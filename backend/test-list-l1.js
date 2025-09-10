require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshak-expense';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const l1s = await User.find({ role: 'l1_approver', isActive: true }).select('name role site email');
  console.log('Active L1s:', l1s.map(u => ({ id: u._id.toString(), name: u.name, site: (u.site && u.site.toString ? u.site.toString() : u.site), email: u.email })));
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });


