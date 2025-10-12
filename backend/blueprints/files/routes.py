import hashlib
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import FileRecord
from services.cert_service import CertService
from services.audit_service import AuditService

files_bp = Blueprint("files", __name__, url_prefix="/files")

@files_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    content = file.read()
    file_hash = hashlib.sha256(content).hexdigest()

    record = FileRecord(
        user_id=user_id,
        filename=file.filename,
        filehash=file_hash
    )
    db.session.add(record)
    db.session.commit()

    AuditService.log_action(user_id, "UPLOAD", f"File: {file.filename}")
    cert = CertService.issue_certificate(user_id, record.id)

    return jsonify({
        "message": "File uploaded successfully",
        "file": record.to_dict(),
        "certificate": cert.to_dict()
    })

@files_bp.route("/verify", methods=["POST"])
@jwt_required()
def verify_file():
    data = request.get_json()
    filehash = data.get("filehash")
    if not filehash:
        return jsonify({"error": "Missing file hash"}), 400

    record = FileRecord.query.filter_by(filehash=filehash).first()
    if record:
        return jsonify({"verified": True, "file": record.to_dict()})
    return jsonify({"verified": False})
