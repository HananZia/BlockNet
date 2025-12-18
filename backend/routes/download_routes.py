from flask import Flask, send_file, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from models import db, FileRecord, FileShare, User

app = Flask(__name__)

# Example: local folder where uploaded files are stored
UPLOAD_FOLDER = "uploads"

@app.route("/files/download/<int:file_id>", methods=["GET"])
@jwt_required()  # optional: requires logged-in user
def download_file(file_id):
    current_user_id = get_jwt_identity()

    # Check if the file exists
    file = FileRecord.query.get(file_id)
    if not file:
        abort(404, description="File not found")

    # Check if the current user owns the file or it was shared with them
    is_owner = file.user_id == current_user_id
    is_shared = FileShare.query.filter_by(file_id=file_id, receiver_id=current_user_id).first() is not None

    if not (is_owner or is_shared):
        abort(403, description="You do not have permission to download this file")

    # Construct the path to the file
    file_path = os.path.join(UPLOAD_FOLDER, file.name)
    if not os.path.exists(file_path):
        abort(404, description="File not found on server")

    # Serve the file
    return send_file(file_path, as_attachment=True, download_name=file.name)
