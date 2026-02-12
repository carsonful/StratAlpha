from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from .api.routes import data, strategy, backtest, analysis
from .utils.helpers import init_db

load_dotenv()

app = FastAPI(
    title="Trading Backtest API",
    description="API for backtesting trading strategies",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(data.router, prefix="/api/data", tags=["data"])
app.include_router(strategy.router, prefix="/api/strategy", tags=["strategy"])
app.include_router(backtest.router, prefix="/api/backtest", tags=["backtest"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    await init_db()


@app.get("/")
async def root():
    return {"message": "Trading Backtest API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("DEBUG", "True") == "True"
    )
