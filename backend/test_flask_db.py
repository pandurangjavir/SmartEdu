import os
from dotenv import load_dotenv

load_dotenv()
print("System DATABASE_URL:", os.environ.get('DATABASE_URL'))

from app import app, db
from models import User

with app.app_context():
    print("Flask SQLALCHEMY_DATABASE_URI:", app.config['SQLALCHEMY_DATABASE_URI'])
    try:
        users = User.query.limit(1).all()
        print("Successfully queried users:", users)
    except Exception as e:
        import traceback
        traceback.print_exc()
