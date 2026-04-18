import requests

try:
    response = requests.post(
        'http://localhost:5000/api/auth/login', 
        json={"email": "test@example.com", "password": "password"}
    )
    print("STATUS CODE:", response.status_code)
    print("RESPONSE JSON:", response.json())
except Exception as e:
    print("HTTP Request failed:", str(e))
