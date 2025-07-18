require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV); 