import os
from flask import Blueprint, current_app, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Certificate, Certificate, User, FileRecord, FileShare
from schemas import UserSchema, FileRecordSchema, FileShareSchema

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

user_schema = UserSchema()
users_schema = UserSchema(many=True)
file_schema = FileRecordSchema()
files_schema = FileRecordSchema(many=True)
share_schema = FileShareSchema()
shares_schema = FileShareSchema(many=True)

# ---------------------------
# ADMIN AUTH DECORATOR
# ---------------------------
def admin_required(func):
    from functools import wraps
    from flask import jsonify
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = User.query.get(get_jwt_identity())
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return func(*args, **kwargs)
    return wrapper

# ---------------------------
# USERS ROUTES
# ---------------------------
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def all_users():
    users = User.query.all()
    return jsonify(users_schema.dump(users)), 200

@admin_bp.route("/users/toggle/<int:user_id>", methods=["POST"])
@jwt_required()
@admin_required
def toggle_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({"message": f"User {'activated' if user.is_active else 'deactivated'}"}), 200

# ---------------------------
# STATS ROUTE
# ---------------------------
@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
@admin_required
def stats():
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    total_files = FileRecord.query.count()
    return jsonify({
        "total_users": total_users,
        "active_users": active_users,
        "total_files": total_files
    }), 200

# ---------------------------
# FILES ROUTES
# ---------------------------
@admin_bp.route("/files", methods=["GET"])
@jwt_required()
@admin_required
def all_files():
    """Return all files with computed size, owner, uploadedAt, and verified status"""
    files = FileRecord.query.all()
    result = []

    for f in files:
        # Compute file size if storage_uri exists
        size = 0
        if f.storage_uri:
            file_path = f.storage_uri
            if not os.path.isabs(file_path):
                file_path = os.path.join(current_app.instance_path, "uploads", f.name)
            if os.path.exists(file_path):
                size = os.path.getsize(file_path)

        # Get owner username safely
        owner_name = f.owner.username if f.owner else "Unknown"

        # Check if file has a valid certificate (verified)
        latest_cert = f.certificates.order_by(Certificate.issued_at.desc()).first()
        verified = latest_cert is not None and latest_cert.blockchain_index is not None

        result.append({
            "id": f.id,
            "name": f.name,
            "owner": owner_name,
            "size": size,
            "uploadedAt": f.created_at.isoformat(),
            "verified": verified
        })

    return jsonify(result), 200


@admin_bp.route("/files/<int:file_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_file(file_id):
    """Return a single file by ID"""
    file = FileRecord.query.get(file_id)
    if not file:
        return jsonify({"error": "File not found"}), 404
    return jsonify(file_schema.dump(file)), 200

# ---------------------------
# TRANSACTIONS ROUTES
# ---------------------------
@admin_bp.route("/transactions", methods=["GET"])
@jwt_required()
@admin_required
def all_transactions():
    """Return all file share transactions"""
    shares = FileShare.query.all()
    return jsonify(shares_schema.dump(shares)), 200

@admin_bp.route("/transactions/<int:share_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_transaction(share_id):
    """Return a single transaction by ID"""
    share = FileShare.query.get(share_id)
    if not share:
        return jsonify({"error": "Transaction not found"}), 404
    return jsonify(share_schema.dump(share)), 200

# ---------------------------
# USER MANAGEMENT ROUTES
# ---------------------------

@admin_bp.route("/users/deactivate/<int:user_id>", methods=["POST"])
@jwt_required()
@admin_required
def deactivate_user(user_id):
    """Deactivate a user account"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.is_active = False
    db.session.commit()
    return jsonify({"message": f"User '{user.username}' has been deactivated"}), 200


@admin_bp.route("/users/delete/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Permanently delete a user and their files"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Optionally delete all files owned by user
    for file in user.files:
        db.session.delete(file)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User '{user.username}' and all their files have been deleted"}), 200


# ---------------------------
# FILE MANAGEMENT ROUTES
# ---------------------------

@admin_bp.route("/files/delete/<int:file_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_file(file_id):
    """Permanently delete a file"""
    file = FileRecord.query.get(file_id)
    if not file:
        return jsonify({"error": "File not found"}), 404

    db.session.delete(file)
    db.session.commit()
    return jsonify({"message": f"File '{file.name}' has been deleted"}), 200
