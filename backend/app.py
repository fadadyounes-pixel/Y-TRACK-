"""
Y-TRACK Admin Dashboard API
A multi-tenant Monitoring & Evaluation system for youth platforms
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['ENV'] = os.getenv('FLASK_ENV', 'development')

# ========================
# Health Check & Root
# ========================

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'name': 'Y-TRACK Admin Dashboard',
        'version': '1.0.0',
        'status': 'online',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

# ========================
# Authentication Routes
# ========================

@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    # Mock authentication
    if data['email'] == 'admin@ytrack.com' and data['password'] == 'admin123':
        return jsonify({
            'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token',
            'user': {
                'id': 1,
                'email': 'admin@ytrack.com',
                'role': 'super_admin',
                'name': 'Admin User'
            }
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/v1/auth/logout', methods=['POST'])
def logout():
    """User logout"""
    return jsonify({'message': 'Logged out successfully'}), 200

# ========================
# Platform Routes
# ========================

@app.route('/api/v1/platforms', methods=['GET'])
def get_platforms():
    """Get all platforms"""
    # Mock data
    platforms = [
        {
            'id': 1,
            'name': 'Youth Platform - Casablanca',
            'region': 'Casablanca-Settat',
            'city': 'Casablanca',
            'sync_status': 'online',
            'total_beneficiaries': 250,
            'active_beneficiaries': 180,
            'completed': 50,
            'coordinator': {'id': 5, 'name': 'Ahmed Alami'},
            'last_sync': '2026-05-11T10:30:00Z'
        },
        {
            'id': 2,
            'name': 'Youth Platform - Rabat',
            'region': 'Rabat-Salé-Kénitra',
            'city': 'Rabat',
            'sync_status': 'syncing',
            'total_beneficiaries': 180,
            'active_beneficiaries': 120,
            'completed': 35,
            'coordinator': {'id': 6, 'name': 'Fatima Moroccan'},
            'last_sync': '2026-05-11T09:15:00Z'
        },
        {
            'id': 3,
            'name': 'Youth Platform - Fez',
            'region': 'Fez-Meknes',
            'city': 'Fez',
            'sync_status': 'online',
            'total_beneficiaries': 215,
            'active_beneficiaries': 160,
            'completed': 42,
            'coordinator': {'id': 7, 'name': 'Hassan Bennani'},
            'last_sync': '2026-05-11T11:00:00Z'
        }
    ]
    
    return jsonify({
        'platforms': platforms,
        'total': len(platforms),
        'page': 1
    }), 200

@app.route('/api/v1/platforms/<int:platform_id>', methods=['GET'])
def get_platform(platform_id):
    """Get platform details"""
    platform = {
        'id': platform_id,
        'name': f'Youth Platform - City {platform_id}',
        'region': 'Region Name',
        'city': 'City Name',
        'address': '123 Street Address',
        'sync_status': 'online',
        'total_beneficiaries': 250,
        'active_beneficiaries': 180,
        'completed': 50,
        'coordinator': {'id': 5, 'name': 'Coordinator Name'},
        'onedrive_url': 'https://onedrive.com/...',
        'google_drive_url': 'https://drive.google.com/...',
        'last_sync': '2026-05-11T10:30:00Z',
        'created_at': '2026-01-15T00:00:00Z'
    }
    
    return jsonify(platform), 200

@app.route('/api/v1/platforms', methods=['POST'])
def create_platform():
    """Create new platform"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Platform name required'}), 400
    
    new_platform = {
        'id': 13,
        'name': data.get('name'),
        'region': data.get('region'),
        'city': data.get('city'),
        'sync_status': 'offline',
        'created_at': datetime.utcnow().isoformat()
    }
    
    return jsonify(new_platform), 201

# ========================
# Beneficiary Routes
# ========================

@app.route('/api/v1/beneficiaries', methods=['GET'])
def get_beneficiaries():
    """Get all beneficiaries"""
    beneficiaries = [
        {
            'id': 'YTR-0001',
            'first_name': 'Mohammed',
            'last_name': 'Benali',
            'gender': 'male',
            'age': 22,
            'age_group': '20-25',
            'region': 'Casablanca-Settat',
            'city': 'Casablanca',
            'education_level': 'High School',
            'platform_id': 1,
            'current_program': 'Leadership & Civic Engagement',
            'status': 'active',
            'email': 'mohammed.benali@example.com',
            'phone': '+212612345678',
            'registration_date': '2026-03-15T00:00:00Z',
            'current_journey_step': 3
        },
        {
            'id': 'YTR-0002',
            'first_name': 'Fatima',
            'last_name': 'Hassan',
            'gender': 'female',
            'age': 20,
            'age_group': '18-20',
            'region': 'Rabat-Salé-Kénitra',
            'city': 'Rabat',
            'education_level': 'Secondary School',
            'platform_id': 2,
            'current_program': 'Skills Training & Vocational Education',
            'status': 'completed',
            'email': 'fatima.hassan@example.com',
            'phone': '+212612345679',
            'registration_date': '2026-02-01T00:00:00Z',
            'current_journey_step': 6
        }
    ]
    
    return jsonify({
        'beneficiaries': beneficiaries,
        'total': 2500,
        'page': 1
    }), 200

