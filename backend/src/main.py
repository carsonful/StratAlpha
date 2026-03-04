from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Create the API app
app = FastAPI(
    title="Fight Club API",
    version="1.0.0"
)

# Allow the frontend to make requests to this backend (required when they run on different ports)
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Basic status check endpoints
@app.get("/")
async def root():
    return {"message": "Fight Club API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Start the server when this file is run directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True
    )
