from fastapi import APIRouter
router = APIRouter()

@router.get("/share/{share_id}")
async def get_share(share_id: str):
    return {"message": "Share endpoint — coming in Day 3"}

@router.post("/share")
async def create_share():
    return {"message": "Share endpoint — coming in Day 3"}