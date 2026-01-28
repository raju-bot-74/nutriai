// NutriAI Backend Server
// This server handles AI nutrition analysis, food image recognition, and user data management

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = './uploads';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
        } catch (err) {
            console.error('Error creating upload directory:', err);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// In-memory database (in production, use MongoDB, PostgreSQL, etc.)
const database = {
    users: new Map(),
    foodLogs: new Map(),
    workouts: new Map(),
    chatHistory: new Map()
};

// Food nutrition database (sample data)
const foodDatabase = {
    'salad': {
        name: 'Mixed Green Salad',
        calories: 150,
        protein: 8,
        carbs: 12,
        fat: 9,
        fiber: 5,
        vitamins: 'A, C, K',
        minerals: 'Iron, Calcium',
        benefits: 'Rich in antioxidants, supports digestive health, low calorie density makes it great for weight management',
        tips: 'Add lean protein like grilled chicken or chickpeas for a complete meal. Use olive oil-based dressing for healthy fats.'
    },
    'chicken': {
        name: 'Grilled Chicken Breast',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        vitamins: 'B3, B6',
        minerals: 'Phosphorus, Selenium',
        benefits: 'Excellent source of lean protein, supports muscle growth and repair, low in calories',
        tips: 'Pair with complex carbs and vegetables for a balanced meal. Marinate for added flavor without extra calories.'
    },
    'rice': {
        name: 'Brown Rice',
        calories: 216,
        protein: 5,
        carbs: 45,
        fat: 1.8,
        fiber: 3.5,
        vitamins: 'B1, B3, B6',
        minerals: 'Magnesium, Manganese',
        benefits: 'Provides sustained energy, rich in fiber for digestive health, contains beneficial antioxidants',
        tips: 'Cook in batches for meal prep. Combine with protein and vegetables for complete nutrition.'
    },
    'avocado': {
        name: 'Avocado',
        calories: 160,
        protein: 2,
        carbs: 9,
        fat: 15,
        fiber: 7,
        vitamins: 'K, E, C, B5, B6',
        minerals: 'Potassium, Magnesium',
        benefits: 'Heart-healthy monounsaturated fats, may help lower cholesterol, supports nutrient absorption',
        tips: 'Perfect for breakfast with eggs or as a healthy fat source in any meal. Store with pit to prevent browning.'
    },
    'salmon': {
        name: 'Grilled Salmon',
        calories: 206,
        protein: 22,
        carbs: 0,
        fat: 13,
        fiber: 0,
        vitamins: 'D, B12, B6',
        minerals: 'Selenium, Potassium',
        benefits: 'Rich in omega-3 fatty acids, supports brain and heart health, reduces inflammation',
        tips: 'Aim for 2-3 servings per week. Pair with leafy greens and whole grains for optimal nutrition.'
    },
    'oatmeal': {
        name: 'Oatmeal',
        calories: 154,
        protein: 6,
        carbs: 27,
        fat: 3,
        fiber: 4,
        vitamins: 'B1, B5',
        minerals: 'Manganese, Phosphorus, Magnesium',
        benefits: 'Lowers cholesterol, provides sustained energy, supports digestive health',
        tips: 'Top with berries, nuts, and a drizzle of honey for a complete breakfast. Add protein powder for extra protein.'
    },
    'eggs': {
        name: 'Scrambled Eggs',
        calories: 140,
        protein: 12,
        carbs: 1,
        fat: 10,
        fiber: 0,
        vitamins: 'A, D, B12',
        minerals: 'Selenium, Choline',
        benefits: 'Complete protein source with all essential amino acids, supports eye health and brain function',
        tips: 'Cook with minimal oil. Pair with whole grain toast and vegetables for a balanced breakfast.'
    },
    'banana': {
        name: 'Banana',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        fiber: 3,
        vitamins: 'B6, C',
        minerals: 'Potassium, Magnesium',
        benefits: 'Quick energy source, supports heart health, helps regulate blood pressure',
        tips: 'Perfect pre or post-workout snack. Freeze for smoothies or nice cream.'
    },
    'broccoli': {
        name: 'Steamed Broccoli',
        calories: 55,
        protein: 4,
        carbs: 11,
        fat: 0.6,
        fiber: 5,
        vitamins: 'C, K, A',
        minerals: 'Folate, Potassium',
        benefits: 'Cancer-fighting compounds, supports immune system, excellent for bone health',
        tips: 'Lightly steam to preserve nutrients. Season with garlic and lemon for enhanced flavor.'
    },
    'yogurt': {
        name: 'Greek Yogurt',
        calories: 100,
        protein: 17,
        carbs: 6,
        fat: 0.4,
        fiber: 0,
        vitamins: 'B12, B2',
        minerals: 'Calcium, Phosphorus',
        benefits: 'High in probiotics for gut health, excellent protein source, supports bone health',
        tips: 'Choose plain varieties to avoid added sugars. Top with berries and nuts for a nutritious snack.'
    }
};

// AI-powered food recognition (simplified - in production, use TensorFlow.js or external API)
async function analyzeFoodImage(imagePath) {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, you would use:
    // - TensorFlow.js with a trained food recognition model
    // - Google Cloud Vision API
    // - AWS Rekognition
    // - Clarifai Food Model
    // - Custom ML model trained on food images
    
    // For demo purposes, randomly select a food item
    const foodKeys = Object.keys(foodDatabase);
    const randomFood = foodKeys[Math.floor(Math.random() * foodKeys.length)];
    
    return foodDatabase[randomFood];
}

// AI Nutrition Coach responses
function getAICoachResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    const responses = {
        protein: {
            keywords: ['protein', 'amino acid', 'muscle'],
            response: "🥚 Protein is crucial for muscle growth, repair, and overall body function. Adults should aim for 0.8-1.0g per kg of body weight, or 1.6-2.2g per kg if you're very active or building muscle. Best sources include: lean meats (chicken, turkey), fish (especially salmon), eggs, Greek yogurt, legumes (lentils, chickpeas), tofu, and quinoa. Try to distribute protein throughout the day - aim for 20-30g per meal for optimal muscle protein synthesis. Don't forget that plant proteins can be just as effective when properly combined!"
        },
        weightLoss: {
            keywords: ['weight loss', 'lose weight', 'fat loss', 'slim'],
            response: "🎯 Sustainable weight loss comes from creating a moderate calorie deficit while maintaining proper nutrition. Here's your action plan: 1) Calculate your TDEE and eat 300-500 calories below it, 2) Prioritize protein (1.6-2g per kg) to preserve muscle mass, 3) Include strength training 3-4x per week, 4) Stay hydrated (2-3L water daily), 5) Get 7-9 hours of quality sleep, 6) Track your food intake for awareness, 7) Aim for 0.5-1kg loss per week. Remember: crash diets don't work long-term. Focus on building healthy habits you can maintain forever!"
        },
        carbs: {
            keywords: ['carb', 'carbohydrate', 'sugar', 'glucose'],
            response: "🍚 Carbohydrates are your body's preferred energy source - they're not the enemy! Focus on complex carbs that provide sustained energy: whole grains (brown rice, quinoa, oats), sweet potatoes, fruits, vegetables, and legumes. These are rich in fiber, vitamins, and minerals. Simple carbs (white bread, sugary drinks) cause blood sugar spikes and crashes. Timing matters: consume carbs around your workouts for energy and recovery. Active individuals need 3-5g per kg bodyweight. If you're less active, 2-3g per kg is sufficient. Quality over quantity!"
        },
        hydration: {
            keywords: ['water', 'hydrat', 'drink', 'fluid'],
            response: "💧 Hydration is fundamental to every body function! Aim for 2-3 liters daily, more if you exercise or live in hot climates. Benefits include: improved digestion, clearer skin, better energy levels, enhanced exercise performance, proper temperature regulation, and better appetite control. Signs of dehydration: dark urine, fatigue, headaches, dry mouth. Pro tips: drink a glass upon waking, keep a water bottle nearby, drink before each meal, set hourly reminders, eat water-rich foods (cucumbers, watermelon). During exercise, drink 500-750ml per hour of activity. Electrolytes matter too - add a pinch of salt or use electrolyte tablets for long workouts!"
        },
        muscle: {
            keywords: ['muscle', 'gain', 'bulk', 'mass'],
            response: "💪 Building muscle requires four key elements: 1) **Nutrition**: Eat in a calorie surplus (250-500 cal above TDEE), consume 1.6-2.2g protein per kg bodyweight, don't fear carbs - they fuel your workouts. 2) **Training**: Lift weights 3-5x per week with progressive overload (gradually increase weight/reps), focus on compound movements (squats, deadlifts, bench press), train each muscle group 2x per week. 3) **Recovery**: Sleep 7-9 hours nightly (this is when muscles grow!), take 1-2 rest days weekly, manage stress. 4) **Consistency**: Results take months, not weeks. Track your lifts, be patient, stay consistent. Muscle growth is a marathon, not a sprint!"
        },
        mealPlan: {
            keywords: ['meal plan', 'diet plan', 'what to eat', 'meal prep'],
            response: "🍽️ Here's a balanced daily meal plan template: **Breakfast** (7-8am): Oatmeal with berries, nuts, and protein powder OR eggs with whole grain toast and avocado. **Snack** (10am): Greek yogurt with fruit OR handful of almonds. **Lunch** (12-1pm): Grilled chicken/fish with quinoa and roasted vegetables OR large salad with lean protein and olive oil dressing. **Snack** (3-4pm): Apple with peanut butter OR protein shake. **Dinner** (6-7pm): Salmon with sweet potato and steamed broccoli OR lean beef stir-fry with brown rice. **Evening** (optional): Cottage cheese with berries if hungry. Meal prep Sunday strategy: cook 3-4 protein sources, prepare 3-4 carb sources, wash and chop vegetables, portion into containers. This ensures healthy choices all week!"
        },
        supplements: {
            keywords: ['supplement', 'vitamin', 'pill', 'creatine', 'protein powder'],
            response: "💊 Supplements support your diet but never replace whole foods. Essential supplements to consider: 1) **Protein Powder**: Convenient protein source (whey for quick absorption, casein for slow release, plant-based for vegans). 2) **Creatine Monohydrate**: 5g daily, proven to increase strength and muscle mass. 3) **Vitamin D**: 2000-4000 IU daily if you have limited sun exposure. 4) **Omega-3**: 1-2g daily if you don't eat fatty fish regularly. 5) **Multivitamin**: Insurance policy for micronutrient gaps. 6) **Magnesium**: 200-400mg for sleep and recovery. NOT essential but helpful: Pre-workout (caffeine + beta-alanine), BCAAs (if you train fasted). Always choose third-party tested brands. Consult a doctor before starting any supplement regimen!"
        },
        fasting: {
            keywords: ['fast', 'intermittent fasting', 'if', 'skip meal'],
            response: "⏰ Intermittent fasting is an eating pattern, not a diet. Popular methods: 16:8 (fast 16 hours, eat within 8-hour window), 18:6, 5:2 (eat normally 5 days, reduce calories 2 days). Benefits: may improve insulin sensitivity, enhance fat burning, simplify eating schedule, reduce calorie intake naturally. Important: IF doesn't override calories - you still need to eat appropriate amounts. Not for everyone: avoid if pregnant, have eating disorder history, or have certain medical conditions. Start gradually: begin with 12-hour fast and extend. Stay hydrated during fasting. Break fasts with balanced meals, not junk food. IF works for some, not all - find what's sustainable for YOU!"
        },
        cardio: {
            keywords: ['cardio', 'running', 'aerobic', 'endurance'],
            response: "🏃 Cardio is excellent for heart health, calorie burning, and endurance! Types: 1) **LISS** (Low-Intensity Steady State): 30-60 min at 60-70% max heart rate, great for recovery and fat burning. 2) **HIIT** (High-Intensity Interval Training): Short bursts of max effort with rest periods, burns more calories in less time, boosts metabolism. 3) **MISS** (Moderate-Intensity): 20-40 min at 70-80% max heart rate, balanced approach. Frequency: 2-5x weekly depending on goals. For fat loss: combine with strength training. For muscle building: don't overdo it - 2-3 sessions weekly. Best options: running, cycling, swimming, rowing, jump rope, dancing. Find activities you enjoy for long-term adherence!"
        },
        sleep: {
            keywords: ['sleep', 'rest', 'recover', 'tired'],
            response: "😴 Sleep is when your body repairs and grows - it's NOT optional! Aim for 7-9 hours nightly. Benefits: muscle recovery, hormonal balance (testosterone, growth hormone), better performance, reduced injury risk, improved mental health, enhanced fat loss. Sleep hygiene tips: 1) Consistent sleep/wake times, 2) Dark, cool room (65-68°F), 3) No screens 1 hour before bed, 4) Avoid caffeine after 2pm, 5) No large meals 2-3 hours before sleep, 6) Regular exercise (but not too close to bedtime), 7) Manage stress through meditation or journaling. Poor sleep = higher cortisol = more fat storage + less muscle growth. Prioritize sleep like you prioritize training!"
        },
        default: {
            keywords: [],
            response: "👋 I'm your AI nutrition coach! I can help you with: **Nutrition**: protein intake, macros, meal planning, supplements, hydration. **Weight Management**: fat loss, muscle building, body recomposition. **Training**: workout advice, cardio vs strength, exercise selection. **Health**: sleep, recovery, stress management, general wellness. What specific question can I help you with today? The more details you provide, the better I can assist you!"
        }
    };
    
    // Find matching response
    for (const [key, data] of Object.entries(responses)) {
        if (data.keywords.some(keyword => lowerMsg.includes(keyword))) {
            return data.response;
        }
    }
    
    return responses.default.response;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Upload and analyze food image
app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const foodData = await analyzeFoodImage(req.file.path);
        
        res.json({
            success: true,
            food: foodData,
            imageUrl: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Food analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze food image' });
    }
});

