import os
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.metrics.pairwise import cosine_similarity
import nltk

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

from dotenv import load_dotenv
load_dotenv()

class HybridNLPEngine:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.llm_configured = False
        self.groq_client = None
        self.college_data = {}
        self.knowledge_base = []  # Flat list of (text, source, data) for semantic search
        self.kb_vectors = None    # TF-IDF vectors for semantic search
        self.kb_vectorizer = None

        # Load local JSON data and build knowledge base
        self.load_college_data()
        self.build_knowledge_base()

        # Configure Groq
        groq_api_key = os.environ.get('GROQ_API_KEY')
        if groq_api_key:
            try:
                import groq
                self.groq_client = groq.Groq(api_key=groq_api_key)
                self.llm_configured = True
                print("Groq API configured successfully.")
            except Exception as e:
                print(f"Failed to initialize Groq: {e}")
                self.llm_configured = False
        else:
            self.llm_configured = False
            print("Groq API key not found.")

        # Training data for local intent classifier
        self.training_data = [
            # Greetings
            ("hello", "greet"), ("hi there", "greet"), ("hey", "greet"), ("good morning", "greet"),
            ("bye", "goodbye"), ("see you later", "goodbye"), ("goodnight", "goodbye"), ("gn", "goodbye"),
            
            # Conversational / Casual
            ("how are you", "ask_howareyou"), ("what's up", "ask_howareyou"), ("how is it going", "ask_howareyou"),
            ("did you eat", "ask_howareyou"), ("did you have lunch", "ask_howareyou"), ("have you eaten", "ask_howareyou"),
            ("what is your age", "nlp_gemini_fallback"), ("how old are you", "nlp_gemini_fallback"),
            ("tell me your age", "nlp_gemini_fallback"), ("your favorite color", "nlp_gemini_fallback"),
            ("what do you like", "nlp_gemini_fallback"), ("do you have a hobby", "nlp_gemini_fallback"),
            ("you are awesome", "greet"), ("thanks", "greet"), ("thank you", "greet"),

            # Core Academic
            ("show my fees", "fee_query"), ("what is my fee balance", "fee_query"), ("fee details", "fee_query"), ("pending payment", "fee_query"),
            ("show my attendance", "attendance_query"), ("am i present", "attendance_query"), ("attendance percentage", "attendance_query"), ("how many classes did i miss", "attendance_query"),
            ("show my marks", "marks_query"), ("what is my score", "marks_query"), ("result of exam", "marks_query"), ("academic performance", "marks_query"),
            ("show events", "event_query"), ("upcoming events", "event_query"), ("register for event", "event_query"), ("college fest", "event_query"),
            ("announcements", "announcement_query"), ("college notices", "announcement_query"), ("any updates", "announcement_query"),

            # College Info
            ("admission process", "ask_admission"), ("how to apply", "ask_admission"), ("eligibility criteria", "ask_admission"),
            ("cutoff marks", "ask_cutoff"), ("merit list", "ask_cutoff"), ("jee cutoff", "ask_cutoff"),
            ("engineering branches", "ask_guidance"), ("which branch is best", "ask_guidance"),
            ("hostel accommodation", "ask_hostel"), ("hostel room", "ask_hostel"), ("hostel fees", "ask_hostel"),
            ("bus transport", "ask_transport"), ("college vehicle", "ask_transport"), ("bus route", "ask_transport"),
            ("placement packages", "ask_placement"), ("highest salary", "ask_placement"), ("top recruiters", "ask_placement"), ("tpo contact", "ask_placement"),
            ("scholarship options", "ask_scholarship"), ("tfws scholarship", "ask_scholarship"), ("financial aid", "ask_scholarship"),
            ("what are the facilities", "ask_facilities"), ("infrastructure", "ask_facilities"), ("labs in college", "ask_facilities"),
            ("library details", "ask_library"), ("books available", "ask_library"), ("e-library", "ask_library"),
            ("about the college", "ask_college_info"), ("principal name", "ask_college_info"), ("hod cse", "ask_college_info"),
            ("research projects", "ask_research"), ("phd faculty", "ask_research"),

            # Guidance
            ("my marks are low", "ask_guidance"), ("i am failing", "ask_guidance"), ("study tips", "ask_guidance"),
            ("how to improve attendance", "ask_guidance"), ("career advice", "ask_guidance"),
        ]

    def load_college_data(self):
        """Loads all college data from the data directory."""
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        files = {
            'admission': 'Admission.json',
            'placements': 'Placements.json',
            'institute_info': 'Institute Info.json',
            'facilities': 'Facilities.json',
            'library': 'Library.json',
            'about': 'About-Us.json',
            'contact': 'Contact-Us.json',
            'research': 'Research.json',
        }
        for key, filename in files.items():
            try:
                filepath = os.path.join(data_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    self.college_data[key] = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load {filename}: {e}")
        print(f"Loaded {len(self.college_data)} college data files.")

    def build_knowledge_base(self):
        """Build a flat text knowledge base for semantic retrieval."""
        def flatten(obj, prefix=''):
            """Recursively flatten nested dict/list into text passages."""
            texts = []
            if isinstance(obj, dict):
                for k, v in obj.items():
                    texts.extend(flatten(v, prefix=f"{prefix} {k}".strip()))
            elif isinstance(obj, list):
                for item in obj:
                    texts.extend(flatten(item, prefix=prefix))
            elif isinstance(obj, str) and len(obj) > 10:
                texts.append(f"{prefix}: {obj}")
            return texts

        for source, data in self.college_data.items():
            passages = flatten(data)
            for passage in passages:
                self.knowledge_base.append((passage, source))

        if self.knowledge_base:
            texts = [item[0] for item in self.knowledge_base]
            self.kb_vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
            self.kb_vectors = self.kb_vectorizer.fit_transform(texts)
            print(f"Knowledge base built with {len(self.knowledge_base)} passages.")

    def retrieve_relevant_context(self, query, top_k=5):
        """Retrieve top-k most relevant passages from knowledge base."""
        if self.kb_vectorizer is None or self.kb_vectors is None:
            return ""
        query_vec = self.kb_vectorizer.transform([query.lower()])
        similarities = cosine_similarity(query_vec, self.kb_vectors).flatten()
        top_indices = similarities.argsort()[-top_k:][::-1]
        relevant = []
        for idx in top_indices:
            if similarities[idx] > 0.05:  # min relevance threshold
                relevant.append(self.knowledge_base[idx][0])
        return "\n".join(relevant)

    def train(self):
        """Train the local TF-IDF SVM classifier."""
        texts = [item[0] for item in self.training_data]
        labels = [item[1] for item in self.training_data]
        self.model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), SVC(probability=True, kernel='linear'))
        self.model.fit(texts, labels)
        self.is_trained = True
        return True

    def predict_intent(self, text):
        """Predict intent using local model. Returns intent and confidence."""
        if not self.is_trained:
            self.train()
        text = text.lower().strip()
        probabilities = self.model.predict_proba([text])[0]
        max_prob_index = np.argmax(probabilities)
        confidence = probabilities[max_prob_index]
        intent = self.model.classes_[max_prob_index]
        return intent, float(confidence)

    def build_system_prompt(self, role, name, student_db_context=None, chat_history=None, user_context=None):
        """Build a role-specific system prompt for Gemini."""
        base = f"""You are SmartEdu AI, the official intelligent virtual assistant for SKN Sinhgad College of Engineering (SKNSCOE), Korti, Pandharpur.
You were developed as a B.Tech final year project by: Miss. Yelpale Pratiksha, Miss. Waghamare Laxmi, Mr. Javir Pandurang, and Mr. Kakade Dhiraj under guidance of Prof. R. S. Yevale.

RULES:
- **Prioritize the provided data context** for all college-related queries.
- For general knowledge questions (e.g., world facts, coding, general news) not in the context, use your internal knowledge to provide helpful and accurate answers.
- Use **rich markdown formatting**: Use bold headers and clean bullet points. **AVOID** long ASCII dividers like "=====" or "-----".
- Keep responses **extremely concise and conversational** (2-3 short sentences max). This is critical as responses are often read aloud.
- If the user asks about personal matters (like your "lunch" or well-being), respond naturally as a helpful AI assistant.
- If a query is college-specific but data is truly missing, suggest contacting the relevant department (e.g., hod.cse@sknscoe.ac.in).

CURRENT REAL-TIME CONTEXT:
- The current time is {user_context.get('current_time', 'Unknown') if user_context else 'Unknown'}.
- Today's date is {user_context.get('current_date', 'Unknown') if user_context else 'Unknown'}.
- Use this information ONLY if the user explicitly asks for the current time or date. Do not mention it in other responses.
"""
        if role == 'admin' or role == 'HOD':
            base += f"""
ROLE: You are speaking with **{name}**, an Administrator/HOD.
- Provide aggregate, analytical, and administrative responses.
- You may reference class-wide statistics, student counts, and departmental data.
- Use a professional, data-driven tone.
- When referencing student data, provide summaries and highlight actionable insights.
"""
        else:
            base += f"""
ROLE: You are speaking with **{name}**, a student.
- Be friendly, encouraging, and supportive.
- Personalize responses using the student's actual data provided below.
- If a student is struggling academically (low marks/attendance), proactively offer guidance.
- Never show other students' private data.
"""
            if student_db_context:
                base += f"\n--- STUDENT'S PERSONAL DATA ---\n{student_db_context}\n"

        if chat_history:
            base += f"\n--- RECENT CONVERSATION HISTORY ---\n{chat_history}\n(Use this for context, do not re-answer already-answered questions.)"

        return base

    def get_learning_guidance(self, student_db_context):
        """Check if student needs academic guidance based on their data."""
        if not student_db_context:
            return None
        alerts = []
        # Parse student context for low marks
        if 'marks' in student_db_context.lower() and ('fail' in student_db_context.lower() or 'low' in student_db_context.lower()):
            alerts.append("📚 **Academic Tip:** Your marks in some subjects need attention. Focus on past question papers and consider forming a study group.")
        if 'attendance' in student_db_context.lower():
            # Simple heuristic — if attendance < 75 is mentioned
            import re
            percentages = re.findall(r'(\d+\.?\d*)%', student_db_context)
            for p in percentages:
                if float(p) < 75:
                    alerts.append(f"⚠️ **Attendance Alert:** Your attendance ({p}%) is below the required 75%. Please attend classes regularly to avoid debarment from exams.")
                    break
        return "\n".join(alerts) if alerts else None

    def generate_gemini_response(self, text, intent='unknown', user_context=None, student_db_context=None, chat_history=None):
        """Generate a response using Groq with RAG context."""
        if not getattr(self, 'llm_configured', False) or not getattr(self, 'groq_client', None):
            return "SmartEdu AI is in offline mode. Please ensure the GROQ_API_KEY is configured."

        role = user_context.get('role', 'student') if user_context else 'student'
        name = user_context.get('name', 'Student') if user_context else 'Student'

        # Build role-specific system prompt
        system_prompt = self.build_system_prompt(role, name, student_db_context, chat_history, user_context)

        # Semantic retrieval from knowledge base
        semantic_context = self.retrieve_relevant_context(text)
        if semantic_context:
            system_prompt += f"\n\n--- RELEVANT COLLEGE KNOWLEDGE BASE ---\n{semantic_context}\n"

        # Intent-specific full data injection
        intent_data_map = {
            'ask_admission': 'admission',
            'ask_eligibility': 'admission',
            'ask_cutoff': 'admission',
            'ask_placement': 'placements',
            'ask_college_info': 'institute_info',
            'ask_facilities': 'facilities',
            'ask_library': 'library',
            'ask_hostel': 'facilities',
            'ask_transport': 'institute_info',
            'ask_scholarship': 'admission',
            'ask_research': 'research',
            'ask_documents': 'admission',
        }
        if intent in intent_data_map:
            data_key = intent_data_map[intent]
            # Inject more data for better AI context
            full_data = json.dumps(self.college_data.get(data_key, {}), indent=2)
            # Use a larger chunk of the data if available
            system_prompt += f"\n--- FULL DATA FOR THIS QUERY ({data_key.upper()}) ---\n{full_data[:15000]}\n"

        prompt = f"{system_prompt}\n\nUser Query: {text}\n\nResponse:"

        try:
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1024
            )
            reply = response.choices[0].message.content

            # Append proactive guidance if applicable
            if role != 'admin':
                guidance = self.get_learning_guidance(student_db_context or "")
                if guidance:
                    reply += f"\n\n---\n{guidance}"

            return reply
        except Exception as e:
            print(f"Groq Error: {e}")
            # Offline fallback: return relevant knowledge base passages
            if semantic_context:
                return f"📋 Here's what I found from the college data:\n\n{semantic_context[:800]}"
            return "I'm experiencing connectivity issues. Please try a direct command like 'show my fees' or 'show my attendance'."

# Initialize singleton
nlp_engine = HybridNLPEngine()
