import hashlib
from models import FileRecord, db
from blockchain import Blockchain

# Global blockchain instance
blockchain = Blockchain()

def hash_file(file_data):
    return hashlib.sha256(file_data).hexdigest()

def save_file_record(file_data, filename, user_id):
    # Step 1: hash file
    file_hash = hash_file(file_data)

    # Step 2: add to blockchain
    new_block = blockchain.add_block(file_hash, user_id)

    # Step 3: save in DB
    file_record = FileRecord(
        filename=filename,
        file_hash=file_hash,
        user_id=user_id,
        block_index=new_block.index,
        block_hash=new_block.hash
    )
    db.session.add(file_record)
    db.session.commit()

    return file_record

def verify_file(file_data):
    file_hash = hash_file(file_data)
    record = FileRecord.query.filter_by(file_hash=file_hash).first()
    return record
