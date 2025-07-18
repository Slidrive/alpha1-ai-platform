#!/bin/bash

# Alpha1 AI Platform - GitHub Setup Script
# This script helps you set up your GitHub repository and prepare for deployment

echo "🚀 Alpha1 AI Platform - GitHub Setup"
echo "======================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Create .env.example for backend
echo "📝 Creating environment template..."
cat > backend/.env.example << EOF
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your_secret_key_here
DEBUG=False

# Database Configuration
DATABASE_URL=sqlite:///alpha1.db

# Security
JWT_SECRET_KEY=your_jwt_secret_key_here

# API Configuration
API_BASE_URL=https://your-domain.com/api

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn_here
EOF

echo "✅ Created backend/.env.example"

# Add all files to git
echo "📦 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Alpha1 AI Platform

- Complete multi-agent AI platform
- 8 specialized AI agents
- Flask backend with OpenAI integration
- Modern frontend with real-time chat
- Waitlist system for pre-launch
- Docker and Kubernetes ready
- Comprehensive documentation"

echo "✅ Initial commit created"

# Instructions for GitHub
echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: alpha1-ai-platform"
echo "   - Description: Revolutionary multi-agent AI development platform"
echo "   - Make it Private (recommended for now)"
echo "   - Don't initialize with README (we already have one)"
echo ""
echo "2. Connect your local repository to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/alpha1-ai-platform.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Set up environment variables:"
echo "   - Copy backend/.env.example to backend/.env"
echo "   - Add your OpenAI API key"
echo "   - Generate secure secret keys"
echo ""
echo "4. Choose your deployment platform:"
echo "   - Railway (recommended): railway.app"
echo "   - Heroku: heroku.com"
echo "   - DigitalOcean: digitalocean.com"
echo "   - AWS/Azure/GCP for enterprise"
echo ""
echo "5. Configure your domain:"
echo "   - Purchase domain (e.g., alpha1ai.com)"
echo "   - Set up DNS records"
echo "   - Configure SSL (automatic on most platforms)"
echo ""
echo "📚 Read DEPLOYMENT.md for detailed deployment instructions"
echo ""
echo "🎉 Your Alpha1 AI Platform is ready for GitHub and deployment!"