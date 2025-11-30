# CodeSync Live - Real-Time Collaborative Coding Platform

A beautiful, production-ready real-time pair-programming web application built with React, TypeScript, and Supabase. Two or more users can join the same room, edit code simultaneously, and see each other's changes instantly with WebSocket-powered synchronization.

---

## 🚀 Features

### **Core Functionality**

* ✨ **Real-Time Collaboration:** Multiple users can code together with instant synchronization (true simultaneous editing)
* 💬 **Live Chat:** Built-in chat sidebar for team communication while coding
* 🤖 **AI Autocomplete:** Mocked AI-powered suggestions that appear after typing pauses
* 🎨 **Beautiful UI:** Modern dark theme with VS Code-inspired aesthetics and smooth animations
* 🌐 **Multi-Language Support:** Python, JavaScript, and TypeScript with syntax highlighting
* 👥 **User Presence:** Live indicators showing who's online with usernames
* 📋 **Easy Sharing:** One-click room link copying for inviting collaborators
* 🔄 **Conflict Resolution:** Debounced updates prevent editing conflicts

### **Technical Highlights**

* **WebSocket Sync:** Real-time database updates using Supabase Realtime
* **Monaco Editor:** Industry-standard code editor (powers VS Code)
* **PostgreSQL Database:** Persistent room state with proper indexing
* **Edge Functions:** Serverless backend for autocomplete suggestions
* **Row Level Security:** Database-level security policies (public for prototype)

---

## 🏗️ Architecture

### **Frontend Stack**

* React 18 – Modern React with hooks
* TypeScript – Type-safe development
* Monaco Editor – Professional code editing experience
* Tailwind CSS – Utility-first styling with custom design system
* React Router – Client-side routing
* Sonner – Beautiful toast notifications

### **Backend Stack**

* PostgreSQL – Primary database for room state
* Supabase Realtime – WebSocket-based real-time synchronization
* Edge Functions (Deno) – Serverless TypeScript functions
* Row Level Security – Database-level security policies

---

## 📊 Database Schema

### **Table: rooms**

* `id` (UUID, Primary Key)
* `room_code` (TEXT, Unique) – 6-character room identifier
* `name` (TEXT) – Room display name
* `language` (TEXT) – Selected programming language
* `code_content` (TEXT) – Current code state
* `active_users` (JSONB) – JSON array of active users
* `created_at` (TIMESTAMP)
* `updated_at` (TIMESTAMP)

### **Table: chat_messages**

* `id` (UUID, Primary Key)
* `room_id` (UUID, Foreign Key → rooms.id)
* `username` (TEXT) – Message sender's name
* `message` (TEXT) – Message content
* `created_at` (TIMESTAMP)

---

## 🔄 Real-Time Synchronization Flow

### **Code Editing:**

1. User types in Monaco Editor
2. `handleCodeChange` captures the change with 300ms debounce
3. Code updates locally (optimistic UI)
4. Debounced update sent to Supabase
5. Supabase broadcasts via WebSocket
6. Other users receive update instantly
7. Echo-prevention avoids update loops

### **Chat System:**

1. User sends message
2. Inserted into `chat_messages`
3. Supabase broadcasts INSERT event
4. All users receive message in real time
5. Chat auto-scrolls to bottom

### **User Presence:**

* User joins and provides username
* Presence channel tracks join/leave/sync
* Online users shown in header and bottom panel

---

## 📁 Project Structure

```
├── src/
│   ├── pages/
│   │   ├── Home.tsx          # Landing page with create/join options
│   │   ├── Room.tsx          # Collaborative editor room
│   │   └── NotFound.tsx      # 404 page
│   ├── components/
│   │   ├── ChatSidebar.tsx   # Real-time chat component
│   │   ├── UsernameDialog.tsx # Username prompt modal
│   │   └── ui/               # Shadcn UI components
│   ├── integrations/
│   │   └── supabase/         # Auto-generated Supabase client
│   ├── index.css             # Design system & theme variables
│   └── App.tsx               # Root component with routing
├── supabase/
│   └── functions/
│       └── autocomplete/     # AI suggestion edge function
│           └── index.ts
└── README.md
```

---

## 🚀 Getting Started

### **Prerequisites**

* Node.js 18+ and npm
* Modern web browser (Chrome, Firefox, Safari, Edge)

### **Local Development**

1. Clone the repository:

```bash
git clone <your-git-url>
cd <project-name>
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser:

```
http://localhost:8080
```

The backend connection is automatic — no additional setup required.

---

## 🎮 How to Use

### **Creating a Room**

1. Click **Create Room**
2. A unique 6-character room code is generated
3. You are redirected to the new room
4. Share the code or copy the invite link

### **Joining a Room**

* Enter a 6-character code
* Click **Join Room**
* Enter your username
* Start coding together!

### **Collaborative Coding**

* Real-time shared editing
* Open chat sidebar for conversation
* Select language (Python, JS, TS)
* See online users
* Copy invite link anytime
* Debounce + echo prevention avoids conflicts

---

## 🔧 Configuration

### **Room Settings** (in `Home.tsx`)

* Default language
* Default code template
* Room code generator

### **Editor Options** (in `Room.tsx`)

* Font settings
* Minimap toggle
* Line numbers
* Word wrap
* Rulers (80, 120 chars)

### **Autocomplete Logic** (in `supabase/functions/autocomplete/index.ts`)

* Suggestion rules
* Response formatting
* Error handling

---

## 🐛 Debugging

### **Console Logs**

Use browser DevTools → Console

### **Common Issues**

**Room not found:**

* Ensure room code is valid
* Check database connection

**Changes not syncing:**

* Check for WebSocket errors
* Ensure Supabase Realtime is enabled
* Validate RLS policies
* Refresh page to reconnect

**Chat not working:**

* Ensure username was saved
* RLS policies for `chat_messages`
* Realtime enabled for chat table

---

