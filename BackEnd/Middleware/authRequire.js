import jwt from 'jsonwebtoken'
import User from '../Models/userModel.js'

const authRequire = async (req, res, next) => {
  try {
    const authHeader = req.headers.Authorization || req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    } 

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('_id');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = user._id;
    console.log('Authenticated user ID:', req.userId);
    next();
    
  } catch (error) {
    console.log('Auth error:', error.message);
    return res.status(401).json({ error: 'Not authorized' });
  }
}

export default authRequire;