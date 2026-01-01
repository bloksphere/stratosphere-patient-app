from fastapi import APIRouter, Query
from uuid import UUID

router = APIRouter()


@router.get("/medications")
async def get_medications():
    """Get patient medications list"""
    return {"medications": []}


@router.get("/conditions")
async def get_conditions():
    """Get patient conditions from clinic"""
    return {"conditions": []}


@router.get("/documents")
async def list_documents(
    document_type: str | None = None,
    limit: int = Query(default=20, le=100),
):
    """List medical documents"""
    return {"documents": [], "total": 0}


@router.get("/documents/{document_id}")
async def get_document(document_id: UUID):
    """Download/view document"""
    return {"id": document_id, "download_url": ""}


@router.get("/allergies")
async def get_allergies():
    """Get patient allergies"""
    return {"allergies": []}


@router.get("/recommendations")
async def get_recommendations():
    """Get clinic recommendations for patient"""
    return {"recommendations": []}
