import os
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, Optional

from validator import validate_workspace
from translator import translate
from lean_runner import run_lean_backtest, LeanRunnerError
from result_parser import parse_results

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fight Club API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Fight Club API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


class BacktestConfig(BaseModel):
    resolution: str = "daily"
    startDate: str = "2020-01-01"
    endDate: str = "2024-12-31"
    initialCash: float = 100000
    maxPositions: int = 1


class BlocklyRequest(BaseModel):
    workspace: Dict[str, Any]
    config: Optional[BacktestConfig] = None


@app.post("/process-blocks")
def process_blocks(data: BlocklyRequest):
    config = data.config or BacktestConfig()
    config_dict = config.model_dump()

    errors, warnings = validate_workspace(data.workspace, config_dict)
    if errors:
        raise HTTPException(status_code=422, detail={
            "errors": errors,
            "warnings": warnings,
        })

    top_blocks = data.workspace.get("blocks", {}).get("blocks", [])
    root = next((b for b in top_blocks if b.get("type") == "strategy_root"), None)
    symbol = ""
    if root:
        symbol = (root.get("fields") or {}).get("SYMBOL", "").strip().upper()
    config_dict["symbol"] = symbol

    try:
        code = translate(data.workspace, config_dict)
    except Exception as e:
        logger.exception("Translation failed")
        raise HTTPException(status_code=400, detail={
            "errors": [f"Failed to translate strategy: {e}"],
            "warnings": warnings,
        })

    try:
        result_paths = run_lean_backtest(code)
    except LeanRunnerError as e:
        logger.error(f"LEAN runner error: {e}")
        raise HTTPException(status_code=500, detail={
            "errors": [str(e)],
            "warnings": warnings,
        })
    except Exception as e:
        logger.exception("Unexpected error running backtest")
        raise HTTPException(status_code=500, detail={
            "errors": [f"Unexpected error running backtest: {e}"],
            "warnings": warnings,
        })

    try:
        backtest_run = parse_results(result_paths, config_dict)
    except Exception as e:
        logger.exception("Failed to parse results")
        raise HTTPException(status_code=500, detail={
            "errors": [f"Backtest ran but failed to parse results: {e}"],
            "warnings": warnings,
        })

    if warnings:
        backtest_run["warnings"] = warnings

    return backtest_run


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True,
    )
