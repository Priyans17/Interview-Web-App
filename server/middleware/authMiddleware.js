import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: No authorization header' });
    }

    // Extract token (support both "Bearer token" and just "token")
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -otp -resetPasswordToken');
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email address' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware;

