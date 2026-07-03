import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Pins from "../Models/pinsModel.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// DEBUG: Log the loaded environment variables
console.log('############################################');
console.log('Cloudinary Config Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set (hidden)' : '❌ Missing');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('############################################\n');

// EXPLICITLY configure Cloudinary with the environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Verify Cloudinary configuration
try {
  // Test the configuration by trying to get account info
  console.log('✅ Cloudinary configured successfully');
} catch (error) {
  console.error('❌ Cloudinary configuration failed:', error.message);
  process.exit(1);
}

// MongoDB Connection URI
const MONGO_URI = process.env.MONGO_URI;

// Provide a valid User ID from your database
const USER_ID = new mongoose.Types.ObjectId("6a3f7c2184d5861d3286dbd3");

// Image directory
const IMAGE_DIR = process.env.IMAGE_DIR || path.resolve(__dirname, "../uploads");

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'pins/seed',
          resource_type: 'auto',
          ...options
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error details:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      // Write buffer to stream
      uploadStream.write(buffer);
      uploadStream.end();
    } catch (error) {
      console.error('Upload stream error:', error);
      reject(error);
    }
  });
};


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
  },
  {
    fileName: "pexels-aditya-aiyar-615049-1545668.jpg",
    title: "Nescafe Coffee Mug",
    about: "A bright red Nescafe coffee mug held against a lush green monstera leaf background.",
    category: "Beverages",
    tags: ["coffee", "mug", "nescafe", "nature"]
  },
  {
    fileName: "pexels-ali-dashti-506667798-17255941.jpg",
    title: "Fresh Lemonade in the Sun",
    about: "A refreshing glass of iced lemonade garnished with fresh mint leaves and a lemon slice, casting sharp summer shadows on a neutral background.",
    category: "Beverages",
    tags: ["lemonade", "refreshing", "summer", "ice", "drink", "shadows"]
  },
  {
    fileName: "pexels-anjana-c-169994-674010.jpg",
    title: "Majestic Peacock Feather",
    about: "An extreme macro shot detailing the mesmerizing blue and green eye pattern of a vibrant peacock feather.",
    category: "Animals & Wildlife",
    tags: ["peacock", "feather", "macro", "texture", "vibrant", "nature"]
  },
  {
    fileName: "pexels-anna-moreva-67499979-11444315.jpg",
    title: "Glass of White Wine with White Grapes",
    about: "An elegant, brightly lit setting featuring a glass of white wine paired with a cluster of fresh green grapes on a matching surface.",
    category: "Beverages",
    tags: ["wine", "grapes", "glass", "elegant", "aesthetic", "white wine"]
  },
  {
    fileName: "pexels-daniel-fabian-594486237-17146786.jpg",
    title: "Chilled Matcha Latte Art",
    about: "A glass of iced matcha green tea latte showing beautiful milky swirls, shot from an artistic top-down perspective.",
    category: "Beverages",
    tags: ["matcha", "latte", "iced tea", "green tea", "aesthetic", "cafe"]
  },
  {
    fileName: "pexels-daria-liudnaya-7354666.jpg",
    title: "Aesthetic Dried Florals",
    about: "A minimalist, warm-toned composition of delicate dried flowers and textured cotton bolls arranged neatly on a beige canvas.",
    category: "Art & Design",
    tags: ["dried flowers", "cotton", "minimalist", "beige", "aesthetic", "cozy"]
  },
  {
    fileName: "pexels-deepak-ramesha-294760-33902690.jpg",
    title: "Vintage Pocket Watch Detail",
    about: "A close-up photograph showcasing the intricate internal gears, cogs, and metallic craftsmanship of a classic antique pocket watch.",
    category: "Photography",
    tags: ["vintage", "watch", "antique", "gears", "macro", "steampunk"]
  },
  {
    fileName: "pexels-desertedinurban-4462781.jpg",
    title: "Cozy Bedroom Morning Sunlight",
    about: "Warm, soft morning light filtering through a window onto a neatly made bed with white linens and an overhead wicker lampshade.",
    category: "Architecture & Interior",
    tags: ["bedroom", "sunlight", "interior", "minimalist", "cozy", "aesthetic"]
  },
  {
    fileName: "pexels-ekrulila-3246665.jpg",
    title: "Minimalist Dried Pampas Grass",
    about: "A soft, neutral-toned close-up of fluffy pampas grass plumes arranged beautifully against a clean background.",
    category: "Wallpapers & Backgrounds",
    tags: ["pampas grass", "neutral", "boho", "aesthetic", "minimalist", "decor"]
  },
  {
    fileName: "pexels-esra-afsar-123882149-34644109.jpg",
    title: "Elegantly Poured Iced Coffee",
    about: "A dynamic shot capturing milk swirling into a glass of rich iced coffee, surrounded by a dark, moody background.",
    category: "Beverages",
    tags: ["coffee", "iced coffee", "latte", "swirl", "moody", "caffeine"]
  },
  {
    fileName: "pexels-oandremoura-9083011.jpg",
    title: "Chilled Orange Cocktail by the Pool",
    about: "A vibrant, ice-cold orange citrus cocktail served in a classic glass, positioned beautifully at the edge of a bright blue swimming pool on a sunny day.",
    category: "Beverages",
    tags: ["cocktail", "pool", "summer", "refreshing", "orange", "vacation"]
  },
  {
    fileName: "pexels-peterfazekas-1653629.jpg",
    title: "Fresh Strawberry Mojito",
    about: "A clear glass filled with a refreshing strawberry mojito, packed with fresh strawberries, lime slices, crushed ice, and vibrant mint leaves.",
    category: "Beverages",
    tags: ["mojito", "strawberry", "lime", "mint", "summer", "cocktail"]
  },
  {
    fileName: "pexels-pixabay-326311.jpg",
    title: "Resting Blue Butterfly",
    about: "A gorgeous blue and black patterned butterfly resting peacefully on a cluster of soft, delicate pink flowers.",
    category: "Animals & Wildlife",
    tags: ["butterfly", "insect", "nature", "flowers", "pink", "wildlife"]
  },
  {
    fileName: "pexels-rahimegul-34286082.jpg",
    title: "Delicate White Lilies in Bloom",
    about: "A collection of pristine white lily blossoms opening up gracefully, showcasing their long stamens against a soft, muted natural background.",
    category: "Gardening & Plants",
    tags: ["lilies", "white flowers", "bloom", "floral", "elegant", "nature"]
  },
  {
    fileName: "pexels-roman-odintsov-12715260.jpg",
    title: "Aesthetic Grapefruit Tonic Drink",
    about: "An elegant, back-lit glass containing a pink grapefruit cocktail garnished with a fresh rosemary sprig and dehydrated citrus wheel.",
    category: "Beverages",
    tags: ["grapefruit", "cocktail", "aesthetic", "rosemary", "refreshing", "mocktail"]
  },
  {
    fileName: "pexels-roshan-kamath-793618-1661179.jpg",
    title: "Vibrant Blue Macaw Close-up",
    about: "A striking portrait of a Hyacinth Macaw, highlighting its deep cobalt blue feathers and the distinct bright yellow patches around its eye and beak.",
    category: "Animals & Wildlife",
    tags: ["macaw", "parrot", "bird", "blue", "vibrant", "photography"]
  },
  {
    fileName: "pexels-santiago-pagnotta-828256-1702624.jpg",
    title: "Freshly Poured Espresso Shot",
    about: "A shot of intense espresso being poured into a transparent glass mug, capturing the thick, rich crema forming on top.",
    category: "Beverages",
    tags: ["coffee", "espresso", "crema", "caffeine", "barista", "cafe"]
  },
  {
    fileName: "pexels-sean-275577670-12909944.jpg",
    title: "Golden Sparkly Festive Beverage",
    about: "A tall glass filled with a sparkling golden beverage, decorated with a tiny star accent on the rim against a warm, festive bokeh background.",
    category: "Beverages",
    tags: ["sparkling", "golden", "festive", "holiday", "celebration", "drink"]
  },
  {
    fileName: "pexels-skinny-alien-671805-2318554.jpg",
    title: "Stunning Sun-lit Palm Tree Silhouette",
    about: "An artistic shot looking straight up past a palm tree trunk towards the vibrant green fronds perfectly backlit by a bright, warm sun.",
    category: "Wallpapers & Backgrounds",
    tags: ["palm tree", "tropical", "sunlight", "summer", "nature", "aesthetic"]
  },
  {
    fileName: "pexels-suzyhazelwood-2445890.jpg",
    title: "Soft Vintage Dried Flowers",
    about: "A gentle, romantic composition of muted pink and cream dried hydrangea petals spread out on a warm, textured vintage surface.",
    category: "Art & Design",
    tags: ["dried flowers", "vintage", "hydrangea", "pastel", "aesthetic", "cozy"]
  },
  {
    fileName: "pexels-jessbaileydesign-1172849.jpg",
    title: "Minimalist Purple Daisy and Wildflowers",
    about: "A clean, minimalist flat-lay composition featuring a single deep purple daisy alongside two delicate green sprigs of wild shepherd's purse on a crisp white background.",
    category: "Nature & Photography",
    tags: ["purple daisy", "wildflowers", "minimalist", "flat-lay", "clean", "floral"]
  },
  {
    fileName: "pexels-roshan-kamath-793618-1661179.jpg",
    title: "Vibrant Blue-crowned Hanging Parrot",
    about: "A close-up shot of a bright green parrot, likely a blue-crowned hanging parrot, featuring a distinct blue patch on its throat, a sharp orange beak, and vibrant red tail feathers, perched on a dried palm leaf.",
    category: "Wildlife & Nature",
    tags: ["parrot", "green bird", "tropical", "wildlife", "vibrant", "exotic"]
  },
  {
    fileName: "pexels-santiago-pagnotta-828256-1702624.jpg",
    title: "Colorful Geometric Basketball Court",
    about: "An artistic, urban basketball court featuring bold geometric patterns and smooth color gradients transitioning through shades of pink, purple, blue, yellow, and orange on the walls and ground.",
    category: "Art & Design",
    tags: ["basketball court", "geometric", "gradient", "urban art", "colorful", "architecture"]
  },
  {
    fileName: "pexels-sean-275577670-12909944.jpg",
    title: "Camels at the Ancient City of Petra",
    about: "Two camels adorned in traditional, brightly patterned woven saddles and reins resting in front of the historic stone-carved facades of Petra, Jordan.",
    category: "Travel & Culture",
    tags: ["camels", "petra", "jordan", "desert", "ancient history", "travel"]
  },
  {
    fileName: "pexels-skinny-alien-671805-2318554.jpg",
    title: "Moody Elephant Ear Foliage",
    about: "A low-key, dramatic top-down view of large, heart-shaped green taro or elephant ear leaves emerging contrastingly from a deep, pitch-black background.",
    category: "Nature & Photography",
    tags: ["foliage", "leaves", "elephant ear", "moody", "dark background", "botanical"]
  },
  {
    fileName: "pexels-suzyhazelwood-2445890.jpg",
    title: "Dense Green Boxwood Leaves",
    about: "A lush and compact full-frame texture pattern composed entirely of small, oval-shaped dark green boxwood shrub leaves.",
    category: "Nature & Backgrounds",
    tags: ["boxwood", "leaves", "shrub", "greenery", "texture", "natural pattern"]
  },
  {
    fileName: "pexels-szafran-33409092.jpg",
    title: "Flowering Rush by the Water",
    about: "A single flowering rush stem stands tall against a softly blurred, golden-hour water background, showcasing an umbrella-like cluster of small pink and white blossoms.",
    category: "Nature & Photography",
    tags: ["flowering rush", "aquatic plant", "golden hour", "wildflower", "serene", "bokeh"]
  },
  {
    fileName: "pexels-unchalee-srirugsar-14114-85773.jpg",
    title: "Vibrant Multicolored Daisy Bouquet",
    about: "A cheerful, close-up explosion of color featuring dyed daisy chrysanthemums in brilliant shades of pink, lime green, bright blue, magenta, and yellow.",
    category: "Art & Design",
    tags: ["daisies", "colorful", "bright", "dyed flowers", "chrysanthemum", "festive"]
  },
  {
    fileName: "pexels-veronika-andrews-2153322013-33593658.jpg",
    title: "Hummingbird Hovering Near Bee Balm",
    about: "An action shot capturing a tiny hummingbird suspended mid-air as it approaches a striking, shaggy red bee balm (monarda) flower to feed.",
    category: "Wildlife & Nature",
    tags: ["hummingbird", "bee balm", "red flower", "mid-air", "wildlife", "pollination"]
  }
];

