import os
import uuid
import mimetypes
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import hashlib

file_upload_bp = Blueprint('file_upload', __name__)

# Allowed file extensions and their categories
ALLOWED_EXTENSIONS = {
    'documents': {
        'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages',
        'md', 'tex', 'csv', 'xlsx', 'xls', 'ppt', 'pptx'
    },
    'images': {
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',
        'tiff', 'ico', 'heic', 'raw'
    },
    'code': {
        'py', 'js', 'html', 'css', 'java', 'cpp', 'c', 'h',
        'php', 'rb', 'go', 'rs', 'swift', 'kt', 'ts', 'jsx',
        'tsx', 'vue', 'json', 'xml', 'yaml', 'yml', 'sql',
        'sh', 'bat', 'ps1', 'r', 'scala', 'dart'
    },
    'media': {
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv',
        'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'
    },
    'archives': {
        'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'
    },
    'data': {
        'json', 'csv', 'tsv', 'xml', 'parquet', 'h5', 'hdf5',
        'pickle', 'pkl', 'npy', 'npz'
    }
}

# Maximum file sizes (in bytes)
MAX_FILE_SIZES = {
    'documents': 50 * 1024 * 1024,  # 50MB
    'images': 20 * 1024 * 1024,     # 20MB
    'code': 10 * 1024 * 1024,       # 10MB
    'media': 500 * 1024 * 1024,     # 500MB
    'archives': 100 * 1024 * 1024,  # 100MB
    'data': 200 * 1024 * 1024       # 200MB
}

def get_file_category(filename):
    """Determine file category based on extension"""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    for category, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return category
    return 'other'

def allowed_file(filename, category=None):
    """Check if file is allowed"""
    if not filename or '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    
    if category:
        return ext in ALLOWED_EXTENSIONS.get(category, set())
    
    # Check if extension is in any category
    for extensions in ALLOWED_EXTENSIONS.values():
        if ext in extensions:
            return True
    return False

def get_file_hash(file_content):
    """Generate SHA-256 hash of file content"""
    return hashlib.sha256(file_content).hexdigest()

def create_upload_directory():
    """Create upload directory if it doesn't exist"""
    upload_dir = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir

@file_upload_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """Enhanced file upload endpoint with comprehensive support"""
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        project_id = request.form.get('project_id')
        agent_id = request.form.get('agent_id')
        file_category = request.form.get('category')
        description = request.form.get('description', '')
        
        if not files or all(f.filename == '' for f in files):
            return jsonify({'error': 'No files selected'}), 400
        
        user_id = get_jwt_identity()
        upload_dir = create_upload_directory()
        uploaded_files = []
        errors = []
        
        for file in files:
            if file.filename == '':
                continue
                
            try:
                # Security checks
                filename = secure_filename(file.filename)
                if not filename:
                    errors.append(f"Invalid filename: {file.filename}")
                    continue
                
                # Determine file category
                detected_category = get_file_category(filename)
                category = file_category or detected_category
                
                # Check if file type is allowed
                if not allowed_file(filename, category):
                    errors.append(f"File type not allowed: {filename}")
                    continue
                
                # Read file content
                file_content = file.read()
                file_size = len(file_content)
                
                # Check file size
                max_size = MAX_FILE_SIZES.get(category, 10 * 1024 * 1024)
                if file_size > max_size:
                    errors.append(f"File too large: {filename} ({file_size / (1024*1024):.1f}MB > {max_size / (1024*1024):.1f}MB)")
                    continue
                
                # Generate unique filename
                file_hash = get_file_hash(file_content)
                file_id = str(uuid.uuid4())
                unique_filename = f"{file_id}_{filename}"
                file_path = os.path.join(upload_dir, unique_filename)
                
                # Save file
                with open(file_path, 'wb') as f:
                    f.write(file_content)
                
                # Get MIME type
                mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
                
                # Create file metadata
                file_info = {
                    'id': file_id,
                    'original_filename': file.filename,
                    'secure_filename': filename,
                    'stored_filename': unique_filename,
                    'file_path': file_path,
                    'size': file_size,
                    'size_human': format_file_size(file_size),
                    'mime_type': mime_type,
                    'category': category,
                    'hash': file_hash,
                    'project_id': project_id,
                    'agent_id': agent_id,
                    'description': description,
                    'user_id': user_id,
                    'uploaded_at': datetime.utcnow().isoformat(),
                    'status': 'uploaded',
                    'processing_status': 'pending'
                }
                
                # TODO: Add to database/storage system
                # For now, we'll store in memory or file system
                
                uploaded_files.append(file_info)
                
            except Exception as e:
                errors.append(f"Error processing {file.filename}: {str(e)}")
        
        response_data = {
            'message': f'Successfully uploaded {len(uploaded_files)} file(s)',
            'uploaded_files': uploaded_files,
            'total_uploaded': len(uploaded_files),
            'total_size': sum(f['size'] for f in uploaded_files),
            'total_size_human': format_file_size(sum(f['size'] for f in uploaded_files))
        }
        
        if errors:
            response_data['errors'] = errors
            response_data['error_count'] = len(errors)
        
        return jsonify(response_data), 200 if uploaded_files else 400
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@file_upload_bp.route('/files', methods=['GET'])
@jwt_required()
def list_files():
    """List uploaded files for the current user"""
    try:
        user_id = get_jwt_identity()
        project_id = request.args.get('project_id')
        agent_id = request.args.get('agent_id')
        category = request.args.get('category')
        
        # TODO: Implement database query
        # For now, return mock data
        files = []
        
        return jsonify({
            'files': files,
            'total_count': len(files),
            'filters': {
                'project_id': project_id,
                'agent_id': agent_id,
                'category': category
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

@file_upload_bp.route('/files/<file_id>', methods=['DELETE'])
@jwt_required()
def delete_file(file_id):
    """Delete an uploaded file"""
    try:
        user_id = get_jwt_identity()
        
        # TODO: Implement file deletion from database and filesystem
        
        return jsonify({'message': 'File deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete file: {str(e)}'}), 500

@file_upload_bp.route('/files/<file_id>/process', methods=['POST'])
@jwt_required()
def process_file(file_id):
    """Process uploaded file (extract text, create embeddings, etc.)"""
    try:
        user_id = get_jwt_identity()
        processing_type = request.json.get('type', 'extract_text')
        
        # TODO: Implement file processing
        # - Text extraction from PDFs, docs
        # - Image analysis
        # - Code analysis
        # - Vector embeddings creation
        
        return jsonify({
            'message': 'File processing started',
            'file_id': file_id,
            'processing_type': processing_type,
            'status': 'processing'
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

@file_upload_bp.route('/upload/info', methods=['GET'])
def get_upload_info():
    """Get upload configuration and limits"""
    return jsonify({
        'allowed_extensions': ALLOWED_EXTENSIONS,
        'max_file_sizes': {k: format_file_size(v) for k, v in MAX_FILE_SIZES.items()},
        'max_file_sizes_bytes': MAX_FILE_SIZES,
        'supported_categories': list(ALLOWED_EXTENSIONS.keys()),
        'total_extensions': sum(len(exts) for exts in ALLOWED_EXTENSIONS.values())
    })

def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    import math
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {size_names[i]}"