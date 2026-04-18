#!/usr/bin/env python3
"""
Custom Seeding script: 
1 Admin, Exactly 10 Students per class, 2 Events, 2 Notifications.
"""

from app import app, db
from models import (User, Department, Class, Subject, Student, Fee, Mark, 
                   Attendance, Event, Announcement, Course, Notification, ChatMessage)
from datetime import datetime, timedelta
from sqlalchemy import text

def seed_custom_data():
    with app.app_context():
        print("Dropping all existing tables...")
        try:
            with db.engine.connect() as conn:
                conn.execute(text('SET FOREIGN_KEY_CHECKS = 0;'))
                db.metadata.drop_all(bind=conn)
                conn.execute(text('SET FOREIGN_KEY_CHECKS = 1;'))
                conn.commit()
        except Exception as e:
            # Fallback for SQLite if used
            db.drop_all()
        print("Creating bare tables...")
        db.create_all()
        
        print("\nSeeding custom payload...")
        
        # 1. EXACTLY 1 ADMIN
        print("Creating 1 Admin...")
        admin_user = User(
            name='Admin Master',
            email='admin@clg.com',
            contact_no='9999999999',
            role='admin'
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        
        # 2. Setup Departments and Classes
        print("Setting up Departments and Classes...")
        cse_dept = Department(dept_name='Computer Science', dept_code='CSE', description='CSE Dept')
        db.session.add(cse_dept)
        db.session.flush()
        
        sy_cse = Class(dept_id=cse_dept.dept_id, class_name='SY-CSE', class_code='SY-CSE', academic_year='2025-26')
        ty_cse = Class(dept_id=cse_dept.dept_id, class_name='TY-CSE', class_code='TY-CSE', academic_year='2024-25')
        final_cse = Class(dept_id=cse_dept.dept_id, class_name='Final-CSE', class_code='FINAL-CSE', academic_year='2023-24')
        
        classes = [sy_cse, ty_cse, final_cse]
        db.session.add_all(classes)
        db.session.flush()
        
        # Add basic subject for each class to prevent foreign key errors later
        for c in classes:
            db.session.add(Subject(class_id=c.class_id, subject_name='Core Programming', subject_code=f'{c.class_code}-101', total_marks=50, total_classes=60))
            db.session.add(Subject(class_id=c.class_id, subject_name='Advanced Systems', subject_code=f'{c.class_code}-102', total_marks=100, total_classes=75))

        # 3. EXACTLY 10 STUDENTS PER CLASS
        print("Creating exactly 10 students per class...")
        for c_idx, c in enumerate(classes):
            for i in range(1, 11):
                raw_pass = f"student{c_idx}{i}"
                stu_user = User(
                    name=f'Student {c.class_name} 0{i}',
                    email=f'stu{i}.{c.class_code.lower()}@clg.com',
                    contact_no=f'9{c_idx}000000{i:02d}',
                    role='student'
                )
                stu_user.set_password(raw_pass)
                db.session.add(stu_user)
                db.session.flush()
                
                student_record = Student(
                    user_id=stu_user.user_id,
                    roll_no=f"{c.class_code}-{i:03d}",
                    class_id=c.class_id,
                    admission_year=2024 - c_idx
                )
                db.session.add(student_record)
                db.session.flush()

                # Initialize Mark and Attendance records for the student using the class subjects
                class_subjects = Subject.query.filter_by(class_id=c.class_id, is_active=True).all()
                for subj in class_subjects:
                    db.session.add(Mark(
                        student_id=student_record.student_id,
                        subject_id=subj.subject_id,
                        total_marks=subj.total_marks,
                        obtained_marks=0,
                        exam_date=datetime.now().date()
                    ))
                    db.session.add(Attendance(
                        student_id=student_record.student_id,
                        subject_id=subj.subject_id,
                        present_count=0,
                        total_classes=subj.total_classes,
                        attendance_percentage=0,
                        academic_year=c.academic_year
                    ))
                
                # Initialize Fee record
                db.session.add(Fee(
                    student_id=student_record.student_id,
                    total_amount=50000,
                    paid_amount=0,
                    due_amount=50000,
                    payment_status='Unpaid',
                    created_at=datetime.utcnow()
                ))
                
        # 4. EXACTLY 2 EVENTS
        print("Creating 2 Events...")
        event1 = Event(
            title='Annual Tech Symposium 2026',
            description='The largest technical gathering of the year.',
            event_date=datetime.now() + timedelta(days=14),
            location='Main Auditorium',
            event_type='workshop',
            max_participants=200,
            current_participants=0,
            is_active=True
        )
        event2 = Event(
            title='Campus Recruitment Drive',
            description='Top companies visiting for placements.',
            event_date=datetime.now() + timedelta(days=30),
            location='Placement Cell',
            event_type='academic',
            max_participants=100,
            current_participants=10,
            is_active=True
        )
        db.session.add_all([event1, event2])
        
        # 5. EXACTLY 2 NOTIFICATIONS / ANNOUNCEMENTS
        print("Creating 2 Announcements...")
        ann1 = Announcement(
            title='Urgent Server Maintenance',
            message='The student portal will be down from 2AM to 4AM this weekend.',
            target='all',
            priority='high',
            is_active=True,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(days=7)
        )
        ann2 = Announcement(
            title='Library Working Hours Extended',
            message='Library will now remain open until 10 PM during exam weeks.',
            target='all',
            priority='normal',
            is_active=True,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(days=30)
        )
        db.session.add_all([ann1, ann2])
        
        db.session.commit()
        print("\n>>> CUSTOM DATA SUCCESSFULLY SEEDED! <<<")
        print(f"Users: {User.query.count()}")
        print(f"Students: {Student.query.count()}")
        print(f"Events: {Event.query.count()}")
        print(f"Announcements: {Announcement.query.count()}")
        print("Admin Credentials -> admin@clg.com / admin123")

if __name__ == '__main__':
    seed_custom_data()
