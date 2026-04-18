import sqlalchemy
import traceback
import jwt
from datetime import datetime, timedelta

# Test 1: Empty port in SQLAlchemy URI
try:
    uri = "mysql+pymysql://root:1234@localhost:/college_system_cse"
    engine = sqlalchemy.create_engine(uri)
    with engine.connect() as conn:
        pass
except Exception as e:
    print("Test 1 Error:", str(e))

# Test 2: Invalid port in pymysql
try:
    uri = "mysql+pymysql://root:1234@localhost:abc/college_system_cse"
    engine = sqlalchemy.create_engine(uri)
    with engine.connect() as conn:
        pass
except Exception as e:
    print("Test 2 Error:", str(e))

# Test 3: JWT encode test
try:
    secret_key = 'dev_secret_key_12345'
    payload = {
        'user_id': 1,
        'role': 'student',
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    # This might fail if the wrong jwt library is installed
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    print("JWT success!")
except Exception as e:
    print("Test 3 Error:", str(e))
