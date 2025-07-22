# Alpha1 AI Platform - Deployment Guide

## 🚀 Quick Deployment to Render

### Prerequisites
1. Valid OpenAI API key
2. GitHub repository with your code
3. Render account (free tier available)

### Step 1: Prepare Your Environment Variables

Create these environment variables in Render:

```
# Database (Render will provide PostgreSQL URL)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
FLASK_SECRET_KEY=your-flask-secret-key-change-this-too

# OpenAI API (REQUIRED for chatbot functionality)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# CrewAI (optional, for advanced AI features)
CREWAI_API_KEY=your-crewai-api-key-if-you-have-one

# Flask Environment
FLASK_ENV=production
FLASK_DEBUG=False
```

### Step 2: Deploy to Render

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn --bind 0.0.0.0:$PORT backend.app:app
   ```

3. **Add Environment Variables**
   - In Render dashboard, go to Environment tab
   - Add all the environment variables listed above
   - **CRITICAL**: Make sure OPENAI_API_KEY is valid

4. **Add PostgreSQL Database**
   - In Render dashboard, click "New +" → "PostgreSQL"
   - Copy the database URL to your DATABASE_URL environment variable

### Step 3: Verify Deployment

After deployment, test these endpoints:
- `https://your-app.onrender.com/` - Main homepage
- `https://your-app.onrender.com/test-chatbot.html` - Customer support chatbot
- `https://your-app.onrender.com/api/support/knowledge` - Support knowledge base

### Step 4: Post-Deployment Setup

1. **Initialize Database**
   ```bash
   # Render will automatically run migrations
   # If needed, you can manually trigger via Render shell
   ```

2. **Test Customer Support Chatbot**
   - Visit your chatbot URL
   - Ask questions like:
     - "How do I use Alpha1 AI agents?"
     - "What are your pricing plans?"
     - "I'm having trouble logging in"

3. **Monitor Logs**
   - Check Render logs for any errors
   - Ensure OpenAI API calls are working

## 🤖 AI Agents Available

### Customer Support Agent
- **Endpoint**: `/api/support/chat`
- **Purpose**: Help customers with platform questions
- **Features**: 
  - Intelligent query analysis
  - Knowledge-based responses
  - Issue escalation
  - Suggested actions

### Deployment Agent
- **Endpoint**: `/api/deployment/manage`
- **Purpose**: Assist with platform updates and maintenance
- **Features**:
  - Plain English instructions
  - Deployment monitoring
  - Health checks
  - Automated fixes

### Core AI Agents
- Project Manager
- Senior Developer  
- QA Engineer
- DevOps Engineer
- AI/ML Engineer
- Technical Writer
- Marketing Specialist
- AI Trainer

## 🔧 Troubleshooting

### Common Issues

1. **Chatbot Not Responding**
   - Check OPENAI_API_KEY is valid
   - Verify API key starts with 'sk-'
   - Check Render logs for API errors

2. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL service is running
   - Check database credentials

3. **Build Failures**
   - Verify all dependencies in requirements.txt
   - Check Python version compatibility
   - Review build logs in Render

### Health Check Endpoints

- `/api/health` - Basic health check
- `/api/support/knowledge` - Support system status
- `/api/agents/list` - Available agents

## 📞 Support

If you encounter issues:
1. Check the chatbot at `/test-chatbot.html`
2. Review Render deployment logs
3. Verify all environment variables are set
4. Test API endpoints manually

## 🔄 Updates After Deployment

Use the Deployment Agent to make updates:

```javascript
// Example: Update platform via API
fetch('/api/deployment/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        instruction: "Add a new feature to the dashboard",
        details: "I want to add user analytics charts"
    })
});
```

The Deployment Agent can:
- Add new features
- Fix bugs
- Update configurations
- Monitor performance
- Handle maintenance tasks

## 🎯 Next Steps

1. **Deploy to Render** following the steps above
2. **Test the customer support chatbot** thoroughly
3. **Train the Deployment Agent** with your specific needs
4. **Monitor performance** and user feedback
5. **Iterate and improve** based on real usage

Your Alpha1 AI Platform is now ready for production! 🚀