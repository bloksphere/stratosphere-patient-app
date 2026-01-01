# API Documentation

## Base URL
- Development: `http://localhost:8000/api/v1`
- Production: `https://api.patient.stratosphere.com/api/v1`

## Authentication

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### POST /auth/register
Register a new patient account.

#### POST /auth/login
Login with email and password.

#### POST /auth/refresh
Refresh access token.

#### POST /auth/logout
Logout and revoke tokens.

## Health Data

#### GET /health/measurements
List health measurements with optional filters.

#### POST /health/measurements
Add a new health measurement.

#### GET /health/summary
Get health summary/dashboard data.

#### GET /health/trends
Get trend data for charts.

## Appointments

#### GET /appointments
List appointments.

#### POST /appointments
Request a new appointment.

#### GET /appointments/available-slots
Get available time slots.

## Messages

#### GET /messages
List message threads.

#### POST /messages
Send a new message to clinic.

## Medical Records

#### GET /records/medications
Get patient medications.

#### GET /records/documents
List medical documents.

## GDPR

#### GET /gdpr/consents
Get current consent status.

#### POST /gdpr/data-export
Request data export.

#### POST /gdpr/data-delete
Request account deletion.

See the OpenAPI documentation at `/docs` for complete API reference.
