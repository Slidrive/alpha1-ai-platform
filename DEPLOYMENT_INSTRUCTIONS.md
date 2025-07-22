
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
