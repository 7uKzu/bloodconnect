import { Router } from 'express';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { sequelize } from '../config/database.js'; // For queries
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';
import { Request, Donation, Appointment, InventoryUnit, AuditLog} from '../models/index.js'; // All models
import * as Auth from '../controllers/auth.controller.js';
import * as Req from '../controllers/request.controller.js';
import * as Notif from '../controllers/notification.controller.js';
import * as Admin from '../controllers/admin.controller.js';
import * as Inventory from '../controllers/inventory.controller.js';

const router = Router();

// Preflight OPTIONS for CORS
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// === AUTH ROUTES ===
router.post('/auth/register', Auth.register);
router.post('/auth/login', Auth.login);
router.post('/auth/refresh', Auth.refresh);
router.post('/auth/logout', Auth.logout);

// === ADMIN ROUTES ===
router.get('/admin/pending-users', authRequired, roleRequired('Admin'), Admin.listPending);
router.put('/admin/users/:id/approve', authRequired, roleRequired('Admin'), Admin.approveUser);
router.put('/admin/users/:id/reject', authRequired, roleRequired('Admin'), Admin.rejectUser);
router.get('/audit/logs', authRequired, roleRequired('Admin'), async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [['created_at', 'DESC']], limit: 50 });
    res.json(logs);
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

// === NOTIFICATION / ALERTS ROUTES ===
router.post('/alerts/urgent', authRequired, roleRequired('MedicalStaff'), Notif.createUrgent);
router.get('/alerts/live', Notif.listLive);

// === REQUEST ROUTES ===
router.get('/requests', authRequired, Req.listMy);
router.post('/requests', authRequired, Req.createOne);
router.put('/requests/:id', authRequired, Req.updateOne);
router.delete('/requests/:id', authRequired, Req.removeOne);
router.post('/requests/:id/accept', authRequired, roleRequired('Donor'), Req.acceptRequest);
router.post('/requests/:id/decline', authRequired, roleRequired('Donor'), Req.declineRequest);
router.get('/requests/incoming', authRequired, roleRequired('Donor'), Req.listIncoming);

// === DONATION ROUTES ===
router.get('/donations/my-history', authRequired, roleRequired('Donor'), async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { donor_id: req.user.id },
      order: [['donated_at', 'DESC']],
    });
    res.json(donations);
  } catch (error) {
    console.error('Donation history error:', error);
    res.status(500).json({ message: 'Failed to fetch donation history' });
  }
});
router.get('/donations/today', authRequired, roleRequired('Technician'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const donations = await Donation.findAll({
      where: { donated_at: { [Op.gte]: today } },
      order: [['donated_at', 'DESC']],
    });
    res.json(donations);
  } catch (error) {
    console.error('Today donations error:', error);
    res.status(500).json({ message: 'Failed to fetch today\'s donations' });
  }
});

router.post(
  '/donations/confirm',
  authRequired,
  roleRequired('Technician'),
  async (req, res) => {
    try {
      const donationId =
        req.body.donationId ||
        req.body.donation_id ||
        req.body.id;

      if (!donationId) {
        return res.status(400).json({ message: 'Donation ID missing' });
      }

      const donation = await Donation.findByPk(donationId);
      if (!donation) {
  console.error('Confirm failed: invalid donationId', donationId);
  return res.status(400).json({ message: 'Invalid or non-existent donation ID' });
}


      // Ensure blood group exists
      if (!donation.blood_group) {
        donation.blood_group =
          req.body.blood_group ||
          req.body.bloodGroup ||
          req.body.blood;
      }

      if (!donation.blood_group) {
        return res.status(400).json({ message: 'Blood group missing' });
      }

      // Force consistency
      donation.status = 'confirmed';
      donation.donated_at = donation.donated_at || new Date();
      await donation.save();

      // Always add inventory unit
      await InventoryUnit.create({
        blood_group: donation.blood_group,
        status: 'available',
      });

      res.json({ message: 'Donation confirmed and inventory updated' });
    } catch (error) {
      console.error('Confirm donation error:', error);
      res.status(500).json({ message: 'Failed to confirm donation' });
    }
  }
);

router.get(
  '/inventory',
  authRequired,
  roleRequired('Technician'),
  async (req, res) => {
    try {
      const inventory = await InventoryUnit.findAll({
        attributes: [
          'blood_group',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'units'],
        ],
        where: { status: 'available' },
        group: ['blood_group'],
        order: [['blood_group', 'ASC']],
      });

      res.json(inventory);
    } catch (error) {
      console.error('Inventory load error:', error);
      res.status(500).json({ message: 'Failed to load inventory' });
    }
  }
);


// === APPOINTMENT ROUTES ===
router.post('/appointments/create', authRequired, roleRequired('Staff'), async (req, res) => {
  try {
    const { scheduled_at, notes } = req.body;
    if (!scheduled_at) return res.status(400).json({ message: 'Scheduled date required' });
    const appt = await Appointment.create({
      scheduled_at,
      notes,
      user_id: req.user.id, // Assuming staff creates for themselves; adjust if needed
      status: 'scheduled',
    });
    res.status(201).json(appt);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
});
router.get('/appointments/upcoming', authRequired, roleRequired('Staff'), async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      where: {
        user_id: req.user.id, // ← THIS LINE FIXES IT
        scheduled_at: { [Op.gte]: new Date() },
        status: 'scheduled',
      },
      order: [['scheduled_at', 'ASC']],
    });
    res.json(appts);
  } catch (error) {
    console.error('Upcoming appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming appointments' });
  }
});


router.post(
  '/inventory',
  authRequired,
  roleRequired('Technician'),
  Inventory.create
);

export default router;