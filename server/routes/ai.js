import express from 'express';
import { protect } from '../middleware/auth.js';
import Medicine from '../models/Medicine.js';
import Order from '../models/Order.js';

const router = express.Router();

router.use(protect);

// ─── Symptom-to-medicine mapping (built-in knowledge base) ───
const symptomMedicineMap = {
  fever: { keywords: ['fever', 'temperature', 'hot', 'pyrexia'], categories: ['Antipyretics', 'Pain Relief'], terms: ['paracetamol', 'ibuprofen', 'aspirin', 'acetaminophen'] },
  headache: { keywords: ['headache', 'head pain', 'migraine', 'head ache'], categories: ['Pain Relief', 'Antipyretics'], terms: ['paracetamol', 'ibuprofen', 'aspirin', 'excedrin'] },
  cold: { keywords: ['cold', 'runny nose', 'sneeze', 'sneezing', 'nasal'], categories: ['Cold & Flu', 'Decongestants'], terms: ['cetirizine', 'pseudoephedrine', 'phenylephrine', 'antihistamine'] },
  cough: { keywords: ['cough', 'dry cough', 'wet cough', 'sore throat', 'throat'], categories: ['Cough & Cold', 'Throat'], terms: ['dextromethorphan', 'guaifenesin', 'honey', 'cough syrup', 'lozenge'] },
  allergy: { keywords: ['allergy', 'allergic', 'rash', 'itching', 'hives', 'urticaria'], categories: ['Antihistamines', 'Allergy'], terms: ['cetirizine', 'loratadine', 'fexofenadine', 'diphenhydramine'] },
  stomach: { keywords: ['stomach', 'acidity', 'indigestion', 'gas', 'bloating', 'nausea', 'vomiting'], categories: ['Digestive', 'Antacids'], terms: ['omeprazole', 'antacid', 'ranitidine', 'pantoprazole', 'domperidone'] },
  pain: { keywords: ['pain', 'body pain', 'muscle pain', 'joint pain', 'back pain', 'ache'], categories: ['Pain Relief', 'Anti-inflammatory'], terms: ['ibuprofen', 'diclofenac', 'paracetamol', 'naproxen', 'muscle relaxant'] },
  diarrhea: { keywords: ['diarrhea', 'loose motion', 'loose stool', 'watery stool'], categories: ['Digestive', 'Antidiarrheal'], terms: ['loperamide', 'ors', 'oral rehydration', 'zinc'] },
  skin: { keywords: ['skin', 'acne', 'pimple', 'wound', 'cut', 'burn', 'infection'], categories: ['Skin Care', 'Topical', 'Dermatology'], terms: ['antiseptic', 'clotrimazole', 'betadine', 'neosporin', 'calamine'] },
  diabetes: { keywords: ['diabetes', 'blood sugar', 'sugar level', 'glucose'], categories: ['Diabetes', 'Antidiabetic'], terms: ['metformin', 'glimepiride', 'insulin', 'glucometer'] },
  bp: { keywords: ['blood pressure', 'hypertension', 'bp', 'high bp'], categories: ['Cardiovascular', 'Antihypertensive'], terms: ['amlodipine', 'losartan', 'atenolol', 'telmisartan'] },
  vitamins: { keywords: ['vitamin', 'weakness', 'fatigue', 'tired', 'energy', 'immunity'], categories: ['Vitamins', 'Supplements'], terms: ['vitamin c', 'vitamin d', 'multivitamin', 'iron', 'calcium', 'zinc'] },
  eye: { keywords: ['eye', 'eyes', 'dry eye', 'red eye', 'eye pain', 'vision'], categories: ['Eye Care', 'Ophthalmic'], terms: ['eye drop', 'lubricant', 'artificial tears'] },
  sleep: { keywords: ['sleep', 'insomnia', 'sleepless', 'cant sleep', 'anxiety', 'stress'], categories: ['Sleep Aid', 'Anxiety'], terms: ['melatonin', 'valerian', 'chamomile'] }
};

/**
 * POST /api/ai/symptom-check - AI symptom checker
 * Accepts: { symptoms: "I have fever and headache" }
 */
