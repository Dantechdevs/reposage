from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

load_dotenv()

from routers import explain, chat, share


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 RepoSage backend starting...")
    yield
    print("👋 RepoSage backend shutting down...")


app = FastAPI(
    title="RepoSage API",
    description="Understand any GitHub repository instantly",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(explain.router, prefix="/api", tags=["explain"])
app.include_router(chat.router,    prefix="/api", tags=["chat"])
app.include_router(share.router,   prefix="/api", tags=["share"])


@app.get("/")
async def root():
    return {
        "name": "RepoSage API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}