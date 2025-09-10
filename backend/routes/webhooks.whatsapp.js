const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { parseExpenseText } = require('../services/chat-parsers');
const { sendText, fetchMedia } = require('../services/whatsapp.service');
const Expense = require('../models/Expense');
const User = require('../models/User');
const policyService = require('../services/policy.service');

// In-memory confirmation store: { phone: { parsed, attachments } }
const pendingByPhone = new Map();

// Verification endpoint
router.get('/whatsapp', (req, res) => {
  const verifyToken = (process.env.WHATSAPP_VERIFY_TOKEN || '').trim();
  const mode = (req.query['hub.mode'] || req.query['hub_mode'] || '').toString().trim().toLowerCase();
  const token = (req.query['hub.verify_token'] || req.query['hub_verify_token'] || '').toString().trim();
  const challenge = (req.query['hub.challenge'] || req.query['hub_challenge'] || '').toString();

  try {
    console.log('🔎 WhatsApp webhook verify called:', {
      mode,
      tokenLength: token.length,
      hasVerifyToken: !!verifyToken,
      match: token === verifyToken
    });
  } catch {}

  if ((mode === 'subscribe' || mode === 'subscription') && token === verifyToken && challenge) {
    return res.status(200).send(challenge);
  }

  // Provide a tiny hint to logs when failing
  try { console.warn('❌ WhatsApp webhook verify failed'); } catch {}
  return res.sendStatus(403);
});

// Receive webhook
router.post('/whatsapp', async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const msg = change?.value?.messages?.[0];
    if (!msg) return res.sendStatus(200);

    const from = msg.from; // phone
    const type = msg.type;

    // Find user by phone
    const user = await User.findOne({ phone: from, isActive: true });
    if (!user) {
      await sendText(from, 'Your phone is not registered. Please contact admin.');
      return res.sendStatus(200);
    }

    if (type === 'text' || type === 'location') {
      if (type === 'location' && msg.location) {
        const prev = pendingByPhone.get(from) || {}; 
        prev.location = { lat: msg.location.latitude, lng: msg.location.longitude, accuracy: msg.location?.accuracy || undefined };
        pendingByPhone.set(from, prev);
        await sendText(from, 'Location received. Now send: Expense: ₹250 lunch at Barista, 12 Aug, Cash');
        return res.sendStatus(200);
      }
      const text = msg.text?.body || '';
      const t = text.trim().toUpperCase();
      if (t === 'YES' && pendingByPhone.has(from)) {
        const pending = pendingByPhone.get(from);
        const { amount, date, paymentMethod, category, title } = pending.parsed;
        const attachments = [];
        // persist attachment buffer if any to uploads/expense-attachments
        if (pending.attachmentBuffer) {
          const uploadDir = path.join(__dirname, '..', 'uploads', 'expense-attachments');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          const filename = `expense-${Date.now()}-${Math.floor(Math.random()*1e9)}.jpg`;
          const full = path.join(uploadDir, filename);
          fs.writeFileSync(full, pending.attachmentBuffer);
          attachments.push({ filename, originalName: filename, path: full, size: pending.attachmentBuffer.length, mimetype: 'image/jpeg', isReceipt: true });
        }

        // Build expense
        const expenseData = {
          expenseNumber: `EXP-${(Date.now()%9999+1).toString().padStart(4,'0')}`,
          title: title || 'WhatsApp Expense',
          description: 'Submitted via WhatsApp',
          amount: amount || 0,
          currency: 'INR',
          category,
          expenseDate: date,
          submittedById: user._id,
          siteId: user.site,
          department: user.department || 'Operations',
          attachments
        };

        // Evaluate policy flags
        const evaluation = await policyService.evaluateExpense({
          ...expenseData,
          submittedBy: user._id,
          site: user.site,
          location: pending.location ? { type: 'Point', coordinates: [pending.location.lng, pending.location.lat], accuracy: pending.location.accuracy } : undefined
        });

        // Create in DB using model directly (mirrors route behavior)
        const ExpenseModel = require('../models/Expense');
        const newExpense = new ExpenseModel({
          expenseNumber: expenseData.expenseNumber,
          title: expenseData.title,
          description: expenseData.description,
          amount: expenseData.amount,
          currency: 'INR',
          category: expenseData.category,
          expenseDate: expenseData.expenseDate,
          submittedBy: user._id,
          site: user.site,
          department: expenseData.department,
          attachments: expenseData.attachments,
          receiptHash: evaluation.receiptHash,
          normalizedKey: evaluation.normalizedKey,
          policyFlags: evaluation.flags,
          riskScore: evaluation.riskScore,
          status: evaluation.nextAction === 'ESCALATE' ? 'under_review' : 'submitted',
          location: pending.location ? { type: 'Point', coordinates: [pending.location.lng, pending.location.lat], accuracy: pending.location.accuracy } : undefined
        });
        await newExpense.save();

        await sendText(from, `Expense created: ${newExpense.expenseNumber}\nFlags: ${(evaluation.flags||[]).join(', ') || 'None'}`);
        pendingByPhone.delete(from);
        return res.sendStatus(200);
      }

      // New parse flow
      const parsed = parseExpenseText(text);
      if (!parsed.amount) {
        await sendText(from, 'Please send: Expense: ₹250 lunch at Barista, 12 Aug, Cash');
        return res.sendStatus(200);
      }
      pendingByPhone.set(from, { parsed });
      await sendText(from, `Confirm expense:\nTitle: ${parsed.title}\nAmount: ₹${parsed.amount}\nCategory: ${parsed.category}\nDate: ${new Date(parsed.date).toDateString()}\nPayment: ${parsed.paymentMethod}\nReply YES to create or EDIT to change.`);
      return res.sendStatus(200);
    }

    if (type === 'image' || type === 'document') {
      const mediaId = (type === 'image' ? msg.image?.id : msg.document?.id);
      if (mediaId) {
        const buffer = await fetchMedia(mediaId);
        const prev = pendingByPhone.get(from) || {}; prev.attachmentBuffer = buffer; pendingByPhone.set(from, prev);
        await sendText(from, 'Attachment received. Now send details like: Expense: ₹250 lunch at Barista, 12 Aug, Cash');
      }
      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (e) {
    console.error('WhatsApp webhook error:', e.message);
    return res.sendStatus(200);
  }
});

module.exports = router;


