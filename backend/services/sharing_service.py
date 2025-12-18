from extensions import db
from models import FileShare, User, FileRecord
from services.email_service import EmailService
from services.audit_service import AuditService
from sqlalchemy.orm import joinedload

class ShareService:
    @staticmethod
    def share_file(sender_id: int, receiver_email: str, file_id: int):
        # Find receiver
        receiver = User.query.filter_by(email=receiver_email).first()
        if not receiver:
            raise ValueError("Receiver not found")

        # Find file
        record = FileRecord.query.get(file_id)
        if not record:
            raise ValueError("File not found")

        # Prevent sharing to self
        if receiver.id == sender_id:
            raise ValueError("You cannot share a file with yourself")

        # Check if already shared
        existing = FileShare.query.filter_by(
            sender_id=sender_id,
            receiver_id=receiver.id,
            file_id=file_id
        ).first()
        if existing:
            raise ValueError("This file is already shared with the user")

        # Create share record
        share = FileShare(
            sender_id=sender_id,
            receiver_id=receiver.id,
            file_id=file_id
        )
        db.session.add(share)
        db.session.commit()

        # Log audit
        AuditService.log_action(
            sender_id,
            "SHARE",
            f"File '{record.name}' shared with {receiver.email}"
        )

        # Send email notification
        subject = "New File Shared with You on BlockNet"
        body = (
            f"Hello {receiver.username},\n\n"
            f"The file '{record.name}' has been shared with you by another user on BlockNet.\n"
            "You can view it by logging into your account.\n\n"
            "Best regards,\n"
            "BlockNet Team"
        )
        try:
            EmailService.send_email(subject, [receiver.email], body)
        except Exception as e:
            print(f"[WARN] Email sending failed: {e}")

        # Eager load related data for frontend
        return FileShare.query.options(
            joinedload(FileShare.file),
            joinedload(FileShare.sender),
            joinedload(FileShare.receiver)
        ).get(share.id)

    @staticmethod
    def get_shared_with_user(user_id: int):
        return FileShare.query.options(
            joinedload(FileShare.file),
            joinedload(FileShare.sender),
            joinedload(FileShare.receiver)
        ).filter_by(receiver_id=user_id).all()

    @staticmethod
    def get_shared_by_user(user_id: int):
        return FileShare.query.options(
            joinedload(FileShare.file),
            joinedload(FileShare.sender),
            joinedload(FileShare.receiver)
        ).filter_by(sender_id=user_id).all()
