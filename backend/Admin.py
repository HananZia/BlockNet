from extensions import db
from models import User
from werkzeug.security import generate_password_hash


admin = User(
    username="HananZia",
    email="admin@blocknet.com",
    password_hash=generate_password_hash("supersecurepassword"),
    role="admin"
)
db.session.add(admin)
db.session.commit()
print("Admin user created with username 'HananZia' and password 'supersecurepassword'")