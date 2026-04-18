import requests

url = 'http://localhost:5000/chatbot'

questions = [
    "show my marks",
    "what is my attendance",
    "what are my pending fees",
    "any upcoming events",
    "show announcements",
    "who is the principal?",
    "what is your favorite color?",
]

for q in questions:
    try:
        response = requests.post(url, json={"message": q, "user_id": 1, "student_id": 1})
        print(f"Q: {q}")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Intent: {data.get('intent')}")
        resp = str(data.get('response'))
        print(f"Response: {resp[:150]}...\n")
    except Exception as e:
        print(f"Failed for {q}: {e}")
