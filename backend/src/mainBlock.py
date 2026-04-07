from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BlocklyRequest(BaseModel):
    workspace: Dict[str, Any]

def find_print_text(block: Dict[str, Any], found: List[str]):
    if not isinstance(block, dict):
        return

    block_type = block.get("type")

    if block_type == "text_print":
        inputs = block.get("inputs", {})
        text_input = inputs.get("TEXT", {})
        connected_block = text_input.get("block", {})

        if connected_block.get("type") == "text":
            fields = connected_block.get("fields", {})
            text_value = fields.get("TEXT", "")
            if text_value:
                found.append(text_value)

    for input_data in block.get("inputs", {}).values():
        child = input_data.get("block")
        if child:
            find_print_text(child, found)

    next_block = block.get("next", {}).get("block")
    if next_block:
        find_print_text(next_block, found)

@app.post("/process-blocks")
def process_blocks(data: BlocklyRequest):
    found_texts = []

    blocks_section = data.workspace.get("blocks", {})
    top_blocks = blocks_section.get("blocks", [])

    for block in top_blocks:
        find_print_text(block, found_texts)

    return {
        "message": "Blocks processed successfully",
        "printedTexts": found_texts
    }