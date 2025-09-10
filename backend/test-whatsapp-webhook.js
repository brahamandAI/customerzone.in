// Simulate WhatsApp webhook POST payloads locally
const axios = require('axios');

async function sendText(from, text) {
  const payload = {
    entry: [{
      changes: [{
        value: {
          messages: [{ from, type: 'text', text: { body: text } }]
        }
      }]
    }]
  };
  const res = await axios.post('http://localhost:5001/webhooks/whatsapp', payload);
  console.log('Text sent:', res.status);
}

async function main() {
  await sendText('919999999999', 'Expense: ₹250 lunch at Barista, 12 Aug, Cash');
  await sendText('919999999999', 'YES');
}

main().catch(console.error);


