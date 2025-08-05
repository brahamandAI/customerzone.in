require('dotenv').config();

console.log('🧪 Testing Environment Variables');
console.log('================================\n');

console.log('✅ Environment Variables Check:');
console.log(`RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  console.log('\n✅ Razorpay credentials are available!');
  console.log(`Key ID: ${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...`);
  console.log(`Key Secret: ${process.env.RAZORPAY_KEY_SECRET.substring(0, 10)}...`);
} else {
  console.log('\n❌ Razorpay credentials are missing!');
}

console.log('\n📋 All environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('RAZORPAY') || key.includes('GOOGLE') || key.includes('MONGODB')) {
    const value = process.env[key];
    const displayValue = value && value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`${key}: ${displayValue}`);
  }
}); 