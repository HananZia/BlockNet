import hashlib
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify


def hash_file(file_stream, chunk_size=8192):
    sha256 = hashlib.sha256()
    while chunk := file_stream.read(chunk_size):
        sha256.update(chunk)
    file_stream.seek(0)
    return sha256.hexdigest()


def hash_password(password: str) -> str:
    return generate_password_hash(password)


def verify_password(password: str, password_hash: str) -> bool:

    return check_password_hash(password_hash, password)


def api_response(success=True, message="", data=None, status=200):
    payload = {
        "success": success,
        "message": message,
        "data": data,
    }
    return jsonify(payload), status
