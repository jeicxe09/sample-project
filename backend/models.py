from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Float, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base


class Workflow(Base):
__tablename__ = 'workflows'
id = Column(Integer, primary_key=True, index=True)
name = Column(String, unique=True, nullable=False)
created_at = Column(DateTime(timezone=True), server_default=func.now())


nodes = relationship('Node', cascade='all, delete-orphan', back_populates='workflow')
edges = relationship('Edge', cascade='all, delete-orphan', back_populates='workflow')


class Node(Base):
__tablename__ = 'nodes'
id = Column(String, primary_key=True)
workflow_id = Column(Integer, ForeignKey('workflows.id', ondelete='CASCADE'), index=True)
type = Column(String, nullable=False)
label = Column(String, nullable=False)
x = Column(Float, nullable=False)
y = Column(Float, nullable=False)
config = Column(JSON, nullable=True)


workflow = relationship('Workflow', back_populates='nodes')


class Edge(Base):
__tablename__ = 'edges'
id = Column(String, primary_key=True)
workflow_id = Column(Integer, ForeignKey('workflows.id', ondelete='CASCADE'), index=True)
source = Column(String, nullable=False)
target = Column(String, nullable=False)
label = Column(String, nullable=True)
data = Column(JSON, nullable=True)


workflow = relationship('Workflow', back_populates='edges')