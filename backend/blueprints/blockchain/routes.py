from flask import Blueprint, jsonify
from services.blockchain_service import BlockchainService
from models import Block

blockchain_bp = Blueprint("blockchain", __name__, url_prefix="/api/blockchain")

@blockchain_bp.route("/chain", methods=["GET"])
def get_chain():
    blocks = Block.query.order_by(Block.index.asc()).all()
    return jsonify([b.to_dict() for b in blocks]), 200

@blockchain_bp.route("/validate", methods=["GET"])
def validate_chain():
    valid = BlockchainService.validate_chain()
    return jsonify({"valid": valid}), 200
