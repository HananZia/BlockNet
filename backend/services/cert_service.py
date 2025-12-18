import uuid
from datetime import datetime
from flask import current_app
from extensions import db, mail
from models import Certificate, FileRecord, User
from services.blockchain_service import BlockchainService
from services.audit_service import AuditService
from flask_mail import Message


class CertService:
    @staticmethod
    def issue_certificate(user_id: int, file_id: int):
        # Fetch file and user
        file = FileRecord.query.get(file_id)
        user = User.query.get(user_id)

        if not file:
            raise ValueError("File not found")
        if not user:
            raise ValueError("User not found")

        # Generate certificate ID
        cert_id = str(uuid.uuid4())

        # Payload to store in blockchain
        payload = {
            "type": "certificate",
            "cert_id": cert_id,
            "filehash": file.filehash,
            "name": file.name,
            "owner": user.username,  # <-- must be string
            "issued_at": datetime.utcnow().isoformat(),
        }

        # Add to blockchain
        block = BlockchainService.add_block(payload)

        # Create certificate record in DB
        cert = Certificate(
            cert_id=cert_id,
            file_id=file_id,
            user_id=user_id,
            blockchain_index=block.index,
            issued_at=datetime.utcnow()
        )
        db.session.add(cert)
        db.session.commit()

        # Log action
        AuditService.log_action(user_id, "CERTIFICATE_ISSUED", f"Certificate {cert_id} for file {file.name}")

        # Send email notification
        try:
            msg = Message(
                subject=f"Certificate Issued for {file.name}",
                recipients=[user.email],
                body=f"Hello {user.username},\n\nYour certificate ID is {cert_id}.\nFile: {file.name}\nBlockchain Index: {block.index}\n\nThank you."
            )
            mail.send(msg)
        except Exception as e:
            current_app.logger.warning(f"Failed to send certificate email: {e}")

        return cert

    @staticmethod
    def verify_certificate(cert_id: str):
        cert = Certificate.query.filter_by(cert_id=cert_id).first()
        if not cert:
            return None

        block = BlockchainService.get_block_by_index(cert.blockchain_index)
        return {
            "certificate": cert.to_dict(),
            "block": block.to_dict() if block else None,
        }

    @staticmethod
    def list_certificates(user_id: int = None):
        query = Certificate.query.order_by(Certificate.issued_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)
        return [c.to_dict() for c in query.all()]
