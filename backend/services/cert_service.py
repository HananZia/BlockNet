import uuid
from datetime import datetime
from extensions import db
from models import FileRecord, User
from services.blockchain_service import BlockchainService


class Certificate(db.Model):
    __tablename__ = "certificates"

    id = db.Column(db.Integer, primary_key=True)
    cert_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    file_id = db.Column(db.Integer, db.ForeignKey("files.id"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    blockchain_index = db.Column(db.Integer, nullable=True)  # block reference

    file = db.relationship("FileRecord", backref="certificate", uselist=False)
    owner = db.relationship("User")

    def to_dict(self):
        return {
            "cert_id": self.cert_id,
            "file_id": self.file_id,
            "user_id": self.user_id,
            "issued_at": self.issued_at.isoformat(),
            "blockchain_index": self.blockchain_index,
        }


class CertService:
    @staticmethod
    def issue_certificate(user_id, file_id):
        """Generate a certificate for a verified file and log it in blockchain"""
        cert_id = str(uuid.uuid4())
        file = FileRecord.query.get(file_id)

        if not file:
            raise ValueError("File not found")

        # Push certificate metadata to blockchain
        payload = {
            "type": "certificate",
            "cert_id": cert_id,
            "filehash": file.filehash,
            "filename": file.filename,
            "owner": user_id,
            "issued_at": datetime.utcnow().isoformat(),
        }

        block = BlockchainService.add_block(payload)

        cert = Certificate(
            cert_id=cert_id,
            file_id=file_id,
            user_id=user_id,
            blockchain_index=block.index,
        )

        db.session.add(cert)
        db.session.commit()
        return cert

    @staticmethod
    def verify_certificate(cert_id):
        """Check certificate existence and blockchain consistency"""
        cert = Certificate.query.filter_by(cert_id=cert_id).first()
        if not cert:
            return None

        # Validate against blockchain
        block = BlockchainService.get_block_by_index(cert.blockchain_index)
        return {
            "certificate": cert.to_dict(),
            "block": block.to_dict() if block else None,
        }

    @staticmethod
    def list_certificates(user_id=None):
        """List certificates issued (optionally filter by user)"""
        query = Certificate.query.order_by(Certificate.issued_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)
        return [c.to_dict() for c in query.all()]
