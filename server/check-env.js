// Script to check and validate .env file
import 'dotenv/config';
import crypto from 'crypto';

console.log('\n=== PrepWise Server Environment Variables Check ===\n');

// Required variables
const required = [
  { key: 'JWT_SECRET', description: 'JWT secret for authentication' },
  { key: 'MONGO_URI', description: 'MongoDB connection string' },
  { key: 'HUGGING_FACE_API_KEY', description: 'Hugging Face API key for AI features' },
  { key: 'CLOUDINARY_CLOUD_NAME', description: 'Cloudinary cloud name' },
  { key: 'CLOUDINARY_API_KEY', description: 'Cloudinary API key' },
  { key: 'CLOUDINARY_API_SECRET', description: 'Cloudinary API secret' },
];

// Required for email functionality
const requiredForEmail = [
  { key: 'SMTP_HOST', description: 'SMTP server host' },
  { key: 'SMTP_PORT', description: 'SMTP server port' },
  { key: 'SMTP_SECURE', description: 'SMTP secure (true/false)' },
  { key: 'SMTP_USER', description: 'SMTP username' },
  { key: 'SMTP_PASS', description: 'SMTP password' },
];

// Optional variables
const optional = [
  { key: 'PORT', description: 'Server port', default: '5000' },
  { key: 'SMTP_FROM', description: 'Email sender address' },
  { key: 'CLIENT_URL', description: 'Frontend URL', default: 'http://localhost:5173' },
];

// Variables to remove (no longer used)
const toRemove = [
  { key: 'FIREBASE_SERVICE_ACCOUNT', reason: 'Firebase authentication has been removed' },
];

console.log('--- REQUIRED VARIABLES ---');
let missingRequired = [];
required.forEach(({ key, description }) => {
  if (process.env[key]) {
    console.log(`✓ ${key}: Set`);
  } else {
    console.log(`✗ ${key}: MISSING - ${description}`);
    missingRequired.push(key);
  }
});

console.log('\n--- REQUIRED FOR EMAIL FUNCTIONALITY ---');
let missingEmail = [];
requiredForEmail.forEach(({ key, description }) => {
  if (process.env[key]) {
    console.log(`✓ ${key}: Set`);
  } else {
    console.log(`✗ ${key}: MISSING - ${description}`);
    missingEmail.push(key);
  }
});

console.log('\n--- OPTIONAL VARIABLES ---');
optional.forEach(({ key, description, default: defaultValue }) => {
  if (process.env[key]) {
    console.log(`✓ ${key}: Set (${process.env[key]})`);
  } else {
    console.log(`- ${key}: Not set ${defaultValue ? `(default: ${defaultValue})` : ''} - ${description}`);
  }
});

console.log('\n--- VARIABLES TO REMOVE (No longer used) ---');
let foundToRemove = [];
toRemove.forEach(({ key, reason }) => {
  if (process.env[key]) {
    console.log(`⚠ ${key}: FOUND - Should be removed - ${reason}`);
    foundToRemove.push(key);
  } else {
    console.log(`✓ ${key}: Not found (good)`);
  }
});

console.log('\n--- SUMMARY ---');
if (missingRequired.length === 0 && missingEmail.length === 0 && foundToRemove.length === 0) {
  console.log('✓ All required variables are set!');
  console.log('✓ No unused variables found!');
  console.log('\nYour .env file is correctly configured.');
} else {
  if (missingRequired.length > 0) {
    console.log(`✗ Missing ${missingRequired.length} required variable(s): ${missingRequired.join(', ')}`);
  }
  if (missingEmail.length > 0) {
    console.log(`⚠ Missing ${missingEmail.length} email variable(s): ${missingEmail.join(', ')}`);
    console.log('  Email functionality (OTP, password reset) will not work without these.');
  }
  if (foundToRemove.length > 0) {
    console.log(`⚠ Found ${foundToRemove.length} variable(s) to remove: ${foundToRemove.join(', ')}`);
    console.log('  These are no longer used and can be safely removed.');
  }
}

console.log('\n--- RECOMMENDATIONS ---');
if (missingRequired.length > 0) {
  console.log('1. Add missing required variables to your .env file');
}
if (missingEmail.length > 0) {
  console.log('2. Add email configuration if you want OTP and password reset functionality');
}
if (foundToRemove.length > 0) {
  console.log('3. Remove unused variables from your .env file:');
  foundToRemove.forEach(key => {
    console.log(`   - ${key}`);
  });
}
if (missingRequired.length === 0 && missingEmail.length === 0 && foundToRemove.length === 0) {
  console.log('No issues found! Your .env file is properly configured.');
}

console.log('\n');

