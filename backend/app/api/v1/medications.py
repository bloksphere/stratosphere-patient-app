"""Medications API routes."""
from typing import Optional, List
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User
from app.models.medication import PatientMedication, MedicationAdherence
from app.core.encryption import field_encryption
from app.schemas.medication import (
    MedicationCreate,
    MedicationUpdate,
    MedicationResponse,
    MedicationAdherenceCreate,
    MedicationAdherenceResponse,
    MedicationAdherenceSummary
)
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.api.deps import get_current_active_user

router = APIRouter()


@router.get("", response_model=List[MedicationResponse])
async def list_medications(
    active_only: bool = True,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List patient medications."""
    query = select(PatientMedication).where(
        PatientMedication.user_id == current_user.id
    )

    if active_only:
        query = query.where(PatientMedication.is_active == True)

    query = query.order_by(PatientMedication.medication_name)

    result = await db.execute(query)
    medications = result.scalars().all()

    return [
        MedicationResponse(
            id=m.id,
            medication_name=m.medication_name,
            dosage=m.dosage,
            frequency=m.frequency,
            instructions=field_encryption.decrypt_if_present(m.instructions_encrypted),
            started_at=m.started_at,
            ended_at=m.ended_at,
            is_active=m.is_active,
            reminder_enabled=m.reminder_enabled,
            reminder_times=m.reminder_times,
            synced_from_clinic=m.synced_from_clinic,
            created_at=m.created_at,
            updated_at=m.updated_at
        )
        for m in medications
    ]


@router.post("", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
async def add_medication(
    data: MedicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a new medication (self-managed)."""
    medication = PatientMedication(
        user_id=current_user.id,
        medication_name=data.medication_name,
        dosage=data.dosage,
        frequency=data.frequency,
        instructions_encrypted=field_encryption.encrypt_if_present(data.instructions),
        started_at=data.started_at,
        reminder_enabled=data.reminder_enabled,
        reminder_times=data.reminder_times,
        synced_from_clinic=False
    )

    db.add(medication)
    await db.commit()
    await db.refresh(medication)

    return MedicationResponse(
        id=medication.id,
        medication_name=medication.medication_name,
        dosage=medication.dosage,
        frequency=medication.frequency,
        instructions=data.instructions,
        started_at=medication.started_at,
        ended_at=medication.ended_at,
        is_active=medication.is_active,
        reminder_enabled=medication.reminder_enabled,
        reminder_times=medication.reminder_times,
        synced_from_clinic=medication.synced_from_clinic,
        created_at=medication.created_at,
        updated_at=medication.updated_at
    )


@router.get("/{medication_id}", response_model=MedicationResponse)
async def get_medication(
    medication_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific medication."""
    result = await db.execute(
        select(PatientMedication).where(
            PatientMedication.id == medication_id,
            PatientMedication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    return MedicationResponse(
        id=medication.id,
        medication_name=medication.medication_name,
        dosage=medication.dosage,
        frequency=medication.frequency,
        instructions=field_encryption.decrypt_if_present(medication.instructions_encrypted),
        started_at=medication.started_at,
        ended_at=medication.ended_at,
        is_active=medication.is_active,
        reminder_enabled=medication.reminder_enabled,
        reminder_times=medication.reminder_times,
        synced_from_clinic=medication.synced_from_clinic,
        created_at=medication.created_at,
        updated_at=medication.updated_at
    )


@router.put("/{medication_id}", response_model=MedicationResponse)
async def update_medication(
    medication_id: UUID,
    data: MedicationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a medication."""
    result = await db.execute(
        select(PatientMedication).where(
            PatientMedication.id == medication_id,
            PatientMedication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    if data.dosage is not None:
        medication.dosage = data.dosage
    if data.frequency is not None:
        medication.frequency = data.frequency
    if data.instructions is not None:
        medication.instructions_encrypted = field_encryption.encrypt(data.instructions)
    if data.ended_at is not None:
        medication.ended_at = data.ended_at
    if data.is_active is not None:
        medication.is_active = data.is_active
    if data.reminder_enabled is not None:
        medication.reminder_enabled = data.reminder_enabled
    if data.reminder_times is not None:
        medication.reminder_times = data.reminder_times

    medication.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(medication)

    return MedicationResponse(
        id=medication.id,
        medication_name=medication.medication_name,
        dosage=medication.dosage,
        frequency=medication.frequency,
        instructions=field_encryption.decrypt_if_present(medication.instructions_encrypted),
        started_at=medication.started_at,
        ended_at=medication.ended_at,
        is_active=medication.is_active,
        reminder_enabled=medication.reminder_enabled,
        reminder_times=medication.reminder_times,
        synced_from_clinic=medication.synced_from_clinic,
        created_at=medication.created_at,
        updated_at=medication.updated_at
    )


@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a self-managed medication."""
    result = await db.execute(
        select(PatientMedication).where(
            PatientMedication.id == medication_id,
            PatientMedication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    if medication.synced_from_clinic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete clinic-prescribed medications"
        )

    await db.delete(medication)
    await db.commit()


@router.post("/{medication_id}/taken", response_model=MedicationAdherenceResponse)
async def log_medication_taken(
    medication_id: UUID,
    data: MedicationAdherenceCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Log that a medication was taken."""
    result = await db.execute(
        select(PatientMedication).where(
            PatientMedication.id == medication_id,
            PatientMedication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    adherence = MedicationAdherence(
        medication_id=medication_id,
        scheduled_at=data.taken_at or datetime.now(timezone.utc),
        taken_at=data.taken_at or datetime.now(timezone.utc),
        skipped=False
    )

    db.add(adherence)
    await db.commit()
    await db.refresh(adherence)

    return MedicationAdherenceResponse(
        id=adherence.id,
        medication_id=adherence.medication_id,
        scheduled_at=adherence.scheduled_at,
        taken_at=adherence.taken_at,
        skipped=adherence.skipped,
        skip_reason=adherence.skip_reason,
        created_at=adherence.created_at
    )


@router.post("/{medication_id}/skipped", response_model=MedicationAdherenceResponse)
async def log_medication_skipped(
    medication_id: UUID,
    data: MedicationAdherenceCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Log that a medication was skipped."""
    result = await db.execute(
        select(PatientMedication).where(
            PatientMedication.id == medication_id,
            PatientMedication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    adherence = MedicationAdherence(
        medication_id=medication_id,
        scheduled_at=datetime.now(timezone.utc),
        skipped=True,
        skip_reason=data.skip_reason
    )

    db.add(adherence)
    await db.commit()
    await db.refresh(adherence)

    return MedicationAdherenceResponse(
        id=adherence.id,
        medication_id=adherence.medication_id,
        scheduled_at=adherence.scheduled_at,
        taken_at=adherence.taken_at,
        skipped=adherence.skipped,
        skip_reason=adherence.skip_reason,
        created_at=adherence.created_at
    )


@router.get("/{medication_id}/adherence", response_model=MedicationAdherenceSummary)
async def get_medication_adherence(
    medication_id: UUID,
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get medication adherence summary."""
    result = await db.execute(
        select(PatientMedication).where(
            PatientMedication.id == medication_id,
            PatientMedication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    # Get adherence logs
    from datetime import timedelta
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(MedicationAdherence).where(
            MedicationAdherence.medication_id == medication_id,
            MedicationAdherence.scheduled_at >= start_date
        )
    )
    logs = result.scalars().all()

    total_doses = len(logs)
    taken_doses = sum(1 for log in logs if log.taken_at and not log.skipped)
    skipped_doses = sum(1 for log in logs if log.skipped)
    missed_doses = total_doses - taken_doses - skipped_doses

    adherence_rate = (taken_doses / total_doses * 100) if total_doses > 0 else 0

    return MedicationAdherenceSummary(
        medication_id=medication_id,
        medication_name=medication.medication_name,
        total_doses=total_doses,
        taken_doses=taken_doses,
        skipped_doses=skipped_doses,
        missed_doses=missed_doses,
        adherence_rate=round(adherence_rate, 1)
    )
