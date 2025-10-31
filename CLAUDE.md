# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FaciliSIMO is a Node.js/Express backend for job matching that uses AI (Google Gemini) to compare user CVs against job descriptions. The system handles user authentication with email confirmation, CV uploads with PDF text extraction, and automated weekly job matching.

## Development Commands

### Starting the Server
```bash
npm install              # Install dependencies
npm run dev             # Start with nodemon (auto-reload)
npm start               # Production mode
```

### Running Tests
Tests use Jest testing framework:
```bash
npm test                      # Run all tests with coverage
npm run test:watch           # Run tests in watch mode
npm run test:unit            # Run only unit tests
```

## Architecture

### Layered Architecture
The codebase follows a clean architecture pattern with clear separation of concerns:

**Routes → Controllers → Services → Models**

- **Routes** (`src/routes/`): Define API endpoints and apply middleware (validation, auth)
- **Controllers** (`src/controllers/`): Handle HTTP request/response, call services
- **Services** (`src/services/`): Contain business logic, interact with models
- **Models** (`src/models/`): Define Mongoose schemas and database interactions

**Key principle**: Controllers are thin and delegate to services. Services contain all business logic and can be tested independently.

### Entry Points & Flow
- **server.js**: Main entry point that:
  - Connects to MongoDB
  - Schedules the weekly CV/job comparison job (if enabled via env)
  - Starts HTTP server with Express app
- **src/app.js**: Express application setup with:
  - Session middleware (stored in MongoDB via connect-mongo)
  - Static file serving (`public/` and `uploads/`)
  - Route mounting and error handlers

### Authentication System
Cookie-based sessions (NOT JWT). Key behaviors:
- Sessions stored in MongoDB with cookie name `faciliSIMO.sid`
- Users must confirm email via token before login (check `isEmailConfirmed`)
- Session userId set at registration/login in `req.session.userId`
- Protected routes use `src/middleware/auth.js` to verify session
- Business logic in `src/services/authService.js`:
  - `registerUser()`: Creates user, hashes password, sends confirmation email
  - `loginUser()`: Validates credentials and email confirmation
  - `confirmEmail()`: Validates token and marks email as confirmed
  - `getUserById()`: Fetches user details (used by protected routes)

### CV Processing Pipeline
1. User uploads PDF via `/api/auth/upload_cv` (requires auth)
2. Flow: Controller → `cvService.uploadUserCV()` → PDF extraction → Model update
3. `src/services/cvService.js` handles:
   - File validation (type, size via constants)
   - Deleting old CV if exists
   - Extracting text via `pdfExtractor.js`
   - Validating extracted text is not empty
   - Updating User model with file path and extracted text
4. `src/utils/pdfExtractor.js` extracts text with `pdf-parse`:
   - Text cleaning: removes newlines, collapses whitespace, handles hyphenation
   - Writes JSON file alongside PDF for debugging
5. Original PDF stored at `uploads/cvs/{userHash}-{uniqueHash}.pdf`

### Job Matching System

**Service Layer** (`src/services/jobService.js`):
- `compareCVWithJob()`: Compares single CV against single job using Gemini
- `findMatchingJobsForUser()`: Finds all jobs matching a user's CV (used by API endpoint)
- `compareAllUsersWithAllJobs()`: Batch comparison for weekly job
- Match threshold: score >= 70 (from `constants.js`)

**API Endpoint** (`GET /api/jobs/matches`):
- Authenticated users can get their matching jobs
- Returns sorted array of matches with scores and reasons

**Weekly scheduled job** (`src/jobs/weeklyCvJobCompare.js`):
- Runs every Monday at 03:00 by default (configurable via constants)
- Must set `ENABLE_WEEKLY_CV_JOB_COMPARE=true` in .env to activate
- Delegates to `jobService.compareAllUsersWithAllJobs()`
- Returns detailed statistics: total users, jobs, comparisons, matches
- Currently logs matches; extend to persist results or send notifications

### Google Gemini Integration
Located in `src/utils/geminiHelper.js`:
- Uses `@google/genai` SDK with model from `GEMINI_MODEL_NAME` env var (default: gemini-2.5-flash)
- `compareWithChat()` function sends structured prompt requesting JSON response with:
  - `canApply`: boolean
  - `score`: 0-100
  - `reasons`: array of match/mismatch explanations
- Prompts are in Spanish for HR domain

### Data Models
**User** (src/models/userModel.js):
- Email confirmation flow: `confirmationToken`, `confirmationTokenExpires`, `isEmailConfirmed`
- CV storage: `cvFile` (relative path), `cvExtractedText` (processed string)
- Passwords hashed with bcryptjs (salt rounds: 12)

**Job** (src/models/jobModel.js):
- `id_simo`: External job ID
- `descripcion`: Raw job description text
- `jdExtractedJson`: Structured JSON of job requirements (used for matching)

## Environment Configuration

Required .env variables (see .env.example):
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/facilisimo
GOOGLE_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL_NAME=gemini-2.5-flash
SESSION_SECRET=your_strong_session_secret
BASE_URL=http://localhost:3000
ENABLE_WEEKLY_CV_JOB_COMPARE=false  # Set to true to enable scheduled job
```

## File Upload Handling
- Multer configured in `src/middleware/upload.js`
- CVs uploaded to `uploads/cvs/` directory
- Old CV files deleted when user uploads new one (see `authController.uploadCv`)

## Error Handling

### Custom Error Classes
Located in `src/utils/errors.js`:
- `AppError`: Base class with statusCode, code, and isOperational flag
- Specific error types: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `InternalServerError`
- All errors include error codes for client-side identification

### Error Middleware
In `src/middleware/errorHandler.js`:
- `handleValidationErrors`: Processes express-validator errors into ValidationError
- `errorHandler`: Global error handler that:
  - Handles operational errors (expected errors thrown by services)
  - Handles Mongoose errors (validation, duplicate keys, cast errors)
  - Formats all errors with consistent structure: `{ success: false, error: { code, message, details } }`
  - Logs unexpected errors and hides stack traces in production
- `notFound`: 404 handler for undefined routes

### Error Response Format
All error responses follow this structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [] // Optional validation details
  }
}
```

## Configuration Management

### Constants
All magic values extracted to `src/config/constants.js`:
- Authentication: bcrypt salt rounds, token expiry times
- Session: cookie name, max age
- File upload: max size, allowed types, upload paths
- Job matching: score threshold, schedule defaults
- Validation: min/max lengths for fields

### Response Formatting
Standardized responses via `src/utils/responseFormatter.js`:
- `sendSuccess()`: Generic success response
- `sendOk()`: 200 OK with data
- `sendCreated()`: 201 Created with data
- `sendNoContent()`: 204 No Content

All success responses follow: `{ success: true, message?, data? }`

## Validation

### Request Validation
Using `express-validator` with improved rules in `src/middleware/validators.js`:
- `registerValidation`: Name, email, password with strength requirements
- `loginValidation`: Email and password format
- Password requirements: min 8 chars, must have uppercase, lowercase, and number
- Name requirements: letters and spaces only, max 100 chars
- Email: regex validation + normalization

### Validation Flow
Routes → Validators → `handleValidationErrors` middleware → Controller

If validation fails, throws `ValidationError` with detailed field-level errors
