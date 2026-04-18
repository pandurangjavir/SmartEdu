import os
from dotenv import load_dotenv
import sqlalchemy

load_dotenv()
host = os.environ.get('MYSQL_HOST')
user = os.environ.get('MYSQL_USER')
password = os.environ.get('MYSQL_PASSWORD', '')
db = os.environ.get('MYSQL_DB')
uri = os.environ.get('DATABASE_URL') or f"mysql+pymysql://{user}:{password}@{host}/{db}"

print("URI:", uri)

engine = sqlalchemy.create_engine(uri)
try:
    with engine.connect() as conn:
        print("Connected successfully!")
except Exception as e:
    import traceback
    traceback.print_exc()
