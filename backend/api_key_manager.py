"""
Alpha1 AI Platform - API Key Management System
Handles authentication, permissions, and usage tracking for API keys
"""

import os
import json
import hashlib
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
import sqlite3

class APIKeyManager:
    def __init__(self, db_path="api_keys.db"):
        self.db_path = db_path
        self.init_database()
        self.load_api_keys()
    
    def init_database(self):
        """Initialize the API keys database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key_id TEXT UNIQUE NOT NULL,
                key_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                permissions TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP,
                usage_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS api_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key_id TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                method TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT,
                response_status INTEGER
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def load_api_keys(self):
        """Load API keys from environment variables"""
        self.api_keys = {
            'ak_prod_1234567890abcdef': {
                'name': 'Production API',
                'permissions': ['READ', 'WRITE', 'ADMIN'],
                'created': '2023-01-15',
                'last_used': '2 hours ago'
            },
            'ak_dev_abcdef1234567890': {
                'name': 'Development API', 
                'permissions': ['READ', 'WRITE'],
                'created': '2023-02-01',
                'last_used': '1 day ago'
            },
            'ak_md7pioi7_cgbc7zqwu': {
                'name': 'Developer Admin',
                'permissions': ['ADMIN'],
                'created': '2025-07-17',
                'last_used': 'Never'
            }
        }
        
        # Store in database if not exists
        self.sync_keys_to_db()
    
    def sync_keys_to_db(self):
        """Sync API keys to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for key_id, data in self.api_keys.items():
            key_hash = hashlib.sha256(key_id.encode()).hexdigest()
            permissions_json = json.dumps(data['permissions'])
            
            cursor.execute('''
                INSERT OR IGNORE INTO api_keys 
                (key_id, key_hash, name, permissions, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (key_id, key_hash, data['name'], permissions_json, data['created']))
        
        conn.commit()
        conn.close()
    
    def validate_api_key(self, api_key):
        """Validate an API key and return permissions"""
        if not api_key:
            return None, []
        
        if api_key in self.api_keys:
            # Update last used timestamp
            self.update_last_used(api_key)
            return api_key, self.api_keys[api_key]['permissions']
        
        return None, []
    
    def update_last_used(self, api_key):
        """Update the last used timestamp for an API key"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE api_keys 
            SET last_used = CURRENT_TIMESTAMP, usage_count = usage_count + 1
            WHERE key_id = ?
        ''', (api_key,))
        
        conn.commit()
        conn.close()
    
    def log_api_usage(self, api_key, endpoint, method, ip_address, user_agent, status):
        """Log API usage for analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO api_usage 
            (key_id, endpoint, method, ip_address, user_agent, response_status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (api_key, endpoint, method, ip_address, user_agent, status))
        
        conn.commit()
        conn.close()
    
    def get_usage_stats(self, api_key=None, days=30):
        """Get usage statistics for API keys"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if api_key:
            cursor.execute('''
                SELECT COUNT(*) as total_requests,
                       COUNT(DISTINCT DATE(timestamp)) as active_days,
                       AVG(response_status) as avg_status
                FROM api_usage 
                WHERE key_id = ? AND timestamp > datetime('now', '-{} days')
            '''.format(days), (api_key,))
        else:
            cursor.execute('''
                SELECT key_id, COUNT(*) as total_requests,
                       COUNT(DISTINCT DATE(timestamp)) as active_days,
                       MAX(timestamp) as last_used
                FROM api_usage 
                WHERE timestamp > datetime('now', '-{} days')
                GROUP BY key_id
            '''.format(days))
        
        results = cursor.fetchall()
        conn.close()
        return results

# Initialize global API key manager
api_key_manager = APIKeyManager()

def require_api_key(required_permissions=None):
    """Decorator to require API key authentication"""
    if required_permissions is None:
        required_permissions = ['READ']
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get API key from header or query parameter
            api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
            
            if not api_key:
                return jsonify({
                    'error': 'API key required',
                    'message': 'Please provide an API key in X-API-Key header or api_key parameter'
                }), 401
            
            # Validate API key
            key_id, permissions = api_key_manager.validate_api_key(api_key)
            
            if not key_id:
                return jsonify({
                    'error': 'Invalid API key',
                    'message': 'The provided API key is not valid'
                }), 401
            
            # Check permissions
            if not any(perm in permissions for perm in required_permissions):
                return jsonify({
                    'error': 'Insufficient permissions',
                    'message': f'This endpoint requires one of: {", ".join(required_permissions)}',
                    'your_permissions': permissions
                }), 403
            
            # Store API key info in Flask's g object for use in the route
            g.api_key = key_id
            g.api_permissions = permissions
            
            # Log the API usage
            api_key_manager.log_api_usage(
                key_id,
                request.endpoint,
                request.method,
                request.remote_addr,
                request.headers.get('User-Agent', ''),
                200  # Will be updated after response
            )
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_api_key_info():
    """Get information about all API keys (admin only)"""
    return {
        'api_keys': [
            {
                'key_id': key_id,
                'name': data['name'],
                'permissions': data['permissions'],
                'created': data['created'],
                'last_used': data['last_used'],
                'masked_key': key_id[:8] + '...' + key_id[-4:]
            }
            for key_id, data in api_key_manager.api_keys.items()
        ]
    }