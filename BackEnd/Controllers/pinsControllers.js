// pinsControllers.js
import Pins from "../Models/pinsModel.js";
import User from "../Models/userModel.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// ============================================
// CLOUDINARY HELPERS
// ============================================

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate buffer
      if (!buffer || !Buffer.isBuffer(buffer)) {
        reject(
          new Error("Invalid buffer: buffer is undefined or not a Buffer"),
        );
        return;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "pins",
          resource_type: "auto",
          ...options,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.write(buffer);
      uploadStream.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from Cloudinary:", publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return null;
  }
};

/**
 * Process tags from request
 * @param {string|Array} tags - Tags from request body
 * @returns {Array} Processed tags array
 */
const processTags = (tags) => {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter((tag) => tag);
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => tag.trim()).filter((tag) => tag);
      }
    } catch (e) {
      // Not JSON, treat as comma-separated
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    }
  }

  return [];
};

/**
 * Validate required fields
 * @param {Object} data - Request body data
 * @returns {Object} Validation result
 */
const validatePinData = (data) => {
  const errors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = "Title is required";
  }

  if (!data.category || !data.category.trim()) {
    errors.category = "Category is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================
// PIN CONTROLLERS
// ============================================

/**
 * Get all pins with pagination
 */
export const getPins = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = parseInt(req.query.skip, 10 ) || (page - 1) * limit;
    // reverse pins order
    const pins = await Pins.find()
      .limit(limit)
      .skip(skip)
      .populate("createdUser", "firstName lastName email img")
      .populate({
        path: "comments.user",
        select: "firstName lastName img email username",
      });

    const total = await Pins.countDocuments();
    const hasMore = total > skip + pins.length;

    res.status(200).json({
      success: true,
      data: pins,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Get pins error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pins",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get pins by user ID
 */
export const getUserPins = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = parseInt(req.query.skip, 10) || 0;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const pins = await Pins.find({ createdUser: userId })
      .limit(limit)
      .skip(skip)
      .populate("createdUser", "firstName lastName email img")
      .populate({
        path: "comments.user",
        select: "firstName lastName img email username",
      })
      .sort({ createdAt: -1 });

    const total = await Pins.countDocuments({ createdUser: userId });
    const hasMore = total > skip + pins.length;

    res.status(200).json({
      success: true,
      pins,
      pagination: {
        limit,
        skip,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Get user pins error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user pins",
    });
  }
};


export const getPinsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = parseInt(req.query.skip, 10) || 0;

    const pins = await Pins.find({ category })
      .limit(limit)
      .skip(skip)
      .populate("createdUser", "firstName lastName email img")
      .populate({
        path: "comments.user",
        select: "firstName lastName img email username",
      })
      .sort({ createdAt: -1 });

    const total = await Pins.countDocuments({ category });
    const hasMore = total > skip + pins.length;

    res.status(200).json({
      success: true,
      pins,
      pagination: {
        limit,
        skip,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Get pins by category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pins by category",
    });
  }
};

/**
 * Get saved pins by user ID
 */
export const getSavedPins = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = parseInt(req.query.skip, 10) || 0;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const pins = await Pins.find({ save: userId })
      .limit(limit)
      .skip(skip)
      .populate("createdUser", "firstName lastName email img")
      .populate({
        path: "comments.user",
        select: "firstName lastName img email username",
      })
      .sort({ createdAt: -1 });

    const total = await Pins.countDocuments({ save: userId });
    const hasMore = total > skip + pins.length;

    res.status(200).json({
      success: true,
      pins,
      pagination: {
        limit,
        skip,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Get saved pins error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved pins",
    });
  }
};

/**
 * Get single pin by ID
 */
export const getPin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID",
      });
    }

    const pin = await Pins.findById(id)
      .populate("createdUser", "firstName lastName img email")
      .populate({
        path: "comments.user",
        select: "firstName lastName img email username",
      });

    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    res.status(200).json({
      success: true,
      pin,
    });
  } catch (error) {
    console.error("Get pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pin",
    });
  }
};

/**
 * Create a new pin
 */
