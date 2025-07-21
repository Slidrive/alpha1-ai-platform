from flask import Flask, jsonify, request, send_from_directory, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import agents blueprint and API key management
from agents import agents_bp
from file_upload import file_upload_bp
from api_key_manager import require_api_key, get_api_key_info, api_key_manager

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///ai_platform.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(agents_bp, url_prefix='/api')
app.register_blueprint(file_upload_bp, url_prefix='/api')

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='viewer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='active')
    progress = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ai_models_count = db.Column(db.Integer, default=0)
    data_points_count = db.Column(db.Integer, default=0)

class AIModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    accuracy = db.Column(db.Float, default=0.0)
    precision = db.Column(db.Float, default=0.0)
    recall = db.Column(db.Float, default=0.0)
    f1_score = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default='training')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_trained = db.Column(db.DateTime)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))

class SystemMetrics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    cpu_usage = db.Column(db.Float)
    memory_usage = db.Column(db.Float)
    active_connections = db.Column(db.Integer)
    requests_per_second = db.Column(db.Float)
    error_rate = db.Column(db.Float)
    response_time = db.Column(db.Float)

class SecurityEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)
    ip_address = db.Column(db.String(45))

# Authentication Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        user.last_active = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/auth/guest-token', methods=['POST'])
def guest_token():
    """Generate a limited access token for guest chatbot users"""
    data = request.get_json()
    session_id = data.get('session_id', 'guest_' + str(random.randint(1000, 9999)))
    
    # Create a temporary guest token with limited permissions
    # Using a special guest user ID (0) for identification
    access_token = create_access_token(
        identity='guest_' + session_id,
        expires_delta=timedelta(hours=2)  # Shorter expiry for guest tokens
    )
    
    return jsonify({
        'token': access_token,
        'session_id': session_id,
        'expires_in': 7200,  # 2 hours in seconds
        'permissions': ['chatbot_access', 'documentation_access']
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(
        name=data.get('name'),
        email=data.get('email'),
        password_hash=generate_password_hash(data.get('password')),
        role=data.get('role', 'viewer')
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

# Dashboard Routes
@app.route('/api/dashboard/metrics')
@jwt_required()
def get_dashboard_metrics():
    # Generate mock real-time metrics
    metrics = {
        'cpuUsage': random.randint(20, 80),
        'memoryUsage': random.randint(40, 90),
        'activeConnections': random.randint(500, 2000),
        'requestsPerSecond': random.randint(50, 150),
        'errorRate': round(random.uniform(0.01, 0.05), 3),
        'uptime': '7d 14h 32m',
        'totalRequests': '1.2M',
        'avgResponseTime': f"{random.randint(30, 60)}ms"
    }
    
    return jsonify(metrics)

@app.route('/api/dashboard/performance-data')
@jwt_required()
def get_performance_data():
    # Generate mock performance data for charts
    performance_data = []
    for i in range(24):
        performance_data.append({
            'timestamp': f"{i:02d}:00",
            'value': random.randint(30, 90),  # Main chart value
            'requests': random.randint(80, 300),
            'errors': random.randint(1, 10),
            'response_time': random.randint(30, 70),
            'cpu_usage': random.randint(20, 80),
            'memory_usage': random.randint(40, 90)
        })
    
    return jsonify({
        'performance_data': performance_data,
        'total_points': len(performance_data)
    })

# Projects Routes
@app.route('/api/projects', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = int(get_jwt_identity())
    projects = Project.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'type': p.type,
        'status': p.status,
        'progress': p.progress,
        'created_at': p.created_at.isoformat(),
        'updated_at': p.updated_at.isoformat(),
        'ai_models': p.ai_models_count,
        'data_points': p.data_points_count
    } for p in projects])

@app.route('/api/projects', methods=['POST'])
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    project = Project(
        name=data.get('name'),
        description=data.get('description'),
        type=data.get('type'),
        user_id=user_id,
        ai_models_count=1 if data.get('type') == 'ai-model' else 0
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify({
        'message': 'Project created successfully',
        'project': {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'type': project.type,
            'status': project.status,
            'progress': project.progress,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
            'ai_models': project.ai_models_count,
            'data_points': project.data_points_count
        }
    }), 201

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
    
    data = request.get_json()
    project.status = data.get('status', project.status)
    project.progress = data.get('progress', project.progress)
    project.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'message': 'Project updated successfully'})

# AI Models Routes
@app.route('/api/ai-models', methods=['GET'])
@jwt_required()
def get_ai_models():
    models = AIModel.query.all()
    
    return jsonify([{
        'id': m.id,
        'name': m.name,
        'type': m.type,
        'accuracy': m.accuracy,
        'precision': m.precision,
        'recall': m.recall,
        'f1_score': m.f1_score,
        'status': m.status,
        'last_trained': m.last_trained.isoformat() if m.last_trained else None
    } for m in models])

@app.route('/api/ai-models/train', methods=['POST'])
@jwt_required()
def train_model():
    data = request.get_json()
    model_name = data.get('model_name', 'Default Model')
    
    # Simulate model training with mock metrics
    accuracy = round(random.uniform(85, 95), 2)
    precision = round(random.uniform(80, 90), 2)
    recall = round(random.uniform(85, 95), 2)
    f1 = round(random.uniform(82, 92), 2)
    
    # Save model metrics
    ai_model = AIModel(
        name=model_name,
        type='classification',
        accuracy=accuracy,
        precision=precision,
        recall=recall,
        f1_score=f1,
        status='active',
        last_trained=datetime.utcnow()
    )
    
    db.session.add(ai_model)
    db.session.commit()
    
    return jsonify({
        'message': 'Model trained successfully',
        'metrics': {
            'accuracy': ai_model.accuracy,
            'precision': ai_model.precision,
            'recall': ai_model.recall,
            'f1_score': ai_model.f1_score
        }
    })

