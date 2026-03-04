import express from 'express'
import { deletePin, getPin, getPins,  savePin,  unSavePin, addComment, searchPin, createPin, updateComment, deleteComment, updatePin, likePin, unlikePin, getUserPins, getSavedPins } from '../Controllers/pinsControllers.js'
import authRequire from '../Middleware/authRequire.js'
import { handleUploadError, pinUpload } from '../Middleware/pinUpload.js'
// PUT /api/pins/:pinId/comments/:commentId
// DELETE /api/pins/:pinId/comments/:commentId
// PUT /api/pins/:pinId



export const pinsRoutes = express.Router()

pinsRoutes.get('/', getPins)
pinsRoutes.get('/:id', getPin)
pinsRoutes.get('/user/:userId', getUserPins)
pinsRoutes.get('/saved/:userId', getSavedPins)
pinsRoutes.use(authRequire)
pinsRoutes.delete('/:pinId', deletePin)
pinsRoutes.delete('/:pinId/unsave', unSavePin)
pinsRoutes.post('/:pinId/save', savePin)
pinsRoutes.post('/create', 
  pinUpload.single('image'),
  handleUploadError,
  createPin
);
// update pin route
pinsRoutes.put('/:pinId',
  pinUpload.single('image'),
  handleUploadError,
  updatePin
);
pinsRoutes.post('/:pinId/like', likePin)
pinsRoutes.delete('/:pinId/like', unlikePin)
pinsRoutes.post('/comments', addComment)
pinsRoutes.put('/:pinId/comments/:commentId', updateComment)
pinsRoutes.delete('/:pinId/comments/:commentId', deleteComment)





export default pinsRoutes