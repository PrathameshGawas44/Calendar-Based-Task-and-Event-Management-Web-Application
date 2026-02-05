# Calendar-Based Task and Event Management Web Application

## Project Description

This is a web-based calendar application developed using React.js and Node.js that allows users to create, manage, and store tasks and events directly on a calendar interface.  
Users can add information on specific dates and configure events to occur once or recur on a weekly, monthly, or yearly basis.

The application uses Firebase for data persistence, enabling tasks and events to be saved and retrieved reliably across sessions.

---

## Tech Stack

Frontend:
- React.js
- JavaScript
- HTML
- CSS

Backend:
- Node.js

Database:
- Firebase

---

## Key Features

- Interactive calendar-based user interface  
- Add tasks and events on specific dates  
- Support for event recurrence:
  - One-time events  
  - Weekly events  
  - Monthly events  
  - Yearly events  
- Persistent storage using Firebase  
- Ability to view, update, and manage saved tasks and events  
- Separation of frontend and backend logic  

---

## Application Workflow

1. User logs in or signs up to the application.  
2. The user interacts with the calendar interface.  
3. A specific date is selected to add a task or event.  
4. The user defines event details and recurrence type.  
5. Data is stored in Firebase for persistence.  
6. Events are fetched and displayed dynamically on the calendar.

## User Roles and Access Control

The application supports two user roles:

- Admin  
  - Can create, edit, and manage tasks and events  

- User  
  - Can view tasks and events  
  - Cannot modify existing data   

---

## Project Structure

frontend/  
- React frontend application  

backend/  
- Server.js backend  

package.json  
package-lock.json  
README.md  

---

## How to Run the Project

### Prerequisites
- Node.js installed  
- Firebase project configured  

### Steps

1. Install dependencies:
   npm install  

2. Start the backend server:
   node Server.js  

3. Start the frontend application:
   npm start  

4. Open the application in the browser at:
   http://localhost:3000  

Ensure Firebase credentials are properly configured using environment variables.

---

## Concepts Demonstrated

- Component-based architecture using React  
- State management for calendar interactions
- Firebase Authentication 
- Handling recurring events logic  
- Backend integration using Node.js  
- Cloud-based data persistence using Firebase  
- REST-style communication between frontend and backend  
- Secure handling of configuration using environment variables  

---

## What I Learned

- Designing a calendar-based user experience
- Firebase Authentication 
- Implementing recurring task and event logic  
- Integrating frontend applications with cloud databases  
- Structuring full-stack JavaScript applications  
- Managing multiple JavaScript files in a scalable project  

---

## Author

Prathamesh Gawas

---

## Repository Description

Calendar-based task and event management web application built using React.js, Node.js, and Firebase with support for recurring events.
