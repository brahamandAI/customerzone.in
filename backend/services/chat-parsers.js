const dayjs = require('dayjs');

function parseAmount(text) {
  const m = text.match(/(?:₹|rs\.?\s*)\s*(\d+[\d,.]*)|\b(\d+[\d,.]*)\b/i);
  if (!m) return null;
  return Number(String(m[1] || m[2]).replace(/[,]/g, '')) || null;
}

function parseDate(text) {
  const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return dayjs(iso[1]).toDate();
  const dmy = text.match(/\b(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i);
  if (dmy) {
    const day = dmy[1];
    const mon = dmy[2];
    const year = new Date().getFullYear();
    return dayjs(`${day} ${mon} ${year}`, 'D MMM YYYY').toDate();
  }
  return new Date();
}

function parsePayment(text) {
  const t = text.toLowerCase();
  if (t.includes('cash')) return 'Cash';
  if (t.includes('card')) return 'Card';
  if (t.includes('upi')) return 'UPI';
  return 'Cash';
}

function guessCategory(text) {
  const t = text.toLowerCase();
  if (/taxi|cab|uber|ola|flight|train|bus|travel/.test(t)) return 'Travel';
  if (/lunch|dinner|food|meal|restaurant|barista|cafe/.test(t)) return 'Food';
  if (/hotel|stay|accommodation|room/.test(t)) return 'Accommodation';
  if (/fuel|petrol|diesel/.test(t)) return 'Fuel';
  return 'Miscellaneous';
}

function extractTitle(text) {
  const after = text.split(':')[1] || text;
  return after.trim().slice(0, 120);
}

function parseExpenseText(text) {
  const amount = parseAmount(text);
  const date = parseDate(text);
  const paymentMethod = parsePayment(text);
  const category = guessCategory(text);
  const title = extractTitle(text);
  return { amount, date, paymentMethod, category, title };
}

module.exports = {
  parseExpenseText,
};


