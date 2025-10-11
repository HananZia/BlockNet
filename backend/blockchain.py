# blockchain.py

import hashlib
import json
from datetime import datetime
from extensions import db
from models import Block


def compute_block_hash(index: int, previous_hash: str, timestamp: str, data: str) -> str:
    """
    Deterministically compute SHA-256 hash of a block.
    """
    block_string = f"{index}{previous_hash}{timestamp}{data}"
    return hashlib.sha256(block_string.encode()).hexdigest()


def get_last_block():
    """
    Returns the latest block in the blockchain.
    """
    return Block.query.order_by(Block.index.desc()).first()


def create_genesis_block():
    """
    Creates the first block (genesis) if it doesn't already exist.
    """
    if Block.query.first() is not None:
        return None  # Genesis already exists

    dt = datetime.utcnow()
    timestamp = dt.isoformat()
    genesis_data = json.dumps({"message": "Genesis Block"})
    genesis_hash = compute_block_hash(0, "0", timestamp, genesis_data)

    genesis = Block(
        index=0,
        previous_hash="0",
        block_hash=genesis_hash,
        data=genesis_data,
        timestamp=dt
    )

    db.session.add(genesis)
    db.session.commit()
    return genesis


def add_block(data_payload) -> Block:
    """
    Adds a new block with given payload.
    data_payload: JSON-serializable object (e.g., {"filehashes": [...], "meta": {...}})
    Returns the new Block instance persisted to DB.
    """
    last = get_last_block()
    if last is None:
        # Ensure genesis block exists
        create_genesis_block()
        last = get_last_block()

    index = last.index + 1
    dt = datetime.utcnow()
    timestamp = dt.isoformat()
    data_json = json.dumps(data_payload, sort_keys=True)

    new_hash = compute_block_hash(index, last.block_hash, timestamp, data_json)

    block = Block(
        index=index,
        previous_hash=last.block_hash,
        block_hash=new_hash,
        data=data_json,
        timestamp=dt
    )

    db.session.add(block)
    db.session.commit()
    return block


def find_block_by_filehash(filehash: str):
    """
    Search blocks for a filehash inside their data JSON.
    Returns a list of matching Block objects.
    """
    blocks = Block.query.order_by(Block.index.desc()).all()
    matches = []

    for b in blocks:
        try:
            data = json.loads(b.data)
            if isinstance(data, dict):
                fh_list = data.get("filehashes") or []
                if filehash in fh_list:
                    matches.append(b)
            elif isinstance(data, list) and filehash in data:
                matches.append(b)
        except Exception:
            continue

    return matches
