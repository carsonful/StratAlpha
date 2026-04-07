#from fastapi import FastAPI
#from fastapi.middleware.cors import CORSMiddleware
import os

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List
import pandas as pd
from io import StringIO
from backtests1 import getBack

app = FastAPI(
    title="Fight Club API",
    version="1.0.0"
)

# Allow the frontend to make requests to this backend (required when they run on different ports)
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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


class BlocklyRequest(BaseModel):
    workspace: Dict[str, Any]

def _find_print_text(block: Dict[str, Any], found: List[str]) -> None:
    if not isinstance(block, dict):
        return
    if block.get("type") == "text_print":
        text_block = block.get("inputs", {}).get("TEXT", {}).get("block", {})
        if text_block.get("type") == "text":
            val = text_block.get("fields", {}).get("TEXT", "")
            if val:
                found.append(val)
    for input_data in block.get("inputs", {}).values():
        child = input_data.get("block")
        if child:
            _find_print_text(child, found)
    next_block = block.get("next", {}).get("block")
    if next_block:
        _find_print_text(next_block, found)

@app.post("/process-blocks")
def process_blocks(data: BlocklyRequest):
    found: List[str] = []
    for block in data.workspace.get("blocks", {}).get("blocks", []):
        _find_print_text(block, found)
    return {"message": "Blocks processed successfully", "printedTexts": found}


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
    