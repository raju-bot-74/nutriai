# 🥗 NutriAI - AI-Powered Nutrition & Fitness Platform

![NutriAI Banner](https://img.shields.io/badge/NutriAI-Nutrition%20%26%20Fitness-00D9A3?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

A comprehensive, AI-powered web application for nutrition tracking, fitness planning, and health management. Built with modern web technologies and featuring a stunning, responsive design.

## ✨ Features

### 🤖 AI-Powered Features
- **AI Food Scanner**: Upload food images for instant nutritional analysis
- **AI Nutrition Coach**: 24/7 chatbot for personalized nutrition advice
- **Smart Recommendations**: Personalized meal and workout suggestions

### 📊 Nutrition Tracking
- **BMR Calculator**: Calculate your Basal Metabolic Rate
- **TDEE Calculation**: Get your Total Daily Energy Expenditure
- **Macro Planning**: Personalized protein, carb, and fat targets
- **Food Logging**: Track your daily food intake
- **Nutritional Database**: Extensive food nutrition information

### 🏋️ Fitness Features
- **Exercise Library**: Comprehensive workout database
- **Custom Workout Generator**: AI-generated personalized workout plans
- **Calorie Burn Tracker**: Track calories burned during exercise
- **Multiple Categories**: Cardio, Strength, Flexibility exercises
- **Workout Logging**: Record your training sessions

### 🌟 Daily Engagement
- **Daily Motivation**: Inspirational quotes updated daily
- **Food of the Day**: Learn about new healthy foods
- **Progress Tracking**: Visualize your fitness journey
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone or download the project files**
```bash
# Create a project directory
mkdir nutriai
cd nutriai

# Copy all files to this directory
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the backend server**
```bash
npm start
```

The server will start on `http://localhost:3000`

4. **Open the frontend**
```bash
# Simply open nutriai.html in your browser
# Or use a local server:
npx http-server -p 8080
```

Then navigate to `http://localhost:8080/nutriai.html`

## 📁 Project Structure

```
nutriai/
├── nutriai.html          # Main frontend application
├── server.js             # Backend API server
├── package.json          # Dependencies and scripts
├── README.md            # This file
└── uploads/             # Uploaded food images (created automatically)
```

## 🔧 API Endpoints

### Nutrition Endpoints

#### Calculate BMR
```http
POST /api/calculate-bmr
Content-Type: application/json

{
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "activity": "1.55",
  "goal": "maintain"
}
```

#### Analyze Food Image
```http
POST /api/analyze-food
Content-Type: multipart/form-data

image: [file]
```

#### AI Chat
```http
POST /api/chat
Content-Type: application/json

{
  "message": "How much protein should I eat?",
  "userId": "user123"
}
```

#### Log Food
```http
POST /api/log-food
Content-Type: application/json

{
  "userId": "user123",
  "food": "Grilled Chicken",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "meal": "lunch"
}
```

#### Log Workout
```http
POST /api/log-workout
Content-Type: application/json

{
  "userId": "user123",
  "exercise": "Running",
  "duration": 30,
  "caloriesBurned": 300,
  "intensity": "moderate"
}
```

### Information Endpoints

#### Get Daily Food
```http
GET /api/daily-food
```

#### Get Daily Motivation
```http
GET /api/daily-motivation
```

#### Get Food Logs
```http
GET /api/food-logs/:userId
```

## 🎨 Design Features

### Color Scheme
- **Primary**: #00D9A3 (Vibrant Teal)
- **Secondary**: #FF6B9D (Coral Pink)
- **Accent**: #FFD93D (Sunny Yellow)
- **Dark Background**: #0A0E27
- **Text**: #E5E7EB

### Typography
- **Display Font**: Syne (Bold, Modern)
- **Body Font**: DM Sans (Clean, Readable)

### Animations
- Smooth page transitions
- Hover effects on cards
- Floating background elements
- Slide-in chat messages
- Progress bar animations

## 🔐 Security Considerations

For production deployment, consider:

1. **Environment Variables**
   - Store API keys in `.env` file
   - Never commit sensitive data to version control

2. **Authentication**
   - Implement user authentication (JWT, OAuth)
   - Add rate limiting to prevent abuse

3. **Data Validation**
   - Validate all user inputs server-side
   - Sanitize data before database storage

4. **HTTPS**
   - Use SSL/TLS certificates
   - Enforce HTTPS in production

5. **Database**
   - Replace in-memory storage with PostgreSQL/MongoDB
   - Implement proper data encryption

## 📈 Scaling for Production

### Database Integration

Replace the in-memory database with a real database:

**MongoDB Example:**
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  profile: {
    age: Number,
    weight: Number,
    height: Number,
    goal: String
  },
  foodLogs: [{
    food: String,
    calories: Number,
    timestamp: Date
  }]
});

