# FaciliSIMO

**FaciliSIMO** is a simple Node.js/Express backend for job registration and listing, featuring cookie-based authentication and session storage in MongoDB.

## Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- express-session & connect-mongo (cookie-based sessions)
- bcryptjs (password hashing)
- express-validator (input validation)
- dotenv (environment variables)

## Prerequisites

- **Node.js** (v14 or later) and **npm**
- **MongoDB** running locally or a connection URI (e.g., MongoDB Atlas)
- **Git** for cloning the repo

## Setup

1. **Clone the repository**

   ```bash
   git clone <REPO_URL>
   cd faciliSIMO
   ```

2. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/facilisimo
   SESSION_SECRET=your_strong_session_secret
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the server**

   ```bash
   npm run dev
   ```

   The server will run at `http://localhost:3000`.

## API Endpoints

### Register a new user

- **URL:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Success Response:**
  - **Code:** 201 Created  
  - **Response Body:**
    ```json
    {
      "user": {
        "id": "60d21baee1d3c073d45e5f1a",
        "name": "Test User",
        "email": "test@example.com"
      }
    }
    ```
- **Authentication:** Sets an HTTP-only session cookie.

### List jobs

- **URL:** `GET /api/jobs`
- **Headers:** Include the session cookie returned on registration.
- **Response Body:** Array of job objects.

### Create a job

- **URL:** `POST /api/jobs`
- **Body:** any job fields (e.g., `title`, `company`, `location`, `description`)
- **Authentication:** Requires session cookie.

## Testing with PowerShell

```powershell
# Register user
$body = @{
  name     = 'Test User'
  email    = 'test@example.com'
  password = 'password123'
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/api/auth/register `
  -Headers @{ 'Content-Type' = 'application/json' } `
  -Body $body `
  -SessionVariable session

# List jobs
Invoke-RestMethod -Method Get `
  -Uri http://localhost:3000/api/jobs `
  -WebSession $session
```

## Project Structure

```
faciliSIMO/
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   └── jobController.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── validators.js
    ├── models/
    │   ├── jobModel.js
    │   └── userModel.js
    └── routes/
        ├── authRoutes.js
        └── jobRoutes.js
```

## License

MIT License
