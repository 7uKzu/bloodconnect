import { Request, User, Op } from '../models/index.js';
import { Donation } from '../models/index.js';

export async function listMy(req, res) {
  const where = { requester_id: req.user.id };
  const rows = await Request.findAll({ where, order: [['created_at','DESC']] });
  res.json(rows);
}

export async function createOne(req, res) {
  const { blood_group, urgency, notes, location } = req.body;

  if (!blood_group)
    return res.status(400).json({ message: 'blood_group is required' });

  const row = await Request.create({
    blood_group,
    urgency,
    notes,
    location,
    requester_id: req.user.id,
  });

  res.status(201).json(row);
}


export async function updateOne(req, res) {
  const { id } = req.params;
  const row = await Request.findByPk(id);
  if (!row || row.requester_id !== req.user.id) return res.status(404).json({ message: 'Not found' });
  const { status, notes } = req.body;
  if (status) row.status = status;
  if (notes) row.notes = notes;
  await row.save();
  res.json(row);
}

export async function removeOne(req, res) {
  const { id } = req.params;
  const row = await Request.findByPk(id);
  if (!row || row.requester_id !== req.user.id) return res.status(404).json({ message: 'Not found' });
  await row.destroy();
  res.json({ ok: true });
}

export async function acceptRequest(req, res) {
  try {
    if (req.user.role !== 'Donor') {
      return res.status(403).json({ message: 'Only donors can accept requests' });
    }

    const request = await Request.findByPk(req.params.id);
    if (!request || request.status !== 'open') {
      return res.status(400).json({ message: 'Request not available' });
    }

    request.status = 'assigned';
    request.donor_id = req.user.id;
    await request.save();

    await Donation.create({
      donor_id: req.user.id,
      blood_group: request.blood_group,
      donated_at: new Date(),
      status: 'pending',
    });

    await AuditLog.create({
      actor_id: req.user.id,
      action: 'REQUEST_ACCEPTED',
      details: `Accepted request ID ${request.id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('request_updated', {
        id: request.id,
        status: 'assigned',
        donor_id: req.user.id,
      });
    }

    res.json({ message: 'Request accepted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}


export async function declineRequest(req, res) {
  const { id } = req.params;
  const request = await Request.findByPk(id);
  if (!request) return res.status(404).json({ message: 'Not found' });

  request.status = 'open';
  await request.save();

  await AuditLog.create({
    actor_id: req.user.id,
    action: 'REQUEST_DECLINED',
    details: `Declined request ID ${request.id}`,
  });

  res.json({ message: 'Request declined' });
}


export async function listIncoming(req, res) {
  try {
    const requests = await Request.findAll({
      where: {
        status: 'open',
      },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['full_name', 'location'],
        },
      ],
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
