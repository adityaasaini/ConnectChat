# ConnectChat ⚡
**A High-Performance Real-Time Group Chat Application**

ConnectChat is a bidirectional, low-latency group chat application that eliminates the overhead of traditional HTTP polling by utilizing WebSockets. Built with a modern tech stack, it features instant messaging, real-time typing indicators, and a premium Glassmorphism-inspired UI.

## 🛠️ Tech Stack
**Frontend:**
* React.js (Vite)
* Tailwind CSS (v4)
* Socket.io-client

**Backend:**
* Node.js
* Express.js
* Socket.io

## ✨ Core Features
* **Real-time Bidirectional Communication:** Instant message delivery using WebSocket protocol.
* **Smart Typing Indicators:** Displays "User is typing..." dynamically with optimized network emission.
* **Room Notifications:** Broadcasts alerts to all connected clients when a new user joins or leaves the chat.
* **Premium UI/UX:** Clean, modern interface utilizing Tailwind CSS with auto-scrolling to the latest messages.

## 🧠 Engineering Highlights
This project was built with a focus on resolving common real-time architecture bottlenecks:
  
1. **Optimized Typing Events (Debouncing):** Instead of firing a `socket.emit` on every single keystroke (which overloads the server), implemented a custom debouncing logic. The 'stop-typing' event is only triggered when the user pauses for 1 second, saving significant server bandwidth.
2. **Memory Leak Prevention:** Handled React 18's strict mode double-mounting behavior by implementing rigorous `useEffect` cleanup functions. Ensured `socket.off()` and `socket.disconnect()` are properly called on component unmount to prevent duplicate event listeners and double-message firing.
3. **CORS & Upgrades:** Configured the Express HTTP server to handle the initial handshake gracefully before upgrading the connection to WebSocket.

## 💻 Local Setup & Installation

To run this project locally on your machine, follow these steps:

### Prerequisites
* Node.js installed (v16 or higher)
* Git

### 1. Clone the repository
```bash
git clone [https://github.com/adityaasaini/ConnectChat.git](https://github.com/adityaasaini/ConnectChat.git)
cd ConnectChat
