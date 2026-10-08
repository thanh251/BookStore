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
- A MySQL account that can create the `bookstore` database and its tables
- A Groq API key only if the chat assistant will be used

## Getting started

Run the setup commands from the repository root. Install dependencies for each application:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Copy the environment template, then replace every placeholder with local credentials. Keep `backend/.env` uncommitted.

```bash
cp backend/.env.example backend/.env
```

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

### Create the database schema

From the repository root, run the schema script with a MySQL account that can create databases and tables:

```bash
mysql -u root -p < backend/database/schema.sql
```

The script creates the `bookstore` database and the tables used by authentication, catalog, cart, wishlist, review, and order endpoints. It is safe to run again because each database object uses `IF NOT EXISTS`.

Confirm that the tables were created:

```bash
mysql -u root -p -D bookstore -e "SHOW TABLES;"
```

If the application uses a different database name, update both `DB_NAME` in `backend/.env` and the `CREATE DATABASE`/`USE` statements in `backend/database/schema.sql` before importing it.

### Check the database connection

Before starting the API, make sure MySQL is running and that the database and credentials match `backend/.env`. The connection settings are read from `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

On startup, the API checks the connection and logs `MySQL connected!` on success or `MySQL connection failed:` followed by the error. A successful connection confirms database access; use the schema import above before calling API endpoints.

### Start the applications

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

Deploy the backend with its environment variables and MySQL connection available, then serve the contents of `frontend/dist`. Configure the frontend's API and image URLs for the deployed backend original one.
