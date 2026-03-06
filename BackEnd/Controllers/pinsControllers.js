import Pins from '../Models/pinsModel.js'
import User from '../Models/userModel.js'
import mongoose from 'mongoose'
import fs from 'fs'

export const getPins = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const pins = await Pins.find()
      .limit(limit)
      .skip(skip)
      .populate('createdUser', 'firstName lastName email img')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName img email username'
      }) 

    const hasMore = pins.length >= limit;

    console.log({ pins: pins.length, hasMore });
    res.status(200).json({ data: pins, hasMore });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserPins = async (req, res) => {
  const { userId } = req.params
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = parseInt(req.query.skip, 10) || 0;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ error: "Invalid user ID" });
    }
    const pins = await Pins.find({ createdUser: userId })
      .limit(limit)
      .skip(skip)
      .populate('createdUser', 'firstName lastName email img')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName img email username'
      })
      const hasMore = pins.length >= limit;
    res.status(200).json({ pins, hasMore })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getSavedPins = async (req, res) => {
  const userId = req.params.userId
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = parseInt(req.query.skip, 10) || 0;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ error: "Invalid user ID" });
    }
    const pins = await Pins.find({ save: userId })
      .limit(limit)
      .skip(skip)
      .populate('createdUser', 'firstName lastName email img')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName img email username'
      })
    const hasMore = pins.length >= limit;
    res.status(200).json({  pins, hasMore })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getPin = async (req, res) => {
  const { id } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid pin ID" });
    }
    
    const pin = await Pins.findById(id)
      .populate('createdUser', 'firstName lastName img email')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName img email username'
      })
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found' })
    }
    res.status(200).json(pin)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deletePin = async (req, res) => {
  const { pinId } = req.params
  console.log('Delete pin request:', { pinId, userId: req.userId });
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(404).json({ error: "Invalid pin ID" });
    }
    const pin = await Pins.findOneAndDelete({ _id: pinId, createdUser: req.userId })
    if (!pin) return res.status(404).json({ error: 'No such pin' })
    res.status(200).json({ message: 'Pin deleted successfully', pin })
  } catch (error) {
    res.status(400).json({ error: error.message })
    console.error('Delete pin error:', error);
  }
}

