from app import app
import traceback

client = app.test_client()

try:
    response = client.post('/api/auth/login', json={
        "email": "test@example.com",
        "password": "password"
    })
    print("STATUS:", response.status_code)
    print("DATA:", response.json)
except Exception as e:
    print("EXCEPTION CAUGHT DIRECTLY:")
    traceback.print_exc()
