import sys
import re

file_path = "c:\\smartEdu\\backend\\app.py"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert dynamic subject extraction
insertion = """
    requested_subject = None
    if intent in ['marks_query', 'attendance_query']:
        try:
            for subject in Subject.query.all():
                s_name = subject.subject_name.lower()
                s_code = subject.subject_code.lower() if subject.subject_code else ''
                m_lower = msg.lower()
                m_norm = m_lower.replace('s ', ' ').replace('s', '')
                s_norm = s_name.replace('s ', ' ').replace('s', '')
                if (s_name in m_lower or s_name + 's' in m_lower or 
                    (len(m_norm) > 4 and m_norm in s_norm) or (len(s_norm) > 4 and s_norm in m_norm) or
                    (s_code and len(s_code) >= 2 and s_code in m_lower)):
                    requested_subject = subject.subject_name
                    break
        except Exception:
            pass

    if any(word in msg for word in ['profile',"""

content = content.replace("    if any(word in msg for word in ['profile',", insertion)

# 2. Remove subject_keywords dict in marks_query
marks_keywords_block = """        # Detect if asking for specific subject (all subjects from database)
        subject_keywords = {
            # Core Subjects
            'data structure': ['data structure', 'ds', 'datal', 'structure'],
            'computer network': ['computer network', 'cn', 'networks', 'computer networks'],
            'database management systems': ['database', 'dbms', 'db management', 'database management'],
            'operating system': ['operating system', 'os'],
            'discrete mathematics': ['discrete math', 'discrete mathematics', 'dm'],
            'web technologies': ['web technologies', 'wt', 'web tech'],
            'software engineering': ['software engineering', 'se', 'software'],
            'theory of computation': ['theory of computation', 'toc', 'toc theory'],
            'computer organization': ['computer organization', 'co', 'org'],
            # Advanced Subjects
            'artificial intelligence': ['artificial intelligence', 'ai'],
            'machine learning': ['machine learning', 'ml'],
            'big data analytics': ['big data', 'bigdata', 'big data analytics', 'bda'],
            'cloud computing': ['cloud computing', 'cloud', 'cc'],
            'cyber security': ['cyber security', 'cybersecurity', 'security', 'cs'],
            'blockchain technology': ['blockchain', 'blockchain technology', 'bt'],
            # First Year Subjects
            'engineering mathematics': ['engineering mathematics', 'math', 'mathematics'],
            'engineering physics': ['engineering physics', 'physics', 'phy'],
            'basic electrical engineering': ['basic electrical engineering', 'basic electrical', 'eee', 'electrical'],
            'engineering chemistry': ['engineering chemistry', 'chemistry', 'chem'],
            'engineering graphics': ['engineering graphics', 'graphics', 'mech']
        }
        
        requested_subject = None
        for subject, keywords in subject_keywords.items():
            if any(kw in msg for kw in keywords):
                requested_subject = subject
                break
        """
content = content.replace(marks_keywords_block, "")

# 3. Remove admin requested_subject re-check in marks_query
admin_marks_subject_block = """                # Check if user is asking for a specific subject (enhanced detection)
                detected_subject = None
                if requested_subject:
                    detected_subject = requested_subject
                else:
                    # Try to match any subject name from the database
                    all_subjects = Subject.query.all()
                    for subject in all_subjects:
                        subject_lower = subject.subject_name.lower()
                        subject_code_lower = subject.subject_code.lower() if subject.subject_code else ''
                        msg_lower = msg.lower()
                        # Normalize both message and subject name for comparison (handle plurals)
                        msg_normalized = msg_lower.replace('s ', ' ').replace('s', '')
                        subject_normalized = subject_lower.replace('s ', ' ').replace('s', '')
                        # Check multiple matching strategies
                        if (subject_lower in msg_lower or 
                            subject_lower + 's' in msg_lower or 
                            msg_normalized in subject_normalized or
                            subject_normalized in msg_normalized or
                            subject_code_lower in msg_lower or
                            msg_lower in subject_lower):
                            detected_subject = subject.subject_name
                            break
                
                # If subject is requested, filter results by subject
                if detected_subject:"""

content = content.replace(admin_marks_subject_block, """                detected_subject = requested_subject
                if detected_subject:""")

# 4. Remove attendance_query subject_keywords block
attendance_keywords_block = """        # Detect if asking for specific subject
        subject_keywords = {
            'data structure': ['data structure', 'ds', 'datal', 'structure'],
            'computer network': ['computer network', 'cn', 'networks'],
            'database': ['database', 'dbms', 'db management'],
            'operating system': ['operating system', 'os'],
            'discrete math': ['discrete math', 'discrete mathematics', 'dm']
        }
        
        msg = payload.get('message', '').lower()
        requested_subject = None
        for subject, keywords in subject_keywords.items():
            if any(kw in msg for kw in keywords):
                requested_subject = subject
                break"""
                
content = content.replace(attendance_keywords_block, "        msg = payload.get('message', '').lower()")


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactor complete.")
