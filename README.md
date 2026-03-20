<h1> Give & Take ♻️ </h1>

Give & Take is a web platform designed for students and young adults who want to exchange items instead of buying new ones.

The platform promotes a sustainable lifestyle by encouraging reuse — turning "one person's trash into another person's treasure".

---

## 🚀 Overview

This project was developed as part of an entrepreneurship course in collaboration with Google.

The team included both Computer Science and Economics students, and the entire product — from idea to implementation — was built independently.

---

## 🌟 Features

- 🔄 Item exchange platform between users
- 👤 User profiles with personal items
- ➕ Add, edit, and delete items
- 📸 Multi-image upload via Firebase Storage
- 🤝 Offer swap bids (including multiple items per bid)
- 📦 Detailed item view with owner information
- 🔍 Search and filtering:
  - text search (name/description)
  - category filters
  - distance-based filtering
  - interest-based prioritization
- 🔔 Notifications UI
- 🧠 AI-assisted item creation (Gemini):
  - title suggestions
  - description suggestions
  - category suggestions
- 🏆 Gamification system (user levels & profile visuals)
- 📱 WhatsApp integration after accepted bids

---

## 🛠 Tech Stack

- **Frontend:** React 19  
- **Routing:** React Router  
- **Backend / BaaS:** Firebase  
  - Firestore (database)  
  - Authentication (Google login)  
  - Storage (images)  
  - Hosting  
- **Styling:** CSS  
- **AI Integration:** Gemini API  

---

## 👥 Team Project

This project was developed as part of a multidisciplinary team:

- 2 Computer Science students  
- 2 Economics students  

The course focused on entrepreneurship, so all technical development was self-taught and implemented by the team.

---

## 🙋‍♀️ My Contribution

- Led the Firebase integration:
  - Firestore data modeling and queries
  - Authentication flow (Google sign-in)
  - Storage (image upload system)
  - Project configuration and connectivity
- Implemented the data layer (`FirebaseDataService`)
- Worked with real-time data and user-based logic
- Contributed to UI/UX decisions and design
- Participated in early product ideation and Figma prototyping

---

## 📁 Project Structure

src/
  components/       # UI components and pages
  services/         # Firebase, auth, AI logic
  hooks/            # Custom React hooks
  utils/            # Helper utilities
  firebase.js       # Firebase configuration

---

## ⚙️ Installation

npm install

---

## ▶️ Run the Project

npm start

Open:
http://localhost:3000

---

## 🔒 Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_GEMINI_API_KEY=...
```

---

## 🚀 Deployment

npm run build
firebase deploy

---

## 🔮 Future Improvements

- Improve system architecture and separation of concerns  
- Refactor components for scalability  
- Improve matching/recommendation logic  
- Add unit and integration tests  
- Enhance UI/UX responsiveness  

---

## 👩‍💻 Author

Dorin Fadida  
Computer Science Student  
Hebrew University of Jerusalem