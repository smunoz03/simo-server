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

**Request**
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "Test User", "email": "test@example.com", "password": "password123" }' \
  -c cookies.txt
```

**Response**

```
HTTP/1.1 201 Created
Set-Cookie: faciliSIMO.sid=eyJh…; Path=/; HttpOnly; SameSite=Lax
Content-Type: application/json; charset=utf-8
Content-Length: 123

{"user":{"id":"...","name":"Test User","email":"test@example.com"}}
```

### Login

**Request**

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", "password": "password123" }' \
  -b cookies.txt \
  -c cookies.txt
```

**Response**

```bash
HTTP/1.1 200 OK
Set-Cookie: faciliSIMO.sid=eyJh…; Path=/; HttpOnly; SameSite=Lax
Content-Type: application/json; charset=utf-8
Content-Length: 98

{"user":{"id":"...","name":"Test User","email":"test@example.com"}}
```

### me

**Request**

```bash
curl -i http://localhost:3000/api/auth/me -b login_cookies.txt

```
**Response**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 199
ETag: W/"c7-L1SdAHSkd2gyk6k6E0ysPNsJQrI"
Date: Sun, 01 Jun 2025 02:18:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"user":{"_id":"683bb82939fac0e3c1cff2d0","name":"Test User","email":"test@example.com","isEmailConfirmed":true,"createdAt":"2025-06-01T02:17:13.710Z","updatedAt":"2025-06-01T02:18:00.829Z","__v":0}}
```

### Upload CV

**Request**

```bash
curl -i -X POST http://localhost:3000/api/auth/upload_cv -F "cv=@C:\Users\user\test_info\sample.pdf;type=application/pdf" -b login_cookies.txt
```
**Response**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 92
ETag: W/"5c-cESwgIfvJMGZUnBTWim+oeDUwok"
Date: Sun, 01 Jun 2025 02:43:37 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"CV subido correctamente.","cvFile":"uploads\\cvs\\683bb82939fac0e3c1cff2d0.pdf"}
```

## License

MIT License
