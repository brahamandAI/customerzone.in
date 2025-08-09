// Test camera functionality
console.log('Testing camera functionality...');

// Check if getUserMedia is supported
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.error('❌ Camera API not supported');
} else {
  console.log('✅ Camera API supported');
  
  // Test camera access
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      console.log('✅ Camera access granted');
      console.log('Stream tracks:', stream.getTracks());
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
    })
    .catch(error => {
      console.error('❌ Camera access denied:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    });
}

// Test canvas functionality
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
if (context) {
  console.log('✅ Canvas 2D context supported');
} else {
  console.error('❌ Canvas 2D context not supported');
}
