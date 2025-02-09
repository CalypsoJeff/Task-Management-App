# Task Management Application

A comprehensive task management application that enables users to create, edit, delete, and view tasks, with real-time updates, user authentication, and task visualization.

---

## Features
- **User Authentication**: Secure registration and login functionality with JWT-based authentication.
- **Task Management**: CRUD operations for tasks, including the ability to add, edit, delete, and view tasks.
- **Real-Time Updates**: Live task updates using WebSocket (Socket.io) for an interactive experience.
- **Data Visualization**: Visual representations of task statistics (e.g., completed tasks, overdue tasks).
- **Responsive Design**: Optimized for various devices with a responsive user interface.
## Tech Stack
Frontend: React (JSX), Redux, Vite
Backend: Node.js, Express, javascript
- **Database**: MongoDB
Real-Time Updates: Socket.io
- **Hosting**:
  - Backend: Render
  - Frontend: Vercel

---

## Live Demo
The application is deployed and accessible at:
**[Deployed URL](https://task-management-app-beryl-theta.vercel.app)**

---

## AI-Assisted Development:
AI tools, including ChatGPT, Claude.AI, and V0 by Vercel, played a crucial role in this project by:

Assisting with frontend development, particularly React components and UI design.
Debugging and error resolution, streamlining the troubleshooting process.
Implementing WebSocket for real-time updates and improving data synchronization.
Providing valuable explanations and best practices for Node.js and Express architecture.
---
## Prerequisites
Node.js installed on your local machine.
Git installed for version control.
---

## Installation
Clone the Repository
Clone the repository and navigate into it:

git clone https://github.com/CalypsoJeff/Task-Management-App.git
cd Task-Management-App
cd server
npm install
cd ../client
npm install

Create a .env file in  backend directories and add the necessary environment variables. 
For Backend:
Example:
SECRET_KEY = 
REFRESH_SECRET_KEY=
MONGO_URL=
SECRET=
PORT=

For Frontend / client:
VITE_API_BASE_URL=http://localhost:5000
Run the Application Locally:
Backend
Start the backend server:
cd server
npm start
Frontend
Start the frontend / client server:
cd client
npm run dev

Access the Application:
Frontend: http://localhost:5173
Backend: http://localhost:5000

Contributing
Contributions are welcome! 
Feel free to fork the repository and submit a pull request.