async function uploadImages() {
  let successfulUploads = 0;
  let failedUploads = 0;

  try {
    // Check Cloudinary credentials
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Cloudinary credentials not found in environment variables!");
      console.log("Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET");
      return;
    }

    // Connect to MongoDB
    if (!MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in .env file");
      return;
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ Successfully connected to MongoDB.");

    // Check if uploads directory exists
    if (!fs.existsSync(IMAGE_DIR)) {
      console.error(`❌ Image directory not found: ${IMAGE_DIR}`);
      console.log(`Please create the directory or set IMAGE_DIR in .env`);
      return;
    }

    console.log(`\n📁 Processing ${imagesToUpload.length} images from: ${IMAGE_DIR}\n`);

    for (const [index, imgData] of imagesToUpload.entries()) {
      try {
        const filePath = path.resolve(IMAGE_DIR, imgData.fileName);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.warn(`⚠️  [${index + 1}/${imagesToUpload.length}] File not found: ${imgData.fileName}`);
          failedUploads++;
          continue;
        }

        // Read file
        const fileBuffer = fs.readFileSync(filePath);
        const contentType = imgData.fileName.endsWith(".png") 
          ? "image/png" 
          : "image/jpeg";

        // Upload to Cloudinary
        console.log(`📤 [${index + 1}/${imagesToUpload.length}] Uploading: "${imgData.title}"...`);
        
        const cloudinaryResult = await uploadToCloudinary(fileBuffer, {
          public_id: `${Date.now()}_${imgData.fileName.split('.')[0]}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
          ]
        });

        // Create pin in database with Cloudinary URL
        await Pins.create({
          title: imgData.title,
          about: imgData.about,
          img: {
            url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id,
            contentType: contentType,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            format: cloudinaryResult.format
          },
          createdUser: USER_ID,
          category: imgData.category,
          tags: imgData.tags,
          save: [],
          likes: [],
          comments: [],
        });

        console.log(`✅ [${index + 1}/${imagesToUpload.length}] Uploaded successfully: "${imgData.title}"`);
        console.log(`   🔗 URL: ${cloudinaryResult.secure_url}\n`);
        successfulUploads++;

      } catch (error) {
        console.error(`❌ [${index + 1}/${imagesToUpload.length}] Failed to upload: "${imgData.title}"`);
        console.error(`   Error: ${error.message}`);
        if (error.error) {
          console.error(`   Cloudinary Error: ${JSON.stringify(error.error)}`);
        }
        console.error('');
        failedUploads++;
      }
    }

    // Summary
    console.log("═══════════════════════════════════════");
    console.log("📊 Upload Summary:");
    console.log(`   ✅ Successful: ${successfulUploads}`);
    console.log(`   ❌ Failed: ${failedUploads}`);
    console.log(`   📁 Total: ${imagesToUpload.length}`);
    console.log("═══════════════════════════════════════\n");

  } catch (error) {
    console.error("❌ Error during upload process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

// Run the upload
uploadImages();