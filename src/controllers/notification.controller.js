import { Notification } from '../models/index.js';

export async function createUrgent(req, res) {
  try {
    const { blood_group, location, units = 1 } = req.body;

    if (!blood_group || !location) {
      return res.status(400).json({ message: 'blood_group and location are required' });
    }

    const alert = await Notification.create({
      type: 'urgent',
      title: `${blood_group} Blood Needed Urgently`,
      message: `${units} unit(s) of ${blood_group} needed at ${location}`,
      blood_group,
      location,
      units,
    });

    // Safely emit via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('urgent_alert', alert.toJSON());
      console.log('Emitted urgent_alert:', alert.toJSON()); // Debug log
    } else {
      console.warn('Socket.IO instance not available - alert not broadcasted');
    }

    res.status(201).json(alert);
  } catch (error) {
    console.error('createUrgent error:', error);
    res.status(500).json({ message: 'Failed to create urgent alert' });
  }
}

export async function listLive(req, res) {
  try {
    const alerts = await Notification.findAll({
      where: { type: 'urgent' },
      order: [['created_at', 'DESC']],
      limit: 20,
    });
    res.json(alerts);
  } catch (error) {
    console.error('listLive error:', error);
    res.status(500).json({ message: 'Failed to fetch live alerts' });
  }
}