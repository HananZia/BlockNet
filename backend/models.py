from datetime import datetime
import json
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    reset_otp = db.Column(db.String(6), nullable=True)
    reset_otp_expiry = db.Column(db.DateTime, nullable=True)

    files = db.relationship("FileRecord", back_populates="owner", lazy="dynamic")
    sent_shares = db.relationship("FileShare", foreign_keys="FileShare.sender_id", back_populates="sender", lazy="dynamic")
    received_shares = db.relationship("FileShare", foreign_keys="FileShare.receiver_id", back_populates="receiver", lazy="dynamic")

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

    __table_args__ = (
        db.UniqueConstraint("user_id", "name", name="uq_user_filename"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(300), nullable=False)
    filehash = db.Column(db.String(128), nullable=False)
    storage_uri = db.Column(db.Text, nullable=True)
    block_index = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)  # new column

    owner = db.relationship("User", back_populates="files")
    shares = db.relationship("FileShare", back_populates="file", lazy="dynamic")
    certificates = db.relationship("Certificate", back_populates="file", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "filehash": self.filehash,
            "storage_uri": self.storage_uri,
            "block_index": self.block_index,
            "created_at": self.created_at.isoformat()
        }
class Certificate(db.Model):
    __tablename__ = "certificates"
    id = db.Column(db.Integer, primary_key=True)
    cert_id = db.Column(db.String(64), unique=True, nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey("files.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    blockchain_index = db.Column(db.Integer, nullable=True)

    file = db.relationship("FileRecord", back_populates="certificates")
    owner = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "cert_id": self.cert_id,
            "file_id": self.file_id,
            "user_id": self.user_id,
            "issued_at": self.issued_at.isoformat(),
            "blockchain_index": self.blockchain_index
        }
class Block(db.Model):
    __tablename__ = "blocks"

    id = db.Column(db.Integer, primary_key=True)
    index = db.Column(db.Integer, nullable=False, unique=True, index=True)
    previous_hash = db.Column(db.String(128), nullable=False)
    block_hash = db.Column(db.String(128), nullable=False, unique=True)
    data = db.Column(db.Text, nullable=False)
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


class FileShare(db.Model):
    __tablename__ = "file_shares"

    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey("files.id"), nullable=False)  # match FileRecord table
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    file = db.relationship("FileRecord", back_populates="shares")
    sender = db.relationship("User", foreign_keys=[sender_id], back_populates="sent_shares")
    receiver = db.relationship("User", foreign_keys=[receiver_id], back_populates="received_shares")

    def to_dict(self):
        return {
            "id": self.id,
            "file_id": self.file_id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "created_at": self.created_at.isoformat()
        }

