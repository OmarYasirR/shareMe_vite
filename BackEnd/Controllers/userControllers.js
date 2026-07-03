// userControllers.js
import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";

// ============================================
// HELPER FUNCTIONS
// ============================================

const createToken = (_id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const token = jwt.sign({ userId: _id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};

/**
 * Upload image buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!buffer || !Buffer.isBuffer(buffer)) {
        reject(
          new Error("Invalid buffer: buffer is undefined or not a Buffer"),
        );
        return;
      }

      console.log("Uploading to Cloudinary, buffer size:", buffer.length);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          ...options,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload successful:", result.public_id);
            resolve(result);
          }
        },
      );

      uploadStream.write(buffer);
      uploadStream.end();
    } catch (error) {
      console.error("Upload stream error:", error);
      reject(error);
    }
  });
};

/**
 * Format user response
 */
const formatUserResponse = (user, token = null) => {
  const response = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    img: user.img || null,
    banner: user.banner || null,
  };

  if (token) {
    response.token = token;
  }

  return response;
};

// ============================================
// AUTH CONTROLLERS
// ============================================

// google sign up handler function

export const handleGoogleSignUp = async (req, res) => {
    const usr = req.body;
  try {
    console.log(usr)
    const user = await User.findOne({ email: usr.email });
    if (user) {
    const token = createToken(user._id);
    const userResponse = formatUserResponse(user, token);
    return res.status(200).json({
      message: "Successfully logged in with Google",
      usr: userResponse,
    });
  } 

  const newUser = await User.create(usr);

  console.log(newUser)
  // Google users don't need a password
  const userData = {
    firstName : newUser.firstName || "Google",
    lastName: newUser.lastName || "",
    email: newUser.email,
    img: newUser.img || null,
    google: true,
  };

  const token = createToken(newUser._id);
  const userResponse = formatUserResponse(newUser, token);

  console.log("Google sign-up completed:", userResponse.email);
  return res.status(201).json({
    message: "Google sign-up successful",
    usr: userResponse,
  });
    
  } catch (error) {
    console.error("Google Sign in error:", error);
    res.status(400).json({
      error: error.message || "Google Sign in failed",
    });
  }


};

export const signIn = async (req, res) => {
  const user = req.body;
  console.log("Sign-in request received:", user);

  try {
    const usr = await User.findOne({ email: user.email });

    if (!usr) {
      return res.status(400).json({ error: "Incorrect Email" });
    }

    const correctPassword = await bcrypt.compare(user.password, usr.password);
    if (!correctPassword) {
      return res.status(400).json({ error: "Incorrect Password" });
    }

    const token = createToken(usr._id);
    const userResponse = formatUserResponse(usr, token);

    return res.status(200).json({ user: userResponse })

  } catch (error) {
    console.error("Sign in error:", error);
    res.status(400).json({
      error: error.message || "Sign in failed",
    });
  }
};

export const signUp = async (req, res) => {
  const { firstName, lastName, email, password, google = false } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists. Please use a different email.",
      });
    }

    // For email/password sign-up
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      google: false,
    };

    const user = await User.create(userData);
    const token = createToken(user._id);
    const userResponse = formatUserResponse(user, token);

    console.log("Signup completed:", userResponse.email);
    res.status(201).json({
      message: "Sign-up successful",
      user: userResponse,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: "Email already exists. Please use a different email.",
      });
    }

    res.status(400).json({
      error: error.message || "Signup failed",
    });
  }
};

export const fetchGoogleUser = async (req, res) => {
  const { code } = req.body;
  console.log("Received Google auth code:", code);

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.BASE_URL,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to fetch token from Google");
    }

    const userData = await tokenResponse.json();
    console.log("Google user data fetched:", userData);

    res.json({
      googleId: userData.sub,
      email: userData.email,
      name: userData.name,
      img: userData.picture,
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id || decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // FIXED: Use the formatUserResponse function instead of non-existent static method
    const userResponse = formatUserResponse(user);

    res.status(200).json({
      success: true,
      message: "Token verified successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ============================================
// USER UPDATE CONTROLLERS
// ============================================

export const updateBanner = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate buffer exists
    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Invalid file data",
      });
    }

    // Delete old banner from Cloudinary if exists
    if (user.banner && user.banner.public_id) {
      try {
        await cloudinary.uploader.destroy(user.banner.public_id);
        console.log(
          "Old banner deleted from Cloudinary:",
          user.banner.public_id,
        );
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new banner to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
        folder: "users/banners",
        public_id: `banner_${userId}_${Date.now()}`,
        transformation: [
          { width: 1500, height: 500, crop: "fill" },
          { quality: "auto" },
        ],
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload banner to Cloudinary",
      });
    }

    // Update user with new banner
    user.banner = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      contentType: req.file.mimetype,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      format: cloudinaryResult.format,
    };

    await user.save();

    // Generate new token
    const token = createToken(user._id);
    const userResponse = formatUserResponse(user, token);

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner: user.banner,
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update banner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Updating avatar for user ID:", userId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate buffer exists
    if (!req.file.buffer) {
      console.error("File buffer is undefined");
      return res.status(400).json({
        success: false,
        message: "Invalid file data. Please try again.",
      });
    }

    console.log("File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferSize: req.file.buffer.length,
    });

    // Delete old avatar from Cloudinary if exists
    if (user.img && user.img.public_id) {
      try {
        await cloudinary.uploader.destroy(user.img.public_id);
        console.log("Old avatar deleted from Cloudinary:", user.img.public_id);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new avatar to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
        folder: "users/avatars",
        public_id: `avatar_${userId}_${Date.now()}`,
        transformation: [
          { width: 400, height: 400, crop: "fill" },
          { radius: "max" },
          { quality: "auto" },
        ],
      });
      console.log("Avatar uploaded successfully:", cloudinaryResult.public_id);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload avatar to Cloudinary",
      });
    }

    // Update user with new avatar
    user.img = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      contentType: req.file.mimetype,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      format: cloudinaryResult.format,
    };

    await user.save();

    // Generate new token
    const token = createToken(user._id);
    const userResponse = formatUserResponse(user, token);

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      img: user.img,
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update avatar",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ============================================
// USER RETRIEVAL CONTROLLERS
// ============================================

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userResponse = formatUserResponse(user);

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersResponse = users.map((user) => formatUserResponse(user));

    res.status(200).json({
      success: true,
      count: usersResponse.length,
      users: usersResponse,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete images from Cloudinary if they exist
    if (user.img && user.img.public_id) {
      try {
        await cloudinary.uploader.destroy(user.img.public_id);
        console.log("Avatar deleted from Cloudinary:", user.img.public_id);
      } catch (error) {
        console.error("Failed to delete avatar from Cloudinary:", error);
      }
    }

    if (user.banner && user.banner.public_id) {
      try {
        await cloudinary.uploader.destroy(user.banner.public_id);
        console.log("Banner deleted from Cloudinary:", user.banner.public_id);
      } catch (error) {
        console.error("Failed to delete banner from Cloudinary:", error);
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