// Calculate BMR and nutritional needs
app.post('/api/calculate-bmr', (req, res) => {
    try {
        const { age, gender, height, weight, activity, goal } = req.body;

        // Validate input
        if (!age || !gender || !height || !weight || !activity || !goal) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Mifflin-St Jeor Equation
        let bmr;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        const tdee = bmr * parseFloat(activity);
        let targetCalories = tdee;

        if (goal === 'lose') {
            targetCalories = tdee - 500;
        } else if (goal === 'gain') {
            targetCalories = tdee + 500;
        }

        // Calculate macros (40% carbs, 30% protein, 30% fat)
        const protein = Math.round((targetCalories * 0.30) / 4);
        const carbs = Math.round((targetCalories * 0.40) / 4);
        const fat = Math.round((targetCalories * 0.30) / 9);

        // Generate recommendations
        let recommendations = `Based on your profile, you should consume approximately ${Math.round(targetCalories)} calories per day. `;
        
        if (goal === 'lose') {
            recommendations += "For healthy weight loss, aim to lose 0.5-1 kg per week by maintaining this calorie deficit and combining it with regular exercise. Focus on protein-rich foods to preserve muscle mass. Incorporate both cardio and strength training for best results.";
        } else if (goal === 'gain') {
            recommendations += "To gain weight healthily, ensure you're getting enough protein (aim for 1.6-2.2g per kg of body weight) and combine this calorie surplus with strength training for optimal muscle growth. Be patient - healthy muscle gain takes time!";
        } else {
            recommendations += "To maintain your weight, focus on eating balanced meals with plenty of vegetables, lean proteins, and whole grains. Stay consistent with your daily calorie target and maintain regular physical activity.";
        }

        res.json({
            success: true,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories: Math.round(targetCalories),
            macros: {
                protein: protein,
                carbs: carbs,
                fat: fat
            },
            recommendations: recommendations
        });
    } catch (error) {
        console.error('BMR calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate BMR' });
    }
});

