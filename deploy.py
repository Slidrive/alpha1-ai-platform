#!/usr/bin/env python3
"""
Alpha1 AI Platform Deployment Script
Supports multiple deployment platforms with waitlist system
"""

import os
import sys
import subprocess
import json
from pathlib import Path

class PlatformDeployer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.deployment_configs = {
            'railway': {
                'name': 'Railway',
                'description': 'Fast deployment with automatic scaling',
                'commands': [
                    'railway login',
                    'railway init',
                    'railway up'
                ]
            },
            'heroku': {
                'name': 'Heroku',
                'description': 'Traditional PaaS with extensive add-ons',
                'commands': [
                    'heroku login',
                    'heroku create alpha1-ai-platform',
                    'git push heroku main'
                ]
            },
            'vercel': {
                'name': 'Vercel',
                'description': 'Frontend-focused with serverless backend',
                'commands': [
                    'vercel login',
                    'vercel --prod'
                ]
            }
        }

    def check_prerequisites(self):
        """Check if all required files and dependencies are present"""
        print("🔍 Checking deployment prerequisites...")
        
        required_files = [
            'backend/app.py',
            'backend/requirements.txt',
            'waitlist_server.py',
            'waitlist.html',
            'index.html',
            'railway.toml',
            'Procfile'
        ]
        
        missing_files = []
        for file_path in required_files:
            if not (self.project_root / file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            print(f"❌ Missing required files: {', '.join(missing_files)}")
            return False
        
        print("✅ All required files present")
        return True

    def setup_environment_variables(self):
        """Create environment configuration for deployment"""
        print("🔧 Setting up environment variables...")
        
        env_vars = {
            'FLASK_ENV': 'production',
            'DEBUG': 'False',
            'SECRET_KEY': 'your-secret-key-here',
            'DATABASE_URL': 'postgresql://user:password@localhost/alpha1_db',
            'REDIS_URL': 'redis://localhost:6379',
            'API_BASE_URL': 'https://your-domain.com',
            'CORS_ORIGINS': 'https://your-domain.com',
            'JWT_SECRET_KEY': 'your-jwt-secret-here'
        }
        
        # Create .env file for local development
        env_file = self.project_root / '.env'
        with open(env_file, 'w') as f:
            for key, value in env_vars.items():
                f.write(f"{key}={value}\n")
        
        print("✅ Environment variables configured")
        print(f"📝 Please update {env_file} with your actual values")

    def display_deployment_options(self):
        """Display available deployment platforms"""
        print("\n🚀 Available Deployment Platforms:")
        print("=" * 50)
        
        for key, config in self.deployment_configs.items():
            print(f"\n{key.upper()}: {config['name']}")
            print(f"Description: {config['description']}")
            print("Commands to run:")
            for cmd in config['commands']:
                print(f"  $ {cmd}")

    def create_deployment_instructions(self):
        """Create detailed deployment instructions"""
        instructions = """
# 🚀 Alpha1 AI Platform Deployment Instructions

## Quick Deployment Options

### Option 1: Railway (Recommended for MVP)
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`
5. Set environment variables in Railway dashboard

### Option 2: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create alpha1-ai-platform`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
5. Add Redis: `heroku addons:create heroku-redis:hobby-dev`
6. Deploy: `git push heroku main`

### Option 3: DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings:
   - Build Command: `pip install -r backend/requirements.txt`
   - Run Command: `python backend/app.py`
3. Add environment variables
4. Deploy

## Environment Variables Required:
- FLASK_ENV=production
- DEBUG=False
- SECRET_KEY=your-secret-key
- DATABASE_URL=your-database-url
- REDIS_URL=your-redis-url
- API_BASE_URL=https://your-domain.com

## Post-Deployment Checklist:
1. ✅ Test main platform at your-domain.com
2. ✅ Test waitlist at your-domain.com/waitlist.html
3. ✅ Verify API endpoints
4. ✅ Test file upload functionality
5. ✅ Test voice communication system
6. ✅ Monitor logs for errors

## Waitlist System:
- Waitlist page: `/waitlist.html`
- API endpoint: `/api/waitlist/signup`
- Statistics: `/api/waitlist/stats`
- Database: SQLite (auto-created)

## Monitoring:
- Health check: `/health`
- API status: `/api/health`
- Logs: Check platform dashboard
"""
        
        instructions_file = self.project_root / 'DEPLOYMENT_INSTRUCTIONS.md'
        with open(instructions_file, 'w') as f:
            f.write(instructions)
        
        print(f"📋 Detailed instructions saved to {instructions_file}")

    def run_deployment_checks(self):
        """Run pre-deployment validation"""
        print("\n🔍 Running deployment validation...")
        
        # Check Python syntax
        try:
            subprocess.run([sys.executable, '-m', 'py_compile', 'backend/app.py'], 
                         check=True, capture_output=True)
            print("✅ Backend Python syntax valid")
        except subprocess.CalledProcessError:
            print("❌ Backend Python syntax errors found")
            return False
        
        # Check if requirements.txt is valid
        try:
            with open('backend/requirements.txt', 'r') as f:
                requirements = f.read()
                if 'flask' not in requirements.lower():
                    print("❌ Flask not found in requirements.txt")
                    return False
            print("✅ Requirements.txt valid")
        except FileNotFoundError:
            print("❌ requirements.txt not found")
            return False
        
        return True

    def deploy(self):
        """Main deployment orchestration"""
        print("🚀 Alpha1 AI Platform Deployment")
        print("=" * 40)
        
        if not self.check_prerequisites():
            print("❌ Prerequisites check failed")
            return False
        
        if not self.run_deployment_checks():
            print("❌ Deployment validation failed")
            return False
        
        self.setup_environment_variables()
        self.display_deployment_options()
        self.create_deployment_instructions()
        
        print("\n✅ Deployment preparation complete!")
        print("\n📋 Next Steps:")
        print("1. Choose your deployment platform from the options above")
        print("2. Follow the commands for your chosen platform")
        print("3. Update environment variables with your actual values")
        print("4. Test the deployed application")
        print("5. Share the waitlist URL with your users")
        
        return True

if __name__ == "__main__":
    deployer = PlatformDeployer()
    success = deployer.deploy()
    
    if success:
        print("\n🎉 Ready for deployment!")
        print("💡 Tip: Start with Railway for fastest deployment")
    else:
        print("\n❌ Deployment preparation failed")
        sys.exit(1)