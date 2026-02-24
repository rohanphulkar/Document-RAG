# ContextBase

A RAG (Retrieval-Augmented Generation) powered chat application with document management. Upload PDFs, organize them into collections, and have AI-powered conversations grounded in your documents.

Built with FastAPI, React, Qdrant, and OpenAI.

## Architecture

```
┌──────────┐        ┌──────────────┐        ┌─────────┐
│  Client  │───────▶│    Server    │───────▶│  Qdrant │
│  (React  │  nginx │  (FastAPI)   │        │ (Vector)│
│  + Nginx)│◀───────│              │◀───────│  Store) │
└──────────┘   :80  └──────────────┘  :6333 └─────────┘
                          │    │
                          │    └──────▶ AWS S3 (file storage)
                          │
                          └──────────▶ AWS RDS MySQL (database)
```

**Request flow**: Client → Nginx (reverse proxy on `:80/:443`) → FastAPI (`:8000` internal) → Qdrant + S3 + RDS

## Tech Stack

| Component            | Technology                |
| -------------------- | ------------------------- |
| **Backend**          | FastAPI, Python 3.12      |
| **Frontend**         | React, Vite, ShadcnUI     |
| **Database**         | AWS RDS MySQL, SQLAlchemy |
| **Vector Store**     | Qdrant                    |
| **File Storage**     | AWS S3                    |
| **AI**               | OpenAI, LangChain         |
| **Reverse Proxy**    | Nginx + Let's Encrypt     |
| **Monitoring**       | Prometheus, cAdvisor      |
| **Containerization** | Docker, Docker Compose    |

## Project Structure

```
ContextBase/
├── server/
│   ├── contextbase/
│   │   ├── main.py                 # App factory, lifespan, CORS
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings (env vars)
│   │   │   ├── database.py         # SQLAlchemy engine + session
│   │   │   └── security.py         # JWT, password hashing
│   │   ├── api/v1/endpoints/
│   │   │   ├── auth.py             # Register, login, me
│   │   │   ├── chats.py            # Chat CRUD, messaging, RAG
│   │   │   └── documents.py        # Collections, document uploads
│   │   ├── models/
│   │   │   ├── user.py             # User model
│   │   │   ├── chat.py             # Chat + Message models
│   │   │   └── document.py         # Collection + Document models
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   └── services/
│   │       ├── llm.py              # OpenAI embeddings + chat model
│   │       ├── vector_store.py     # Qdrant indexing + search
│   │       ├── chat.py             # RAG chat + simple chat + title gen
│   │       ├── s3.py               # S3 upload, download, delete
│   │       └── file_handler.py     # File upload orchestration
│   ├── .env / .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── client/
│   ├── src/
│   │   ├── components/             # React UI components
│   │   ├── pages/                  # Route pages
│   │   ├── store/                  # Redux state management
│   │   ├── context/                # React context providers
│   │   └── hooks/                  # Custom hooks
│   ├── nginx/nginx.conf            # Reverse proxy + SSL config
│   └── Dockerfile                  # Multi-stage build (Node → Nginx)
├── prometheus/prometheus.yml
└── docker-compose.yml
```

## Features

- **JWT Authentication** — Register, login, and token-based access control
- **Document Collections** — Organize uploaded PDFs into named collections
- **S3 File Storage** — Documents stored in AWS S3 with automatic cleanup
- **Vector Indexing** — PDFs chunked and indexed in Qdrant for semantic search
- **RAG Chat** — Conversations grounded in your documents using OpenAI + LangChain
- **Simple Chat** — General AI conversations without document context
- **Auto Chat Titles** — First message auto-generates a descriptive chat title
- **Chat History** — Full conversation history with user and AI messages
- **Monitoring** — Prometheus metrics + cAdvisor container monitoring
- **Production SSL** — Let's Encrypt certificates via Certbot + Nginx

## API Endpoints

### Auth (`/api/v1/auth`)

| Method | Endpoint    | Description               |
| ------ | ----------- | ------------------------- |
| POST   | `/register` | Create a new user account |
| POST   | `/login`    | Get JWT access token      |
| GET    | `/me`       | Get current user profile  |

### Chats (`/api/v1/chats`)

| Method | Endpoint              | Description                            |
| ------ | --------------------- | -------------------------------------- |
| POST   | `/`                   | Create chat (optionally with files)    |
| GET    | `/`                   | List all user chats                    |
| GET    | `/{chat_id}`          | Get chat with message history          |
| PUT    | `/{chat_id}`          | Update chat name/description           |
| DELETE | `/{chat_id}`          | Delete chat and orphaned collections   |
| POST   | `/{chat_id}/messages` | Send message and get AI response (RAG) |
| GET    | `/{chat_id}/messages` | Get all messages in a chat             |
| POST   | `/{chat_id}/upload`   | Upload additional documents to a chat  |

### Documents (`/api/v1/documents`)

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/collections`                | Create a document collection   |
| GET    | `/collections`                | List all collections           |
| GET    | `/collections/{id}`           | Get collection details         |
| DELETE | `/collections/{id}`           | Delete collection + documents  |
| POST   | `/collections/{id}/documents` | Upload PDFs to a collection    |
| GET    | `/collections/{id}/documents` | List documents in a collection |
| DELETE | `/{doc_id}`                   | Delete a single document       |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- AWS account (S3 bucket + RDS MySQL instance)
- OpenAI API key

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/rohanphulkar/ContextBase.git
   cd ContextBase
   ```

2. **Configure environment variables**

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env` with your credentials:

   ```env
   # Database (RDS MySQL)
   MYSQL_HOST=your-rds-endpoint.ap-south-1.rds.amazonaws.com
   MYSQL_PORT=3306
   MYSQL_USER=your_user
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=contextbase

   # JWT
   SECRET_KEY=your-super-secret-key

   # Vector Store
   QDRANT_URL=http://qdrant:6333

   # OpenAI
   OPENAI_API_KEY=sk-...

   # AWS S3
   AWS_ACCESS_KEY=your-access-key
   AWS_SECRET_KEY=your-secret-key
   AWS_REGION=ap-south-1
   S3_BUCKET=contextbase
   ```

3. **Start all services**

   ```bash
   docker compose up -d
   ```

4. **Access the application**
   - **Frontend**: http://localhost (or https with SSL configured)
   - **API Docs**: http://localhost/api/docs
   - **Prometheus**: http://localhost:9090
   - **cAdvisor**: http://localhost:8080

## Docker Services

| Service      | Image / Build   | Port            | Network          |
| ------------ | --------------- | --------------- | ---------------- |
| `server`     | `./server`      | 8000 (internal) | internal, public |
| `client`     | `./client`      | 80, 443         | public           |
| `qdrant`     | qdrant/qdrant   | 6333 (internal) | internal         |
| `prometheus` | prom/prometheus | 9090            | internal, public |
| `cadvisor`   | cadvisor        | 8080            | internal, public |

The `internal` network isolates backend services (server, qdrant) from direct external access. The `client` service acts as the single public entry point, proxying `/api/` requests to the server.

## How It Works

1. **Upload** — Users upload PDF documents into collections. Files are stored in **S3**, then chunked and indexed into **Qdrant** for vector search.
2. **Chat** — Users create chats linked to a collection. Each message triggers a RAG pipeline: relevant chunks are retrieved from Qdrant and provided as context to **OpenAI**.
3. **Response** — The AI responds with contextual answers. Source references are stored alongside messages for traceability.
4. **Auto-Title** — After the first Q&A exchange, the chat is automatically renamed based on the conversation content.

## License

MIT
