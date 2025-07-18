# Development Environment Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

## Backend Setup

1. **Create Virtual Environment**:
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**:
Create `.env` file in backend directory:
```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/ai_platform
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your-jwt-secret-key
```

4. **Database Setup**:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

5. **Run Backend**:
```bash
flask run --host=0.0.0.0 --port=5000
```

## Frontend Setup

1. **Install Dependencies**:
```bash
cd frontend
npm install
```

2. **Environment Configuration**:
Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

3. **Run Frontend**:
```bash
npm start
```

## Docker Development Environment

1. **Build and Run with Docker Compose**:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will start:
- Backend API on port 5000
- Frontend on port 3000
- PostgreSQL on port 5432
- Redis on port 6379
- Prometheus on port 9090
- Grafana on port 3001

## Database Services

### PostgreSQL Setup
```bash
# Using Docker
docker run --name postgres-ai \
  -e POSTGRES_DB=ai_platform \
  -e POSTGRES_USER=ai_user \
  -e POSTGRES_PASSWORD=ai_password \
  -p 5432:5432 \
  -d postgres:15

# Or install locally on Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb ai_platform
```

### Redis Setup
```bash
# Using Docker
docker run --name redis-ai \
  -p 6379:6379 \
  -d redis:7-alpine

# Or install locally on Ubuntu
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

## AI Model Setup

1. **Download Pre-trained Models**:
```bash
cd backend/models
python download_models.py
```

2. **Model Training Environment**:
```bash
# GPU support (optional)
pip install tensorflow-gpu torch-gpu
```

## Testing Setup

1. **Backend Tests**:
```bash
cd backend
pytest tests/ -v --cov=app
```

2. **Frontend Tests**:
```bash
cd frontend
npm test
```

3. **Integration Tests**:
```bash
cd tests
python -m pytest integration/ -v
```

## Development Tools

### Code Quality
```bash
# Backend
black backend/
flake8 backend/

# Frontend
npm run lint
npm run format
```

### Database Management
```bash
# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade

# Rollback migration
flask db downgrade
```

### Monitoring Setup
```bash
# Start monitoring stack
docker-compose -f monitoring/docker-compose.yml up -d
```

Access:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

2. **Database Connection Issues**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Restart PostgreSQL
sudo systemctl restart postgresql
```

3. **Redis Connection Issues**:
```bash
# Check Redis status
redis-cli ping
# Should return PONG
```

4. **Python Package Issues**:
```bash
# Clear pip cache
pip cache purge
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Environment Variables

Create a `.env.example` file with all required environment variables:
```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=change-this-in-production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_platform
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600

# AI Models
MODEL_PATH=/app/models
TENSORFLOW_SERVING_URL=http://localhost:8501

# Monitoring
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3001

# External Services
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Development Workflow

1. **Feature Development**:
   - Create feature branch from main
   - Implement backend API endpoints
   - Add corresponding frontend components
   - Write tests for new functionality
   - Update documentation

2. **Testing**:
   - Run unit tests
   - Run integration tests
   - Manual testing in browser
   - Performance testing

3. **Code Review**:
   - Create pull request
   - Code review by team members
   - Address feedback
   - Merge to main branch

4. **Deployment**:
   - Automated CI/CD pipeline
   - Deploy to staging environment
   - User acceptance testing
   - Deploy to production

