# schemas.py

from marshmallow import Schema, fields
from models import User, FileRecord, Block

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    role = fields.Str()
    created_at = fields.DateTime()
    files = fields.List(fields.Nested(lambda: FileRecordSchema(exclude=("user_id",))))  # optional


class UserRegisterSchema(Schema):
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class FileRecordSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int()
    filename = fields.Str()
    filehash = fields.Str()
    storage_uri = fields.Str(allow_none=True)
    block_index = fields.Int(allow_none=True)
    created_at = fields.DateTime()
    owner = fields.Nested(UserSchema, exclude=("files",), dump_only=True)  # optional backref


class BlockSchema(Schema):
    id = fields.Int(dump_only=True)
    index = fields.Int()
    previous_hash = fields.Str()
    block_hash = fields.Str()
    data = fields.Raw()  # dict, list, etc.
    timestamp = fields.DateTime()
