// src/flow/GroupNode.jsx
import React from 'react'
import { Handle, Position } from 'reactflow'

export default function GroupNode({ data }) {
  return (
    <div
      style={{
        border: '2px dashed #999',
        borderRadius: 8,
        padding: 10,
        background: 'rgba(200, 200, 200, 0.2)',
        width: data.width || 300,
        height: data.height || 200,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.label || 'Group'}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Drag tasks here to group them
      </div>

      {/* Optional handles if you want to connect the group itself */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
