import React, { useCallback, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './xy-theme.css'

import Sidebar from './components/Sidebar.jsx'
import NodeModal from './components/NodeModal.jsx'
import Toast from './components/Toast.jsx'
import ContextMenu from './components/ContextMenu.jsx'
import nodeTypes from './flow/nodeTypes.jsx' 

const initialNodes = []
const initialEdges = []

let id = 1
const getId = () => `${id++}`

export default function App() {
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalNode, setModalNode] = useState(null)
  const [toast, setToast] = useState(null)

  const [ctx, setCtx] = useState({ x: null, y: null, node: null })

  const isValidConnection = useCallback(
    (connection) => connection.source !== connection.target,
    []
  )

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  )
  const onEdgeClick = useCallback((evt, edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id))
  }, [])

  const onEdgeContextMenu = useCallback((evt, edge) => {
    evt.preventDefault()
    setEdges((eds) => eds.filter((e) => e.id !== edge.id))
  }, [])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      if (!reactFlowWrapper.current) return

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }

      const raw = event.dataTransfer.getData('application/reactflow')
      if (!raw) return
      let taskType
      try {
        taskType = JSON.parse(raw)
      } catch {
        return
      }
      if (!taskType?.type) return

      const newNode = {
        id: getId(),
        type: 'task',
        position,
        data: {
          type: taskType.type,
          label: taskType.label || taskType.type,
          config: { source: {}, destination: {} }, // good default shape
        },
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes]
  )

  // RIGHT-CLICK on node -> show menu (no modal)
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault()
    setCtx({ x: event.clientX, y: event.clientY, node })
  }, [])

  // DOUBLE-CLICK on node -> open modal
  const onNodeDoubleClick = useCallback((event, node) => {
    event.preventDefault()
    setCtx({ x: null, y: null, node: null }) // ensure menu closed
    setModalNode(node)
    setModalOpen(true)
  }, [])

  // click on empty pane -> close menu
  const onPaneClick = useCallback(() => {
    setCtx({ x: null, y: null, node: null })
  }, [])

  const onSaveNodeConfig = (updatedNode) => {
    setNodes((nds) => nds.map((n) => (n.id === updatedNode.id ? updatedNode : n)))
    setModalOpen(false)
    setModalNode(null)
    setToast({ message: 'Node updated', type: 'success' })
  }

  // GROUP the selected node (wrap with a group node and reparent)
  const handleGroup = useCallback(() => {
    if (!ctx.node) return
    const node = ctx.node
    const padding = 40

    const group = {
      id: getId(),
      type: 'group',
      position: { x: node.position.x - padding, y: node.position.y - padding },
      data: { label: 'Group', width: 360, height: 220 },
    }

    setNodes((nds) =>
      nds
        .concat(group)
        .map((n) =>
          n.id === node.id
            ? {
                ...n,
                parentNode: group.id,
                extent: 'parent',
                position: { x: padding, y: padding },
              }
            : n
        )
    )
    setCtx({ x: null, y: null, node: null })
  }, [ctx.node, setNodes])

  // UNGROUP the selected node
  const handleUngroup = useCallback(() => {
    if (!ctx.node) return
    const node = ctx.node
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id ? { ...n, parentNode: undefined, extent: undefined } : n
      )
    )
    setCtx({ x: null, y: null, node: null })
  }, [ctx.node, setNodes])

  const serialize = () => ({
    name: 'Data Ingestion Workflow',
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type, // keep actual node type (task/group)
      label: n.data?.label,
      position: n.position,
      parentNode: n.parentNode || null,
      extent: n.extent || undefined,
      config:
        n.data?.config && (n.data.config.source || n.data.config.destination)
          ? n.data.config
          : { source: {}, destination: {} },
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || null,
    })),
  })

  const save = async () => {
    try {
      const payload = serialize()
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      setToast({ message: 'Workflow saved!', type: 'success' })
    } catch (err) {
      console.error(err)
      setToast({ message: 'Save failed. Check console for details.', type: 'error' })
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="brand">
          <div className="logo-box" aria-label="Logo placeholder">🐝</div>
          <div className="titles">
            <div className="title">Data Ingestion Tool</div>
            <div className="subtitle">Design • Connect • Configure</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save}>Save to Backend</button>
        </div>
      </div>

      {/* Main: Modules + Canvas */}
      <div className="main">
        <Sidebar />
        <div className="canvas" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onPaneClick={onPaneClick}
            onNodeContextMenu={onNodeContextMenu}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeClick={onEdgeClick}                 // ← click to delete
            //onEdgeContextMenu={onEdgeContextMenu}     // ← right-click to delete
            deleteKeyCode={['Delete', 'Backspace']}   // ← keyboard delete
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
          >
            <Background className="flow-background" variant="dots" />
            <Controls />
          </ReactFlow>

          {/* Node config modal */}
          <NodeModal
            open={modalOpen}
            node={modalNode}
            onClose={() => setModalOpen(false)}
            onSave={onSaveNodeConfig}
          />

          {/* Context menu for node actions */}
          <ContextMenu
            x={ctx.x}
            y={ctx.y}
            onGroup={handleGroup}
            onUngroup={handleUngroup}
            onClose={() => setCtx({ x: null, y: null, node: null })}
          />

          {/* Optional toast */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
