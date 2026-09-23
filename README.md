# MADLOV AI — Company Assistant Frontend

A lightweight frontend for the **MADLOV AI Company Assistant**, a full-stack AI-powered company chatbot built around a Retrieval-Augmented Generation (RAG) backend.

The frontend provides a chat interface where users can start conversations, continue previous conversations, browse conversation history, and communicate with the FastAPI backend.

## ✨ Features

* 💬 Interactive AI chat interface
* 🗂️ Conversation sidebar
* 🆕 Create new conversations
* 💾 Load previous conversation history
* 🔄 Persistent conversations through backend APIs
* ⏳ Loading state while waiting for the AI response
* ⚠️ Basic API connection error handling
* 📱 Responsive layout for smaller screens
* 🔗 Integration with FastAPI backend
* 🆔 Generates conversation IDs using `crypto.randomUUID()`

## 🖥️ Interface

The application contains two main sections:

### Sidebar

* Company Assistant branding
* New Chat button
* Previously created conversations

### Chat Window

* User and AI messages
* File selection interface
* Message input
* Send button
* Conversation history

The HTML structure defines the sidebar, conversation list, chat area, file selector, and message input form.

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│       Frontend              │
│                             │
│  HTML + CSS + JavaScript    │
│                             │
│  ┌───────────────────────┐  │
│  │ Conversation Sidebar  │  │
│  └───────────────────────┘  │
│              │              │
│  ┌───────────────────────┐  │
│  │    Chat Interface     │  │
│  └───────────────────────┘  │
└──────────────┬──────────────┘
               │ HTTP Requests
               ▼
┌─────────────────────────────┐
│       FastAPI Backend       │
│                             │
│       RAG Pipeline          │
│            │                │
│            ▼                │
│      Vector Database        │
│            │                │
│            ▼                │
│        Gemini LLM           │
└─────────────────────────────┘
```

## 🔌 Backend Integration

The frontend communicates with the FastAPI backend using HTTP requests.

### API Endpoints Used

| Endpoint                            | Method | Purpose                                    |
| ----------------------------------- | ------ | ------------------------------------------ |
| `/first_chat`                       | POST   | Starts a new conversation                  |
| `/chat`                             | POST   | Sends messages in an existing conversation |
| `/fetch_title`                      | GET    | Retrieves conversation titles              |
| `/fetch_messages/{conversation_id}` | GET    | Retrieves messages from a conversation     |

The first message of a conversation is sent to `/first_chat`. Subsequent messages are sent to `/chat`.

Conversation history is retrieved through `/fetch_title` and `/fetch_messages/{conversation_id}`.

## 📁 Project Structure

```text
company-assistant-frontend/
│
├── index.html
├── script.js
├── style.css
└── README.md
```

### `index.html`

Contains the application's main UI structure:

* Sidebar
* Project name
* New Chat button
* Conversation list
* Chat area
* File selector
* Message input
* Submit button

The page loads `style.css` and `script.js` directly.

### `script.js`

Responsible for the application's frontend logic:

* Sending messages
* Creating conversation IDs
* Loading conversation history
* Displaying messages
* Managing the current conversation
* Calling backend APIs
* Handling loading states
* Creating new conversations
* Handling basic connection errors

Conversation IDs are generated in the browser using `crypto.randomUUID()`.

### `style.css`

Contains the application's layout and visual styling, including:

* Fixed sidebar
* Chat window
* Message bubbles
* Conversation list
* Input area
* File selector
* Send button
* Responsive mobile styling

The stylesheet includes a responsive breakpoint for screens below 700px.

## ⚙️ Requirements

* Modern web browser
* Running MADLOV AI Company Assistant backend
* FastAPI backend accessible at:

```text
http://127.0.0.1:8000
```

## 🚀 Running the Frontend

### 1. Clone the repository

```bash
git clone <your-frontend-repository-url>
cd company-assistant-frontend
```

### 2. Start the backend

Make sure your FastAPI backend is running on:

```text
http://127.0.0.1:8000
```

### 3. Start the frontend

Because this is a static HTML/CSS/JavaScript frontend, you can serve it using a simple local server.

For example:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

You can also use VS Code's Live Server extension.

## 🔄 Application Flow

### Starting a conversation

```text
User enters message
        ↓
Frontend generates conversation ID
        ↓
POST /first_chat
        ↓
Backend processes the RAG request
        ↓
AI response returned
        ↓
Frontend displays response
        ↓
Conversation title added to sidebar
```

### Continuing a conversation

```text
User sends another message
        ↓
POST /chat
        ↓
Backend retrieves conversation context
        ↓
RAG pipeline generates response
        ↓
Frontend displays AI response
```

### Loading previous conversations

```text
Frontend
   ↓
GET /fetch_title
   ↓
Conversation titles
   ↓
User selects conversation
   ↓
GET /fetch_messages/{conversation_id}
   ↓
Messages displayed in chat window
```

## 🎨 UI Design

The interface uses a two-column layout:

```text
┌─────────────────┬─────────────────────────────────────┐
│                 │                                     │
│ Company         │                                     │
│ Assistant       │          Chat Messages              │
│                 │                                     │
│ + New Chat      │                                     │
│                 │                                     │
│ Conversation 1  │                                     │
│ Conversation 2  │                                     │
│ Conversation 3  │                                     │
│                 │                                     │
│                 ├─────────────────────────────────────┤
│                 │ File │ Message Input       │ Send │
└─────────────────┴─────────────────────────────────────┘
```

The chat interface uses separate styling for user and AI messages, with automatic scrolling to the latest message.

## 🔧 Configuration

The current frontend expects the backend to be available locally on port `8000`.

If the backend is deployed to another server, update the API URLs in `script.js`.

For example:

```javascript
const API_BASE_URL = "https://your-backend-url.com";
```

Then use:

```javascript
fetch(`${API_BASE_URL}/chat`, ...)
```

instead of hardcoding the backend URL throughout the application.

## ⚠️ Current Limitations

This frontend is currently a portfolio/project implementation rather than a production-ready application.

Current limitations include:

* Backend URL is hardcoded
* User ID is currently hardcoded
* No authentication UI
* No authorization handling
* File selection UI is present but not currently connected to a file-upload workflow
* Basic error handling
* No streaming AI responses
* No markdown rendering for AI responses
* No advanced frontend framework
* No frontend testing
* No production environment configuration

## 🛠️ Tech Stack

* **HTML5**
* **CSS3**
* **JavaScript**
* **Fetch API**
* **FastAPI** — Backend API
* **RAG** — Retrieval-Augmented Generation
* **Gemini** — LLM/AI backend

## 🔗 Related Project

This repository contains the frontend for the MADLOV AI Company Assistant.

**Backend:**
`https://github.com/lovishdhot00/comapny-assistant-backend`

The backend contains the RAG pipeline, vector database, conversation memory, LLM integration, document ingestion, and FastAPI API.

## 📌 Project Focus

This project demonstrates how a conversational AI application can be built as a full-stack system rather than only as an isolated RAG pipeline.

The overall project combines:

* Document ingestion
* Document chunking
* Vector search
* RAG
* LLM generation
* Conversation memory
* Persistent chat history
* FastAPI backend
* JavaScript frontend

## 👨‍💻 Author

**Lovish**

AI Engineer | GenAI | RAG | LLM Applications

---

⭐ If you find this project useful, consider giving the repository a star.
