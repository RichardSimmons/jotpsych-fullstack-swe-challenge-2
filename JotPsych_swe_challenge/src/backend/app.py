import os
import time
import random
import threading
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from cryptography.fernet import Fernet, InvalidToken

# Path to the encryption key file
KEY_FILE = 'encryption_key.key'

def load_or_generate_key():
    """Load the encryption key from a file or generate a new one."""
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, 'rb') as key_file:
            return key_file.read()
    else:
        key = Fernet.generate_key()
        with open(KEY_FILE, 'wb') as key_file:
            key_file.write(key)
        return key

# Initialize cryptographic key
encryption_key = load_or_generate_key()
cipher = Fernet(encryption_key)

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    app.config['SECRET_KEY'] = 'secret123'
    app.config['JWT_SECRET_KEY'] = 'secret1234'

    CORS(app, resources={r"*": {"origins": ["*"]}}, allow_headers=["Authorization", "Content-Type", "app-version"], methods=["GET", "POST", "OPTIONS"], max_age=86400)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        db.create_all()

    @app.before_request
    def check_version():
        app_version = request.headers.get('app-version')
        if app_version and app_version < '1.2.0':
            return jsonify({'message': 'Please update your client application.'}), 426

    @app.route('/')
    def index():
        return jsonify({'status': 200})

    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = User(username=data['username'], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(identity={'username': new_user.username})
        return jsonify({'message': 'User registered successfully', 'token': access_token}), 201

    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and bcrypt.check_password_hash(user.password, data['password']):
            access_token = create_access_token(identity={'username': user.username})
            return jsonify({'token': access_token}), 200
        return jsonify({'message': 'Invalid credentials'}), 401

    @app.route('/user', methods=['GET'])
    @jwt_required()
    def get_user_data():
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()

        decrypted_motto = "Your motto here..."
        if user.motto:
            try:
                decrypted_motto = cipher.decrypt(user.motto.encode()).decode()
            except InvalidToken:
                decrypted_motto = "Could not decrypt motto (invalid token)."

        user_data = {
            'id': user.id,
            'username': user.username,
            'motto': decrypted_motto
        }
        return jsonify(user_data), 200

    def mock_transcribe_audio(file_path):
        """Simulate transcription with a random delay between 5 and 15 seconds."""
        random_delay = random.randint(5, 15)
        time.sleep(random_delay)
        return "Mock transcript of the audio file"

    def process_audio_file(file_path, user):
        """Process the audio file asynchronously and update the user motto."""
        transcript = mock_transcribe_audio(file_path)
        encrypted_transcript = cipher.encrypt(transcript.encode()).decode()
        user.motto = encrypted_transcript
        db.session.commit()
        return transcript

    def process_audio_thread(file_path, user):
        """Thread function to process the audio file."""
        with app.app_context():process_audio_file(file_path, user)

    @app.route('/upload', methods=['POST'])
    @jwt_required()
    def upload_file():
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()

        if 'audio' not in request.files:
            return jsonify({'message': 'No file part'}), 400

        file = request.files['audio']
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400

        upload_folder = 'api/audio_files'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        file_path = os.path.join(upload_folder, file.filename)
        try:
            file.save(file_path)
        except Exception as e:
            return jsonify({'message': f'File saving error: {str(e)}'}), 500

        # Process the audio file synchronously for simplicity
        transcript = mock_transcribe_audio(file_path)
        encrypted_transcript = cipher.encrypt(transcript.encode()).decode()
        user.motto = encrypted_transcript
        db.session.commit()

        return jsonify({'message': 'Motto updated successfully', 'transcript': transcript}), 200

    @app.route('/update_motto', methods=['POST'])
    @jwt_required()
    def update_motto():
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()
        data = request.get_json()
        new_motto = data.get('motto', '')
        encrypted_motto = cipher.encrypt(new_motto.encode()).decode()
        user.motto = encrypted_motto
        db.session.commit()
        return jsonify({'message': 'Motto updated successfully'}), 200

    return app

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    motto = db.Column(db.String(250), nullable=True)

if __name__ == '__main__':
    app = create_app()
    app.run(port=3002, debug=True)