/**
 * Create a new pin
 */
export const createPin = async (req, res) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Validate buffer
    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Invalid file data",
      });
    }

    // Validate required fields
    const validation = validatePinData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { title, about, category, userId } = req.body;

    // Process tags
    const tags = processTags(req.body.tags);

    // Find user
    const user = await User.findById(userId || req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
        public_id: `${Date.now()}_${req.file.originalname.split(".")[0]}`,
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto" },
        ],
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to Cloudinary",
        error:
          process.env.NODE_ENV === "development"
            ? uploadError.message
            : undefined,
      });
    }

    // Create pin - FIXED: Use a different variable name to avoid conflict
    const newPinData = {
      title: title.trim(),
      about: about ? about.trim() : "",
      img: {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        contentType: req.file.mimetype,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format,
      },
      category: category.trim(),
      createdUser: user._id,
      tags: tags,
      save: [],
      likes: [],
      comments: [],
    };

    // Use create() method instead of new + save()
    const createdPin = await Pins.create(newPinData);

    // Populate user info
    const populatedPin = await Pins.findById(createdPin._id).populate(
      "createdUser",
      "email img banner firstName lastName",
    );

    console.log("Pin created successfully with Cloudinary");

    res.status(201).json({
      success: true,
      message: "Pin created successfully",
      data: populatedPin,
    });
  } catch (error) {
    console.error("Create pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create pin",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update a pin
 */
export const updatePin = async (req, res) => {
  try {
    const { pinId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID",
      });
    }

    // Find pin
    const pin = await Pins.findById(pinId);
    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    // Check ownership
    if (pin.createdUser.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this pin",
      });
    }

    // Prepare update data
    const updateData = {};
    const { title, about, category, tags } = req.body;

    if (title) updateData.title = title.trim();
    if (about) updateData.about = about.trim();
    if (category) updateData.category = category.trim();
    if (tags) updateData.tags = processTags(tags);

    // Handle image update
    if (req.file) {
      // Validate buffer
      if (!req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid file data",
        });
      }

      // Delete old image from Cloudinary
      if (pin.img?.public_id) {
        await deleteFromCloudinary(pin.img.public_id);
      }

      // Upload new image
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
        public_id: `${Date.now()}_${req.file.originalname.split(".")[0]}`,
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto" },
        ],
      });

      updateData.img = {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        contentType: req.file.mimetype,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format,
      };
    }

    // Update pin
    const updatedPin = await Pins.findByIdAndUpdate(
      pinId,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate("createdUser", "firstName lastName img email")
      .populate({
        path: "comments.user",
        select: "firstName lastName img email username",
      });

    res.status(200).json({
      success: true,
      message: "Pin updated successfully",
      data: updatedPin,
    });
  } catch (error) {
    console.error("Update pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update pin",
    });
  }
};

/**
 * Delete a pin
 */
export const deletePin = async (req, res) => {
  try {
    const { pinId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID",
      });
    }

    // Find pin
    const pin = await Pins.findById(pinId);
    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    // Check ownership
    if (pin.createdUser.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this pin",
      });
    }

    // Delete from Cloudinary
    if (pin.img?.public_id) {
      await deleteFromCloudinary(pin.img.public_id);
    }

    // Delete from database
    await Pins.findByIdAndDelete(pinId);

    res.status(200).json({
      success: true,
      message: "Pin deleted successfully",
    });
  } catch (error) {
    console.error("Delete pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete pin",
    });
  }
};

/**
 * Search pins
 */
export const searchPin = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query.trim(), "i");

    const pins = await Pins.find({
      $or: [
        { title: searchRegex },
        { about: searchRegex },
        { tags: searchRegex },
        { category: searchRegex },
      ],
    })
      .populate("createdUser", "firstName lastName img email")
      .populate({
        path: "comments.user",
        select: "firstName lastName img email username",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pins.length,
      data: pins,
    });
  } catch (error) {
    console.error("Search pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search pins",
    });
  }
};

// ============================================
// SAVE/LIKE CONTROLLERS
// ============================================

