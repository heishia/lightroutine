# API Reference

Base URL: `/api`

All endpoints except auth return `{ success: boolean, data: T }`.
Protected endpoints require `Authorization: Bearer <token>`.

## Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | /auth/register | email, password, nickname | user + tokens |
| POST | /auth/login | email, password | user + tokens |
| POST | /auth/refresh | refreshToken | tokens |
| POST | /auth/logout | - | null |

## Routines (protected)

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | /routines | name, category, timeSlot, color, repeatDays | routine |
| GET | /routines | - | routine[] |
| PATCH | /routines/:id | partial routine fields | routine |
| DELETE | /routines/:id | - | null |
| PATCH | /routines/reorder/batch | routineIds[] | null |

## Tracking (protected)

| Method | Path | Params | Response |
|--------|------|--------|----------|
| POST | /tracking/:routineId/toggle | - | log status |
| GET | /tracking | date=YYYY-MM-DD | daily tracking |

## Statistics (protected)

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | /statistics/today | - | today stats |
| GET | /statistics/weekly | - | weekly stats |
| GET | /statistics/monthly | year, month | monthly calendar data |
| GET | /statistics/streak | - | streak info |
