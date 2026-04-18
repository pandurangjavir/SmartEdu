import sys
import re

file_path = "c:\\smartEdu\\backend\\app.py"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the marks query matches logic for student
old_marks_match = "matches = requested_subject in mark_subject or any(kw in mark_subject for kw in subject_keywords[requested_subject])"
new_marks_match = "matches = requested_subject.lower() in mark_subject.lower() or requested_subject.lower().replace('s', '') in mark_subject.lower().replace('s', '')"
content = content.replace(old_marks_match, new_marks_match)

old_marks_match_2 = "matches = requested_subject in mark_subject or any(kw in mark_subject for kw in subject_keywords.get(requested_subject, []))"
content = content.replace(old_marks_match_2, new_marks_match) # just in case

# Fix the attendance query matches logic for student
old_att_match = "matches = requested_subject in subject_name or any(kw in subject_name for kw in subject_keywords[requested_subject])"
new_att_match = "matches = requested_subject.lower() in subject_name.lower() or requested_subject.lower().replace('s', '') in subject_name.lower().replace('s', '')"
content = content.replace(old_att_match, new_att_match)

old_att_match_2 = "matches = requested_subject in subject_name or any(kw in subject_name for kw in subject_keywords.get(requested_subject, []))"
content = content.replace(old_att_match_2, new_att_match)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Bug fixes complete.")
