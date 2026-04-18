from app import app
from models import db, User

with app.app_context():
    try:
        user = User.query.first()
        print("Connected! User:", user)
    except Exception as e:
        import traceback
        traceback.print_exc()
