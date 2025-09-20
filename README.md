# SmartEdu - AI-Powered Educational Management System

SmartEdu is a comprehensive educational management system that leverages AI technology to enhance learning experiences and streamline administrative tasks for educational institutions.

## 🚀 Features

### Core Functionality
- **AI Chatbot**: Intelligent conversation with voice support
- **AI Services**: Generate notes, quizzes, and academic content
- **Student Services**: Comprehensive academic support and resources
- **Role-based Access**: Different dashboards for different user types

### User Roles & Dashboards

#### 1. **Principal Dashboard**
- **Overview**: Institution-wide statistics and management
- **Quick Actions**: 
  - Manage HODs across departments
  - View teachers by branch
  - View students by branch and year
  - Make announcements
- **Statistics**: Departments, Teachers, Students count
- **Management**: Full administrative control over the institution

#### 2. **HOD (Head of Department) Dashboard**
- **Overview**: Department-specific management and insights
- **Statistics**: 
  - Department name
  - Teacher count (from database)
  - Student count (from database)
- **Quick Actions**:
  - Start Chat (AI assistant)
  - Student Services (academic resources)
  - Manage Teachers (add/delete department teachers)
  - Manage Students (add/delete department students)
  - Profile management

#### 3. **Teacher Dashboard**
- **Features**: Student management, attendance tracking, material uploads
- **Quick Actions**: Manage attendance, upload materials, create assignments, monitor performance

#### 4. **Student Dashboard**
- **Features**: Access to AI services, academic resources, and learning tools
- **Quick Actions**: Start chat, AI services, student services, profile

## 🏗️ Technical Architecture

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

### Backend Integration
- **API Endpoints**: RESTful API design
- **Authentication**: Role-based access control
- **Database**: Real-time data fetching and updates

## 📁 Project Structure

```
smartEdu/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── Navbar.jsx           # Top navigation
│   │   │   └── LoadingSpinner.jsx   # Loading component
│   │   ├── pages/
│   │   │   ├── PrincipalDashboard.jsx  # Principal management interface
│   │   │   ├── HODDashboard.jsx        # HOD management interface
│   │   │   ├── TeacherDashboard.jsx    # Teacher interface
│   │   │   ├── Dashboard.jsx           # Student interface
│   │   │   ├── Chatbot.jsx             # AI chat interface
│   │   │   ├── AIServices.jsx          # AI tools interface
│   │   │   ├── StudentServices.jsx     # Academic resources
│   │   │   └── Profile.jsx             # User profile management
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   └── App.jsx                  # Main application component
│   └── package.json
└── README.md
```

## 🎯 HOD Dashboard Features

### Management Capabilities

#### Teacher Management
- **Add Teachers**: Complete form with validation
  - Name, Email, Contact, Subject, Username, Password
  - Department-specific assignment
- **Delete Teachers**: Remove teachers by ID
- **View Teachers**: Searchable list with all teacher details
- **Real-time Updates**: Dashboard stats update automatically

#### Student Management
- **Add Students**: Complete form with validation
  - Roll Number, Name, Email, Year, Contact, Username, Password
  - Department and year assignment
- **Delete Students**: Remove students by ID
- **View Students**: Searchable list with all student details
- **Real-time Updates**: Dashboard stats update automatically

### API Endpoints Used

#### Teacher Management
- `GET /api/hod/teachers/{department}/count` - Get teacher count
- `GET /api/hod/teachers/{department}` - Get teachers list
- `POST /api/hod/teachers` - Add new teacher
- `DELETE /api/hod/teachers/{id}` - Delete teacher

#### Student Management
- `GET /api/hod/students/{department}/count` - Get student count
- `GET /api/hod/students/{department}` - Get students list
- `POST /api/hod/students` - Add new student
- `DELETE /api/hod/students/{id}` - Delete student

#### Department Information
- `GET /api/hod/department/{department}` - Get department details

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API server running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartEdu
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Setup

Make sure your backend API server is running and accessible. The frontend expects the following base API endpoints:

- `/api/principal/*` - Principal management endpoints
- `/api/hod/*` - HOD management endpoints
- `/api/teacher/*` - Teacher management endpoints
- `/api/student/*` - Student management endpoints
- `/api/chatbot/*` - AI chatbot endpoints

## 🔧 Configuration

### Authentication
The system uses role-based authentication with the following roles:
- `principal` - Full administrative access
- `hod` - Department management access
- `teacher` - Class and student management
- `student` - Learning and resource access

### Department Configuration
Supported departments:
- CSE (Computer Science Engineering)
- ENTC (Electronics and Telecommunication)
- CIVIL (Civil Engineering)
- MECH (Mechanical Engineering)
- AIDS (Artificial Intelligence and Data Science)
- ELECTRICAL (Electrical Engineering)

## 📱 Usage Guide

### For HODs

1. **Access Dashboard**: Login with HOD credentials
2. **View Statistics**: Check department, teacher, and student counts
3. **Manage Teachers**:
   - Click "Manage Teachers" quick action
   - Fill the form to add new teachers
   - Enter teacher ID to delete existing teachers
   - Search and view all department teachers
4. **Manage Students**:
   - Click "Manage Students" quick action
   - Fill the form to add new students
   - Enter student ID to delete existing students
   - Search and view all department students
5. **Use AI Services**: Access chatbot and AI tools for academic support

### For Principals

1. **Institution Overview**: View institution-wide statistics
2. **Manage HODs**: Add or assign HODs to departments
3. **View Data**: Browse teachers and students by branch and year
4. **Announcements**: Create and manage institutional announcements

## 🛠️ Development

### Adding New Features

1. **Create new components** in the `src/components/` directory
2. **Add new pages** in the `src/pages/` directory
3. **Update routing** in `App.jsx`
4. **Add API endpoints** as needed
5. **Update authentication context** if new roles are added

### Code Style

- Use functional components with React Hooks
- Follow consistent naming conventions
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure backend server is running
   - Check API endpoint URLs
   - Verify CORS configuration

2. **Authentication Issues**
   - Check user role assignments
   - Verify token handling
   - Ensure proper login flow

3. **Data Not Loading**
   - Check network requests in browser dev tools
   - Verify API response format
   - Check error handling in components

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔮 Future Enhancements

- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] Integration with external learning management systems
- [ ] Advanced AI features for personalized learning
- [ ] Real-time collaboration tools
- [ ] Advanced notification system
- [ ] Bulk import/export functionality
- [ ] Advanced search and filtering
- [ ] Performance monitoring and optimization

---

**SmartEdu** - Empowering education through intelligent technology.
