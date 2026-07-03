// userRoutes.js
import express from 'express';
import {
  signIn,
  signUp,
  verifyUser,
  fetchGoogleUser,
  updateAvatar,
  updateBanner,
  getUserById,
  getAllUsers,
  deleteUser,
  handleGoogleSignUp
} from '../Controllers/userControllers.js';
import  authMiddleware from '../Middleware/authRequire.js';

import { handleUploadError, upload } from '../utils/multerConfig.js';

const userRoutes = express.Router();

// Auth routes
userRoutes.post('/signin', signIn);
userRoutes.post('/signup', signUp);
userRoutes.post('/verify', verifyUser);
userRoutes.post('/google', handleGoogleSignUp);

// User routes
userRoutes.get('/:id', getUserById);
userRoutes.get('/users', getAllUsers);
userRoutes.delete('/:id', authMiddleware, deleteUser);

// Upload routes
userRoutes.put(
  '/:id/avatar',authMiddleware,upload.single('avatar'),handleUploadError,updateAvatar
);

userRoutes.put('/:id/banner', authMiddleware, upload.single('banner'), handleUploadError, updateBanner);

export default userRoutes;