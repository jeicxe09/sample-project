import React, { useEffect, useState } from 'react'
import { TASK_TYPES, MODULE_SCHEMAS } from '../flow/schemas'

export default function NodeModal({ open, node, onClose, onSave }) {
  const [taskName, setTaskName] = useState('')
  const [sourceForm, setSourceForm] = useState({})
  const [destForm, setDestForm] = useState({})

  useEffect(() => {
    if (!node) return

    const fallbackLabel = TASK_TYPES.find(t => t.type === node.data.type)?.label || 'Task'
    setTaskName(node.data.label || fallbackLabel)

    const schema = MODULE_SCHEMAS[node.data.type] || { source: [], destination: [] }
    const existing = node.data.config || {}
    const existingSource = existing.source ?? {}
    const existingDest = existing.destination ?? {}

    const srcDefaults = {}
    for (const f of schema.source) srcDefaults[f.key] = existingSource[f.key] ?? ''

    const dstDefaults = {}
    for (const f of schema.destination) dstDefaults[f.key] = existingDest[f.key] ?? ''

    setSourceForm(srcDefaults)
    setDestForm(dstDefaults)
  }, [node])

  if (!open || !node) return null

  const schema = MODULE_SCHEMAS[node.data.type] || { source: [], destination: [] }
  const setSrc = (k, v) => setSourceForm(prev => ({ ...prev, [k]: v }))
  const setDst = (k, v) => setDestForm(prev => ({ ...prev, [k]: v }))

  const save = () => {
    onSave({
      ...node,
      data: {
        ...node.data,
        label: taskName?.trim() || node.data.label,
        config: { source: sourceForm, destination: destForm },
      },
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>Configure: {taskName || node.data.label}</header>

        {/* Task name */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, opacity: 0.8, display: 'block', marginBottom: 4 }}>
            Task Name
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter a descriptive name for this node"
          />
        </div>

        {/* --- Source Section --- */}
        {schema.source?.length > 0 && (
          <>
            <h4 className="section-title small">Source</h4>
            <div className="grid compact">
              {schema.source.map(field => (
                <div
                  key={field.key}
                  style={{ gridColumn: field.input === 'textarea' ? '1 / span 2' : 'auto' }}
                >
                  <label style={{ fontSize: 11, opacity: 0.75, display: 'block', marginBottom: 3 }}>
                    {field.label}
                  </label>

                  {field.input === 'select' ? (
                    <select
                      className="compact-input"
                      value={sourceForm[field.key]}
                      onChange={e => setSrc(field.key, e.target.value)}
                    >
                      <option value="">-- select --</option>
                      {(field.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.input === 'textarea' ? (
                    <textarea
                      className="compact-input"
                      rows={3}
                      value={sourceForm[field.key]}
                      onChange={e => setSrc(field.key, e.target.value)}
                    />
                  ) : (
                    <input
                      className="compact-input"
                      type={field.input === 'password' ? 'password' : 'text'}
                      value={sourceForm[field.key]}
                      onChange={e => setSrc(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- Destination Section --- */}
        {schema.destination?.length > 0 && (
          <>
            <h4 className="section-title small">Destination</h4>
            <div className="grid compact">
              {schema.destination.map(field => (
                <div
                  key={field.key}
                  style={{ gridColumn: field.input === 'textarea' ? '1 / span 2' : 'auto' }}
                >
                  <label style={{ fontSize: 11, opacity: 0.75, display: 'block', marginBottom: 3 }}>
                    {field.label}
                  </label>

                  {field.input === 'select' ? (
                    <select
                      className="compact-input"
                      value={destForm[field.key]}
                      onChange={e => setDst(field.key, e.target.value)}
                    >
                      <option value="">-- select --</option>
                      {(field.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.input === 'textarea' ? (
                    <textarea
                      className="compact-input"
                      rows={3}
                      value={destForm[field.key]}
                      onChange={e => setDst(field.key, e.target.value)}
                    />
                  ) : (
                    <input
                      className="compact-input"
                      type={field.input === 'password' ? 'password' : 'text'}
                      value={destForm[field.key]}
                      onChange={e => setDst(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <footer>
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={save}>Save</button>
        </footer>
      </div>
    </div>
  )
}
