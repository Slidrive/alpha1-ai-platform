# 🚀 Quick Test Guide - Deploy Alpha1 AI Platform Locally

**Time to deploy: 5-10 minutes**

This guide will help you deploy and test the Alpha1 AI Platform on your local machine.

---

## 📋 Prerequisites

Before you start, make sure you have:

1. **Python 3.9+** installed ([Download](https://www.python.org/downloads/))
2. **Git** installed ([Download](https://git-scm.com/downloads))
3. **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

To check if you have Python and Git:
```bash
python --version  # Should show 3.9 or higher
git --version     # Should show git version
```

---

## ⚡ Option 1: Quick Local Test (Recommended for Testing)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Slidrive/alpha1-ai-platform.git
cd alpha1-ai-platform
```

### Step 2: Set Up Backend
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### Step 3: Configure Your API Key
Open the `.env` file in a text editor and add your OpenAI API key:
```bash
# On Mac/Linux:
nano .env

# On Windows:
notepad .env
```

Update this line:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key (starts with `sk-`).

**Save and close the file.**

### Step 4: Start the Backend Server
```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5001
 * Running on http://localhost:5001
```

**✅ Your backend is now running!**

### Step 5: Test the Platform

**Keep the backend running** and open a new terminal/command prompt.

Navigate back to the project root:
```bash
cd alpha1-ai-platform  # Or wherever you cloned it
```

**Open in your browser:**

1. **Main Landing Page**: `index.html` (double-click to open)
2. **Test Chatbot**: `test-chatbot.html` (double-click to open)
3. **Dashboard**: `dashboard.html` (double-click to open)
4. **API Health Check**: Open browser to http://localhost:5001/api/health

### Step 6: Test the AI Agents

You can test the AI agents directly:

```bash
# In a new terminal, from the project root:
cd backend
python test_agents_direct.py
```

This will test all 8 AI agents and show you the results.

---

## 🐳 Option 2: Docker Deployment (For Production-like Testing)

If you have Docker installed:

### Step 1: Clone the Repository
```bash
git clone https://github.com/Slidrive/alpha1-ai-platform.git
cd alpha1-ai-platform
```

### Step 2: Configure Environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your OPENAI_API_KEY
```

### Step 3: Start with Docker Compose
```bash
docker-compose up -d
```

### Step 4: Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health**: http://localhost:5001/api/health

---

## 🌐 Option 3: Deploy to Cloud (For Public Access)

For testing with a public URL, deploy to a cloud platform:

### Railway (Fastest - 5 minutes)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and Deploy:**
```bash
railway login
railway init
railway up
```

3. **Set Environment Variables** in Railway dashboard:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `FLASK_ENV` = production

4. **Get your URL** from Railway dashboard

### Render (Easy - 10 minutes)

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set build command: `cd backend && pip install -r requirements.txt`
5. Set start command: `cd backend && gunicorn app:app`
6. Add environment variables:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `FLASK_ENV` = production
7. Click "Create Web Service"

### Heroku (Traditional - 10 minutes)

```bash
# Install Heroku CLI first
heroku login
heroku create alpha1-ai-platform

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key_here
heroku config:set FLASK_ENV=production

# Deploy
git push heroku main
```

---

## ✅ Verify Your Deployment

Once deployed, test these endpoints:

1. **Health Check**:
   - Local: http://localhost:5001/api/health
   - Cloud: https://your-app-url.com/api/health
   - Should return: `{"status": "healthy"}`

2. **AI Agents List**:
   - Local: http://localhost:5001/api/agents
   - Should show 8 agents

3. **Test Chatbot**:
   - Open `test-chatbot.html` in your browser
   - Try chatting with the AI agents

---

## 🐛 Troubleshooting

### "Module not found" error
```bash
pip install -r backend/requirements.txt
```

### "OpenAI API key not found" error
Make sure you:
1. Created the `.env` file in the `backend/` directory
2. Added your OpenAI API key correctly
3. The key starts with `sk-`

### Port already in use
Change the port in `backend/app.py`:
```python
app.run(debug=True, port=5002)  # Changed from 5001 to 5002
```

### Can't access from browser
Try:
- http://localhost:5001 instead of http://127.0.0.1:5001
- Check firewall settings
- Make sure the backend is running (you should see logs in the terminal)

---

## 📊 What to Test

Once deployed, try these features:

### 1. AI Agent Chat
- Open `test-chatbot.html`
- Select different agents (Project Manager, Developer, QA, etc.)
- Send messages and see AI responses

### 2. API Endpoints
Test with curl or Postman:
```bash
# Health check
curl http://localhost:5001/api/health

# List agents
curl http://localhost:5001/api/agents

# Get agent details
curl http://localhost:5001/api/agents/project-manager
```

### 3. Dashboard Features
- Open `dashboard.html`
- View metrics and statistics
- Navigate through different sections

### 4. Landing Pages
- `index.html` - Main landing page
- `pricing.html` - Pricing information
- `login.html` - Login page
- `signup.html` - Registration page

---

## 🎯 Next Steps After Testing

1. **Customize**: Update the branding and content
2. **Configure**: Adjust settings in `.env` file
3. **Deploy**: Choose a cloud platform for production
4. **Monitor**: Set up logging and monitoring
5. **Scale**: Add more resources as needed

---

## 📚 Additional Resources

- **Complete Documentation**: See `complete-documentation.md`
- **API Reference**: See `api-reference.md`
- **Deployment Guide**: See `DEPLOYMENT_READY.md`
- **Architecture**: See `architecture.md`

---

## 🆘 Need Help?

If you run into issues:

1. Check the **Troubleshooting** section above
2. Review the logs in your terminal
3. Make sure all prerequisites are installed
4. Verify your OpenAI API key is valid
5. Check that port 5001 is not in use

---

## 🎉 Success Indicators

You'll know it's working when:

- ✅ Backend server starts without errors
- ✅ http://localhost:5001/api/health returns healthy status
- ✅ You can chat with AI agents in `test-chatbot.html`
- ✅ Dashboard loads and displays data
- ✅ No error messages in the terminal

**Congratulations! Your Alpha1 AI Platform is now running!** 🚀

---

*For production deployment with SSL, monitoring, and scaling, see `DEPLOYMENT_READY.md` for detailed instructions.*
