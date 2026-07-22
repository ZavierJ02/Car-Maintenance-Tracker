import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import Base, engine
from app.routes import auth, maintenance, vehicles

from dotenv import load_dotenv

load_dotenv()



Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Car Maintenance Tracker API",
    description="An API for tracking car maintenance activities",
    version="1.0.0"
)

default_origins = (
    "http://localhost:5173",
    "http://127.0.0.1:5173"
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        default_origins
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(maintenance.router)

@app.get("/")
def read_root():
    return {"message": "Car Maintenance Tracker API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}