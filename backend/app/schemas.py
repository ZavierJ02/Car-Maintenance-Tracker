from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
	email: EmailStr
	password: str


class VehicleCreate(BaseModel):
	make: str
	model: str
	year: int
	nickname: Optional[str] = None
	current_mileage: int


class MaintenanceRecordCreate(BaseModel):
	service_type: str
	service_date: date
	mileage: int
	cost: Optional[float] = None
	notes: Optional[str] = None


class UserLogin(BaseModel):
	email: EmailStr
	password: str

class Token(BaseModel):
	access_token: str
	token_type: str

class VehicleResponse(BaseModel):
	id: int
	make: str
	model: str
	year: int
	nickname: Optional[str] = None
	current_mileage: int

	class Config:
		from_attributes = True

class MaintenanceRecordResponse(BaseModel):
	id: int
	service_type: str
	service_date: date
	mileage: int
	cost: Optional[float] = None
	notes: Optional[str] = None

	class Config:
		from_attributes = True


class VehicleDetailResponse(BaseModel):
	id: int
	make: str
	model: str
	year: int
	nickname: Optional[str] = None
	current_mileage: int
	maintenance_records: list[MaintenanceRecordResponse] = Field(default_factory=list)

	class Config:
		from_attributes = True


class ServiceDueItem(BaseModel):
	service_type: str
	interval_miles: int
	last_service_mileage: Optional[int] = None
	miles_until_due: int
	status: str 

class ServiceDueResponse(BaseModel):
	vehicle_id: int
	current_mileage: int
	items: list[ServiceDueItem]
	