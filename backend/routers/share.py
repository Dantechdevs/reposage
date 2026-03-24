from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from db.models import Explanation
from pydantic import BaseModel

router = APIRouter()


class ShareCreate(BaseModel):
    repo_url: str
    explanation: str
    owner: str
    repo: str
    stars: int = 0
    language: str = ""


@router.post("/share")
async def create_share(
    payload: ShareCreate,
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(
        select(Explanation).where(Explanation.repo_url == payload.repo_url)
    )
    record = existing.scalar_one_or_none()

    if record:
        record.explanation = payload.explanation
        record.view_count = 0
    else:
        record = Explanation(
            repo_url=payload.repo_url,
            owner=payload.owner,
            repo=payload.repo,
            explanation=payload.explanation,
            stars=payload.stars,
            language=payload.language,
        )
        db.add(record)

    await db.commit()
    await db.refresh(record)

    return {
        "share_id": record.share_id,
        "url": f"/share/{record.share_id}",
    }


@router.get("/share/{share_id}")
async def get_share(
    share_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Explanation).where(Explanation.share_id == share_id)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Share not found")

    record.view_count += 1
    await db.commit()

    return record.to_dict()