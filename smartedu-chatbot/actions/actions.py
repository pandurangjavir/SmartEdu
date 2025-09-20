from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet, SessionStarted, ActionExecuted
import requests

BASE_URL = "http://localhost:5000/api"


def _extract_auth_and_role(tracker: Tracker):
    """Get role and Authorization header value from slots or latest metadata."""
    role = tracker.get_slot("role")
    token = tracker.get_slot("token")
    metadata = tracker.latest_message.get("metadata") if tracker.latest_message else None
    if (not role or not token) and isinstance(metadata, dict):
        role = role or metadata.get("role") or metadata.get("user_role")
        token = token or metadata.get("token")
    headers = {}
    if token:
        # If token already includes 'Bearer', use as-is; else prefix
        headers["Authorization"] = token if isinstance(token, str) and token.lower().startswith("bearer ") else f"Bearer {token}"
    return role, headers

class ActionGetAnnouncements(Action):
    def name(self): return "action_get_announcements"
    def run(self, dispatcher, tracker, domain):
        role = tracker.get_slot("role")
        branch = tracker.get_slot("branch")
        params = {}
        if role == "teacher" and branch:
            params["branch"] = branch
        res = requests.get(f"{BASE_URL}/announcements", params=params)
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


class ActionSessionStart(Action):
    def name(self) -> Text:
        return "action_session_start"

    def run(
        self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        events: List[Dict[Text, Any]] = []
        events.append(SessionStarted())

        metadata = tracker.get_slot("session_started_metadata")
        # Rasa passes metadata on the message; use tracker.latest_message
        message_metadata = tracker.latest_message.get("metadata") if tracker.latest_message else None

        role = None
        branch = None
        year = None
        roll_no = None
        username = None
        token = None

        if isinstance(message_metadata, dict):
            role = message_metadata.get("role") or message_metadata.get("user_role")
            branch = message_metadata.get("branch")
            year = message_metadata.get("year")
            roll_no = message_metadata.get("roll_no")
            username = message_metadata.get("username")
            token = message_metadata.get("token")

        slot_events: List[Dict[Text, Any]] = []
        if role:
            slot_events.append(SlotSet("role", role))
        if branch:
            slot_events.append(SlotSet("branch", branch))
        if year:
            slot_events.append(SlotSet("year", year))
        if roll_no is not None:
            slot_events.append(SlotSet("roll_no", roll_no))
        if username:
            slot_events.append(SlotSet("username", username))
        if token:
            slot_events.append(SlotSet("token", token))

        events.extend(slot_events)
        events.append(ActionExecuted("action_listen"))
        return events


class ActionPrincipalGetHODs(Action):
    def name(self) -> Text:
        return "action_principal_get_hods"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        role, headers = _extract_auth_and_role(tracker)
        if role != "principal":
            dispatcher.utter_message(text="This information is only available to the principal.")
            return []
        try:
            res = requests.get(f"{BASE_URL}/principal/hods", headers=headers, timeout=10)
            data = res.json()
            rows = data.get("rows") if isinstance(data, dict) else data
            if not rows:
                dispatcher.utter_message(text="No HODs found.")
            else:
                lines = []
                for h in rows:
                    name = h.get("name") or h.get("username") or f"HOD #{h.get('id')}"
                    email = h.get("email") or "N/A"
                    contact = h.get("contact") or "N/A"
                    branch = h.get("branch") or h.get("department") or ""
                    suffix = f" | {branch}" if branch else ""
                    lines.append(f"- {name}{suffix} | email: {email} | contact: {contact}")
                dispatcher.utter_message(text="HOD details:\n" + "\n".join(lines))
        except Exception:
            dispatcher.utter_message(text="Unable to fetch HODs right now.")
        return []


class ActionPrincipalGetAnnouncements(Action):
    def name(self) -> Text:
        return "action_principal_get_announcements"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        role, headers = _extract_auth_and_role(tracker)
        if role != "principal":
            dispatcher.utter_message(text="This information is only available to the principal.")
            return []
        try:
            res = requests.get(f"{BASE_URL}/principal/announcements", headers=headers, timeout=10)
            data = res.json()
            rows = data.get("rows") if isinstance(data, dict) else data
            if not rows:
                dispatcher.utter_message(text="No announcements found.")
            else:
                lines = []
                for a in rows[:10]:
                    title = a.get("title") or "Announcement"
                    msg = a.get("message") or a.get("body") or ""
                    audience = a.get("target_audience") or a.get("audience") or "all"
                    created_at = a.get("created_at") or a.get("createdAt") or ""
                    meta = f" (to: {audience})" if audience else ""
                    date = f" [{created_at}]" if created_at else ""
                    lines.append(f"- {title}{meta}{date}: {msg}")
                dispatcher.utter_message(text="Recent announcements:\n" + "\n".join(lines))
        except Exception:
            dispatcher.utter_message(text="Unable to fetch announcements right now.")
        return []


class ActionPrincipalCreateAnnouncement(Action):
    def name(self) -> Text:
        return "action_principal_create_announcement"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        role, headers = _extract_auth_and_role(tracker)
        if role != "principal":
            dispatcher.utter_message(text="Only the principal can make announcements.")
            return []

        user_text = (tracker.latest_message or {}).get("text") or ""
        # naive parse: everything after keywords becomes the message
        lowered = user_text.lower()
        message = user_text
        for kw in ["make announcement", "announce", "create announcement", "make an announcement", "post announcement"]:
            idx = lowered.find(kw)
            if idx >= 0:
                message = user_text[idx + len(kw):].strip(" :-,\u2013\u2014") or user_text
                break

        if not message:
            dispatcher.utter_message(text="Please provide the announcement content.")
            return []

        payload = {
            "title": message[:60] if len(message) > 60 else (message or "Announcement"),
            "message": message,
            "target_audience": "all"
        }
        try:
            req_headers = dict(headers)
            req_headers["Content-Type"] = "application/json"
            res = requests.post(f"{BASE_URL}/principal/announcements", json=payload, headers=req_headers, timeout=10)
            if res.status_code in (200, 201):
                dispatcher.utter_message(text="Announcement created successfully.")
            else:
                dispatcher.utter_message(text="Failed to create announcement.")
        except Exception:
            dispatcher.utter_message(text="Could not reach the announcement service.")
        return []


class ActionRestrictPrincipal(Action):
    def name(self) -> Text:
        return "action_restrict_principal"

    def run(self, dispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        role = tracker.get_slot("role")
        if role == "principal":
            dispatcher.utter_message(text="I can help with HOD info and announcements only. Say 'list HODs', 'show announcements', or 'make announcement ...'.")
        else:
            dispatcher.utter_message(text="Sorry, I didn't understand that.")
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