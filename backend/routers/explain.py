from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.explainer import stream_explanation, get_explanation
import json

router = APIRouter()


class ExplainRequest(BaseModel):
    repo_url: str
    stream: bool = True


@router.post("/explain")
async def explain(payload: ExplainRequest):
    if not payload.repo_url:
        raise HTTPException(status_code=400, detail="repo_url is required")

    try:
        if payload.stream:
            async def event_generator():
                async for chunk in stream_explanation(payload.repo_url):
                    yield f"data: {json.dumps({'text': chunk})}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                event_generator(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                },
            )
        else:
            result = await get_explanation(payload.repo_url)
            return {"explanation": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to explain repo: {str(e)}")