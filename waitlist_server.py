from flask import Flask, request, jsonify, render_template_string
from datetime import datetime
import sqlite3
import re
import os

app = Flask(__name__)

# Initialize waitlist database
def init_waitlist_db():
    conn = sqlite3.connect('waitlist.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS waitlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            company TEXT,
            role TEXT,
            use_case TEXT,
            signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'waiting',
            position INTEGER,
            referral_source TEXT,
            notes TEXT
        )
    ''')
    conn.commit()
    conn.close()

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@app.route('/api/waitlist/signup', methods=['POST'])
def waitlist_signup():
    try:
        data = request.get_json()
        
        # Validate required fields
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        
        if not email or not validate_email(email):
            return jsonify({'error': 'Valid email is required'}), 400
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        # Connect to database
        conn = sqlite3.connect('waitlist.db')
        cursor = conn.cursor()
        
        # Check if email already exists
        cursor.execute('SELECT id FROM waitlist WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Email already registered'}), 409
        
        # Get current position (next in line)
        cursor.execute('SELECT COUNT(*) FROM waitlist')
        position = cursor.fetchone()[0] + 1
        
        # Insert new signup
        cursor.execute('''
            INSERT INTO waitlist (email, name, company, role, use_case, position, referral_source)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            email,
            name,
            data.get('company', ''),
            data.get('role', ''),
            data.get('use_case', ''),
            position,
            data.get('referral_source', 'website')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Successfully joined the waitlist!',
            'position': position,
            'estimated_wait': f'{position * 2} weeks' if position > 100 else 'Early access'
        })
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/waitlist/stats', methods=['GET'])
def waitlist_stats():
    try:
        conn = sqlite3.connect('waitlist.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM waitlist')
        total_signups = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM waitlist WHERE signup_date >= date("now", "-7 days")')
        weekly_signups = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM waitlist WHERE signup_date >= date("now", "-1 day")')
        daily_signups = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'total_signups': total_signups,
            'weekly_signups': weekly_signups,
            'daily_signups': daily_signups,
            'estimated_launch': 'Q2 2024'
        })
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    init_waitlist_db()
    app.run(debug=True, host='0.0.0.0', port=5002)