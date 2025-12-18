from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.sharing_service import ShareService
from schemas import FileShareSchema

share_bp = Blueprint("share", __name__, url_prefix="/api/share")
share_schema = FileShareSchema()
shares_schema = FileShareSchema(many=True)

@share_bp.route("/share", methods=["POST"])
@jwt_required()
def send_share():
    sender_id = get_jwt_identity()
    data = request.get_json() or {}
    receiver_email = data.get("receiver_email")
    file_id = data.get("file_id")
    if not receiver_email or not file_id:
        return jsonify({"error": "receiver_email and file_id required"}), 400

    try:
        share = ShareService.share_file(sender_id, receiver_email, file_id)
        return jsonify({"message": "File shared", "share": share_schema.dump(share)}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@share_bp.route("/shared-with-me", methods=["GET"])
@jwt_required()
def received_files():
    user_id = get_jwt_identity()
    shares = ShareService.get_shared_with_user(user_id)
    return jsonify(shares_schema.dump(shares)), 200

@share_bp.route("/shared-by-me", methods=["GET"])
@jwt_required()
def sent_files():
    user_id = get_jwt_identity()
    shares = ShareService.get_shared_by_user(user_id)
    return jsonify(shares_schema.dump(shares)), 200
