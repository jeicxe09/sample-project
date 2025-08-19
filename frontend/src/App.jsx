import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ name: '', type: '', source: '', destination: '' });
  const [showConfig, setShowConfig] = useState(null);

  const addTask = () => {
    if (!newTask.name || !newTask.type) return;
    setTasks([...tasks, { id: uuidv4(), ...newTask, rules: [] }]);
    setNewTask({ name: '', type: '', source: '', destination: '' });
  };

  const updateTaskRules = (taskId, rules) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, rules } : t));
  };

  const saveToBackend = async () => {
    await fetch('/api/tasks/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks)
    });
    alert('Saved to backend!');
  };

  return (
    <div className="container">
      <h1>Data Ingestion UI</h1>
      <div style={{ marginBottom: 20 }}>
        <input placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} />
        <select value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })}>
          <option value="">Select Task</option>
          <option value="load">Load</option>
          <option value="transform">Transform</option>
          <option value="scd">SCD</option>
        </select>
        <select value={newTask.source} onChange={e => setNewTask({ ...newTask, source: e.target.value })}>
          <option value="">Source</option>
          <option value="db">Database</option>
          <option value="file">File</option>
          <option value="txt">TXT</option>
        </select>
        <select value={newTask.destination} onChange={e => setNewTask({ ...newTask, destination: e.target.value })}>
          <option value="">Destination</option>
          <option value="db">Database</option>
          <option value="file">File</option>
          <option value="txt">TXT</option>
        </select>
        <button onClick={addTask}>Add</button>
        <button onClick={saveToBackend}>Save to Backend</button>
      </div>
      <table>
        <thead>
          <tr><th>Name</th><th>Type</th><th>Source</th><th>Destination</th><th>Configure</th></tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.name}</td>
              <td>{task.type}</td>
              <td>{task.source}</td>
              <td>{task.destination}</td>
              <td><button onClick={() => setShowConfig(task)}>Configure</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {showConfig && (
        <div style={{ border: '1px solid #ccc', marginTop: 20, padding: 20 }}>
          <h3>Configure Task: {showConfig.name}</h3>
          {showConfig.type === 'scd' && (
            <div>
              <label>SCD Type: </label>
              <select onChange={e => updateTaskRules(showConfig.id, [{ type: e.target.value }])}>
                <option value="">Select SCD Type</option>
                <option value="1">SCD Type 1 (Business Keys)</option>
                <option value="2">SCD Type 2 (Effective/Expiry/Flag)</option>
                <option value="3">SCD Type 3 (Current/Prev Column)</option>
              </select>
            </div>
          )}
          {showConfig.type === 'transform' && (
            <div>
              <p>Transform rules (map, cast, filter, lookup) can be defined here.</p>
            </div>
          )}
          <button onClick={() => setShowConfig(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
