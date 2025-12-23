import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';

function signTokens(user) {
  const accessToken = jwt.sign({ id: user.id, role: user.Role.name }, process.env.JWT_SECRET, { expiresIn: +process.env.JWT_EXPIRES || 900 });
  const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: +process.env.REFRESH_EXPIRES || 604800 });
  return { accessToken, refreshToken };
}

export async function register(req, res) {
  console.log("REGISTER BODY:", req.body);
  try {
    const { email, password, full_name, role } = req.body;
    const roleRow = await Role.findOne({ where: { name: role } });
    if (!roleRow) return res.status(400).json({ message: 'Invalid role' });

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password_hash: hash,
      full_name,
      RoleId: roleRow.id,
      status: 'pending',
    });
    
    res.status(201).json({ 
      message: 'Registration successful. Awaiting admin approval.',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: roleRow.name,
        status: 'pending'
      }
    });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
}


export async function login(req, res) {
  console.log("LOGIN BODY:", req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (!['approved', 'active'].includes(user.status))
      return res.status(403).json({ message: 'Awaiting Approval' });

    const { accessToken, refreshToken } = signTokens(user);
    res.json({ user: await serializeUser(user), accessToken, refreshToken });
  } catch (e) {
    console.error("LOGIN ERROR:", e); 
    res.status(500).json({ message: "Server error" });
  }
}


export async function refresh(req, res) {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findByPk(payload.id, { include: Role });
    const { accessToken, refreshToken: newRefresh } = signTokens(user);
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (e) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  res.json({ ok: true });
}

export async function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    blood_group: user.blood_group,
    location: user.location,
    role: { id: user.Role.id, name: user.Role.name, created_at: user.Role.createdAt, updated_at: user.Role.updatedAt },
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
