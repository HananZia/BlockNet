from flask import Blueprint, jsonify
from services.blockchain_service import BlockchainService

blockchain_bp = Blueprint("blockchain", __name__, url_prefix="/blockchain")

@blockchain_bp.route("/chain", methods=["GET"])
def get_chain():
    from models import Block
    blocks = Block.query.order_by(Block.index.asc()).all()
    return jsonify([b.to_dict() for b in blocks])

@blockchain_bp.route("/validate", methods=["GET"])
def validate_chain():
    valid = BlockchainService.validate_chain()
    return jsonify({"valid": valid})
