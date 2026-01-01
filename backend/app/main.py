from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.v1 import auth, users, health, appointments, messages, records, gdpr

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Patient-facing API for Stratosphere EMR BD",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router, prefix=f"{settings.api_v1_prefix}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{settings.api_v1_prefix}/users", tags=["Users"])
app.include_router(health.router, prefix=f"{settings.api_v1_prefix}/health", tags=["Health"])
app.include_router(appointments.router, prefix=f"{settings.api_v1_prefix}/appointments", tags=["Appointments"])
app.include_router(messages.router, prefix=f"{settings.api_v1_prefix}/messages", tags=["Messages"])
app.include_router(records.router, prefix=f"{settings.api_v1_prefix}/records", tags=["Medical Records"])
app.include_router(gdpr.router, prefix=f"{settings.api_v1_prefix}/gdpr", tags=["GDPR"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.app_name}


@app.get("/")
async def root():
    return {
        "message": "Welcome to Stratosphere Patient API",
        "docs": "/docs" if settings.debug else "Disabled in production",
    }
