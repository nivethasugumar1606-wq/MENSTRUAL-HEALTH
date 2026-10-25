# Nurtura API Documentation

## Overview
The Nurtura backend API is a RESTful service built with Node.js, Express, TypeScript, and Prisma. It enforces strict server-side ownership checks, parameter validation, rate limiting, and password encryption via bcrypt.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Authentication**: Bearer Token in `Authorization` header (`Authorization: Bearer <jwt_token>`)
- **Default Port**: 5000

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a private account for a minor without collecting identifying personal data.
- **Request Body**:
  ```json
  {
    "username": "flowergirl21",
    "password": "secretpassword",
    "nickname": "Maya",
    "ageBand": "13-14",
    "periodStatus": "started_recently"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Welcome to Nurtura! Your private account has been created.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "uuid-here",
        "username": "flowergirl21",
        "nickname": "Maya",
        "ageBand": "13-14",
        "periodStatus": "started_recently",
        "createdAt": "2026-10-24T05:00:00.000Z"
      }
    }
  }
  ```

### `POST /api/auth/login`
Authenticates existing account and generates session JWT token.
- **Request Body**:
  ```json
  {
    "username": "flowergirl21",
    "password": "secretpassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Signed in successfully! Welcome back.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": { ... }
    }
  }
  ```

### `GET /api/auth/me`
Fetches currently authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "username": "flowergirl21",
      "nickname": "Maya",
      "ageBand": "13-14",
      "periodStatus": "started_recently",
      "createdAt": "..."
    }
  }
  ```

### `PATCH /api/auth/profile`
Updates nickname, ageBand, or periodStatus.
- **Request Body**:
  ```json
  {
    "nickname": "NewNickname",
    "ageBand": "15-16",
    "periodStatus": "tracking_regularly"
  }
  ```

### `GET /api/auth/export`
Exports the user's entire data in a clean portable JSON format.
- **Response (200 OK)**: Contains user profile, period records, journal entries, completed lessons, and earned badges.

### `DELETE /api/auth/account`
Permanently deletes user account and cascade-removes all personal period, journal, quiz, and badge records.

---

## 2. Period Tracker Endpoints (`/api/periods`)
All period endpoints require `Authorization: Bearer <token>`.

### `GET /api/periods`
Retrieves all recorded periods sorted descending by date, plus calculated cycle statistics.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "periods": [
        {
          "id": "uuid",
          "startDate": "2026-10-01",
          "endDate": "2026-10-06",
          "flow": "medium",
          "symptoms": ["mild cramps"],
          "mood": "calm",
          "energy": "medium",
          "notes": "Rested and drank herbal tea"
        }
      ],
      "stats": {
        "hasSufficientData": true,
        "totalRecordedPeriods": 2,
        "averageCycleLength": 29,
        "averagePeriodDuration": 5,
        "lastPeriodStartDate": "2026-10-01",
        "estimatedNextPeriodStart": "2026-10-30",
        "estimatedNextPeriodEnd": "2026-11-04",
        "currentCycleDay": 24,
        "isIrregular": false,
        "explanation": "Based on your 2 previous cycle intervals..."
      }
    }
  }
  ```

### `POST /api/periods`
Logs a new period record.
- **Request Body**:
  ```json
  {
    "startDate": "2026-10-24",
    "endDate": null,
    "flow": "medium",
    "symptoms": ["mild cramps", "headache"],
    "mood": "sensitive",
    "energy": "low",
    "notes": "First day of period"
  }
  ```

### `PUT /api/periods/:id`
Updates an existing period record (e.g. adding end date when bleeding finishes). Validates ownership server-side.

### `DELETE /api/periods/:id`
Deletes an entry with confirmation. Validates ownership server-side.

---

## 3. Body Journal Endpoints (`/api/journal`)
All journal endpoints require `Authorization: Bearer <token>`.

### `GET /api/journal`
Retrieves all private journal entries for the user.

### `POST /api/journal`
Upserts a journal entry for a given date (`date` is unique per user).
- **Request Body**:
  ```json
  {
    "date": "2026-10-24",
    "mood": "happy",
    "energy": "high",
    "cramps": "none",
    "symptoms": ["clear discharge"],
    "notes": "Great day with friends at school!"
  }
  ```

### `DELETE /api/journal/:id`
Deletes an entry. Validates ownership server-side.

---

## 4. Learning & Gamification (`/api/learning`)
All learning endpoints require `Authorization: Bearer <token>`.

### `GET /api/learning/progress`
Returns total points, completed lesson IDs, recent quiz attempts, and earned badges.

### `POST /api/learning/complete-lesson`
Marks a lesson as completed and awards points. Automatically checks for milestone badges.

### `POST /api/learning/quiz-attempt`
Records score and question count for Myth-or-Fact or Quick Quizzes. Automatically unlocks badges like "Myth Buster".
