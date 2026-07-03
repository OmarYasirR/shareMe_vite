// pinsModel.js
import mongoose from 'mongoose'

const Schema = mongoose.Schema

const commentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true })

const pinsSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  about: {
    type: String,
    required: true,
    trim: true
  },
  img: {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      default: 'image/jpeg'
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    format: {
      type: String
    }
  },
  createdUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  save: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: {
    type: [String],
    default: []
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  category: {
    type: String,
    required: true,
    trim: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual property to get the full image URL (useful for transformations)
pinsSchema.virtual('imgUrl').get(function() {
  if (this.img && this.img.url) {
    return this.img.url;
  }
  return null;
});

// Virtual property to get a thumbnail version
pinsSchema.virtual('thumbnail').get(function() {
  if (this.img && this.img.public_id) {
    // Cloudinary URL with transformation for thumbnail
    return this.img.url.replace('/upload/', '/upload/w_400,h_400,c_fill/');
  }
  return null;
});

// Virtual property to get optimized version
pinsSchema.virtual('optimized').get(function() {
  if (this.img && this.img.public_id) {
    // Cloudinary URL with optimization
    return this.img.url.replace('/upload/', '/upload/q_auto,f_auto/');
  }
  return null;
});

// Method to generate different image sizes
pinsSchema.methods.getImageWithSize = function(width, height) {
  if (this.img && this.img.public_id) {
    return this.img.url.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
  }
  return null;
};

// Method to check if image exists
pinsSchema.methods.hasImage = function() {
  return !!(this.img && this.img.url && this.img.public_id);
};

const Pins = mongoose.model('Pins', pinsSchema)

export default Pins