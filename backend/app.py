from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session


from .database import Base, engine, SessionLocal
from .models import Workflow, Node, Edge


# Create tables (simple auto-setup for demo)
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Workflow API")


app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)


# DB dependency


def get_db():
db = SessionLocal()
try:
yield db
finally:
db.close()


# ---- Pydantic Schemas ----
class NodeIn(BaseModel):
id: str
type: str
label: str
position: dict
config: Optional[dict] = None


class EdgeIn(BaseModel):
id: Optional[str] = None
source: str
target: str
label: Optional[str] = None


class WorkflowIn(BaseModel):
name: str = Field(..., min_length=1)
nodes: List[NodeIn] = []
edges: List[EdgeIn] = []


class WorkflowOut(BaseModel):
id: int
name: str
nodes: List[NodeIn]
edges: List[EdgeIn]


class Config:
orm_mode = True


# ---- Routes ----
@app.get('/api/health')
async def health():
return {"status": "ok"}
return WorkflowOut(id=w.id, name=w.name, nodes=nodes, edges=edges)