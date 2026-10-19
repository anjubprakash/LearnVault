import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'learnvault_super_secure_key_2026_dev_private_vault';
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Token invalid, fall back to default user
      }
    }

    // Fallback: website is open without login - attach default user
    let defaultUser = await User.findOne({ role: 'admin' });
    if (!defaultUser) {
      defaultUser = await User.findOne();
    }
    if (!defaultUser) {
      defaultUser = await User.create({
        name: 'Study Buddy',
        email: 'vault@learnvault.local',
        password: 'vaultpassword123',
        role: 'admin',
      });
    }

    req.user = defaultUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  // Website is open without login requirement
  next();
};
