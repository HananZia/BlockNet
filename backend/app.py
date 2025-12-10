import os
from flask import Flask, app, jsonify
from config import Config
from extensions import db, migrate, jwt, mail
from models import User, FileRecord, Block
from routes.sharing_routes import share_bp
from services.blockchain_service import BlockchainService

from blueprints.auth.routes import auth_bp
from blueprints.files.routes import files_bp
from blueprints.blockchain.routes import blockchain_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    os.makedirs(os.path.join(app.root_path, "instance"), exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(share_bp, url_prefix="/api/share")
    app.register_blueprint(files_bp, url_prefix="/api/files")
    app.register_blueprint(blockchain_bp, url_prefix="/api/blockchain")

    @app.route("/", methods=["GET"])
    def starter():
        return jsonify({"Success": "BlockNet Backend is running."})

    @app.route("/api/blocknet", methods=["GET"])
    def blocknet_health():
        return jsonify({"status": "Success", "message": "Blocknet is operational."})

    @app.route("/api/auth", methods=["GET"])
    def auth_data():
        users = User.query.all()
        users_list = [
            {"id": user.id, "username": user.username, "email": user.email}
            for user in users
        ]
        return jsonify({"status": "success", "users": users_list})

    @app.route("/api/user", methods=["GET"])
    def user_data():
        users = User.query.all()
        users_list = [
        {"id": u.id, "username": u.username, "email": u.email} for u in users
        ]
        return jsonify({"status": "success", "users": users_list})

    @app.route("/api/share", methods=["GET"])
    def share_health():
        return jsonify({"status": "ok"})

    @app.route("/api/files", methods=["GET"])
    def files_health():
        return jsonify({"status": "ok"})

    with app.app_context():
        db.create_all()
        BlockchainService.create_genesis_block()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
