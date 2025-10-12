from extensions import db
from models import FileShare, User, FileRecord
from services.email_service import EmailService
from services.audit_service import AuditService

class ShareService:
    @staticmethod
    def share_file(sender_id: int, receiver_email: str, file_id: int):
        receiver = User.query.filter_by(email=receiver_email).first()
        if not receiver:
            raise ValueError("Receiver not found")

        record = FileRecord.query.get(file_id)
        if not record:
            raise ValueError("File not found")

        if receiver.id == sender_id:
            raise ValueError("You cannot share a file with yourself")

        existing = FileShare.query.filter_by(
            sender_id=sender_id,
            receiver_id=receiver.id,
            file_id=file_id
        ).first()
        if existing:
            raise ValueError("This file is already shared with the user")

        share = FileShare(
            sender_id=sender_id,
            receiver_id=receiver.id,
            file_id=file_id
        )
        db.session.add(share)
        db.session.commit()

        AuditService.log_action(
            sender_id,
            "SHARE",
            f"File '{record.filename}' shared with {receiver.email}"
        )

        subject = "New File Shared with You on BlockNet"
        body = (
            f"Hello {receiver.username},\n\n"
            f"The file '{record.filename}' has been shared with you by another user on BlockNet.\n"
            "You can view it by logging into your account.\n\n"
            "Best regards,\n"
            "BlockNet Team"
        )

        try:
            EmailService.send_email(subject, [receiver.email], body)
        except Exception as e:
            print(f"[WARN] Email sending failed: {e}")

        return share

    @staticmethod
    def get_shared_with_user(user_id: int):
        return FileShare.query.filter_by(receiver_id=user_id).all()

    @staticmethod
    def get_shared_by_user(user_id: int):
        return FileShare.query.filter_by(sender_id=user_id).all()