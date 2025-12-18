from flask import Blueprint, jsonify
from services.blockchain_service import BlockchainService
from models import Block, User, FileRecord
from flask import request
from sqlalchemy import or_

blockchain_bp = Blueprint("blockchain", __name__, url_prefix="/api/blockchain")

@blockchain_bp.route("/chain", methods=["GET"])
def get_chain():
    blocks = Block.query.order_by(Block.index.asc()).all()
    return jsonify([b.to_dict() for b in blocks]), 200

@blockchain_bp.route("/validate", methods=["GET"])
def validate_chain():
    valid = BlockchainService.validate_chain()
    return jsonify({"valid": valid}), 200

@blockchain_bp.route("/transactions", methods=["GET"])
def get_transactions():
    blocks = Block.query.order_by(Block.index.desc()).all()

    results = []

    for block in blocks:
        file = FileRecord.query.filter_by(block_index=block.index).first()
        owner = User.query.get(file.user_id) if file else None

        results.append({
            "tx_hash": block.block_hash,
            "block_number": block.index,
            "timestamp": block.timestamp.isoformat(),
            "status": "confirmed",

            # SAFE FALLBACKS
            "file_name": file.name if file else "(No file attached)",
            "file_hash": file.filehash if file else None,
            "owner_name": owner.email if owner else None,
        })

    return jsonify(results), 200



@blockchain_bp.route("/transaction/<string:tx_hash>", methods=["GET"])
def get_transaction(tx_hash):
    block = Block.query.filter_by(block_hash=tx_hash).first_or_404()

    file = FileRecord.query.filter_by(block_index=block.index).first()
    owner = User.query.get(file.user_id) if file else None

    return jsonify({
        "tx_hash": block.block_hash,
        "block_number": block.index,
        "timestamp": block.timestamp.isoformat(),
        "status": "confirmed",
        "file_name": file.name if file else None,
        "file_hash": file.filehash if file else None,
        "owner_name": owner.email if owner else None
    })


@blockchain_bp.route("/search", methods=["GET"])
def search_blockchain():
    q = request.args.get("q", "").strip().lower()

    if not q:
        return jsonify([]), 200

    # Join blocks -> files -> users
    rows = (
        Block.query
        .outerjoin(FileRecord, FileRecord.block_index == Block.index)
        .outerjoin(User, User.id == FileRecord.user_id)
        .filter(
            or_(
                Block.block_hash.ilike(f"%{q}%"),
                FileRecord.name.ilike(f"%{q}%"),
                FileRecord.filehash.ilike(f"%{q}%"),
                User.email.ilike(f"%{q}%"),
                User.username.ilike(f"%{q}%"),
            )
        )
        .order_by(Block.index.desc())
        .all()
    )

    results = []

    for block in rows:
        file = FileRecord.query.filter_by(block_index=block.index).first()
        owner = User.query.get(file.user_id) if file else None

        results.append({
            "tx_hash": block.block_hash,
            "block_number": block.index,
            "timestamp": block.timestamp.isoformat(),
            "status": "confirmed",
            "file_name": file.name if file else None,
            "file_hash": file.filehash if file else None,
            "owner_name": owner.email if owner else None,
        })

    return jsonify(results), 200