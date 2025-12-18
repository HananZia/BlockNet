import hashlib
import json
from datetime import datetime
from models import Block, db


class BlockchainService:
    # ---------------- HASH ----------------
    @staticmethod
    def calculate_hash(index, previous_hash, data_str, timestamp):
        block_string = json.dumps({
            "index": index,
            "previous_hash": previous_hash,
            "data": data_str,
            "timestamp": str(timestamp)
        }, sort_keys=True).encode()

        return hashlib.sha256(block_string).hexdigest()

    # ---------------- GENESIS ----------------
    @staticmethod
    def create_genesis_block():
        if Block.query.count() == 0:
            dt = datetime.utcnow()
            data_str = json.dumps({"message": "Genesis Block"}, sort_keys=True)

            block_hash = BlockchainService.calculate_hash(
                0, "0", data_str, dt
            )

            genesis = Block(
                index=0,
                previous_hash="0",
                block_hash=block_hash,
                data=data_str,
                timestamp=dt
            )

            db.session.add(genesis)
            db.session.commit()
            return genesis

        return Block.query.order_by(Block.index.asc()).first()

    # ---------------- ADD BLOCK ----------------
    @staticmethod
    def add_block(data: dict):
        latest_block = Block.query.order_by(Block.index.desc()).first()
        if not latest_block:
            latest_block = BlockchainService.create_genesis_block()

        new_index = latest_block.index + 1
        dt = datetime.utcnow()
        data_str = json.dumps(data, sort_keys=True)

        new_hash = BlockchainService.calculate_hash(
            new_index,
            latest_block.block_hash,
            data_str,
            dt
        )

        block = Block(
            index=new_index,
            previous_hash=latest_block.block_hash,
            block_hash=new_hash,
            data=data_str,
            timestamp=dt
        )

        db.session.add(block)
        db.session.commit()
        return block

    # ---------------- FETCH BLOCK ----------------
    @staticmethod
    def get_block_by_index(index: int):
        return Block.query.filter_by(index=index).first()

    # ---------------- PARSE BLOCK DATA ----------------
    @staticmethod
    def get_block_data(block: Block):
        try:
            return json.loads(block.data)
        except Exception:
            return {}

    # ---------------- VALIDATE CHAIN ----------------
    @staticmethod
    def validate_chain():
        blocks = Block.query.order_by(Block.index.asc()).all()

        for i in range(1, len(blocks)):
            current = blocks[i]
            prev = blocks[i - 1]

            # Check link
            if current.previous_hash != prev.block_hash:
                return False

            # Recalculate hash
            recalculated_hash = BlockchainService.calculate_hash(
                current.index,
                current.previous_hash,
                current.data,
                current.timestamp
            )

            if current.block_hash != recalculated_hash:
                return False

        return True
