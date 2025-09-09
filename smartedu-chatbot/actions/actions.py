from rasa_sdk import Action
import requests

BASE_URL = "http://localhost:5000/api"

class ActionGetAnnouncements(Action):
    def name(self): return "action_get_announcements"
    def run(self, dispatcher, tracker, domain):
        res = requests.get(f"{BASE_URL}/announcements")
        data = res.json()
        if not data:
            dispatcher.utter_message(text="No announcements available.")
        else:
            msg = "\n".join([f"{a['branch']} - {a['year']}: {a['message']}" for a in data])
            dispatcher.utter_message(text=msg)
        return []

class ActionGetEvents(Action):
    def name(self): return "action_get_events"
    def run(self, dispatcher, tracker, domain):
        res = requests.get(f"{BASE_URL}/events")
        data = res.json()
        if not data:
            dispatcher.utter_message(text="No events found.")
        else:
            msg = "\n".join([f"{e['title']} ({e['event_date']}) - {e['description']}" for e in data])
            dispatcher.utter_message(text=msg)
        return []

class ActionGetFees(Action):
    def name(self): return "action_get_fees"
    def run(self, dispatcher, tracker, domain):
        # For demo: fixed student roll_no=1
        res = requests.get(f"{BASE_URL}/fees/1")
        data = res.json()
        if not data:
            dispatcher.utter_message(text="No fee records found.")
        else:
            # Handle both single record and array of records
            if isinstance(data, list):
                if len(data) > 0:
                    fee = data[0]
                    msg = f"Amount: ₹{fee['amount']}, Status: {fee['status']}, Year: {fee.get('year', 'N/A')}"
                else:
                    msg = "No fee records found."
            else:
                # Single record
                msg = f"Amount: ₹{data['amount']}, Status: {data['status']}, Year: {data.get('year', 'N/A')}"
            dispatcher.utter_message(text=msg)
        return []

class ActionGetStudents(Action):
    def name(self): return "action_get_students"
    def run(self, dispatcher, tracker, domain):
        res = requests.get(f"{BASE_URL}/hod/students")
        data = res.json()
        if not data:
            dispatcher.utter_message(text="No students found.")
        else:
            msg = ", ".join([s['name'] for s in data])
            dispatcher.utter_message(text=f"Students: {msg}")
        return []

class ActionGetTeachers(Action):
    def name(self): return "action_get_teachers"
    def run(self, dispatcher, tracker, domain):
        res = requests.get(f"{BASE_URL}/hod/teachers")
        data = res.json()
        if not data:
            dispatcher.utter_message(text="No teachers found.")
        else:
            msg = ", ".join([t['name'] for t in data])
            dispatcher.utter_message(text=f"Teachers: {msg}")
        return []

class ActionUpdateFromPDF(Action):
    def name(self): return "action_update_from_pdf"
    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text="Upload your PDF via the portal to update records.")
        return []