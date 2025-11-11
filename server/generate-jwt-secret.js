import crypto from 'crypto';

const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

console.log('Generated JWT_SECRET:');
console.log(generateJwtSecret());
console.log('\nCopy this value to your .env file as JWT_SECRET=');
