import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';

/* =======================
   TOKEN HELPERS
======================= */
function signTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, role: user.Role.name },
    process.env.JWT_SECRET,
    { expiresIn: +process.env.JWT_EXPIRES || 900 }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: +process.env.REFRESH_EXPIRES || 604800 }
  );

  return { accessToken, refreshToken };
}

/* =======================
   REGISTER
======================= */
export async function register(req, res) {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const roleRow = await Role.findOne({ where: { name: role } });
    if (!roleRow) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash: hash,
      full_name,
      RoleId: roleRow.id,
      status: 'pending',
    });

    return res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: roleRow.name,
        status: user.status,
      },
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* =======================
   LOGIN
======================= */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: { model: Role, required: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Approval logic:
    // - Admin: always allowed
    // - Others: must be approved
    if (
      user.Role.name !== 'Admin' &&
      user.status !== 'approved'
    ) {
      return res.status(403).json({ message: 'Awaiting Approval' });
    }

    const { accessToken, refreshToken } = signTokens(user);

    return res.json({
      user: serializeUser(user),
      accessToken,
      refreshToken,
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* =======================
   REFRESH TOKEN
======================= */
export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Missing refresh token' });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await User.findByPk(payload.id, {
      include: { model: Role, required: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = signTokens(user);
    return res.json(tokens);

  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

/* =======================
   LOGOUT
======================= */
export async function logout(req, res) {
  return res.json({ ok: true });
}

/* =======================
   SERIALIZER
======================= */
export function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    blood_group: user.blood_group,
    location: user.location,
    role: {
      id: user.Role.id,
      name: user.Role.name,
    },
    status: user.status,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
