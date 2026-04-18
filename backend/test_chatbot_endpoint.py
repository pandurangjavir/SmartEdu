import requests

try:
    response = requests.post(
        'http://localhost:5000/chatbot', 
        json={"message": "hello", "user_id": 1, "student_id": 1}
    )
    print("STATUS CODE:", response.status_code)
    try:
        print("RESPONSE JSON:", response.json())
    except Exception:
        print("RESPONSE TEXT:", response.text)
except Exception as e:
    print("HTTP Request failed:", str(e))
