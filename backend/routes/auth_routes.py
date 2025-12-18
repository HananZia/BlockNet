from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User
from schemas import UserSchema, UserRegisterSchema

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

user_schema = UserSchema()
register_schema = UserRegisterSchema()

# REGISTER
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    errors = register_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already taken"}), 400

    new_user = User(
        username=data["username"],
        email=data["email"],
        password_hash=generate_password_hash(data["password"]),
        role="user"
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered", "user": user_schema.dump(new_user)}), 201

# LOGIN
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not check_password_hash(user.password_hash, data.get("password", "")):
        return jsonify({"error": "Invalid credentials"}), 401

    # Fix: convert user.id to string
    token = create_access_token(identity=str(user.id))

    return jsonify({"access_token": token, "user": user_schema.dump(user)}), 200

# PROFILE
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user = User.query.get(get_jwt_identity())
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user_schema.dump(current_user)), 200
