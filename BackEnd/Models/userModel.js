// userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String
  },
  google: {
    type: Boolean,
    default: false
  },
  img: {
    url: {
      type: String,
      default: null
    },
    public_id: {
      type: String,
      default: null
    },
    contentType: {
      type: String,
      default: 'image/jpeg'
    },
    width: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: null
    },
    format: {
      type: String,
      default: null
    }
  },
  banner: {
    url: {
      type: String,
      default: null
    },
    public_id: {
      type: String,
      default: null
    },
    contentType: {
      type: String,
      default: 'image/jpeg'
    },
    width: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: null
    },
    format: {
      type: String,
      default: null
    }
  },
}, { 
  timestamps: true 
});

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for avatar URL (with fallback)
userSchema.virtual("avatarUrl").get(function () {
  return this.img?.url || null;
});

// Virtual for banner URL (with fallback)
userSchema.virtual("bannerUrl").get(function () {
  return this.banner?.url || null;
});

// Virtual for avatar thumbnail (Cloudinary transformation)
userSchema.virtual("avatarThumbnail").get(function () {
  if (this.img?.url) {
    // Add Cloudinary transformation for thumbnail
    return this.img.url.replace(
      "/upload/",
      "/upload/w_100,h_100,c_fill,r_max/",
    );
  }
  return null;
});

// Virtual for banner optimized
userSchema.virtual("bannerOptimized").get(function () {
  if (this.banner?.url) {
    // Add Cloudinary transformation for optimization
    return this.banner.url.replace("/upload/", "/upload/q_auto,f_auto/");
  }
  return null;
});

// ============================================
// METHODS
// ============================================

// Method to get avatar with specific size
userSchema.methods.getAvatarWithSize = function (width, height) {
  if (this.img?.url) {
    return this.img.url.replace(
      "/upload/",
      `/upload/w_${width},h_${height},c_fill,r_max/`,
    );
  }
  return null;
};

// Method to get banner with specific size
userSchema.methods.getBannerWithSize = function (width, height) {
  if (this.banner?.url) {
    return this.banner.url.replace(
      "/upload/",
      `/upload/w_${width},h_${height},c_fill/`,
    );
  }
  return null;
};

// Method to check if user has avatar
userSchema.methods.hasAvatar = function () {
  return !!(this.img && this.img.url && this.img.public_id);
};

// Method to check if user has banner
userSchema.methods.hasBanner = function () {
  return !!(this.banner && this.banner.url && this.banner.public_id);
};

// Method to get user profile data (without sensitive info)
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    img: this.img,
    banner: this.banner,
    fullName: this.fullName,
    avatarUrl: this.avatarUrl,
    bannerUrl: this.bannerUrl,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// ============================================
// STATIC METHODS
// ============================================

// Static method to find users with avatars
userSchema.statics.findWithAvatars = function () {
  return this.find({ "img.url": { $exists: true, $ne: null } });
};

// Static method to find users with banners
userSchema.statics.findWithBanners = function () {
  return this.find({ "banner.url": { $exists: true, $ne: null } });
};

// ============================================
// MIDDLEWARE
// ============================================

// Pre-save middleware to clean up empty objects
userSchema.pre("save", function (next) {
  // If img object exists but has no url, set it to null
  if (this.img && !this.img.url) {
    this.img = null;
  }

  // If banner object exists but has no url, set it to null
  if (this.banner && !this.banner.url) {
    this.banner = null;
  }

  next();
});

// ============================================
// INDEXES
// ============================================

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ "img.url": 1 });
userSchema.index({ "banner.url": 1 });

// ============================================
// EXPORT
// ============================================

// Ensure virtuals are included when converting to JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default mongoose.model("User", userSchema);
