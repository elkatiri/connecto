# CONNECTO

Premium random video and text chat platform. Connect with strangers worldwide instantly.

```
┌─────────────────────────────────────────────────────────────┐
│                     ARCHITECTURE                            │
│                                                             │
│   Browser                  Server                  MongoDB  │
│  ┌────────┐   WebSocket  ┌─────────┐  Mongoose  ┌───────┐  │
│  │Next.js │◄────────────►│ Node.js │◄──────────►│  DB   │  │
│  │  App   │   Socket.IO  │ Express │            └───────┘  │
│  └────────┘              │Socket.io│                        │
│      │                   └────┬────┘                        │
│      │     WebRTC P2P         │                             │
│      └───────────────────────►│ (signaling only)            │
│                               │                             │
│  Pages:                    Events:                          │
│  /          Landing         join-queue → matchmaking        │
│  /entry     Mode select     match-found → navigate          │
│  /matching  GSAP loader     webrtc-* → P2P negotiation      │
│  /chat      Video + Text    send-message → relay            │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- A browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev        # nodemon — auto-restarts on change
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your values
npm install
npm run dev        # Next.js on http://localhost:3000
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/connecto` |
| `JWT_SECRET` | JWT signing secret (change in prod!) | — |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `NODE_ENV` | `development` or `production` | `development` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL (must be public) | `http://localhost:5000` |

## MongoDB

**Local:**
```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community
# URI: mongodb://localhost:27017/connecto
```

**Atlas (cloud):**
1. Create a free cluster at mongodb.com/atlas
2. Whitelist your IP
3. Set `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/connecto`

> The server starts without MongoDB — matchmaking works in-memory. Only auth and reports require the database.

## WebRTC Notes

**STUN servers** (configured, free):
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

**TURN servers** (required for production behind symmetric NAT):
```
# Add to useWebRTC.js ICE_SERVERS if needed:
{ urls: "turn:your-turn-server.com", username: "user", credential: "pass" }
```

Free TURN options: `coturn` (self-host), Metered, Twilio TURN.

## Production Deploy

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_BACKEND_URL to your Railway/Render URL
```

### Backend → Railway

1. Push `backend/` folder to GitHub
2. Create Railway project → deploy from repo
3. Set all env vars in Railway dashboard
4. Enable TCP networking for Socket.IO

### Backend → Render

1. New Web Service → connect GitHub
2. Build command: `npm install`
3. Start command: `npm start`
4. Add env vars in Render dashboard

## Development Scripts

```bash
# Backend
npm run dev      # nodemon server.js
npm run start    # node server.js

# Frontend
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run start    # next start (production)
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TailwindCSS v4, Framer Motion, GSAP + @gsap/react
- **Backend:** Node.js, Express 5, Socket.IO 4, Mongoose 9
- **Real-time:** WebRTC (P2P video/audio), Socket.IO (signaling + text)
- **Auth:** JWT + anonymous sessions

## Project Structure

```
connecto/
├── backend/
│   ├── server.js              # Express + Socket.IO entry
│   ├── .env.example
│   ├── services/
│   │   ├── matchmaking.js     # In-memory queue + room management
│   │   ├── signaling.js       # WebRTC SDP/ICE relay
│   │   └── moderation.js      # Keyword filter + auto-ban
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── Report.js
│   └── routes/
│       ├── auth.js            # Anonymous / register / login
│       ├── users.js           # Profile endpoints
│       └── reports.js         # Report submission
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx     # Root layout
        │   ├── page.jsx       # Landing (GSAP hero + ScrollTrigger)
        │   ├── entry/         # Mode + interest selection
        │   ├── matchmaking/   # GSAP orbit loader
        │   └── chat/          # WebRTC + text chat
        ├── components/
        │   ├── ui/            # GlassCard, Button, Badge, StatusIndicator
        │   ├── chat/          # VideoPanel, TextPanel, ChatMessage, etc.
        │   └── layout/        # Navbar, PageWrapper
        ├── hooks/
        │   ├── useSocket.js
        │   ├── useMatchmaking.js
        │   └── useWebRTC.js
        ├── services/
        │   ├── socket.js      # Singleton socket.io-client
        │   └── api.js         # Fetch wrapper
        ├── animations/
        │   └── variants.js    # Framer Motion variants
        └── styles/
            └── globals.css    # Design tokens + glass utilities
```
