# 💬 NexusChat — Real-Time Chat Application

A full-stack real-time chat application built with **Spring Boot 3** + **React + Vite**, powered by **WebSocket/STOMP**, secured with **JWT**, and deployable via **Docker Compose + Nginx**.

---

## 🏗️ Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend     | Java 17, Spring Boot 3, Spring Security, Spring Data JPA |
| Auth        | JWT (access + refresh tokens)                     |
| Real-time   | WebSocket · STOMP · SockJS                        |
| Database    | MySQL 8                                           |
| DevOps      | Docker, Docker Compose, Nginx                     |
| State       | Zustand                                           |

---

## 📁 Project Structure

```
chat-app/
├── backend/                        # Spring Boot application
│   └── src/main/java/com/chatapp/
│       ├── config/                 # Security, WebSocket, DataInitializer
│       ├── controller/             # Auth, Chat, User, WebSocket controllers
│       ├── dto/                    # All DTOs (Dtos.java)
│       ├── entity/                 # User, ChatRoom, Message, RefreshToken
│       ├── exception/              # Global exception handler
│       ├── repository/             # JPA repositories
│       ├── security/               # JwtUtils, JwtAuthFilter, UserDetailsServiceImpl
│       └── service/                # AuthService, ChatService, UserService
│
├── frontend/                       # React + Vite application
│   └── src/
│       ├── components/
│       │   ├── chat/               # ChatArea, MessageBubble, TypingIndicator,
│       │   │                       #   MemberList, ProfileModal, RoomBrowser
│       │   ├── layout/             # Sidebar
│       │   └── ui/                 # Avatar, StatusDot
│       ├── hooks/                  # useWebSocket, useTyping, useRooms
│       ├── pages/                  # LoginPage, RegisterPage, ChatPage
│       ├── services/               # api.js (Axios)
│       └── store/                  # authStore, chatStore (Zustand)
│
├── nginx/
│   └── nginx.conf                  # Reverse proxy config
├── db/
│   └── init.sql                    # DB init script
├── docker-compose.yml              # Dev orchestration
├── docker-compose.prod.yml         # Production overrides
├── .env.example                    # Environment variable template
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Ports `80`, `3000`, `8080`, `3306` free

### 1. Clone & configure
```bash
git clone <repo-url>
cd chat-app
cp .env.example .env
# Edit .env to set a strong JWT_SECRET and DB passwords
```

### 2. Start with Docker Compose
```bash
docker compose up --build
```

Services start in order: **MySQL → Backend → Frontend → Nginx**

| Service   | URL                         |
|-----------|-----------------------------|
| App (Nginx) | http://localhost            |
| Frontend  | http://localhost:3000       |
| Backend   | http://localhost:8080       |

### 3. Production build
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

---

## 🔧 Local Development (without Docker)

### Backend
```bash
cd backend
# Set environment variables or edit application.properties
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

> The Vite dev server proxies `/api` and `/ws` to `localhost:8080` automatically.

---

## 🔐 API Reference

### Auth
| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | `/api/auth/register` | Register new user  |
| POST   | `/api/auth/login`    | Login, get tokens  |
| POST   | `/api/auth/refresh`  | Refresh access token |
| POST   | `/api/auth/logout`   | Logout             |
| GET    | `/api/auth/me`       | Get current user   |

### Rooms
| Method | Endpoint                      | Description             |
|--------|-------------------------------|-------------------------|
| GET    | `/api/rooms/public`           | List public rooms       |
| GET    | `/api/rooms/my`               | My joined rooms         |
| POST   | `/api/rooms`                  | Create room             |
| POST   | `/api/rooms/{id}/join`        | Join a room             |
| POST   | `/api/rooms/{id}/leave`       | Leave a room            |
| GET    | `/api/rooms/{id}/messages`    | Paginated messages      |
| POST   | `/api/rooms/{id}/messages`    | Send REST message       |
| POST   | `/api/rooms/direct/{userId}`  | Get/create DM room      |

### Users
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/users`          | All users            |
| GET    | `/api/users/search`   | Search users         |
| GET    | `/api/users/{username}` | User profile       |
| PUT    | `/api/users/profile`  | Update own profile   |

### WebSocket (STOMP)
| Destination              | Direction | Description             |
|--------------------------|-----------|-------------------------|
| `/app/room/{id}/send`    | Client→   | Send a message          |
| `/app/room/{id}/typing`  | Client→   | Typing event            |
| `/topic/room/{id}`       | →Client   | Room messages broadcast |
| `/topic/room/{id}/typing`| →Client   | Typing indicator        |
| `/topic/users/status`    | →Client   | User status changes     |

**STOMP connect header:**
```
Authorization: Bearer <access_token>
```

---

## ✨ Features

- 🔐 JWT auth with refresh token rotation
- 💬 Real-time messaging via WebSocket (STOMP/SockJS)
- ⌨️ Live typing indicators
- 🟢 Online / Away / Offline user presence
- 📋 Public room browser + join/leave
- 💌 Direct messages between users
- 🏠 Create public or private rooms
- 👤 Profile editor (display name, status, avatar)
- 📜 Paginated message history
- 🎨 Dark glassmorphism UI with smooth animations
- 🐳 Full Docker Compose orchestration
- 🔁 Nginx reverse proxy (HTTP + WebSocket)
- 🌱 Auto-seeded default rooms on first start

---

## 🐳 Docker Services

| Container            | Image             | Purpose                       |
|----------------------|-------------------|-------------------------------|
| `nexuschat-db`       | mysql:8.0         | Database                      |
| `nexuschat-backend`  | Custom (JDK 17)   | Spring Boot API + WebSocket   |
| `nexuschat-frontend` | Custom (Node 20)  | React dev server / static     |
| `nexuschat-nginx`    | nginx:alpine      | Reverse proxy + routing       |

---

## 🛡️ Security

- Passwords hashed with **BCrypt**
- JWT signed with **HMAC-SHA256**
- Stateless session (no server-side sessions)
- CORS configured for all origins in dev (restrict in production)
- WebSocket connections validated via JWT on STOMP `CONNECT`

---

## 📝 Environment Variables

| Variable              | Default                        | Description                  |
|-----------------------|--------------------------------|------------------------------|
| `DB_HOST`             | `localhost`                    | MySQL host                   |
| `DB_PORT`             | `3306`                         | MySQL port                   |
| `DB_NAME`             | `chatdb`                       | Database name                |
| `DB_USERNAME`         | `chatuser`                     | DB username                  |
| `DB_PASSWORD`         | `chatpassword`                 | DB password                  |
| `JWT_SECRET`          | (default base64 key)           | JWT signing secret           |
| `JWT_EXPIRATION`      | `86400000` (24h)               | Access token TTL (ms)        |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7d)            | Refresh token TTL (ms)       |
| `VITE_API_URL`        | `/api`                         | Frontend API base URL        |
| `VITE_WS_URL`         | `/ws`                          | Frontend WebSocket base URL  |
