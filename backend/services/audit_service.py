
from datetime import datetime
from extensions import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True, index=True)
    action = db.Column(db.String(255), nullable=False)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "details": self.details,
            "timestamp": self.timestamp.isoformat()
        }


class AuditService:
    @staticmethod
    def log_action(user_id, action, details=None):
        """Save an audit log entry to DB"""
        log = AuditLog(user_id=user_id, action=action, details=details)
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_logs(user_id=None, limit=100):
        """Retrieve audit logs, optionally filtered by user"""
        query = AuditLog.query.order_by(AuditLog.timestamp.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)
        return [log.to_dict() for log in query.limit(limit).all()]
