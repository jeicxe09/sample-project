import React from 'react'

export default function ContextMenu({ x, y, onGroup, onUngroup, onClose }) {
  if (x == null || y == null) return null

  return (
    <div
      className="context-menu"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
        minWidth: 160,
        zIndex: 1000,
        overflow: 'hidden',
      }}
      onMouseLeave={onClose}
    >
      <button className="context-item" onClick={onGroup}>➕ Group</button>
      <button className="context-item" onClick={onUngroup}>🔓 Ungroup</button>
    </div>
  )
}