@app.route('/api/v1/beneficiaries/<beneficiary_id>', methods=['GET'])
def get_beneficiary(beneficiary_id):
    """Get beneficiary details"""
    beneficiary = {
        'id': beneficiary_id,
        'first_name': 'Mohammed',
        'last_name': 'Benali',
        'gender': 'male',
        'age': 22,
        'date_of_birth': '2004-05-15',
        'age_group': '20-25',
        'region': 'Casablanca-Settat',
        'city': 'Casablanca',
        'education_level': 'High School',
        'platform_id': 1,
        'current_program': 'Leadership & Civic Engagement',
        'status': 'active',
        'email': 'mohammed.benali@example.com',
        'phone': '+212612345678',
        'registration_date': '2026-03-15T00:00:00Z',
        'current_journey_step': 3,
        'journey_history': [
            {
                'step': 1,
                'name': 'Registered',
                'date': '2026-03-15T00:00:00Z'
            },
            {
                'step': 2,
                'name': 'Orientation',
                'date': '2026-03-22T00:00:00Z'
            },
            {
                'step': 3,
                'name': 'Active in Program',
                'date': '2026-04-01T00:00:00Z'
            }
        ]
    }
    
    return jsonify(beneficiary), 200

@app.route('/api/v1/beneficiaries', methods=['POST'])
def create_beneficiary():
    """Create new beneficiary"""
    data = request.get_json()
    
    required_fields = ['first_name', 'last_name', 'gender', 'date_of_birth', 'platform_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_beneficiary = {
        'id': 'YTR-2501',
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'registration_date': datetime.utcnow().isoformat(),
        'status': 'registered'
    }
    
    return jsonify(new_beneficiary), 201

# ========================
# Programs Routes
# ========================

@app.route('/api/v1/programs', methods=['GET'])
def get_programs():
    """Get all programs"""
    programs = [
        {
            'id': 1,
            'name': 'Leadership & Civic Engagement',
            'description': 'Program focused on developing leadership skills',
            'total_enrolled': 450,
            'completion_rate': 85,
            'active_count': 280
        },
        {
            'id': 2,
            'name': 'Skills Training & Vocational Education',
            'description': 'Technical and vocational skills training',
            'total_enrolled': 520,
            'completion_rate': 78,
            'active_count': 310
        },
        {
            'id': 3,
            'name': 'Entrepreneurship & Business Development',
            'description': 'Business startup and development program',
            'total_enrolled': 380,
            'completion_rate': 72,
            'active_count': 240
        }
    ]
    
    return jsonify({'programs': programs}), 200

@app.route('/api/v1/programs/<int:program_id>/stats', methods=['GET'])
def get_program_stats(program_id):
    """Get program statistics"""
    stats = {
        'id': program_id,
        'name': 'Program Name',
        'total_enrolled': 450,
        'active': 280,
        'completed': 150,
        'dropped': 20,
        'completion_rate': 85,
        'by_platform': [
            {
                'platform_id': 1,
                'platform_name': 'Casablanca',
                'enrolled': 100,
                'completed': 85
            }
        ]
    }
    
    return jsonify(stats), 200

# ========================
# Dashboard Routes
# ========================

@app.route('/api/v1/dashboard/metrics', methods=['GET'])
def get_metrics():
    """Get global dashboard metrics"""
    metrics = {
        'total_beneficiaries': 2500,
        'female_percentage': 52,
        'male_percentage': 48,
        'completion_rate': 81,
        'dropout_rate': 5,
        'active_platforms': 12,
        'outcomes_achieved': {
            'employment': 180,
            'certification': 250,
            'education_advancement': 120
        },
        'by_program': {
            'leadership': 450,
            'skills': 520,
            'entrepreneurship': 380
        }
    }
    
    return jsonify(metrics), 200

@app.route('/api/v1/dashboard/registration-trend', methods=['GET'])
def get_registration_trend():
    """Get registration trend data"""
    period = request.args.get('period', 'monthly')
    
    trend_data = {
        'period': period,
        'data': [
            {'month': '2025-05', 'registrations': 180, 'completions': 45, 'dropouts': 8},
            {'month': '2025-06', 'registrations': 210, 'completions': 52, 'dropouts': 10},
            {'month': '2025-07', 'registrations': 195, 'completions': 48, 'dropouts': 9},
            {'month': '2025-08', 'registrations': 220, 'completions': 55, 'dropouts': 11},
            {'month': '2025-09', 'registrations': 205, 'completions': 51, 'dropouts': 10},
            {'month': '2025-10', 'registrations': 240, 'completions': 60, 'dropouts': 12}
        ]
    }
    
    return jsonify(trend_data), 200

# ========================
# Messages Routes
# ========================

@app.route('/api/v1/messages', methods=['GET'])
def get_messages():
    """Get messages"""
    messages = [
        {
            'id': 1,
            'subject': 'Program Update',
            'body': 'New workshops available this week',
            'sender': 'admin@ytrack.com',
            'recipient_count': 250,
            'status': 'delivered',
            'created_at': '2026-05-11T10:00:00Z'
        }
    ]
    
    return jsonify({
        'messages': messages,
        'total': 45,
        'page': 1
    }), 200

@app.route('/api/v1/messages', methods=['POST'])
def send_message():
    """Send message"""
    data = request.get_json()
    
    if not data.get('subject') or not data.get('body'):
        return jsonify({'error': 'Subject and body required'}), 400
    
    message = {
        'id': 101,
        'subject': data.get('subject'),
        'recipient_count': 350,
        'status': 'sent',
        'created_at': datetime.utcnow().isoformat()
    }
    
    return jsonify(message), 201

# ========================
# Error Handlers
# ========================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

# ========================
# Main
# ========================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = app.config['ENV'] == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)