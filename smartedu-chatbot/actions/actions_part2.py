from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import json

class ActionGetStudents(Action):
    def name(self) -> Text:
        return "action_get_students"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            user_token = tracker.get_slot("user_token")
            user_role = tracker.get_slot("user_role")
            
            if not user_token:
                dispatcher.utter_message(text="Please log in to view student information.")
                return []
            
            if user_role != "hod":
                dispatcher.utter_message(text="Student information is only available for HODs.")
                return []
            
            headers = {"Authorization": f"Bearer {user_token}"}
            response = requests.get("http://localhost:5000/api/students/all", headers=headers)
            
            if response.status_code == 200:
                students = response.json()
                if students:
                    message = f"Student Information (Total: {len(students)} students):\n\n"
                    
                    by_year = {}
                    for student in students:
                        year = student.get('year', 'Unknown')
                        if year not in by_year:
                            by_year[year] = []
                        by_year[year].append(student)
                    
                    for year, year_students in by_year.items():
                        message += f"{year} Year ({len(year_students)} students):\n"
                        for student in year_students[:3]:
                            message += f"• {student.get('name', 'Unknown')} ({student.get('roll_no', 'No ID')})\n"
                        if len(year_students) > 3:
                            message += f"  ... and {len(year_students) - 3} more\n"
                        message += "\n"
                else:
                    message = "No students found."
            else:
                message = "Sorry, I couldn't fetch student information. Please try again later."
                
        except Exception as e:
            message = "Sorry, there was an error fetching student information."
            
        dispatcher.utter_message(text=message)
        return []

class ActionGetTeachers(Action):
    def name(self) -> Text:
        return "action_get_teachers"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            user_token = tracker.get_slot("user_token")
            user_role = tracker.get_slot("user_role")
            
            if not user_token:
                dispatcher.utter_message(text="Please log in to view teacher information.")
                return []
            
            if user_role != "hod":
                dispatcher.utter_message(text="Teacher information is only available for HODs.")
                return []
            
            headers = {"Authorization": f"Bearer {user_token}"}
            response = requests.get("http://localhost:5000/api/teachers", headers=headers)
            
            if response.status_code == 200:
                teachers = response.json()
                if teachers:
                    message = f"Teacher Information (Total: {len(teachers)} teachers):\n\n"
                    for teacher in teachers[:10]:
                        message += f"• {teacher.get('name', 'Unknown')}"
                        if teacher.get('subject'):
                            message += f" - {teacher['subject']}"
                        if teacher.get('email'):
                            message += f" ({teacher['email']})"
                        message += "\n"
                    
                    if len(teachers) > 10:
                        message += f"\n... and {len(teachers) - 10} more teachers"
                else:
                    message = "No teachers found."
            else:
                message = "Sorry, I couldn't fetch teacher information. Please try again later."
                
        except Exception as e:
            message = "Sorry, there was an error fetching teacher information."
            
        dispatcher.utter_message(text=message)
        return []

class ActionUpdateFromPdf(Action):
    def name(self) -> Text:
        return "action_update_from_pdf"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            user_token = tracker.get_slot("user_token")
            user_role = tracker.get_slot("user_role")
            
            if not user_token:
                dispatcher.utter_message(text="Please log in to access this feature.")
                return []
            
            if user_role not in ["admin", "principal"]:
                dispatcher.utter_message(text="PDF data updates are only available for administrators.")
                return []
            
            message = "PDF data update feature is currently under development. Please contact the system administrator for manual data updates."
            
        except Exception as e:
            message = "Sorry, there was an error processing your request."
            
        dispatcher.utter_message(text=message)
        return []
