import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Pins from "../Models/pinsModel.js";
import dotenv from "dotenv";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 1. Configure your MongoDB Connection URI
const MONGO_URI = process.env.MONGO_URI;

// 2. Provide a valid User ID from your database
const USER_ID = new mongoose.Types.ObjectId("6a3f7c2184d5861d3286dbd3");

const IMAGE_DIR = process.env.IMAGE_DIR;

const imagesToUpload = [
  {
    fileName: "pexels-felix-mittermeier-2832034.jpg",
    title: "Serene Mountain Cabin Reflection",
    about: "A peaceful moment of a traveler sitting on a lush green hill, looking at a rustic wooden cabin nestled against a misty forest background during a golden sunset.",
    category: "Travel & Nature",
    tags: ["nature", "cabin", "travel", "wanderlust", "scenic", "solitude"]
  },
  {
    fileName: "pexels-hans-martha-399489-1059823.jpg",
    title: "Vibrant Rainbow Lorikeet Close-up",
    about: "A stunning, detailed close-up portrait of a colorful Rainbow Lorikeet showing its bright blue head, orange beak, and vivid chest feathers.",
    category: "Animals & Wildlife",
    tags: ["bird", "parrot", "wildlife", "lorikeet", "colorful", "photography"]
  },
  {
    fileName: "pexels-inspiredimages-133472.jpg",
    title: "Elegant Yellow Rosebud",
    about: "A minimalist, high-contrast shot of a single yellow rosebud starting to bloom on a clean, solid light background.",
    category: "Photography",
    tags: ["rose", "flower", "yellow", "minimalist", "botanical", "flora"]
  },
  {
    fileName: "pexels-iriser-1122639.jpg",
    title: "Moody Red Roses in Shadow",
    about: "A collection of deep red roses blooming beautifully amidst lush, dark green foliage under dramatic, moody lighting.",
    category: "Gardening & Plants",
    tags: ["roses", "red flowers", "moody", "aesthetic", "garden", "nature"]
  },
  {
    fileName: "pexels-iriser-1396027.jpg",
    title: "Blooming Pink Phlox Bush",
    about: "A dense, vibrant cluster of pink phlox flowers in full bloom, capturing the essence of a bright spring or summer garden.",
    category: "Gardening & Plants",
    tags: ["flowers", "pink", "garden", "blossom", "summer", "floral"]
  },
  {
    fileName: "pexels-jessbaileydesign-1172849.jpg",
    title: "Minimalist Purple Daisy Arrangement",
    about: "A clean, modern flat-lay style composition featuring a single purple daisy-like flower accompanied by delicate white sprigs over a crisp white canvas.",
    category: "Art & Design",
    tags: ["minimalist", "purple", "flatlay", "aesthetic", "flower", "art"]
  },
  {
    fileName: "pexels-julia-lee-1148675-2218065.jpg",
    title: "Intricate Fern Fronds",
    about: "An artistic macro look looking up through layered green fern leaves against a soft, dreamy teal background.",
    category: "Wallpapers & Backgrounds",
    tags: ["fern", "leaves", "green", "pattern", "macro", "nature"]
  },
  {
    fileName: "pexels-kasperphotography-1042423.jpg",
    title: "Lone Yellow Tulip in the Grass",
    about: "A vibrant yellow tulip standing out brilliantly in a field of tall green wild grass and clover patches.",
    category: "Photography",
    tags: ["tulip", "yellow flower", "spring", "grass", "nature", "vivid"]
  },
  {
    fileName: "pexels-lily-lili-17626726-35730692.jpg",
    title: "Soft Pink Blossom Branches",
    about: "Delicate pink cherry or plum blossoms arranged gracefully along slender green branches against a soft-focus bokeh background.",
    category: "Wallpapers & Backgrounds",
    tags: ["blossoms", "pink", "spring", "sakura", "pastel", "aesthetic"]
  }
]

async function uploadImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Successfully connected to MongoDB.");

    for (const imgData of imagesToUpload) {
      const filePath = path.resolve(IMAGE_DIR, imgData.fileName);

      if (!fs.existsSync(filePath)) {
        console.warn(`File not found, skipping: ${filePath}`);
        continue;
      }

      const fileBuffer = fs.readFileSync(filePath);
      const contentType = imgData.fileName.endsWith(".png")
        ? "image/png"
        : "image/jpeg";

      await Pins.create({
        title: imgData.title,
        about: imgData.about,
        img: {
          data: fileBuffer,
          contentType: contentType,
        },
        createdUser: USER_ID,
        category: imgData.category,
        tags: imgData.tags,
        save: [],
        likes: [],
        comments: [],
      });
      console.log(`Uploaded successfully: "${imgData.title}"`);
    }

    console.log("All available images have been processed.");
  } catch (error) {
    console.error("Error uploading images:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

uploadImages();