const User = mongoose.model('User', userSchema);
```

**PostgreSQL Example:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE food_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  food_name VARCHAR(255),
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  logged_at TIMESTAMP DEFAULT NOW()
);
```

### AI Integration

For production-grade food recognition:

```javascript
// Using TensorFlow.js
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');

async function analyzeFoodImage(imagePath) {
  const model = await mobilenet.load();
  const image = await loadImage(imagePath);
  const predictions = await model.classify(image);
  return predictions;
}

// Or use cloud APIs:
// - Google Cloud Vision API
// - AWS Rekognition
// - Clarifai Food Model
```

### Real-time Features

Add WebSocket support for real-time updates:

```javascript
const socketIo = require('socket.io');
const io = socketIo(server);

io.on('connection', (socket) => {
  socket.on('log-food', (data) => {
    // Broadcast to user's devices
    socket.broadcast.to(data.userId).emit('food-logged', data);
  });
});
```

## 🌐 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku login
heroku create nutriai-app

# Add Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

### Deploy to Vercel (Frontend)

```bash
npm i -g vercel
vercel --prod
```

### Deploy to Railway (Backend)

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Deploy to AWS

1. **EC2 Instance**: Host both frontend and backend
2. **S3**: Store uploaded images
3. **RDS**: PostgreSQL database
4. **CloudFront**: CDN for static assets

## 🧪 Testing

Add tests for your API endpoints:

```javascript
const request = require('supertest');
const app = require('./server');

describe('API Tests', () => {
  test('Calculate BMR', async () => {
    const response = await request(app)
      .post('/api/calculate-bmr')
      .send({
        age: 25,
        gender: 'male',
        height: 175,
        weight: 70,
        activity: '1.55',
        goal: 'maintain'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.bmr).toBeGreaterThan(0);
  });
});
```

## 📱 Mobile App

Consider building native mobile apps:

- **React Native**: Reuse React components
- **Flutter**: Cross-platform with beautiful UI
- **Progressive Web App**: Add to home screen functionality

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Fonts: Google Fonts (Syne, DM Sans)
- Icons: Unicode Emoji
- Inspiration: Modern health and fitness apps

## 📞 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Email: support@nutriai.app
- Documentation: https://docs.nutriai.app

## 🎯 Roadmap

- [ ] User authentication system
- [ ] Social features (share progress, challenges)
- [ ] Meal planning with recipes
- [ ] Barcode scanner for packaged foods
- [ ] Integration with fitness trackers
- [ ] Advanced analytics and insights
- [ ] Personalized meal recommendations
- [ ] Recipe database with nutrition info
- [ ] Shopping list generation
- [ ] Mobile app (iOS/Android)

## 💡 Tips for Customization

### Change Colors
Edit CSS variables in `nutriai.html`:
```css
:root {
  --primary: #00D9A3;        /* Your primary color */
  --secondary: #FF6B9D;      /* Your secondary color */
  --accent: #FFD93D;         /* Your accent color */
}
```

### Add More Foods to Database
Edit `foodDatabase` object in `server.js`:
```javascript
const foodDatabase = {
  'yourfood': {
    name: 'Your Food Name',
    calories: 200,
    // ... more properties
  }
};
```

### Customize AI Responses
Edit `getAICoachResponse()` function in `server.js` to add more nutrition knowledge.

---

**Built with ❤️ for healthy living**

*Transform your health with AI-powered nutrition tracking!* 🥗💪