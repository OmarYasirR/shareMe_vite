import express from 'express'
import { fetchGoogleUser, signIn, signUp, updateAvatar, updateBanner, verifyUser } from '../Controllers/userControllers.js'
import upload from '../utils/multerConfig.js'


export const userRoutes = express.Router()


userRoutes.post('/signup', signUp)
userRoutes.post('/signin', signIn)
userRoutes.post('/verify', verifyUser)



// uploading images
userRoutes.post('/:id/banner', upload.single('banner'), updateBanner);
userRoutes.post('/:id/avatar', upload.single('avatar'), updateAvatar);

export default userRoutes 