import React from 'react'
import { Handle, Position } from 'reactflow'
import GroupNode from './groupnode.jsx'


function TaskNode({ data }) {
  return (
    <div className="node-card">
      <Handle type="target" position={Position.Top} />

      <div className="rf-node__title">{data?.label || 'Task'}</div>
      <div className="rf-node__subtitle">{data?.type}</div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes = { task: TaskNode, group: GroupNode }
export default nodeTypes
