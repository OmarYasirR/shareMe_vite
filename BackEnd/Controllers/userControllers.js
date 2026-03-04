import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const createToken = (_id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const token = jwt.sign({ userId: _id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};

export const signIn = async (req, res) => {
  const user = req.body;
  
  try {
    // If User isn't Sign in with Google
    if (!user.google) {
      const usr = await User.findOne({ email: user.email });
      if (!usr) {
        return res.status(400).json({ error: "Incorrect Email" });
      }

      const correctPassword = bcrypt.compare(user.password, usr.password);
      if (!correctPassword)
        return res.status(400).json({ error: "Incorrect Password" });
      const token = createToken(usr._id);

      const userResponse = {
        _id: usr._id,
        firstName: usr.firstName,
        lastName: usr.lastName,
        email: usr.email,
        createdAt: usr.createdAt,
        updatedAt: usr.updatedAt,
        img: usr.img,
        banner: usr.banner,
        token,
      };

      return res.status(200).json({ user: userResponse });
    }
    const { email } = user;
    // if User Sign in with Google
    const usr = await User.findOne({ email });

    if (!usr) {
      const userObj = {
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ")[1] || "",
        email: user.email,
        google: true,
      };
      const newUser = await User.create(userObj);
      const token = createToken(newUser._id);
      const userResponse = {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        token,
      };

      return res.status(200).json({ user: userResponse });
    }

    console.log(usr);
    if (usr) {
      const token = createToken(usr._id);
      const userResponse = {
        _id: usr._id,
        firstName: usr.firstName,
        lastName: usr.lastName,
        email: usr.email,
        createdAt: usr.createdAt,
        updatedAt: usr.updatedAt,
        img: usr.img.data? usr.img: null,
        banner: usr.banner.data? usr.banner: null,
        token,
      };

      return res.status(200).json({ user: userResponse });
    }
    const newUser = await User.create({ ...user });
    const token = createToken(newUser._id);

    res.status(200).json({ token, user: newUser });
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }
};

export const signUp = async (req, res) => {
  const { firstName, lastName, email, password, img } = req.body;

  try {
    // Check if user already exists
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ error: "Email Already Exists" });
    }

    console.log("✅ Email is unique, proceeding...");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object - FIX 1: Don't wrap in {userData}
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };

    // Handle image if provided
    if (img && img.startsWith("data:image")) {
      try {
        const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        userData.img = {
          data: buffer,
          contentType: img.match(/^data:image\/(\w+);base64/)[1],
        };
      } catch (imageError) {
        console.error("Image processing failed:", imageError);
      }
    }
    const user = await User.create(userData);

    // FIX 3: Make sure createToken function exists and works
    const token = createToken(user._id);

    // Return user without password and image data
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    };

    // If user has image, include image URL
    if (user.img && user.img.data) {
      userResponse.imgUrl = `/user/users/${user._id}/image`;
    }

    console.log("Signup completed:", userResponse.email);
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Signup error:", error);

    // FIX 4: Send proper error response
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(", ") });
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

    const user = await tokenResponse.json();
    // user contains: sub (Google ID), email, name, picture, etc.
    console.log("Google user data fetched:", user);
    // 3. Return user data to frontend
    res.json({
        googleId: user.sub,
        email: user.email,
        name: user.name,
        img: user.picture,
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

    // Return user data
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      img: user.img,
      banner: user.banner,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

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

export const updateBanner = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      // Delete the uploaded file if user doesn't exist
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "User not found" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Delete old banner if exists
    if (user.banner && user.banner.path) {
      const oldPath = path.join(process.cwd(), user.banner.path);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Convert image to base64 for storage in MongoDB (optional)
    const bannerBuffer = fs.readFileSync(req.file.path);

    // Update user with new banner
    user.banner = {
      data: bannerBuffer, // Store as buffer in DB
      contentType: req.file.mimetype,
    };

    await user.save();
    // Delete the temporary file
    fs.unlinkSync(req.file.path);
    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      banner: user.banner,
      user,
      token,
    });
  } catch (error) {
    console.error("Error updating banner:", error);

    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: "Failed to update banner" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Updating avatar for user ID:", userId);
    console.log(req.file);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read the file
    const avatarBuffer = fs.readFileSync(req.file.path);

    // Update user's image in MongoDB
    user.img = {
      data: avatarBuffer,
      contentType: req.file.mimetype,
    };

    await user.save();

    // Delete the temporary file
    fs.unlinkSync(req.file.path);
    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      img: user.img,
      user,
      token,
    });
  } catch (error) {
    console.error("Error updating avatar:", error);

    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: "Failed to update avatar" });
  }
};
