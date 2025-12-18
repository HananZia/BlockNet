import os
import hashlib
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import FileRecord, db, Certificate
from services.cert_service import CertService
from services.audit_service import AuditService

files_bp = Blueprint("files_bp", __name__, url_prefix="/api/files")

# ---------------------
# LIST FILES
# ---------------------
@files_bp.route("", methods=["GET"])
@jwt_required()
def list_files():
    user_id = get_jwt_identity()
    files = FileRecord.query.filter_by(user_id=user_id).all()
    return jsonify([f.to_dict() for f in files]), 200

# ---------------------
# UPLOAD FILE
# ---------------------
@files_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    content = file.read()
    file_hash = hashlib.sha256(content).hexdigest()

    upload_dir = os.path.join(current_app.root_path, "instance/uploads")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.name)
    file.seek(0)
    file.save(file_path)

    # Create file record
    record = FileRecord(user_id=user_id, name=file.name, filehash=file_hash, storage_uri=file_path)
    db.session.add(record)
    db.session.commit()

    # Log audit
    AuditService.log_action(user_id, "UPLOAD", f"File: {file.name}")

    # Issue certificate
    cert = CertService.issue_certificate(user_id, record.id)
    db.session.add(cert)
    db.session.commit()

    return jsonify({
        "message": "File uploaded",
        "file": record.to_dict(),
        "certificate": cert.to_dict()
    }), 201

# ---------------------
# VERIFY FILE
# ---------------------
@files_bp.route("/verify", methods=["POST"])
@jwt_required()
def verify_file():
    from services.blockchain_service import BlockchainService

    if "file" not in request.files:
        return jsonify({"error": "Missing file"}), 400

    uploaded_file = request.files["file"]
    uploaded_bytes = uploaded_file.read()
    uploaded_hash = hashlib.sha256(uploaded_bytes).hexdigest()

    # Find file record
    record = FileRecord.query.filter_by(name=uploaded_file.name).first()
    if not record:
        return jsonify({
            "verified": False,
            "status": "NOT_FOUND",
            "message": "File not registered"
        }), 404

    # Get all certificates
    certs = getattr(record, "certificate", None)

    # If certificate is a list (future multiple certs), pick latest
    if isinstance(certs, list):
        cert = certs[-1] if certs else None
    else:
        cert = certs

    # Get latest certificate
    cert = record.certificates.order_by(Certificate.issued_at.desc()).first()

    if not cert or cert.blockchain_index is None:
        return jsonify({
            "verified": False,
            "status": "NO_CERTIFICATE",
            "message": "No blockchain certificate found"
        }), 400
    # Fetch blockchain block
    block = BlockchainService.get_block_by_index(cert.blockchain_index)
    if not block:
        return jsonify({
            "verified": False,
            "status": "BLOCK_NOT_FOUND"
        }), 400

    block_data = BlockchainService.get_block_data(block)
    original_hash = block_data.get("filehash")

    if not original_hash:
        return jsonify({
            "verified": False,
            "status": "INVALID_BLOCK_DATA"
        }), 400

    # Compare hashes
    if uploaded_hash == original_hash:
        return jsonify({
            "verified": True,
            "status": "VERIFIED",
            "file": record.to_dict()
        }), 200

    return jsonify({
        "verified": False,
        "status": "TAMPERED",
        "message": "File content has been modified"
    }), 200

@files_bp.route("/verified", methods=["GET"])
@jwt_required()
def get_verified_files():
    """
    Return all files uploaded by the user that are verified (have a blockchain certificate)
    """
    user_id = get_jwt_identity()
    files = FileRecord.query.filter_by(user_id=user_id).all()
    verified_files = []

    for f in files:
        cert = f.certificates.order_by(Certificate.issued_at.desc()).first()
        if cert and cert.blockchain_index is not None:
            verified_files.append(f)

    return jsonify([{
        "id": f.id,
        "name": f.name,
        "size": os.path.getsize(f.storage_uri),  # size in bytes
        "uploaded_at": f.created_at.isoformat(),
        "verified": True,
        "owner_id": f.user_id
    } for f in verified_files]), 200
