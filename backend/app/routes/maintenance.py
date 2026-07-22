from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import MaintenanceRecord, User, Vehicle
from app.schemas import (
    MaintenanceRecordCreate,
    MaintenanceRecordResponse,
    ServiceDueItem,
    ServiceDueResponse,
)

router = APIRouter(prefix="/vehicles",tags=["maintenance"])

SERVICE_INTERVALS = {
    "Oil Change": 5000,
    "Tire Rotation": 7500,
    "Air Filter": 15000,
    "Brake Inspection": 12000,
}


def get_user_vehicle(
	vehicle_id: int,
	db: Session,
	current_user: User,
) -> Vehicle:
	"""Retrieve a vehicle by ID that belongs to the authenticated user.

	Raises HTTPException 404 if the vehicle does not exist or does not belong to the user.
	"""
	vehicle = (
		db.query(Vehicle)
		.filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id)
		.first()
	)
	if vehicle is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Vehicle not found",
		)
	return vehicle


@router.get(
	"/{vehicle_id}/maintenance",
	response_model=list[MaintenanceRecordResponse],
)
def list_maintenance_records(
	vehicle_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> list[MaintenanceRecord]:
	vehicle = get_user_vehicle(vehicle_id, db, current_user)
	return (
		db.query(MaintenanceRecord)
		.filter(MaintenanceRecord.vehicle_id == vehicle.id)
		.order_by(MaintenanceRecord.service_date.desc())
		.all()
	)


@router.post(
	"/{vehicle_id}/maintenance",
	response_model=MaintenanceRecordResponse,
	status_code=status.HTTP_201_CREATED,
)
def create_maintenance_record(
	vehicle_id: int,
	record_data: MaintenanceRecordCreate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> MaintenanceRecord:
	vehicle = get_user_vehicle(vehicle_id, db, current_user)
	record = MaintenanceRecord(
		vehicle_id=vehicle.id,
		service_type=record_data.service_type,
		service_date=record_data.service_date,
		mileage=record_data.mileage,
		cost=record_data.cost,
		notes=record_data.notes,
	)
	db.add(record)

	if record_data.mileage > vehicle.current_mileage:
		vehicle.current_mileage = record_data.mileage
	
	db.commit()
	db.refresh(record)
	return record


@router.get(
	"/{vehicle_id}/service-due",
	response_model=ServiceDueResponse,
)
def get_service_due(
	vehicle_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> dict:
	vehicle = get_user_vehicle(vehicle_id, db, current_user)

	records = (
		db.query(MaintenanceRecord)
		.filter(MaintenanceRecord.vehicle_id == vehicle.id)
		.all()
	)

	# Build a map of service_type -> max mileage at which it was performed
	last_service: dict[str, int] = {}
	for rec in records:
		if rec.service_type in SERVICE_INTERVALS:
			prev = last_service.get(rec.service_type)
			if prev is None or rec.mileage > prev:
				last_service[rec.service_type] = rec.mileage

	items: list[ServiceDueItem] = []

	for service_type, interval in SERVICE_INTERVALS.items():
		last_mileage = last_service.get(service_type)

		if last_mileage is None:
			# Service was never performed; due at `interval` total miles
			miles_until_due = interval - vehicle.current_mileage
		else:
			# Next due is last_mileage + interval
			miles_until_due = (last_mileage + interval) - vehicle.current_mileage

		if miles_until_due < 0:
			status = "overdue"
		elif miles_until_due <= 1000:
			status = "due_soon"
		else:
			status = "ok"

		items.append(
			ServiceDueItem(
				service_type=service_type,
				interval_miles=interval,
				last_service_mileage=last_mileage,
				miles_until_due=miles_until_due,
				status=status,
			)
		)

	return {
		"vehicle_id": vehicle.id,
		"current_mileage": vehicle.current_mileage,
		"items": items,
	}

@router.delete(
	"/{vehicle_id}/maintenance/{record_id}",
	status_code=status.HTTP_204_NO_CONTENT,
)
def delete_maintenance_record(
	vehicle_id: int,
	record_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	vehicle = get_user_vehicle(vehicle_id, db, current_user)
	
	record = (
		db.query(MaintenanceRecord)
		.filter(
			MaintenanceRecord.id == record_id,
			MaintenanceRecord.vehicle_id == vehicle.id,
		)
		.first()
	)
	if record is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Maintenance record not found",
		)
	db.delete(record)
	db.commit()
	return None

@router.put(
    "/{vehicle_id}/maintenance/{record_id}",
    response_model=MaintenanceRecordResponse,
)
def update_maintenance_record(
    vehicle_id: int,
    record_id: int,
    record_data: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MaintenanceRecord:
    vehicle = get_user_vehicle(vehicle_id, db, current_user)

    record = (
        db.query(MaintenanceRecord)
        .filter(
            MaintenanceRecord.id == record_id,
            MaintenanceRecord.vehicle_id == vehicle.id,
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found",
        )

    record.service_type = record_data.service_type
    record.service_date = record_data.service_date
    record.mileage = record_data.mileage
    record.cost = record_data.cost
    record.notes = record_data.notes

    db.commit()
    db.refresh(record)
    return record