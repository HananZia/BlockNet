# routes/__init__.py
from flask import Blueprint

# placeholder blueprints so app can import them early.
auth_bp = Blueprint("auth", __name__)
files_bp = Blueprint("files", __name__)
blockchain_bp = Blueprint("blockchain", __name__)

# later, replace these by importing the real route modules:
# from .auth import bp as auth_bp
# from .files import bp as files_bp
# from .blockchain import bp as blockchain_bp
