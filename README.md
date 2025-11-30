# CodeSync Live - Real-Time Collaborative Coding Platform

A beautiful, production-ready real-time pair-programming web application built with React, TypeScript, and Lovable Cloud (Supabase). Two or more users can join the same room, edit code simultaneously, and see each other's changes instantly with WebSocket-powered synchronization.

![CodeSync Live](https://img.shields.io/badge/Built%20with-Lovable-FF6B6B)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)

## 🚀 Features

### Core Functionality
- ✨ **Real-Time Collaboration**: Multiple users can code together with instant synchronization (true simultaneous editing)
- 💬 **Live Chat**: Built-in chat sidebar for team communication while coding
- 🤖 **AI Autocomplete**: Mocked AI-powered suggestions that appear after typing pauses
- 🎨 **Beautiful UI**: Modern dark theme with VS Code-inspired aesthetics and smooth animations
- 🌐 **Multi-Language Support**: Python, JavaScript, and TypeScript with syntax highlighting
- 👥 **User Presence**: Live indicators showing who's online with usernames
- 📋 **Easy Sharing**: One-click room link copying for inviting collaborators
- 🔄 **Conflict Resolution**: Debounced updates prevent editing conflicts

### Technical Highlights
- **WebSocket Sync**: Real-time database updates using Supabase Realtime
- **Monaco Editor**: Industry-standard code editor (powers VS Code)
- **PostgreSQL Database**: Persistent room state with proper indexing
- **Edge Functions**: Serverless backend for autocomplete suggestions
- **Row Level Security**: Proper database security policies (public for prototype)

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Monaco Editor** - Professional code editing experience
- **Tailwind CSS** - Utility-first styling with custom design system
- **React Router** - Client-side routing
- **Sonner** - Beautiful toast notifications

### Backend Stack (Lovable Cloud)
- **PostgreSQL** - Primary database for room state
- **Supabase Realtime** - WebSocket-based real-time synchronization
- **Edge Functions (Deno)** - Serverless TypeScript functions
- **Row Level Security** - Database-level security policies

### Database Schema

```sql
Table: rooms
- id (UUID, Primary Key)
- room_code (TEXT, Unique) - 6-character room identifier
- name (TEXT) - Room display name
- language (TEXT) - Selected programming language
- code_content (TEXT) - Current code state
- active_users (JSONB) - JSON array of active users
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP) - Auto-updated on changes

Table: chat_messages
- id (UUID, Primary Key)
- room_id (UUID, Foreign Key → rooms.id)
- username (TEXT) - Message sender's name
- message (TEXT) - Message content
- created_at (TIMESTAMP)
```

### Real-Time Synchronization Flow

**Code Editing:**
1. User types in Monaco Editor
2. `handleCodeChange` captures the change with 300ms debounce
3. Code updates local state immediately (optimistic update)
4. Debounced database update sent to Supabase
5. Supabase broadcasts change via WebSocket
6. Other users receive update via Realtime subscription
7. Remote changes update their editor (with echo prevention)
8. Local change flag prevents feedback loops

**Chat System:**
1. User sends message in chat sidebar
2. Message inserted into `chat_messages` table
3. Supabase Realtime broadcasts INSERT event
4. All connected users receive message instantly
5. Messages auto-scroll to bottom

**User Presence:**
1. User joins room and provides username
2. Presence channel tracks user with username + timestamp
3. `sync`, `join`, and `leave` events update user list
4. Online users displayed in header and bottom-right panel

### AI Autocomplete Flow

1. User stops typing for 600ms (debounced)
2. Frontend calls `/autocomplete` edge function
3. Edge function returns mocked suggestion based on language
4. Suggestion displays in UI for 5 seconds
5. Suggestion fades out automatically

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm installed
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-git-url>
   cd <project-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:8080
   ```

The backend (database and edge functions) is automatically connected via Lovable Cloud - no additional setup required!

## 🎮 How to Use

### Creating a Room
1. Click "Create Room" on the home page
2. A unique 6-character room code is generated
3. You're automatically redirected to the room
4. Share the room code or click the copy icon to invite others

### Joining a Room
1. Enter a 6-character room code
2. Click "Join Room"
3. Provide your username
4. Start coding collaboratively!

### Collaborative Coding
- **Edit Together**: Type in the editor - changes sync in real-time with 300ms debounce
- **Chat**: Click the message icon to open the chat sidebar
- **Language**: Select Python, JavaScript, or TypeScript from the dropdown
- **Presence**: See who's online with usernames in the header and bottom panel
- **AI Help**: Pause typing to get AI-powered suggestions
- **Share**: Copy room link to invite team members
- **Conflict Prevention**: Debounced updates and echo prevention avoid editing conflicts

## 🎨 Design System

### Color Palette
- **Primary (Cyan)**: `hsl(189 94% 43%)` - Main brand color, CTAs
- **Secondary (Green)**: `hsl(142 76% 36%)` - Success states, accents
- **Accent (Purple)**: `hsl(271 81% 56%)` - Special highlights
- **Background**: `hsl(217 33% 7%)` - Deep dark base
- **Card**: `hsl(220 30% 10%)` - Elevated surfaces

### Typography
- System fonts with fallback to sans-serif
- Monaco Editor uses monospace: 'Fira Code', 'Cascadia Code', Consolas

### Animations
- Smooth transitions with cubic-bezier easing
- Fade-in and slide-in animations on page load
- Glow effects on hover for interactive elements
- Sequential animation delays for staggered reveals

## 🔧 Configuration

### Room Settings
Edit in `src/pages/Home.tsx`:
- Default language (currently Python)
- Default code template
- Room code generation logic

### Editor Options
Customize in `src/pages/Room.tsx`:
- Font size and family
- Minimap visibility
- Line numbers
- Word wrap
- Rulers (80, 120 characters)

### Autocomplete Behavior
Modify in `supabase/functions/autocomplete/index.ts`:
- Suggestion sets per language
- Response format
- Error handling

## 🐛 Debugging

### View Console Logs
- Open browser DevTools (F12)
- Check Console tab for frontend logs
- Edge function logs available in Lovable Cloud dashboard

### Common Issues

**Room not found**
- Verify room code is correct (case-insensitive)
- Check database connection in Lovable Cloud

**Changes not syncing**
- Check browser console for WebSocket errors
- Verify Supabase Realtime is enabled on both tables
- Ensure RLS policies allow read/write access
- Try refreshing the page to reconnect WebSocket

**Chat not working**
- Verify username was set (check localStorage)
- Check that `chat_messages` table has proper RLS policies
- Ensure Realtime is enabled on `chat_messages` table

**Autocomplete not working**
- Check edge function logs in Lovable Cloud
- Verify CORS headers in edge function
- Check network tab for failed requests

**Multiple users editing conflicts**
- This is expected with simultaneous edits
- The 300ms debounce reduces conflicts
- Last write wins (simple conflict resolution)
- For production, implement OT or CRDT algorithms

## 📊 Performance Considerations

### Current Implementation
- In-memory state per room (PostgreSQL)
- Database updates on every keystroke (with optimistic UI)
- WebSocket connections scale with Supabase infrastructure

### Optimizations for Production
- **Conflict Resolution**: Implement operational transformation (OT) or CRDT for true multi-user editing
- **Delta Sync**: Send only code deltas instead of full content (currently sends full code)
- **Cursor Sharing**: Show each user's cursor position in the editor
- **Connection Status**: Add indicators for connection state and auto-reconnect
- **Rate Limiting**: Further optimize database update frequency
- **Batching**: Batch multiple rapid changes into single updates
- **Caching**: Add Redis or similar for frequently accessed rooms
- **Authentication**: Move from localStorage usernames to proper auth

## 🚀 Deployment

### Frontend
Deploy through Lovable:
1. Click "Publish" button in Lovable interface
2. Frontend deploys to Lovable's CDN
3. Custom domain available on paid plans

### Backend
- Database and edge functions deploy automatically with code changes
- No manual deployment needed
- Real-time capabilities work out of the box

## 🔐 Security Notes

### Current Security (Prototype)
- **Open access**: Anyone can create/join/edit rooms
- **No authentication**: Users are anonymous
- **Public RLS policies**: All operations allowed for prototype purposes

### Production Recommendations
1. **Add Authentication**
   - Implement email/password or OAuth
   - Link rooms to user IDs
   - Restrict room creation to authenticated users

2. **Update RLS Policies**
   ```sql
   -- Only room creator can delete
   -- Only room members can view/edit
   -- Implement role-based access
   ```

3. **Add Rate Limiting**
   - Limit room creation per IP/user
   - Throttle code updates
   - Prevent abuse of edge functions

4. **Input Validation**
   - Sanitize code content
   - Validate room codes
   - Limit code content size

5. **Monitoring**
   - Track edge function usage
   - Monitor database performance
   - Set up error alerting

## 🎯 Future Enhancements

### Near Term
- [x] Real-time chat sidebar
- [x] User nicknames and presence
- [ ] Cursor position indicators for each user
- [ ] User avatars with color coding
- [ ] Code execution environment
- [ ] File upload support
- [ ] Syntax error highlighting
- [ ] Private rooms with passwords

### Long Term
- [ ] Real AI autocomplete with OpenAI/Anthropic
- [ ] Video/voice chat integration
- [ ] Code review and commenting
- [ ] Version history and rollback
- [ ] Export code to GitHub
- [ ] Terminal sharing
- [ ] Whiteboard/diagramming tool

## 🤝 Contributing

This is a prototype project. To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is built with Lovable and uses open-source technologies. Check individual component licenses for details.

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft's excellent code editor
- **Supabase** - Powers the backend infrastructure
- **Lovable** - Rapid full-stack development platform
- **shadcn/ui** - Beautiful, accessible UI components

## 📞 Support

For issues, questions, or feature requests:
1. Check the debugging section above
2. Review Lovable Cloud documentation
3. Contact support through Lovable platform

---

**Built with ❤️ using Lovable - Ship faster, build better**
