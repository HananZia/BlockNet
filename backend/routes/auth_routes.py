from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from datetime import datetime, timedelta
from flask_mail import Message
from models import User
from extensions import mail
from flask import current_app
from schemas import UserSchema, UserRegisterSchema
import random

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

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    # Security: don't reveal if email exists
    if not user:
        return jsonify({"message": "If email exists, OTP was sent"}), 200

    otp = f"{random.randint(100000, 999999)}"
    user.reset_otp = otp
    user.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    db.session.commit()

    try:
        msg = Message(
            subject="Your Password Reset Code",
            recipients=[user.email],
            body=f"""
Hello {user.username},

Your password reset code is:

{otp}

This code expires in 10 minutes.
If you didn't request this, ignore this email.
"""
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Mail error: {e}")

    return jsonify({"message": "If email exists, OTP was sent"}), 200

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json() or {}
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({"error": "Email and OTP required"}), 400

    user = User.query.filter_by(email=email, reset_otp=otp).first()

    if not user:
        return jsonify({"error": "Invalid OTP"}), 400

    if not user.reset_otp_expiry or user.reset_otp_expiry < datetime.utcnow():
        return jsonify({"error": "OTP expired"}), 400

    return jsonify({"message": "OTP verified"}), 200

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("password")

    if not email or not otp or not new_password:
        return jsonify({"error": "Missing fields"}), 400

    user = User.query.filter_by(email=email, reset_otp=otp).first()

    if not user:
        return jsonify({"error": "Invalid OTP"}), 400

    if not user.reset_otp_expiry or user.reset_otp_expiry < datetime.utcnow():
        return jsonify({"error": "OTP expired"}), 400

    user.password_hash = generate_password_hash(new_password)
    user.reset_otp = None
    user.reset_otp_expiry = None

    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200

