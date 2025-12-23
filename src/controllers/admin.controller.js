import { User, Role } from '../models/index.js';

export async function listPending(req, res) {
  try {
    const users = await User.findAll({
      where: { status: 'pending' },
      include: [{ model: Role, attributes: ['name'] }],
      order: [['created_at', 'DESC']],
    });

    res.json(
      users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        blood_group: u.blood_group,
        location: u.location,
        role: u.Role?.name,
        status: u.status,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending users' });
  }
}

export async function approveUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'approved';
    await user.save();

    res.json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve user' });
  }
}

export async function rejectUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User rejected and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject user' });
  }
}