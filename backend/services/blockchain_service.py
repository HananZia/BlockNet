import hashlib
import json
from datetime import datetime
from models import Block, db


class BlockchainService:
    @staticmethod
    def calculate_hash(index, previous_hash, data_str, timestamp):
        """
        Compute hash deterministically using index, prev hash, data string, and timestamp.
        """
        block_string = json.dumps({
            "index": index,
            "previous_hash": previous_hash,
            "data": data_str,
            "timestamp": str(timestamp)
        }, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    @staticmethod
    def create_genesis_block():
        """
        Create the genesis block if blockchain is empty.
        """
        if Block.query.count() == 0:
            dt = datetime.utcnow()
            data_str = json.dumps({"message": "Genesis Block"})
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

    @staticmethod
    def add_block(data):
        """
        Add a new block with given data payload.
        """
        latest_block = Block.query.order_by(Block.index.desc()).first()
        if not latest_block:
            latest_block = BlockchainService.create_genesis_block()

        new_index = latest_block.index + 1
        dt = datetime.utcnow()
        data_str = json.dumps(data, sort_keys=True)
        new_hash = BlockchainService.calculate_hash(
            new_index, latest_block.block_hash, data_str, dt
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

    @staticmethod
    def validate_chain():
        """
        Validate blockchain integrity by checking:
        - Previous hash matches
        - Block hash recomputes correctly
        """
        blocks = Block.query.order_by(Block.index.asc()).all()
        for i in range(1, len(blocks)):
            current = blocks[i]
            prev = blocks[i - 1]

            if current.previous_hash != prev.block_hash:
                return False

            calc_hash = BlockchainService.calculate_hash(
                current.index,
                current.previous_hash,
                current.data,
                current.timestamp
            )

            if current.block_hash != calc_hash:
                return False

        return True
