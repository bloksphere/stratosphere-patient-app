# Stratosphere Patient App

A GDPR-compliant patient-facing application for the Stratosphere EMR BD clinic system. Enables patients to view health data, upload measurements, communicate with their clinic, book appointments, and access medical records.

## Features

- **Health Tracking**: Log blood pressure, glucose, weight, and symptoms
- **Appointments**: Book and manage clinic appointments
- **Secure Messaging**: Encrypted communication with healthcare providers
- **Medical Records**: Access prescriptions, test results, and documents
- **Medication Management**: Track medications with reminders
- **GDPR Compliance**: Full consent management and data export/deletion

## Project Structure

```
stratosphere-patient-app/
├── apps/
│   ├── mobile/          # React Native mobile app (iOS/Android)
│   └── web/             # Next.js web application
├── packages/
│   ├── api-client/      # Shared API client
│   ├── shared-ui/       # Shared UI components
│   ├── types/           # TypeScript types
│   └── validation/      # Zod validation schemas
├── backend/             # FastAPI backend
├── infrastructure/      # Docker & Terraform configs
└── docs/                # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/bloksphere/stratosphere-patient-app.git
   cd stratosphere-patient-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start infrastructure**
   ```bash
   cd infrastructure/docker
   docker-compose up -d
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run database migrations**
   ```bash
   cd backend
   alembic upgrade head
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn app.main:app --reload

   # Terminal 2: Web app
   pnpm --filter @stratosphere/web dev

   # Terminal 3: Mobile app
   pnpm --filter @stratosphere/mobile start
   ```

## Development

### Web Application
- URL: http://localhost:3000
- Built with Next.js 14, Tailwind CSS

### Mobile Application
- Built with React Native 0.73
- Run `npx react-native run-ios` or `npx react-native run-android`

### Backend API
- URL: http://localhost:8000
- Docs: http://localhost:8000/docs
- Built with FastAPI, SQLAlchemy, PostgreSQL

## Technology Stack

### Frontend
- React Native 0.73 (Mobile)
- Next.js 14 (Web)
- TypeScript 5
- Tailwind CSS
- Zustand (State Management)
- React Hook Form + Zod

### Backend
- FastAPI 0.110+
- SQLAlchemy 2.x
- PostgreSQL 16
- Redis 7
- Celery (Background Tasks)

### Infrastructure
- AWS (ECS, RDS, S3, CloudFront)
- Docker
- Terraform

## Security

- JWT authentication with refresh tokens
- Field-level encryption for PII
- MFA support (TOTP)
- Biometric authentication
- GDPR-compliant audit logging
- Rate limiting and WAF

## License

MIT License - See [LICENSE](LICENSE) for details.