// AI Chat endpoint
app.post('/api/chat', (req, res) => {
    try {
        const { message, userId = 'anonymous' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get AI response
        const response = getAICoachResponse(message);

        // Store chat history
        if (!database.chatHistory.has(userId)) {
            database.chatHistory.set(userId, []);
        }
        
        database.chatHistory.get(userId).push({
            userMessage: message,
            aiResponse: response,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Log food intake
app.post('/api/log-food', (req, res) => {
    try {
        const { userId = 'anonymous', food, calories, protein, carbs, fat, meal } = req.body;

        const logEntry = {
            id: Date.now(),
            food,
            calories,
            protein,
            carbs,
            fat,
            meal,
            timestamp: new Date().toISOString()
        };

        if (!database.foodLogs.has(userId)) {
            database.foodLogs.set(userId, []);
        }

        database.foodLogs.get(userId).push(logEntry);

        res.json({
            success: true,
            entry: logEntry
        });
    } catch (error) {
        console.error('Food logging error:', error);
        res.status(500).json({ error: 'Failed to log food' });
    }
});

// Get food logs for a user
app.get('/api/food-logs/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const logs = database.foodLogs.get(userId) || [];

        // Calculate daily totals
        const today = new Date().toDateString();
        const todayLogs = logs.filter(log => 
            new Date(log.timestamp).toDateString() === today
        );

        const totals = todayLogs.reduce((acc, log) => ({
            calories: acc.calories + (log.calories || 0),
            protein: acc.protein + (log.protein || 0),
            carbs: acc.carbs + (log.carbs || 0),
            fat: acc.fat + (log.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        res.json({
            success: true,
            logs: todayLogs,
            totals: totals
        });
    } catch (error) {
        console.error('Get food logs error:', error);
        res.status(500).json({ error: 'Failed to retrieve food logs' });
    }
});

// Log workout
app.post('/api/log-workout', (req, res) => {
    try {
        const { userId = 'anonymous', exercise, duration, caloriesBurned, intensity } = req.body;

        const workoutEntry = {
            id: Date.now(),
            exercise,
            duration,
            caloriesBurned,
            intensity,
            timestamp: new Date().toISOString()
        };

        if (!database.workouts.has(userId)) {
            database.workouts.set(userId, []);
        }

        database.workouts.get(userId).push(workoutEntry);

        res.json({
            success: true,
            entry: workoutEntry
        });
    } catch (error) {
        console.error('Workout logging error:', error);
        res.status(500).json({ error: 'Failed to log workout' });
    }
});

// Get daily nutrition facts (food of the day)
app.get('/api/daily-food', (req, res) => {
    try {
        const foods = [
            {
                name: "Avocado",
                emoji: "🥑",
                description: "Rich in healthy fats, fiber, and various vitamins. Avocados are nutrient-dense fruits that provide heart-healthy monounsaturated fats and can help improve cholesterol levels.",
                calories: 160,
                fat: "15g",
                fiber: "7g",
                protein: "2g"
            },
            {
                name: "Blueberries",
                emoji: "🫐",
                description: "Packed with antioxidants, particularly anthocyanins. Excellent for brain health and may help reduce DNA damage.",
                calories: 84,
                fat: "0.5g",
                fiber: "4g",
                protein: "1g"
            },
            {
                name: "Salmon",
                emoji: "🐟",
                description: "Excellent source of omega-3 fatty acids, high-quality protein, and vitamin D. Supports heart health and brain function.",
                calories: 206,
                fat: "13g",
                fiber: "0g",
                protein: "22g"
            }
        ];

        // Rotate based on day of month
        const dayIndex = new Date().getDate() % foods.length;
        
        res.json({
            success: true,
            food: foods[dayIndex]
        });
    } catch (error) {
        console.error('Daily food error:', error);
        res.status(500).json({ error: 'Failed to get daily food' });
    }
});

// Get motivational quote
app.get('/api/daily-motivation', (req, res) => {
    try {
        const quotes = [
            "Your body is a reflection of your lifestyle. Make it count! 💪",
            "Small daily improvements lead to stunning results over time. 🌟",
            "The only bad workout is the one that didn't happen. Keep moving! 🏃",
            "Eat well, move daily, hydrate often, sleep well, and be kind to yourself. 💚",
            "Progress, not perfection. Every healthy choice matters! 🎯",
            "Your health is an investment, not an expense. Invest wisely! 💎",
            "Consistency beats intensity. Show up every day! 📈",
            "Food is fuel. Choose premium for peak performance! 🚀"
        ];

        const dayIndex = new Date().getDate() % quotes.length;

        res.json({
            success: true,
            quote: quotes[dayIndex]
        });
    } catch (error) {
        console.error('Daily motivation error:', error);
        res.status(500).json({ error: 'Failed to get motivation' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║     🥗 NutriAI Backend Server Running     ║
    ║                                           ║
    ║  Server: http://localhost:${PORT}         ║
    ║  Status: Ready to serve nutrition data    ║
    ║                                           ║
    ║  Available Endpoints:                     ║
    ║  - POST /api/analyze-food                 ║
    ║  - POST /api/calculate-bmr                ║
    ║  - POST /api/chat                         ║
    ║  - POST /api/log-food                     ║
    ║  - POST /api/log-workout                  ║
    ║  - GET  /api/daily-food                   ║
    ║  - GET  /api/daily-motivation             ║
    ╚═══════════════════════════════════════════╝
    `);
});

module.exports = app;