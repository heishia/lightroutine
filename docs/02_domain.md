# Domain Model

## Entities

### User
- id (UUID)
- email (unique)
- passwordHash
- nickname
- createdAt, updatedAt, deletedAt

### Routine
- id (UUID)
- userId (FK -> User)
- name (max 100 chars)
- category: HEALTH | EXERCISE | STUDY | LIFESTYLE | WORK | OTHER
- timeSlot: MORNING | AFTERNOON | EVENING
- color (hex)
- repeatDays (comma-separated: MON,TUE,WED...)
- sortOrder (integer)
- createdAt, updatedAt, deletedAt (soft delete)

### RoutineLog
- id (UUID)
- routineId (FK -> Routine)
- userId (FK -> User)
- logDate (date only)
- completed (boolean)
- createdAt
- Unique constraint: (routineId, logDate)

## Relationships
- User 1:N Routine
- Routine 1:N RoutineLog
- User 1:N RoutineLog
