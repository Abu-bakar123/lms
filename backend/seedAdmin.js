/**
 * Admin Seed Script
 * Run this script to create an admin user
 * Usage: node seedAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use the same MongoDB Atlas URI from .env
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://farooqabubakar2000_db_user:26z6QbKLShZQ355u@cluster0.ltcwzvr.mongodb.net/?appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password method
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

const seedAdmin = async () => {
  try {
    await connectDB();

    // First, try to update existing admin to the new credentials
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      // Update admin to new credentials
      existingAdmin.name = 'Admin';
      existingAdmin.email = 'admin@admin.com';
      existingAdmin.password = 'admin';
      existingAdmin.bio = 'System Administrator';
      await existingAdmin.save();
      console.log('Admin user updated successfully!');
      console.log('Admin email: admin@admin.com');
      console.log('Admin password: admin');
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin', // Admin password - admin
        role: 'admin',
        bio: 'System Administrator'
      });
      
      console.log('Admin user created successfully!');
      console.log('Admin email: admin@admin.com');
      console.log('Admin password: admin');
    }

    // Also create a demo instructor
    const instructorExists = await User.findOne({ email: 'instructor@lms.com' });
    
    if (!instructorExists) {
      await User.create({
        name: 'John Smith',
        email: 'instructor@lms.com',
        password: 'instructor123',
        role: 'instructor',
        bio: 'Expert instructor with 10+ years of experience'
      });
      console.log('Demo instructor created: instructor@lms.com / instructor123');
    }

    // Also create a demo student
    const studentExists = await User.findOne({ email: 'student@lms.com' });
    
    if (!studentExists) {
      await User.create({
        name: 'Jane Doe',
        email: 'student@lms.com',
        password: 'student123',
        role: 'student',
        bio: 'Eager learner'
      });
      console.log('Demo student created: student@lms.com / student123');
    }

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
