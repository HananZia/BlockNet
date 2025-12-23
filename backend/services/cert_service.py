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
        """
        Issue a blockchain certificate for a file.
        Marks the file as verified after successful issuance.
        """
        # Fetch file and user
        file = FileRecord.query.get(file_id)
        user = User.query.get(user_id)

        if not file:
            raise ValueError("File not found")
        if not user:
            raise ValueError("User not found")

        # Ensure blockchain block exists for this file
        if file.block_index is None:
            block_data = {
                "type": "file",
                "file_id": file.id,
                "filehash": file.filehash,
                "owner_id": user.id,
                "filename": file.name,
                "uploaded_at": file.created_at.isoformat()
            }
            block = BlockchainService.add_block(block_data)
            file.block_index = block.index
            db.session.commit()
        else:
            block = BlockchainService.get_block_by_index(file.block_index)

        # Generate unique certificate ID
        cert_id = str(uuid.uuid4())

        # Create certificate record in DB
        cert = Certificate(
            cert_id=cert_id,
            file_id=file.id,
            user_id=user.id,
            blockchain_index=file.block_index,
            issued_at=datetime.utcnow()
        )
        db.session.add(cert)

        # ✅ Mark file as verified
        file.is_verified = True

        db.session.commit()

        # Log audit action
        AuditService.log_action(user_id, "CERTIFICATE_ISSUED", f"Certificate {cert_id} for file {file.name}")

        # Send email notification (optional)
        try:
            msg = Message(
                subject=f"Certificate Issued for {file.name}",
                recipients=[user.email],
                body=f"Hello {user.username},\n\n"
                     f"Your certificate ID is {cert_id}.\n"
                     f"File: {file.name}\n"
                     f"Blockchain Index: {file.block_index}\n\nThank you."
            )
            mail.send(msg)
        except Exception as e:
            current_app.logger.warning(f"Failed to send certificate email: {e}")

        return cert

    @staticmethod
    def verify_certificate(cert_id: str):
        """
        Verify a certificate and return its blockchain data.
        """
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
        """
        List all certificates, optionally filtered by user.
        """
        query = Certificate.query.order_by(Certificate.issued_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)
        return [c.to_dict() for c in query.all()]

