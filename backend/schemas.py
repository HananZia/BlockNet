from marshmallow import Schema, fields
from models import User, FileRecord, FileShare, Certificate, Block

# ----------------------
# User Schema
# ----------------------
class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    role = fields.Str()
    created_at = fields.DateTime()


# ----------------------
# File Record Schema
# ----------------------
class FileRecordSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int()
    name = fields.Str(attribute="name")
    filehash = fields.Str()
    storage_uri = fields.Str(allow_none=True)
    block_index = fields.Int(allow_none=True)
    created_at = fields.DateTime()
    owner = fields.Nested(UserSchema, only=("id", "username", "email"), dump_only=True)


# ----------------------
# Certificate Schema
# ----------------------
class CertificateSchema(Schema):
    id = fields.Int(dump_only=True)
    cert_id = fields.Str()
    file_id = fields.Int()
    user_id = fields.Int()
    issued_at = fields.DateTime()
    blockchain_index = fields.Int()


# ----------------------
# File Share Schema
# ----------------------
class FileShareSchema(Schema):
    id = fields.Int(dump_only=True)
    file_id = fields.Int(required=True)
    sender_id = fields.Int()
    receiver_id = fields.Int(required=True)
    shared_at = fields.DateTime(attribute="created_at")

    file = fields.Nested(
        lambda: FileRecordSchema(only=("id", "name", "user_id")),
        dump_only=True
    )
    shared_by = fields.Nested(
        lambda: UserSchema(only=("id", "email", "username")),
        dump_only=True,
        attribute="sender"  # Use sender relationship from model
    )
    shared_with = fields.Nested(
        lambda: UserSchema(only=("id", "email", "username")),
        dump_only=True,
        attribute="receiver"  # Use receiver relationship from model
    )


# ----------------------
# Block Schema
# ----------------------
class BlockSchema(Schema):
    id = fields.Int(dump_only=True)
    index = fields.Int()
    previous_hash = fields.Str()
    block_hash = fields.Str()
    data = fields.Raw()
    timestamp = fields.DateTime()


# ----------------------
# User Register & Login Schemas
# ----------------------
class UserRegisterSchema(Schema):
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)