router.post('/symptom-check', async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ success: false, message: 'Please describe your symptoms' });
    }

    const lowerSymptoms = symptoms.toLowerCase();
    const matchedTerms = new Set();
    const matchedCategories = new Set();
    const matchedConditions = [];

    // Find matching conditions
    for (const [condition, data] of Object.entries(symptomMedicineMap)) {
      const found = data.keywords.some(kw => lowerSymptoms.includes(kw));
      if (found) {
        matchedConditions.push(condition);
        data.terms.forEach(t => matchedTerms.add(t));
        data.categories.forEach(c => matchedCategories.add(c));
      }
    }

    if (matchedTerms.size === 0) {
      // Fallback: search medicine names directly
      const directSearch = await Medicine.find({
        isActive: true,
        $text: { $search: symptoms }
      }).limit(10).select('name price image stock description dosageForm strength discount');

      return res.json({
        success: true,
        data: {
          conditions: [],
          suggestions: directSearch,
          message: 'We found some medicines that might help. Please consult a doctor for proper diagnosis.'
        }
      });
    }

    // Search medicines by matched terms
    const termRegex = matchedTerms.size > 0
      ? new RegExp([...matchedTerms].join('|'), 'i')
      : null;

    const query = {
      isActive: true,
      $or: []
    };

    if (termRegex) {
      query.$or.push({ name: termRegex });
      query.$or.push({ genericName: termRegex });
      query.$or.push({ description: termRegex });
      query.$or.push({ uses: { $in: [...matchedTerms].map(t => new RegExp(t, 'i')) } });
    }

    if (query.$or.length === 0) delete query.$or;

    const suggestions = await Medicine.find(query)
      .limit(15)
      .select('name price image stock description dosageForm strength discount uses sideEffects')
      .sort('-stock');

    res.json({
      success: true,
      data: {
        conditions: matchedConditions,
        suggestions,
        disclaimer: 'These are general suggestions only. Please consult a qualified healthcare professional before taking any medication.',
        message: `Based on your symptoms, you may be experiencing: ${matchedConditions.join(', ')}. Here are some medicines that might help.`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai/chat - AI chatbot for medicine queries
 * Accepts: { message: "What medicine for fever?" }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const lowerMsg = message.toLowerCase();

    // Detect intent
    let intent = 'general';
    let responseText = '';
    let medicines = [];

    // Medicine recommendation intent
    const medicineIntents = ['medicine for', 'tablet for', 'drug for', 'remedy for', 'treatment for', 'what to take for', 'cure for'];
    const hasMedicineIntent = medicineIntents.some(i => lowerMsg.includes(i));

    // Order status intent
    const orderIntents = ['order status', 'track order', 'where is my order', 'order update', 'delivery status'];
    const hasOrderIntent = orderIntents.some(i => lowerMsg.includes(i));

    // Greeting intent
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(g => lowerMsg.startsWith(g));

    if (isGreeting) {
      intent = 'greeting';
      responseText = 'Hello! I\'m your PharmaCare assistant. I can help you find medicines, check order status, or answer health-related questions. How can I help you today?';
    } else if (hasOrderIntent) {
      intent = 'order_status';
      const recentOrders = await Order.find({ user: req.user._id })
        .sort('-createdAt')
        .limit(3)
        .select('orderNumber status total createdAt');

      responseText = recentOrders.length > 0
        ? 'Here are your recent orders:'
        : 'You don\'t have any recent orders.';

      return res.json({
        success: true,
        data: {
          intent,
          message: responseText,
          orders: recentOrders
        }
      });
    } else if (hasMedicineIntent) {
      intent = 'medicine_search';

      // Extract the condition after "for"
      const forMatch = lowerMsg.match(/(?:medicine|tablet|drug|remedy|treatment|cure)\s+for\s+(.+)/);
      const condition = forMatch ? forMatch[1].trim() : lowerMsg;

      // Find matching from symptom map
      const matchedTerms = new Set();
      for (const [, data] of Object.entries(symptomMedicineMap)) {
        if (data.keywords.some(kw => condition.includes(kw))) {
          data.terms.forEach(t => matchedTerms.add(t));
        }
      }

      if (matchedTerms.size > 0) {
        const regex = new RegExp([...matchedTerms].join('|'), 'i');
        medicines = await Medicine.find({
          isActive: true,
          $or: [{ name: regex }, { genericName: regex }, { uses: { $in: [...matchedTerms].map(t => new RegExp(t, 'i')) } }]
        }).limit(5).select('name price image stock description dosageForm');

        responseText = medicines.length > 0
          ? `Here are some medicines for ${condition}. Always consult your doctor before starting any medication.`
          : `I couldn't find specific medicines for "${condition}" in our catalog. Please try searching in our shop or consult your pharmacist.`;
      } else {
        // Try text search
        medicines = await Medicine.find({
          isActive: true,
          $or: [
            { name: new RegExp(condition, 'i') },
            { description: new RegExp(condition, 'i') }
          ]
        }).limit(5).select('name price image stock description dosageForm');

        responseText = medicines.length > 0
          ? `Here's what I found for "${condition}":`
          : `I couldn't find medicines matching "${condition}". Try browsing our catalog or ask your pharmacist for help.`;
      }
    } else {
      intent = 'general';
      // General help response
      responseText = 'I can help you with:\n• Finding medicines - "medicine for headache"\n• Order status - "where is my order"\n• Health queries - describe your symptoms\n\nWhat would you like to know?';
    }

    res.json({
      success: true,
      data: {
        intent,
        message: responseText,
        medicines
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/ai/recommendations - Personalized medicine recommendations
 * Based on purchase history and user profile
 */
router.get('/recommendations', async (req, res) => {
  try {
    // Get user's past orders
    const pastOrders = await Order.find({
      user: req.user._id,
      status: { $in: ['delivered', 'confirmed', 'processing'] }
    }).populate('items.medicine');

    // Collect purchased medicine IDs and categories
    const purchasedIds = new Set();
    const purchasedCategories = new Set();

    pastOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.medicine) {
          purchasedIds.add(item.medicine._id.toString());
          if (item.medicine.category) {
            purchasedCategories.add(item.medicine.category.toString());
          }
        }
      });
    });

    let recommendations = [];

    if (purchasedCategories.size > 0) {
      // Recommend medicines from same categories that user hasn't bought
      recommendations = await Medicine.find({
        isActive: true,
        _id: { $nin: [...purchasedIds] },
        category: { $in: [...purchasedCategories] },
        stock: { $gt: 0 }
      })
        .limit(10)
        .select('name price image stock description dosageForm strength discount category')
        .populate('category', 'name');
    }

    // If not enough recommendations, add popular/high-stock medicines
    if (recommendations.length < 5) {
      const additional = await Medicine.find({
        isActive: true,
        _id: { $nin: [...purchasedIds, ...recommendations.map(r => r._id.toString())] },
        stock: { $gt: 0 }
      })
        .sort('-stock')
        .limit(10 - recommendations.length)
        .select('name price image stock description dosageForm strength discount category')
        .populate('category', 'name');

      recommendations = [...recommendations, ...additional];
    }

    res.json({
      success: true,
      data: {
        recommendations,
        basedOn: purchasedCategories.size > 0 ? 'purchase_history' : 'popular'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
