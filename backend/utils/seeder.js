/**
 * Database Seeder
 * Seeds the database with sample admin user, categories, and products.
 *
 * Usage:
 *   node utils/seeder.js --seed    (seed data)
 *   node utils/seeder.js --destroy (clear all data)
 */

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

const connectDB = async () => {
  await mongoose.connect(process.env.DB_URI);
  console.log("MongoDB connected for seeding...");
};

const sampleCategories = [
  { name: "Electronics", description: "Gadgets, devices, and electronics" },
  { name: "Clothing", description: "Men, women, and kids fashion" },
  { name: "Books", description: "Fiction, non-fiction, and educational books" },
  { name: "Home & Kitchen", description: "Furniture, appliances, and home decor" },
  { name: "Beauty", description: "Skincare, haircare, and personal care" },
  { name: "Sports", description: "Fitness, outdoor, and sports gear" },
  { name: "Toys", description: "Toys, games, and kids essentials" },
  { name: "Bags", description: "Backpacks, handbags, and travel gear" },
];

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@ecommerce.com",
    password: "Admin@123456",
    role: "admin",
    phone: "2025550123",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "Customer@123",
    role: "customer",
    phone: "4155550134",
  },
];

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
  ]);

  console.log("🗑️  Existing data cleared.");

  // Seed users
  const users = await User.create(sampleUsers);
  console.log(`✅ ${users.length} users seeded.`);

  // Seed categories
  const categories = await Category.create(sampleCategories);
  console.log(`✅ ${categories.length} categories seeded.`);

  // Seed products
  const sampleProducts = [
    {
      name: "Wireless Bluetooth Headphones",
      description: "Premium noise-cancelling wireless headphones with 30-hour battery life.",
      price: 149.99,
      category: categories[0]._id, // Electronics
      brand: "SoundPro",
      stock: 50,
      images: [],
      ratings: 4.5,
      numReviews: 128,
      createdBy: users[0]._id,
    },
    {
      name: "Men's Classic Fit T-Shirt",
      description: "100% cotton comfortable everyday t-shirt available in multiple colors.",
      price: 24.99,
      category: categories[1]._id, // Clothing
      brand: "BasicWear",
      stock: 200,
      images: [],
      ratings: 4.2,
      numReviews: 85,
      createdBy: users[0]._id,
    },
    {
      name: "Clean Code: A Handbook of Agile Software",
      description: "The definitive guide to writing clean, maintainable code by Robert C. Martin.",
      price: 39.99,
      category: categories[2]._id, // Books
      brand: "Prentice Hall",
      stock: 75,
      images: [],
      ratings: 4.8,
      numReviews: 512,
      createdBy: users[0]._id,
    },
    {
      name: "Stainless Steel Cookware Set",
      description: "10-piece professional cookware set with glass lids, dishwasher safe.",
      price: 199.99,
      category: categories[3]._id, // Home & Kitchen
      brand: "ChefPro",
      stock: 30,
      images: [],
      ratings: 4.6,
      numReviews: 67,
      createdBy: users[0]._id,
    },
    {
      name: "Vitamin C Brightening Serum",
      description: "Lightweight serum for brighter, more even skin tone.",
      price: 22.5,
      category: categories[4]._id, // Beauty
      brand: "GlowLab",
      stock: 120,
      images: [],
      ratings: 4.4,
      numReviews: 210,
      createdBy: users[0]._id,
    },
    {
      name: "Hydrating Face Moisturizer",
      description: "Daily moisturizer with hyaluronic acid for all skin types.",
      price: 18.99,
      category: categories[4]._id, // Beauty
      brand: "HydraCare",
      stock: 160,
      images: [],
      ratings: 4.3,
      numReviews: 145,
      createdBy: users[0]._id,
    },
    {
      name: "Adjustable Dumbbell Set",
      description: "Space-saving dumbbells with quick weight adjustment.",
      price: 129.0,
      category: categories[5]._id, // Sports
      brand: "IronFlex",
      stock: 40,
      images: [],
      ratings: 4.7,
      numReviews: 98,
      createdBy: users[0]._id,
    },
    {
      name: "Yoga Mat Pro",
      description: "Non-slip yoga mat with extra cushioning.",
      price: 29.99,
      category: categories[5]._id, // Sports
      brand: "ZenFit",
      stock: 85,
      images: [],
      ratings: 4.5,
      numReviews: 132,
      createdBy: users[0]._id,
    },
    {
      name: "Wooden Building Blocks Set",
      description: "60-piece wooden block set for creative play.",
      price: 24.5,
      category: categories[6]._id, // Toys
      brand: "PlayCraft",
      stock: 140,
      images: [],
      ratings: 4.6,
      numReviews: 76,
      createdBy: users[0]._id,
    },
    {
      name: "Remote Control Racing Car",
      description: "High-speed RC car with rechargeable battery.",
      price: 39.99,
      category: categories[6]._id, // Toys
      brand: "TurboDrive",
      stock: 95,
      images: [],
      ratings: 4.2,
      numReviews: 54,
      createdBy: users[0]._id,
    },
    {
      name: "Water-Resistant Travel Backpack",
      description: "35L backpack with padded laptop compartment.",
      price: 49.99,
      category: categories[7]._id, // Bags
      brand: "TrailPack",
      stock: 110,
      images: [],
      ratings: 4.4,
      numReviews: 88,
      createdBy: users[0]._id,
    },
    {
      name: "Leather Crossbody Bag",
      description: "Minimalist crossbody with adjustable strap.",
      price: 59.0,
      category: categories[7]._id, // Bags
      brand: "UrbanCarry",
      stock: 70,
      images: [],
      ratings: 4.3,
      numReviews: 61,
      createdBy: users[0]._id,
    },
    {
      name: "Smart LED Desk Lamp",
      description: "Dimmable desk lamp with touch controls and USB port.",
      price: 34.99,
      category: categories[3]._id, // Home & Kitchen
      brand: "LumaDesk",
      stock: 90,
      images: [],
      ratings: 4.5,
      numReviews: 73,
      createdBy: users[0]._id,
    },
    {
      name: "Noise-Isolating Earbuds",
      description: "Compact earbuds with clear sound and deep bass.",
      price: 29.99,
      category: categories[0]._id, // Electronics
      brand: "EchoPulse",
      stock: 150,
      images: [],
      ratings: 4.1,
      numReviews: 120,
      createdBy: users[0]._id,
    },
    {
      name: "Casual Denim Jacket",
      description: "Classic denim jacket with relaxed fit.",
      price: 59.99,
      category: categories[1]._id, // Clothing
      brand: "DenimWorks",
      stock: 65,
      images: [],
      ratings: 4.4,
      numReviews: 39,
      createdBy: users[0]._id,
    },
    {
      name: "Kids Storybook Collection",
      description: "Set of 5 illustrated bedtime stories.",
      price: 19.99,
      category: categories[2]._id, // Books
      brand: "StoryTime",
      stock: 130,
      images: [],
      ratings: 4.8,
      numReviews: 57,
      createdBy: users[0]._id,
    },
  ];

  const products = await Product.create(sampleProducts);
  console.log(`✅ ${products.length} products seeded.`);

  console.log("\n📋 Seeded Admin Credentials:");
  console.log("   Email:    admin@ecommerce.com");
  console.log("   Password: Admin@123456\n");

  process.exit(0);
};

const destroyData = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
  ]);
  console.log("🗑️  All data destroyed.");
  process.exit(0);
};

// CLI argument parsing
if (process.argv[2] === "--seed") {
  seedData().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else if (process.argv[2] === "--destroy") {
  destroyData().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.log("Usage: node utils/seeder.js [--seed | --destroy]");
  process.exit(0);
}


