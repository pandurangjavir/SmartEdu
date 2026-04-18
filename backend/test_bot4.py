import requests

url = 'http://localhost:5000/chatbot'

questions = [
    "fine of ty"
]

# user_id 2 assumes it's an admin user (if 1 is student)
for q in questions:
    response = requests.post(url, json={"message": q, "user_id": 2})
    data = response.json()
    print(f"Q: {q}")
    print(f"Intent: {data.get('intent')}")
    print(f"Response: {str(data.get('response'))[:200]}...\n")
