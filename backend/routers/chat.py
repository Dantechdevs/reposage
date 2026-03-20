from fastapi import APIRouter
router = APIRouter()

@router.post("/chat")
async def chat():
    return {"message": "Chat endpoint — coming in Day 4"}