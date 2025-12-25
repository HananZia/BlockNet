import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

from config import Config
from extensions import db, migrate, mail
from services.blockchain_service import BlockchainService

# Import blueprints
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.file_routes import files_bp
from routes.sharing_routes import share_bp
from routes.blockchain_routes import blockchain_bp
from routes.dashboard_routes import dashboard_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS
    CORS(app, supports_credentials=True)

    # Ensure upload folder exists
    os.makedirs(os.path.join(app.root_path, "instance/uploads"), exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(files_bp)
    app.register_blueprint(share_bp)
    app.register_blueprint(blockchain_bp)
    app.register_blueprint(dashboard_bp)

    # Health check
    @app.route("/", methods=["GET"])
    def health():
        return jsonify({"success": "BlockNet Backend running."})

    # Create DB tables and genesis block if not exist
    with app.app_context():
        db.create_all()
        BlockchainService.create_genesis_block()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