# Analytics Routes
@app.route('/api/analytics/security-events')
@jwt_required()
def get_security_events():
    events = SecurityEvent.query.order_by(SecurityEvent.timestamp.desc()).limit(50).all()
    
    return jsonify([{
        'id': e.id,
        'type': e.event_type,
        'severity': e.severity,
        'description': e.description,
        'timestamp': e.timestamp.isoformat(),
        'resolved': e.resolved,
        'ip_address': e.ip_address
    } for e in events])

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'database': check_database(),
            'redis': check_redis()
        }
    })

def check_database():
    try:
        db.session.execute('SELECT 1')
        return 'connected'
    except Exception:
        return 'disconnected'

def check_redis():
    try:
        from redis import Redis
        redis = Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))
        redis.ping()
        return 'connected'
    except Exception:
        return 'disconnected'

# Initialize database
def create_tables():
    db.create_all()
    
    # Create default admin user if not exists
    if not User.query.filter_by(email='admin@example.com').first():
        admin_user = User(
            name='Admin User',
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin_user)
        
        # Create sample projects
        sample_projects = [
            Project(
                name='Predictive Analytics Engine',
                description='Advanced machine learning model for predictive analytics',
                type='ai-model',
                status='active',
                progress=75,
                user_id=1,
                ai_models_count=3,
                data_points_count=150000
            ),
            Project(
                name='Real-time Data Processor',
                description='High-performance data processing pipeline',
                type='data-processing',
                status='active',
                progress=60,
                user_id=1,
                data_points_count=500000
            )
        ]
        
        for project in sample_projects:
            db.session.add(project)
        
        # Create sample AI models
        sample_models = [
            AIModel(
                name='Predictive Analytics Model',
                type='regression',
                accuracy=94.5,
                precision=92.8,
                recall=96.2,
                f1_score=94.4,
                status='active',
                last_trained=datetime.utcnow() - timedelta(hours=2)
            ),
            AIModel(
                name='Anomaly Detection Model',
                type='classification',
                accuracy=89.3,
                precision=87.1,
                recall=91.5,
                f1_score=89.2,
                status='active',
                last_trained=datetime.utcnow() - timedelta(hours=6)
            )
        ]
        
        for model in sample_models:
            db.session.add(model)
        
        # Create sample security events
        sample_events = [
            SecurityEvent(
                event_type='Failed Login Attempt',
                severity='medium',
                description='Multiple failed login attempts detected',
                ip_address='192.168.1.100',
                timestamp=datetime.utcnow() - timedelta(minutes=2)
            ),
            SecurityEvent(
                event_type='Suspicious API Call',
                severity='high',
                description='Unusual API access pattern detected',
                ip_address='10.0.0.50',
                resolved=True,
                timestamp=datetime.utcnow() - timedelta(minutes=15)
            )
        ]
        
        for event in sample_events:
            db.session.add(event)
        
        db.session.commit()

# API Key Management Routes
@app.route('/api/admin/api-keys', methods=['GET'])
@require_api_key(['ADMIN'])
def get_api_keys():
    """Get all API keys information (admin only)"""
    return jsonify(get_api_key_info())

@app.route('/api/admin/api-keys/usage', methods=['GET'])
@require_api_key(['ADMIN'])
def get_api_usage_stats():
    """Get API usage statistics (admin only)"""
    days = request.args.get('days', 30, type=int)
    stats = api_key_manager.get_usage_stats(days=days)
    
    return jsonify({
        'usage_stats': [
            {
                'key_id': stat[0],
                'total_requests': stat[1],
                'active_days': stat[2],
                'last_used': stat[3]
            }
            for stat in stats
        ],
        'period_days': days
    })

@app.route('/api/admin/api-keys/<key_id>/usage', methods=['GET'])
@require_api_key(['ADMIN'])
def get_specific_api_usage(key_id):
    """Get usage statistics for a specific API key"""
    days = request.args.get('days', 30, type=int)
    stats = api_key_manager.get_usage_stats(api_key=key_id, days=days)
    
    if stats:
        stat = stats[0]
        return jsonify({
            'key_id': key_id,
            'total_requests': stat[0],
            'active_days': stat[1],
            'avg_status': stat[2],
            'period_days': days
        })
    else:
        return jsonify({
            'key_id': key_id,
            'total_requests': 0,
            'active_days': 0,
            'avg_status': 0,
            'period_days': days
        })

# Protected API endpoints examples
@app.route('/api/protected/data', methods=['GET'])
@require_api_key(['READ'])
def get_protected_data():
    """Example protected endpoint requiring READ permission"""
    return jsonify({
        'message': 'This is protected data',
        'data': [
            {'id': 1, 'value': 'Sample data 1'},
            {'id': 2, 'value': 'Sample data 2'}
        ],
        'api_key_used': getattr(g, 'api_key', 'unknown'),
        'permissions': getattr(g, 'api_permissions', [])
    })

@app.route('/api/protected/admin', methods=['GET'])
@require_api_key(['ADMIN'])
def get_admin_data():
    """Example admin-only endpoint"""
    return jsonify({
        'message': 'This is admin-only data',
        'system_info': {
            'total_users': User.query.count(),
            'total_projects': Project.query.count(),
            'total_models': AIModel.query.count()
        },
        'api_key_used': getattr(g, 'api_key', 'unknown')
    })

# Static file serving routes
@app.route('/')
def serve_index():
    """Serve the main index.html file"""
    return send_from_directory('../', 'index.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    """Serve static files from the parent directory"""
    try:
        return send_from_directory('../', filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

# Initialize database tables when app starts (for production)
with app.app_context():
    create_tables()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)