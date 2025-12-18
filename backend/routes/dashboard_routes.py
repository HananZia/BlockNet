from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import FileRecord, FileShare, Certificate
from datetime import datetime
from sqlalchemy import func


dashboard_bp = Blueprint("dashboard_bp", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("", methods=["GET"])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()

    # Total files uploaded
    total_files = FileRecord.query.filter_by(user_id=user_id).count()

    # Files shared by this user
    shared_files = FileShare.query.filter_by(sender_id=user_id).count()

    # Verified files: files with a certificate and blockchain_index
    verified_files = FileRecord.query.join(Certificate)\
        .filter(FileRecord.user_id==user_id, Certificate.blockchain_index.isnot(None))\
        .count()

    # Pending verifications: files without blockchain certificate
    pending_verifications = FileRecord.query.outerjoin(Certificate)\
        .filter(FileRecord.user_id==user_id, Certificate.id.is_(None))\
        .count()

    # Recent activity: upload, share, verify
    uploads = FileRecord.query.filter_by(user_id=user_id)\
        .order_by(FileRecord.created_at.desc()).all()

    shares_sent = FileShare.query.filter_by(sender_id=user_id)\
        .order_by(FileShare.created_at.desc()).all()

    certs = Certificate.query.filter_by(user_id=user_id)\
        .order_by(Certificate.issued_at.desc()).all()

    # Format activities
    activity = []

    for f in uploads:
        activity.append({
            "id": f.id,
            "type": "upload",
            "description": f"Uploaded {f.name}",
            "time": f.created_at.isoformat()
        })

    for s in shares_sent:
        activity.append({
            "id": s.id,
            "type": "share",
            "description": f"Shared {s.file.name} with user_id {s.receiver_id}",
            "time": s.created_at.isoformat()
        })

    for c in certs:
        activity.append({
            "id": c.id,
            "type": "verify",
            "description": f"Verified {c.file.name} on blockchain",
            "time": c.issued_at.isoformat()
        })

    # Sort by most recent
    activity = sorted(activity, key=lambda x: datetime.fromisoformat(x["time"]), reverse=True)

    return jsonify({
        "stats": {
            "totalFiles": total_files,
            "sharedFiles": shared_files,
            "verifications": verified_files,
            "pendingVerifications": pending_verifications
        },
        "recentActivity": activity
    }), 200
