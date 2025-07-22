#!/usr/bin/env python3
"""
Minimal test script to debug Render deployment issues
"""
import os
import sys

def test_imports():
    """Test all required imports"""
    try:
        print("Testing imports...")
        
        import flask
        print(f"✅ Flask {flask.__version__}")
        
        import flask_cors
        print(f"✅ Flask-CORS {flask_cors.__version__}")
        
        import flask_sqlalchemy
        print(f"✅ Flask-SQLAlchemy {flask_sqlalchemy.__version__}")
        
        import flask_migrate
        print(f"✅ Flask-Migrate {flask_migrate.__version__}")
        
        import flask_jwt_extended
        print(f"✅ Flask-JWT-Extended {flask_jwt_extended.__version__}")
        
        import requests
        print(f"✅ Requests {requests.__version__}")
        
        import gunicorn
        print(f"✅ Gunicorn {gunicorn.__version__}")
        
        print("✅ All imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_app_creation():
    """Test basic Flask app creation"""
    try:
        print("\nTesting Flask app creation...")
        from flask import Flask
        app = Flask(__name__)
        
        @app.route('/health')
        def health():
            return {'status': 'ok', 'message': 'Minimal app working'}
        
        print("✅ Flask app created successfully!")
        return app
        
    except Exception as e:
        print(f"❌ App creation error: {e}")
        return None

def test_environment():
    """Test environment variables"""
    print("\nTesting environment...")
    print(f"Python version: {sys.version}")
    print(f"Python path: {sys.path}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"PORT environment variable: {os.getenv('PORT', 'Not set')}")
    print(f"DATABASE_URL: {os.getenv('DATABASE_URL', 'Not set')}")

if __name__ == '__main__':
    print("=== Render Deployment Diagnostic ===")
    
    # Test environment
    test_environment()
    
    # Test imports
    if not test_imports():
        sys.exit(1)
    
    # Test app creation
    app = test_app_creation()
    if not app:
        sys.exit(1)
    
    # Try to run the app
    try:
        port = int(os.getenv('PORT', 5000))
        print(f"\n🚀 Starting test server on port {port}...")
        app.run(host='0.0.0.0', port=port, debug=False)
    except Exception as e:
        print(f"❌ Server start error: {e}")
        sys.exit(1)