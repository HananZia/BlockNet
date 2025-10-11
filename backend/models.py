from datetime import datetime
import json
from extensions import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")  # user | admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    files = db.relationship("FileRecord", back_populates="owner", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }

class FileRecord(db.Model):
    __tablename__ = "files"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    filename = db.Column(db.String(300), nullable=False)
    filehash = db.Column(db.String(128), nullable=False, index=True)
    storage_uri = db.Column(db.Text, nullable=True)  # optional: IPFS CID / S3 URL
    block_index = db.Column(db.Integer, nullable=True)  # index in blockchain table
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    owner = db.relationship("User", back_populates="files")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "filehash": self.filehash,
            "storage_uri": self.storage_uri,
            "block_index": self.block_index,
            "created_at": self.created_at.isoformat()
        }

class Block(db.Model):
    __tablename__ = "blocks"
    id = db.Column(db.Integer, primary_key=True)  # autoincrement PK
    index = db.Column(db.Integer, nullable=False, unique=True, index=True)
    previous_hash = db.Column(db.String(128), nullable=False)
    block_hash = db.Column(db.String(128), nullable=False, unique=True)
    data = db.Column(db.Text, nullable=False)  # JSON string; e.g. list of file hashes or metadata
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def data_json(self):
        try:
            return json.loads(self.data)
        except Exception:
            return self.data

    def to_dict(self):
        return {
            "index": self.index,
            "previous_hash": self.previous_hash,
            "block_hash": self.block_hash,
            "data": self.data_json(),
            "timestamp": self.timestamp.isoformat()
        }
