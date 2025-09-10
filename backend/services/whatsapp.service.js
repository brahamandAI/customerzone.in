const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

async function sendText(toPhone, text) {
  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;
  await axios.post(url, {
    messaging_product: 'whatsapp',
    to: toPhone,
    type: 'text',
    text: { body: text }
  }, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
  });
}

async function fetchMedia(mediaId) {
  // Step 1: get media url
  const metaUrl = `https://graph.facebook.com/v19.0/${mediaId}`;
  const metaRes = await axios.get(metaUrl, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
  const mediaUrl = metaRes.data?.url;
  if (!mediaUrl) throw new Error('No media URL');
  // Step 2: download binary
  const binRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
  return Buffer.from(binRes.data);
}

module.exports = { sendText, fetchMedia };


