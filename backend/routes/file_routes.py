import os
import hashlib
from flask import Blueprint, request, jsonify, current_app, send_file, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import FileRecord, FileShare, db, Certificate
from services.cert_service import CertService
from services.audit_service import AuditService
from services.blockchain_service import BlockchainService

files_bp = Blueprint("files_bp", __name__, url_prefix="/api/files")


# --------------------- UTILITY ---------------------
def get_upload_dir():
    """Return absolute path to uploads folder and create if it doesn't exist."""
    upload_dir = os.path.join(current_app.instance_path, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir


# --------------------- LIST FILES ---------------------
@files_bp.route("", methods=["GET"])
@jwt_required()
def list_files():
    user_id = get_jwt_identity()
    files = FileRecord.query.filter_by(user_id=user_id).all()
    result = []
    for f in files:
        size = os.path.getsize(f.storage_uri) if f.storage_uri and os.path.exists(f.storage_uri) else 0
        cert = f.certificates.order_by(Certificate.issued_at.desc()).first()
        verified = cert is not None and cert.blockchain_index is not None
        result.append({
            "id": f.id,
            "name": f.name,
            "filehash": f.filehash,
            "size": size,
            "created_at": f.created_at.isoformat(),
            "verified": verified
        })
    return jsonify(result), 200


# --------------------- UPLOAD FILE ---------------------
@files_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    uploaded_file = request.files.get("file")

    if not uploaded_file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = secure_filename(uploaded_file.filename)
    existing = FileRecord.query.filter_by(user_id=user_id, name=filename).first()
    if existing:
        return jsonify({"error": "File with this name already exists"}), 409

    upload_dir = get_upload_dir()
    file_path = os.path.join(upload_dir, filename)
    uploaded_file.save(file_path)

    # Hash file
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    file_hash = sha256.hexdigest()

    # Save DB record
    record = FileRecord(
        user_id=user_id,
        name=filename,
        filehash=file_hash,
        storage_uri=file_path
    )
    db.session.add(record)
    db.session.commit()

    # Audit
    AuditService.log_action(user_id, "UPLOAD", f"File: {filename}")

    # Blockchain
    block_data = {
        "type": "file",
        "file_id": record.id,
        "filehash": record.filehash,
        "owner_id": user_id,
        "filename": record.name,
        "uploaded_at": record.created_at.isoformat()
    }
    block = BlockchainService.add_block(block_data)
    record.block_index = block.index
    db.session.commit()

    # Certificate
    cert = CertService.issue_certificate(user_id, record.id)

    return jsonify({
        "message": "File uploaded successfully",
        "file": {
            "id": record.id,
            "name": record.name,
            "filehash": record.filehash,
            "size": os.path.getsize(record.storage_uri),
            "created_at": record.created_at.isoformat(),
            "verified": True
        },
        "certificate": cert.to_dict()
    }), 201


# --------------------- DOWNLOAD FILE ---------------------
@files_bp.route("/download/<int:file_id>", methods=["GET"])
@jwt_required()
def download_file(file_id):
    user_id = get_jwt_identity()
    file = FileRecord.query.get_or_404(file_id)

    # Permission
    is_owner = file.user_id == user_id
    is_shared = file.shares.filter_by(receiver_id=user_id).first()
    if not is_owner and not is_shared:
        return jsonify({"error": "Access denied"}), 403

    # Use filename in uploads folder if storage_uri is absolute
    file_path = file.storage_uri
    if not os.path.isabs(file_path):
        file_path = os.path.join(get_upload_dir(), file.name)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found on server"}), 404

    return send_file(file_path, as_attachment=True, download_name=file.name)


# --------------------- VERIFY FILE ---------------------
@files_bp.route("/verify", methods=["POST"])
@jwt_required()
def verify_file():
    user_id = get_jwt_identity()
    uploaded_file = request.files.get("file")
    if not uploaded_file:
        return jsonify({"error": "Missing file"}), 400

    uploaded_bytes = uploaded_file.read()
    uploaded_hash = hashlib.sha256(uploaded_bytes).hexdigest()
    filename = secure_filename(uploaded_file.filename)

    record = FileRecord.query.filter_by(user_id=user_id, name=filename).first()
    if not record:
        return jsonify({"verified": False, "status": "NOT_FOUND", "message": "File not registered"}), 404

    cert = record.certificates.order_by(Certificate.issued_at.desc()).first()
    if not cert or cert.blockchain_index is None:
        return jsonify({"verified": False, "status": "NO_CERTIFICATE", "message": "No blockchain certificate found"}), 400

    block = BlockchainService.get_block_by_index(cert.blockchain_index)
    if not block:
        return jsonify({"verified": False, "status": "BLOCK_NOT_FOUND", "message": "Blockchain block not found"}), 400

    block_data = BlockchainService.get_block_data(block)
    original_hash = block_data.get("filehash")
    if uploaded_hash == original_hash:
        status = "VERIFIED"
        verified = True
    else:
        status = "TAMPERED"
        verified = False

    return jsonify({"verified": verified, "status": status, "file": record.to_dict()}), 200


# --------------------- GET VERIFIED FILES ---------------------
@files_bp.route("/verified", methods=["GET"])
@jwt_required()
def get_verified_files():
    user_id = get_jwt_identity()
    files = FileRecord.query.filter_by(user_id=user_id).all()
    verified_files = []

    for f in files:
        cert = f.certificates.order_by(Certificate.issued_at.desc()).first()
        if cert and cert.blockchain_index is not None:
            verified_files.append(f)

    result = []
    for f in verified_files:
        size = os.path.getsize(f.storage_uri) if f.storage_uri and os.path.exists(f.storage_uri) else 0
        result.append({
            "id": f.id,
            "name": f.name,
            "size": size,
            "uploaded_at": f.created_at.isoformat(),
            "verified": True,
            "owner_id": f.user_id
        })

    return jsonify(result), 200
