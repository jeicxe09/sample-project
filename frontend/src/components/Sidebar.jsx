import React from 'react'
import { TASK_TYPES } from '../flow/schemas'

const onDragStart = (event, taskType) => {
  // Keep sending an object with { type, label } to match App.jsx's onDrop parser
  event.dataTransfer.setData('application/reactflow', JSON.stringify(taskType))
  event.dataTransfer.effectAllowed = 'move'
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Modules</h2>

      {TASK_TYPES.map((t) => (
        <div
          key={t.type}
          className="task-item"
          draggable
          onDragStart={(e) => onDragStart(e, t)}
          title={`Drag ${t.label} onto the canvas`}
        >
          <div style={{ fontWeight: 700, textAlign: 'center' }}>{t.label}</div>
          <div style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>{t.type}</div>
        </div>
      ))}

      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
        {/* Tip: Drag a module onto the canvas, then right-click a node to configure fields. */}
      </div>
    </aside>
  )
}
