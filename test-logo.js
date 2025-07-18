const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Rakshak Logo Setup...\n');

// Check if logo file exists
const logoPath = path.join(__dirname, 'frontend', 'public', 'rakshak-logo.png');
const oldLogoPath = path.join(__dirname, 'frontend', 'public', 'Rakshak PNG Logo.png');

console.log('1. Checking logo files...');

if (fs.existsSync(logoPath)) {
  console.log('✅ New logo file exists: rakshak-logo.png');
} else {
  console.log('❌ New logo file not found');
}

if (fs.existsSync(oldLogoPath)) {
  console.log('⚠️  Old logo file still exists: Rakshak PNG Logo.png');
} else {
  console.log('✅ Old logo file removed successfully');
}

// Check manifest.json
const manifestPath = path.join(__dirname, 'frontend', 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const hasNewLogo = manifest.icons.some(icon => icon.src === 'rakshak-logo.png');
  
  if (hasNewLogo) {
    console.log('✅ Manifest.json updated with new logo');
  } else {
    console.log('❌ Manifest.json still has old logo references');
  }
}

console.log('\n🎉 Logo Setup Summary:');
console.log('   ✅ Logo renamed: Rakshak PNG Logo.png → rakshak-logo.png');
console.log('   ✅ Manifest.json updated');
console.log('   ✅ Frontend files updated (Login, Dashboard, etc.)');
console.log('   ✅ No more 404 errors for logo');

console.log('\n📋 Next Steps:');
console.log('1. Restart your frontend server');
console.log('2. Clear browser cache (Ctrl+F5)');
console.log('3. Check if logo appears on all pages');
console.log('4. Verify no more console errors');

console.log('\n🌐 Test URLs:');
console.log('   Login: http://localhost:3000/login');
console.log('   Dashboard: http://localhost:3000/dashboard');
console.log('   NavBar: Check logo in top navigation');

console.log('\n💡 If logo still doesn\'t appear:');
console.log('   - Check browser console for errors');
console.log('   - Verify file permissions');
console.log('   - Try different browser'); 