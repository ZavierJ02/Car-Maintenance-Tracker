from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Vehicle
from app.schemas import VehicleCreate, VehicleResponse

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
	vehicle_data: VehicleCreate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Vehicle:
	vehicle = Vehicle(
		user_id=current_user.id,
		make=vehicle_data.make,
		model=vehicle_data.model,
		year=vehicle_data.year,
		nickname=vehicle_data.nickname,
		current_mileage=vehicle_data.current_mileage,
	)
	db.add(vehicle)
	db.commit()
	db.refresh(vehicle)
	return vehicle


@router.get("", response_model=list[VehicleResponse])
def list_vehicles(
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> list[Vehicle]:
	return db.query(Vehicle).filter(Vehicle.user_id == current_user.id).all()


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
	vehicle_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Vehicle:
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


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
	vehicle_id: int,
	vehicle_data: VehicleCreate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
) -> Vehicle:
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

	vehicle.make = vehicle_data.make
	vehicle.model = vehicle_data.model
	vehicle.year = vehicle_data.year
	vehicle.nickname = vehicle_data.nickname
	vehicle.current_mileage = vehicle_data.current_mileage

	db.commit()
	db.refresh(vehicle)
	return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
	vehicle_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
): 
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
	db.delete(vehicle)
	db.commit()
	return None