# Development Guide

## Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- Python 3.11+
- Docker

### Installation

1. Install frontend dependencies:
   ```bash
   pnpm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements-dev.txt
   ```

3. Start infrastructure:
   ```bash
   cd infrastructure/docker
   docker-compose up -d
   ```

## Code Style

### Frontend
- ESLint + Prettier
- Run `pnpm lint` to check
- Run `pnpm format` to format

### Backend
- Black + Ruff
- Run `black .` to format
- Run `ruff check .` to lint

## Testing

### Frontend
```bash
pnpm test
```

### Backend
```bash
cd backend
pytest
```

## Project Structure

### Monorepo (Turborepo)
- `apps/web` - Next.js web application
- `apps/mobile` - React Native mobile app
- `packages/*` - Shared packages

### Backend
- `app/api` - API routes
- `app/models` - SQLAlchemy models
- `app/schemas` - Pydantic schemas
- `app/services` - Business logic
- `app/core` - Core utilities

## Database

### Migrations
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- Database connection
- Redis connection
- JWT secrets
- AWS credentials (optional)
