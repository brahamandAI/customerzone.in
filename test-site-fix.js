// Test script to verify site comparison fix
console.log('🧪 Testing Site Comparison Fix\n');

// Simulate the different scenarios we're handling

// Scenario 1: userSite is a populated object (like in the logs)
const userSiteObject = {
  _id: '68a46dc17f71aa1b3363a363',
  name: 'Rohini',
  code: 'ROHINI',
  location: {
    address: 'Sector-17, Rohini, Delhi',
    city: 'Rohini',
    state: 'Delhi',
    pincode: '122103',
    country: 'India'
  }
};

// Scenario 2: userSite is a string
const userSiteString = '68a46dc17f71aa1b3363a363';

// Scenario 3: userSite is an ObjectId
const userSiteObjectId = { _bsontype: 'ObjectID', toString: () => '68a46dc17f71aa1b3363a363' };

// Test site ID
const siteId = '68a46dc17f71aa1b3363a363';

// Function to extract userSiteId (same logic as in our fix)
function extractUserSiteId(userSite) {
  if (typeof userSite === 'string') {
    return userSite;
  } else if (userSite && userSite._bsontype === 'ObjectID') {
    return userSite.toString();
  } else if (userSite && userSite._id) {
    return userSite._id.toString();
  } else if (userSite && userSite.id) {
    return userSite.id.toString();
  }
  return null;
}

// Test all scenarios
console.log('1️⃣ Testing userSite as populated object:');
const result1 = extractUserSiteId(userSiteObject);
console.log('   Input:', userSiteObject);
console.log('   Extracted ID:', result1);
console.log('   Match with siteId:', result1 === siteId);
console.log('');

console.log('2️⃣ Testing userSite as string:');
const result2 = extractUserSiteId(userSiteString);
console.log('   Input:', userSiteString);
console.log('   Extracted ID:', result2);
console.log('   Match with siteId:', result2 === siteId);
console.log('');

console.log('3️⃣ Testing userSite as ObjectId:');
const result3 = extractUserSiteId(userSiteObjectId);
console.log('   Input:', userSiteObjectId);
console.log('   Extracted ID:', result3);
console.log('   Match with siteId:', result3 === siteId);
console.log('');

console.log('4️⃣ Testing null/undefined userSite:');
const result4 = extractUserSiteId(null);
console.log('   Input: null');
console.log('   Extracted ID:', result4);
console.log('');

console.log('🎉 All tests completed!');
console.log('✅ If all matches are true, the fix should work correctly.');