export const createPin = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    // Validate required fields
    const { title, about, category, userId } = req.body;
    
    if (!title || !about || !category) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Title, about, and category are required'
      });
    }

    const pinBuffer = fs.readFileSync(req.file.path);

    // Process tags if provided
    let processedTags = [];
    if (req.body.tags) {
      processedTags = Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags.split(',').map(tag => tag.trim());
    }

    // Find user
    const user = await User.findById(userId || req.userId);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new pin
    const newPin = new Pins({
      title,
      about,
      img: {
        data: pinBuffer,
        contentType: req.file.mimetype
      },
      category,
      createdUser: user,
      tags: processedTags,
      save: [],
      likes: [],
      comments: []
    });

    // Save to database 
    const savedPin = await Pins.create(newPin);
    const populatedPin = await Pins.findById(savedPin._id)
  .populate('createdUser', 'email img banner firstName lastName');
    console.log(populatedPin); 
    // Delete the temporary file after saving
    fs.unlinkSync(req.file.path)
  console.log('pin has been created scusessflly')

    res.status(201).json(populatedPin);

  } catch (error) {
    console.error('Create pin error:', error);
    
    // Delete uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create pin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updatePin = async (req, res) => {
  try {
    const { pinId } = req.params; 
    console.log('req.body:', req.body);
    const { title, about, category, tags } = req.body;
    const userId = req.userId;

    // Find the pin
    const pin = await Pins.findById(pinId);
    if (!pin) {
      console.log('Pin not found with ID:', pinId);
      return res.status(404).json({ error: 'Pin not found' });
    }

    // Check if user owns the pin
    if (pin.createdUser.toString() !== userId.toString()) {
      console.log(pin.createdUser.toString(), userId);
      console.log('User not authorized to edit this pin');
      return res.status(403).json({ error: 'Not authorized to edit this pin' });
    }

    // Prepare update data
    const updateData = {};
    
    if (title) updateData.title = title;
    if (about) updateData.about = about;
    if (category) updateData.category = category;
    
    if (tags) {
      const processedTags = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map(tag => tag.trim());
      updateData.tags = processedTags;
    }

    // Handle image update if a new file was uploaded
    if (req.file) {
      const pinBuffer = fs.readFileSync(req.file.path);
      updateData.img = {
        data: pinBuffer,
        contentType: req.file.mimetype
      };
      
      // Delete the temporary file after reading
      fs.unlinkSync(req.file.path);
    }

    // Update the pin
    const updatedPin = await Pins.findByIdAndUpdate(
      pinId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdUser', 'firstName lastName img email')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName img email username'
      });

    res.status(200).json({
      success: true,
      message: 'Pin updated successfully',
      pin: updatedPin
    });
  } catch (error) {
    console.error('Update pin error:', error);
    
    // Delete uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update pin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const savePin = async (req, res) => {
  const userId = req.userId
  const { pinId } = req.params
  console.log('Save pin request:', { userId, pinId });
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(404).json({ error: "Invalid pin ID" });
    }
    
    const pin = await Pins.findByIdAndUpdate(
      pinId,
      { $addToSet: { save: userId } }, // Use $addToSet to prevent duplicates
      { new: true }
    );
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found' })
    }
    
    res.status(200).json(pin)
  } catch (error) {
    console.error('Save pin error:', error); 
    res.status(400).json({ error: error.message })
  }
}

export const unSavePin = async (req, res) => {
  const userId = req.userId;
  const { pinId } = req.params
  console.log('Unsave pin request:', { userId, pinId });
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(404).json({ error: "Invalid pin ID" });
    }
    
    const pin = await Pins.findByIdAndUpdate(
      pinId,
      { $pull: { save: userId } },
      { new: true }
    );
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found' })
    }
    
    res.status(200).json(pin)
  } catch (error) {
    console.log('Unsave pin error:', error);
    res.status(400).json({ error: error.message })
  }
}

export const likePin = async (req, res) => {
  const userId  = req.userId;
  const { pinId } = req.params
  try {
      if (!mongoose.Types.ObjectId.isValid(pinId)) {  
      return res.status(404).json({ error: "Invalid pin ID" });
    }
    const pin = await Pins.findOneAndUpdate(
      { _id: pinId },
      { $addToSet: { likes: userId } }, // Use $addToSet to prevent duplicates
      { new: true }
    );
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found' })
    }
    res.status(200).json(pin)
  } catch (error) {
    console.error('Like pin error:', error);
    res.status(400).json({ error: error.message })
  }
}

export const unlikePin = async (req, res) => {
  const userId  = req.userId;
  const { pinId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(404).json({ error: "Invalid pin ID" });
    }

    const updatedPin = await Pins.findByIdAndUpdate(
      pinId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!updatedPin) {
      return res.status(404).json({ error: 'Pin not found' });
    }

    res.status(200).json(updatedPin);
  } catch (error) {
    console.error('Unlike pin error:', error);
    res.status(500).json({ error: error.message });
  }
}

export const searchPin = async (req, res) => {
  const { query } = req.body;
  console.log(query)
  console.log('search pin request')
  try {
    if (!query) {
      console.log('Search query is required')
      return res.status(400).json({ error: 'Search query is required' })
    }
    
    // Search in title, about, tags, and category
    const data = await Pins.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { about: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).populate('createdUser', 'firstName lastName img email')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName img email username'
      })
    
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const addComment = async (req, res) => {
  const { comment, pinId } = req.body; 
  const userId = req.userId;
  console.log('Add comment request:', { comment, pinId, userId });
  try { 
    if (!comment || !pinId || !userId) {
      return res.status(400).json({ error: 'Comment, pinId, and userId are required' })
    }
    
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      console.log('Invalid pin ID:', pinId);
      return res.status(404).json({ error: "Invalid pin ID" });
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found'})
    }

    const newComment = {
      user: userId,
      comment: comment,
      createdAt: new Date()
    }

    const updatedPin = await Pins.findByIdAndUpdate(
      pinId,
      { $push: { comments: newComment } },
      { new: true, runValidators: true }
    ).populate({
      path: 'comments.user',
      select: 'firstName lastName img email'
    });

    if (!updatedPin) {
      return res.status(404).json({ error: 'Pin not found' })
    }
    
    
    const responseComment = {
      _id: updatedPin.comments[updatedPin.comments.length - 1]._id, // Get the ID of the newly added comment
      user: {
        _id: user._id,
        img: user.img,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      comment: newComment.comment,
      createdAt: newComment.createdAt
    };
    
    res.status(200).json(responseComment)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const updateComment = async (req, res) => {
  try {
    const { pinId, commentId } = req.params;
    const { comment } = req.body;
    const userId = req.userId;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Find the pin to check ownership
    const existingPin = await Pins.findById(pinId).lean();
    if (!existingPin) {
      console.log('Pin not found with ID:', pinId);
      return res.status(404).json({ error: 'Pin not found' });
    }

    // Find the comment to check ownership
    const existingComment = existingPin.comments.find(c => c._id.toString() === commentId);
    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' })
    }
    

    // Check if user owns the comment
    if (existingComment.user.toString() !== userId.toString()) {
      console.log('User not authorized to edit this comment');
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    // Update the comment using findOneAndUpdate
    const updatedPin = await Pins.findOneAndUpdate(
      {
        _id: pinId,
        'comments._id': commentId,
        'comments.user': userId // Ensure user owns the comment
      },
      {
        $set: {
          'comments.$.comment': comment.trim(),
          'comments.$.editedAt': new Date()
        }
      },
      {
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    )
    .populate('createdUser', '_id username firstName lastName img')
    .populate({
      path: 'comments.user',
      select: '_id username firstName lastName img'
    });

    if (!updatedPin) {
      return res.status(404).json({ error: 'Pin or comment not found, or user not authorized' });
    }

    // Find the updated comment
    const updatedComment = updatedPin.comments.id(commentId);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { pinId, commentId } = req.params;
    const userId = req.userId;
    console.log('Delete comment request:', { pinId, commentId, userId });

    if (!mongoose.Types.ObjectId.isValid(pinId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(404).json({ error: "Invalid pin ID or comment ID" });
    }

    // Optional: Check if the pin exists and the user is authorized (similar to update)
    const pin = await Pins.findById(pinId).lean();
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found ' });}
    console.log(pin.comments)
    const comment = pin.comments.find(c => c._id.toString() === commentId);
    if (!comment) {
      console.log('Comment not found with ID:', commentId);
      return res.status(404).json({ error: 'Comment not found' })
    };
      console.log('Comment found for deletion:', comment);
    // console.log(userId)
    const isCommentOwner = comment.user.toString() === userId.toString();
    const isPinOwner = pin.createdUser.toString() === userId.toString();
    if (!isCommentOwner && !isPinOwner) {
      console.log('User not authorized to delete this comment');
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Atomic delete using $pull
    const updatedPin = await Pins.findByIdAndUpdate(
      pinId,
      { $pull: { comments: { _id: commentId } } },
      { new: true } // optional, if you need the updated document
    );

    if (!updatedPin) {
      // This shouldn't happen if the pin existed, but handle gracefully
      console.error('Failed to delete comment: Pin not found after update');
      return res.status(404).json({ error: 'Pin not found after update' });
    }
    console.log('Comment deleted successfully');  

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);  
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};