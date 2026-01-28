// NutriAI Frontend API Integration
// Add this script to your HTML or create a separate api.js file

const API_BASE_URL = 'http://localhost:3000/api';

class NutriAIAPI {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    // Helper method for making requests
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // BMR Calculation
    async calculateBMR(data) {
        return this.request('/calculate-bmr', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Food Image Analysis
    async analyzeFoodImage(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const url = `${this.baseUrl}/analyze-food`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to analyze food image');
        }

        return await response.json();
    }

    // AI Chat
    async chat(message, userId = 'anonymous') {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({ message, userId })
        });
    }

    // Food Logging
    async logFood(foodData) {
        return this.request('/log-food', {
            method: 'POST',
            body: JSON.stringify(foodData)
        });
    }

    // Workout Logging
    async logWorkout(workoutData) {
        return this.request('/log-workout', {
            method: 'POST',
            body: JSON.stringify(workoutData)
        });
    }

    // Get Food Logs
    async getFoodLogs(userId) {
        return this.request(`/food-logs/${userId}`);
    }

    // Get Daily Food
    async getDailyFood() {
        return this.request('/daily-food');
    }

    // Get Daily Motivation
    async getDailyMotivation() {
        return this.request('/daily-motivation');
    }
}

// Usage example:
const api = new NutriAIAPI();

// Example: Calculate BMR with API
async function calculateBMRWithAPI() {
    const formData = {
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        height: parseInt(document.getElementById('height').value),
        weight: parseFloat(document.getElementById('weight').value),
        activity: document.getElementById('activity').value,
        goal: document.getElementById('goal').value
    };

    try {
        const result = await api.calculateBMR(formData);
        
        if (result.success) {
            // Update UI with results
            document.getElementById('bmrValue').textContent = result.bmr;
            document.getElementById('tdeeValue').textContent = result.tdee;
            document.getElementById('targetCalories').textContent = result.targetCalories;
            document.getElementById('proteinNeeds').textContent = result.macros.protein + 'g';
            document.getElementById('carbsNeeds').textContent = result.macros.carbs + 'g';
            document.getElementById('fatNeeds').textContent = result.macros.fat + 'g';
            document.getElementById('recommendations').textContent = result.recommendations;
            document.getElementById('bmrResults').classList.add('show');
        }
    } catch (error) {
        alert('Error calculating BMR: ' + error.message);
    }
}

// Example: Analyze food image with API
async function analyzeFoodWithAPI(imageFile) {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.innerHTML = '<span class="loading"></span> Analyzing...';
    analyzeBtn.disabled = true;

    try {
        const result = await api.analyzeFoodImage(imageFile);
        
        if (result.success) {
            displayFoodResults(result.food);
        }
    } catch (error) {
        alert('Error analyzing food: ' + error.message);
    } finally {
        analyzeBtn.textContent = 'Analyze Food';
        analyzeBtn.disabled = false;
    }
}

// Example: Send chat message with API
async function sendChatMessageWithAPI() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = message;
    chatMessages.appendChild(userMsg);
    
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add loading message
    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-message ai';
    aiMsg.innerHTML = '<span class="loading"></span> Thinking...';
    chatMessages.appendChild(aiMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const result = await api.chat(message);
        
        if (result.success) {
            aiMsg.textContent = result.response;
        }
    } catch (error) {
        aiMsg.textContent = 'Sorry, I encountered an error. Please try again.';
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Local Storage Helper for offline functionality
class LocalStorage {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}

// User Profile Management
class UserProfile {
    constructor() {
        this.profile = LocalStorage.load('userProfile') || {
            userId: this.generateUserId(),
            settings: {},
            goals: {},
            history: []
        };
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    save() {
        LocalStorage.save('userProfile', this.profile);
    }

    updateSettings(settings) {
        this.profile.settings = { ...this.profile.settings, ...settings };
        this.save();
    }

    updateGoals(goals) {
        this.profile.goals = { ...this.profile.goals, ...goals };
        this.save();
    }

    addToHistory(entry) {
        this.profile.history.push({
            ...entry,
            timestamp: new Date().toISOString()
        });
        this.save();
    }

    getHistory(type, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.profile.history.filter(entry => 
            entry.type === type && 
            new Date(entry.timestamp) >= cutoffDate
        );
    }
}

// Progress Tracker
class ProgressTracker {
    constructor(userId) {
        this.userId = userId;
        this.data = LocalStorage.load(`progress_${userId}`) || {
            weight: [],
            calories: [],
            workouts: [],
            measurements: []
        };
    }

    save() {
        LocalStorage.save(`progress_${this.userId}`, this.data);
    }

    addWeight(weight, date = new Date()) {
        this.data.weight.push({
            value: weight,
            date: date.toISOString()
        });
        this.save();
    }

    addCalories(calories, date = new Date()) {
        this.data.calories.push({
            value: calories,
            date: date.toISOString()
        });
        this.save();
    }

    addWorkout(workout, date = new Date()) {
        this.data.workouts.push({
            ...workout,
            date: date.toISOString()
        });
        this.save();
    }

    getWeightProgress(days = 30) {
        return this.getRecentData(this.data.weight, days);
    }

    getCalorieProgress(days = 7) {
        return this.getRecentData(this.data.calories, days);
    }

    getRecentData(dataArray, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return dataArray.filter(item => 
            new Date(item.date) >= cutoffDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
}

// Notification System
class NotificationSystem {
    static show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            backgroundColor: type === 'success' ? '#10B981' : 
                           type === 'error' ? '#EF4444' : 
                           type === 'warning' ? '#F59E0B' : '#3B82F6',
            color: 'white',
            fontWeight: '500',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '400px'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NutriAIAPI,
        LocalStorage,
        UserProfile,
        ProgressTracker,
        NotificationSystem
    };
}