/**
 * Save a pin
 */
export const savePin = async (req, res) => {
  try {
    const userId = req.userId;
    const { pinId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID",
      });
    }

    const pin = await Pins.findByIdAndUpdate(
      pinId,
      { $addToSet: { save: userId } },
      { new: true },
    );

    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pin saved successfully",
      data: pin,
    });
  } catch (error) {
    console.error("Save pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save pin",
    });
  }
};

/**
 * Unsave a pin
 */
export const unSavePin = async (req, res) => {
  try {
    const userId = req.userId;
    const { pinId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID",
      });
    }

    const pin = await Pins.findByIdAndUpdate(
      pinId,
      { $pull: { save: userId } },
      { new: true },
    );

    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pin unsaved successfully",
      data: pin,
    });
  } catch (error) {
    console.error("Unsave pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsave pin",
    });
  }
};

/**
 * Like a pin
 */
export const likePin = async (req, res) => {
  try {
    const userId = req.userId;
    const { pinId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID",
      });
    }

    const pin = await Pins.findByIdAndUpdate(
      pinId,
      { $addToSet: { likes: userId } },
      { new: true },
    );

    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pin liked successfully",
      data: pin,
    });
  } catch (error) {
    console.error("Like pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like pin",
    });
  }
};

/**
 * Unlike a pin
 */
export const unlikePin = async (req, res) => {
  try {
    const userId = req.userId;
    const { pinId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID",
      });
    }

    const pin = await Pins.findByIdAndUpdate(
      pinId,
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pin unliked successfully",
      data: pin,
    });
  } catch (error) {
    console.error("Unlike pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlike pin",
    });
  }
};

// ============================================
// COMMENT CONTROLLERS
// ============================================

/**
 * Add a comment to a pin
 */
export const addComment = async (req, res) => {
  try {
    const { comment, pinId } = req.body;
    const userId = req.userId;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    if (!pinId || !mongoose.Types.ObjectId.isValid(pinId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newComment = {
      user: userId,
      comment: comment.trim(),
      createdAt: new Date(),
    };

    const updatedPin = await Pins.findByIdAndUpdate(
      pinId,
      { $push: { comments: newComment } },
      { new: true, runValidators: true },
    ).populate({
      path: "comments.user",
      select: "firstName lastName img email",
    });

    if (!updatedPin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    const responseComment = {
      _id: updatedPin.comments[updatedPin.comments.length - 1]._id,
      user: {
        _id: user._id,
        img: user.img,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      comment: newComment.comment,
      createdAt: newComment.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: responseComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

/**
 * Update a comment
 */
export const updateComment = async (req, res) => {
  try {
    const { pinId, commentId } = req.params;
    const { comment } = req.body;
    const userId = req.userId;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(pinId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID or comment ID",
      });
    }

    // Find the pin
    const pin = await Pins.findById(pinId);
    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    // Find the comment
    const commentToUpdate = pin.comments.id(commentId);
    if (!commentToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check ownership
    if (commentToUpdate.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    // Update comment
    commentToUpdate.comment = comment.trim();
    commentToUpdate.editedAt = new Date();

    await pin.save();

    const updatedPin = await Pins.findById(pinId)
      .populate("createdUser", "firstName lastName img email")
      .populate({
        path: "comments.user",
        select: "firstName lastName img email",
      });

    const updatedComment = updatedPin.comments.id(commentId);

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (req, res) => {
  try {
    const { pinId, commentId } = req.params;
    const userId = req.userId;

    if (
      !mongoose.Types.ObjectId.isValid(pinId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pin ID or comment ID",
      });
    }

    // Find the pin
    const pin = await Pins.findById(pinId);
    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    // Find the comment
    const commentToDelete = pin.comments.id(commentId);
    if (!commentToDelete) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check ownership
    const isCommentOwner =
      commentToDelete.user.toString() === userId.toString();
    const isPinOwner = pin.createdUser.toString() === userId.toString();

    if (!isCommentOwner && !isPinOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Remove comment
    pin.comments.pull(commentId);
    await pin.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
}
