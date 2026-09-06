# BookStore

BookStore is a full-stack web application for browsing and purchasing books. It combines a React storefront with an Express API, MySQL persistence, JWT-based authentication, product administration, order management, and an optional AI book-assistant powered by Groq.

## Features

- Browse, search, and filter books, including new releases, bestsellers, and promotions.
- Register, sign in, and manage a customer profile.
- Manage a cart, wishlist, checkout flow, and order history.
- Review books and upload product images.
- Admin and employee endpoints for catalog, category, user, order, and review management.
- Ask the in-app assistant for recommendations drawn from the store catalog.

## Stack

| Area | Technology |
| --- | --- |
| Client | React, TypeScript, Vite, Tailwind CSS |
| Server | Node.js, Express, TypeScript |
| Database | MySQL via `mysql2` |
| Authentication | JSON Web Tokens and bcrypt |
| AI assistant | Groq SDK |

## Project layout

```text
.
├── backend/     # Express API, database access, and uploaded product images
└── frontend/    # React + Vite storefront
```

## Prerequisites

- Node.js 20 or later
- MySQL 8 or a compatible MySQL server
- A database named `bookstore` with the tables required by the API
- A Groq API key only if the chat assistant will be used

## Getting started

Install dependencies for each application:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env` with your local settings. Do not commit this file.

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bookstore
JWT_SECRET=replace_with_a_long_random_value
JWT_EXPIRES_IN=7d
GROQ_API_KEY=optional_groq_api_key
```

Start the API in one terminal:

```bash
cd backend
npm run dev
```

Start the client in another terminal:

```bash
cd frontend
npm run dev
```

The API runs at `http://localhost:3000` by default. The Vite development server runs at `http://localhost:5173` and proxies `/api` requests to the API.

> [!NOTE]
> The client builds image URLs against `http://localhost:3000`. Update the API configuration before deploying the frontend and backend to different hosts.

## Available commands

| Directory | Command | Description |
| --- | --- | --- |
| `backend` | `npm run dev` | Run the API with automatic reloads |
| `backend` | `npm run build` | Compile TypeScript to `dist/` |
| `backend` | `npm start` | Run the compiled API |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Type-check and create a production build |
| `frontend` | `npm run lint` | Run ESLint |
| `frontend` | `npm run preview` | Preview the production client build |

## API overview

The API is served under `/api` and exposes resources for:

- `auth` — registration, login, and the current user
- `products` and `categories` — storefront catalog management
- `cart`, `wishlist`, and `orders` — customer purchasing flow
- `reviews`, `users`, and `upload` — supporting account and administration features
- `chat` — the Groq-backed book assistant

Most customer-specific and staff endpoints require a bearer token. Send it with `Authorization: Bearer <token>` after signing in.

## Production build

Build both applications before deployment:

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

Deploy the backend with its environment variables and MySQL connection available, then serve the contents of `frontend/dist`. Configure the frontend's API and image URLs for the deployed backend origin.
