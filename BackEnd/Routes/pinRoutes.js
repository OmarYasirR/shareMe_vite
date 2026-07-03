import express from 'express'
import { deletePin, getPin, getPins,  savePin,  unSavePin, addComment, searchPin, createPin, updateComment, deleteComment, updatePin, likePin, unlikePin, getUserPins, getSavedPins, getPinsByCategory } from '../Controllers/pinsControllers.js'
import authRequire from '../Middleware/authRequire.js'
import { handleUploadError, upload } from '../utils/multerConfig.js'



export const pinsRoutes = express.Router()

pinsRoutes.get('/', getPins)
// get pin by category
pinsRoutes.get('/category/:category', getPinsByCategory)
pinsRoutes.get('/:id', getPin)
pinsRoutes.get('/user/:userId', getUserPins)
pinsRoutes.get('/saved/:userId', getSavedPins)
pinsRoutes.post('/search', searchPin)
pinsRoutes.use(authRequire)
pinsRoutes.delete('/:pinId', deletePin)
pinsRoutes.delete('/:pinId/unsave', unSavePin)
pinsRoutes.post('/:pinId/save', savePin)
pinsRoutes.post('/create', 
  upload.single('image'),
  handleUploadError,
  createPin
);
// update pin route 
pinsRoutes.put('/:pinId',
  upload.single('image'),
  handleUploadError,
  updatePin
);
pinsRoutes.post('/:pinId/like', likePin)
pinsRoutes.delete('/:pinId/like', unlikePin)
pinsRoutes.post('/comments', addComment)
pinsRoutes.put('/:pinId/comments/:commentId', updateComment)
pinsRoutes.delete('/:pinId/comments/:commentId', deleteComment)





export default pinsRoutes