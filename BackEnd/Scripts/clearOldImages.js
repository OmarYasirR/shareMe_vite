import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Pins from "../Models/pinsModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

async function clearOldImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Successfully connected to MongoDB.");

    // Count pins before deletion
    const totalPins = await Pins.countDocuments();
    console.log(`📊 Total pins in database: ${totalPins}`);

    // Find pins with binary data (old format)
    const oldPins = await Pins.find({ 'img.data': { $exists: true } });
    console.log(`🖼️  Pins with binary images: ${oldPins.length}`);

    if (oldPins.length === 0) {
      console.log("✅ No old binary images found. Database is already clean.");
      return;
    }

    // Option 1: Delete all pins with binary data
    const result = await Pins.deleteMany({ 'img.data': { $exists: true } });
    console.log(`🗑️  Deleted ${result.deletedCount} pins with binary images`);

    // Show sample of deleted pins
    console.log("\n📋 Sample of deleted pins:");
    oldPins.slice(0, 5).forEach((pin, index) => {
      console.log(`   ${index + 1}. "${pin.title}" - ${pin._id}`);
    });
    if (oldPins.length > 5) {
      console.log(`   ... and ${oldPins.length - 5} more`);
    }

    // Count remaining pins
    const remainingPins = await Pins.countDocuments();
    console.log(`\n📊 Remaining pins in database: ${remainingPins}`);

  } catch (error) {
    console.error("❌ Error clearing old images:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

clearOldImages();