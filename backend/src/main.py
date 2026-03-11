#from fastapi import FastAPI
#from fastapi.middleware.cors import CORSMiddleware
import os

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import StringIO
#from backend.src.backtests1 import getBack
from src.backtests1 import getBack

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


@app.post("/backtest")
async def max_open(file: UploadFile = File(...)):
    contents = await file.read()
    csv_text = contents.decode("utf-8")
    #df = pd.read_csv(StringIO(csv_text), sep="\t")

    df = pd.read_csv(StringIO(csv_text), sep=None, engine="python")
    df.columns = df.columns.str.strip()


    try:
        val = getBack(df)
        return {"getBack": val}
    except ValueError as e:
        return {"error": str(e)}
    