import os
from flask import Flask, jsonify
from config import Config
from extensions import db, migrate, jwt
from models import User, FileRecord, Block
from routes.auth_routes import auth_bp
from services.blockchain_service import BlockchainService

# Import blueprints
from blueprints.auth.routes import auth_bp
from blueprints.files.routes import files_bp
from blueprints.blockchain.routes import blockchain_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure instance folder exists (useful for SQLite)
    os.makedirs(os.path.join(app.root_path, "instance"), exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(files_bp)
    app.register_blueprint(blockchain_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})

    # Create DB tables and Genesis block (only once)
    with app.app_context():
        db.create_all()
        BlockchainService.create_genesis_block()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
