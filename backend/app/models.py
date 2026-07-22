from datetime import date, datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	email = Column(String, unique=True, nullable=False, index=True)
	password_hash = Column(String, nullable=False)
	created_at = Column(DateTime (timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

	vehicles = relationship("Vehicle", back_populates="user", cascade="all, delete-orphan")


class Vehicle(Base):
	__tablename__ = "vehicles"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
	make = Column(String, nullable=False)
	model = Column(String, nullable=False)
	year = Column(Integer, nullable=False)
	nickname = Column(String, nullable=True)
	current_mileage = Column(Integer, nullable=False, default=0)
	created_at = Column(DateTime (timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

	user = relationship("User", back_populates="vehicles")
	maintenance_records = relationship(
		"MaintenanceRecord",
		back_populates="vehicle",
		cascade="all, delete-orphan",
	)


class MaintenanceRecord(Base):
	__tablename__ = "maintenance_records"

	id = Column(Integer, primary_key=True, index=True)
	vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
	service_type = Column(String, nullable=False)
	service_date = Column(Date, nullable=False, default=date.today)  # Note: date.today is a function, so we use date.today()
	mileage = Column(Integer, nullable=False)
	cost = Column(Numeric(10, 2), nullable=True)
	notes = Column(Text, nullable=True)

	vehicle = relationship("Vehicle", back_populates="maintenance_records")
