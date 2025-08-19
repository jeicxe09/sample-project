import React from 'react';
import './styles.css';

// catalogs
const TASK_TYPES = [
  { id: 'file-to-db', label: 'File → Database' },
  { id: 'db-to-db', label: 'Database → Database' },
  { id: 'transform', label: 'Transform Only' }, // DB→DB only
  { id: 'scd', label: 'Apply SCD' },
  { id: 'db-to-file', label: 'Database → File' }
];
const SOURCE_TYPES = [
  { id: 'csv', label: 'CSV / Excel' },
  { id: 'txt', label: 'Text (TXT)' },
  { id: 'mssql', label: 'SQL Server' },
  { id: 'postgres', label: 'PostgreSQL' },
  { id: 'api', label: 'HTTP API' },
  { id: 'kafka', label: 'Kafka' }
];
const DEST_TYPES = [
  { id: 'mssql', label: 'SQL Server' },
  { id: 'postgres', label: 'PostgreSQL' },
  { id: 's3', label: 'S3 / Object Store' },
  { id: 'file', label: 'File (CSV/Parquet)' },
  { id: 'txt', label: 'Text (TXT)' }
];
const ALLOWED = {
  'file-to-db': { sources: ['csv','txt'], dests: ['mssql','postgres'] },
  'db-to-db':   { sources: ['mssql','postgres'], dests: ['mssql','postgres'] },
  'transform':  { sources: ['mssql','postgres'], dests: ['mssql','postgres'] }, // strictly DB→DB
  'scd':        { sources: ['mssql','postgres'], dests: ['mssql','postgres'] },
  'db-to-file': { sources: ['mssql','postgres'], dests: ['file','txt','s3'] }
};
const allowed = (list, ids) => list.filter(x => ids.includes(x.id));
const newId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export default function App(){
  const [tasks, setTasks] = React.useState([]);
  const [modal, setModal] = React.useState(null); // { taskId }
  const [justAddedId, setJustAddedId] = React.useState(null);

  // load from API (safe to no-op if backend not running)
  React.useEffect(() => { (async()=>{
    try{ const r=await fetch('/api/tasks'); const j=await r.json(); setTasks(Array.isArray(j)?j:[]); }
    catch{ setTasks([]); }
  })(); }, []);

  const patchTaskDeep = (id, path, patchObj) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (path==='name' || path==='taskType') return { ...t, [path]: patchObj };
      if (path==='rules') return { ...t, rules: patchObj };
      return { ...t, [path]: { ...(t[path]||{}), ...patchObj } };
    }));
  };

  const addRow = () => {
    const t = {
      id: newId(),
      name: 'New Task',
      taskType: 'file-to-db',
      source: { type: 'csv', name: 'SourceName', path: '', hasHeader: true, delimiter: ',' },
      destination: { type: 'mssql', db: '', schema: 'dbo', table: '', upsertKey: '' },
      rules: [],
      schedule: { enabled:false, cron:'0 2 * * *', timezone:'Asia/Singapore' }
    };
    setTasks(prev => [t, ...prev]);
    setJustAddedId(t.id);
    setTimeout(()=>setJustAddedId(null), 900);
  };

  const removeRow = (id) => setTasks(prev => prev.filter(t=>t.id!==id));

  // keep selections valid when taskType changes
  const typeKey = tasks.map(t=>t.taskType).join('|');
  React.useEffect(() => {
    setTasks(prev => prev.map(t => {
      const a = ALLOWED[t.taskType];
      if (!a) return t;
      const srcOk = a.sources.includes(t.source?.type);
      const dstOk = a.dests.includes(t.destination?.type);
      return {
        ...t,
        source: srcOk ? t.source : { ...(t.source||{}), type: a.sources[0] },
        destination: dstOk ? t.destination : { ...(t.destination||{}), type: a.dests[0] }
      };
    }));
  }, [typeKey]);

  async function saveAll(){
    try{
      const r = await fetch('/api/tasks/bulk', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ tasks })
      });
      if(!r.ok) throw new Error();
      toast('Saved!');
    }catch{ toast('Could not save. Is backend on :4000?', true); }
  }

  return (
    <div className="container">
      <div className="h1">Data Ingestion — Tabular</div>
      <div className="sub">Add tasks, pick types, and configure via the ⚙️ gear — only relevant fields are shown.</div>

      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn primary" onClick={addRow}>+ Add Task</button>
        </div>
        <div className="toolbar-right">
          <button className="btn" onClick={saveAll}>Save to Backend</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{width:64}}>#</th>
              <th style={{width:260}}>Task Name</th>
              <th style={{width:200}}>Task Type</th>
              <th style={{width:200}}>Source</th>
              <th style={{width:200}}>Destination</th>
              <th style={{width:120}}>Config</th>
              <th style={{width:140}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, i) => {
              const allowedSources = allowed(SOURCE_TYPES, ALLOWED[t.taskType].sources);
              const allowedDests = allowed(DEST_TYPES, ALLOWED[t.taskType].dests);
              const rowClass = t.id === justAddedId ? 'tr-new' : '';
              return (
                <tr key={t.id} className={rowClass}>
                  <td><span className="badge">#{tasks.length - i}</span></td>
                  <td>
                    <input className="input" value={t.name || ''} onChange={e=>patchTaskDeep(t.id, 'name', e.target.value)} placeholder="Task name"/>
                  </td>
                  <td>
                    <select className="select" value={t.taskType} onChange={e=>patchTaskDeep(t.id, 'taskType', e.target.value)}>
                      {TASK_TYPES.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="select" value={t.source?.type || ''} onChange={e=>patchTaskDeep(t.id, 'source', { type: e.target.value })}>
                      {allowedSources.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="select" value={t.destination?.type || ''} onChange={e=>patchTaskDeep(t.id, 'destination', { type: e.target.value })}>
                      {allowedDests.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn small icon-btn"
                      title="Configure"
                      aria-label="Configure task"
                      onClick={()=>setModal({ taskId: t.id })}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M10.3 2.1c.5-1.4 2.4-1.4 2.9 0l.3.8c.2.6.8 1 1.4 1.1l.8.1c1.5.2 2 2 .8 2.9l-.6.5c-.5.4-.6 1.1-.4 1.6l.3.8c.5 1.4-.8 2.7-2.2 2.2l-.8-.3c-.6-.2-1.2 0-1.6.4l-.5.6c-.9 1.2-2.8.7-2.9-.8l-.1-.8c-.1-.6-.5-1.2-1.1-1.4l-.8-.3c-1.4-.5-1.4-2.4 0-2.9l.8-.3c.6-.2 1-.8 1.1-1.4l.1-.8z" fill="#1f2937"/>
                        <circle cx="12" cy="12" r="3.25" stroke="#1f2937" strokeWidth="1.6" fill="white"/>
                      </svg>
                    </button>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn small ghost" onClick={()=>removeRow(t.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {tasks.length===0 && (
              <tr><td colSpan={7} style={{textAlign:'center', color:'#6b7280'}}>No tasks yet — click “Add Task”.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <ConfigModal
          task={tasks.find(x=>x.id===modal.taskId)}
          onClose={()=>setModal(null)}
          onPatchDeep={(path, p)=>{
            const id = modal.taskId;
            setTasks(prev => prev.map(t => {
              if (t.id!==id) return t;
              if (path==='rules') return { ...t, rules:p };
              return { ...t, [path]: { ...(t[path]||{}), ...p } };
            }));
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Configure Modal (context-aware) ---------------- */
function ConfigModal({ task, onClose, onPatchDeep }) {
  if (!task) return null;

  // rules helpers
  const addRule = (kind) => {
    const id = newId();
    const rule =
      kind==='map'  ? { id, kind:'map', from:'srcCol', to:'destCol' } :
      kind==='cast' ? { id, kind:'cast', column:'col', datatype:'string' } :
      kind==='filter' ? { id, kind:'filter', expression:'Amount > 0' } :
      kind==='lookup' ? { id, kind:'lookup', column:'CustomerId', ref:'Customers.csv', key:'CustomerId', select:'CustomerName' } :
      kind==='scd1' ? { id, kind:'scd1', businessKeys:'' } :
      kind==='scd2' ? { id, kind:'scd2', businessKeys:'', effectiveDateCol:'', expiryDateCol:'', currentFlagCol:'' } :
      /* scd3 */       { id, kind:'scd3', businessKeys:'', currentCol:'', previousCol:'' };
    onPatchDeep('rules', [ ...(task.rules||[]), rule ]);
  };
  const updateRule = (id, patch) =>
    onPatchDeep('rules', (task.rules||[]).map(r => r.id===id ? { ...r, ...patch } : r));
  const removeRule = (id) =>
    onPatchDeep('rules', (task.rules||[]).filter(r => r.id !== id));

  // derived
  const isFileSrc = task.source?.type==='csv' || task.source?.type==='txt';
  const isFileDst = task.destination?.type==='file' || task.destination?.type==='txt';
  const isSCD = task.taskType==='scd';
  const isTransform = task.taskType==='transform';
  const isFileToDb = task.taskType==='file-to-db';
  const isDbToDb = task.taskType==='db-to-db';
  const isDbToFile = task.taskType==='db-to-file';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <header>
          <strong>⚙️ Configure:</strong>&nbsp; {task.name || '(Unnamed)'}
          <span className="badge tag">{task.taskType}</span>
          <button className="btn small ghost" style={{ marginLeft: 'auto' }} onClick={onClose}>Close</button>
        </header>

        <div className="body">
          {(isFileToDb || isDbToDb || isDbToFile || isTransform) && (
            <div className="section">
              <h4>Connection Setup</h4>

              {/* SOURCE */}
              <div className="row-2">
                <div>
                  <span className="label">Source Name</span>
                  <input className="input" value={task.source?.name || ''} onChange={e=>onPatchDeep('source',{ name:e.target.value })}/>
                </div>
                <div>
                  <span className="label">Source Type</span>
                  <input className="input" disabled value={task.source?.type || ''}/>
                </div>
              </div>

              {isFileSrc ? (
                <>
                  <div className="row-2">
                    <div>
                      <span className="label">File Path</span>
                      <input className="input" value={task.source?.path || ''} onChange={e=>onPatchDeep('source',{ path:e.target.value })}/>
                    </div>
                    <div>
                      <span className="label">Delimiter</span>
                      <input className="input" value={task.source?.delimiter ?? (task.source?.type==='txt'?'|':',')} onChange={e=>onPatchDeep('source',{ delimiter:e.target.value })}/>
                    </div>
                  </div>
                  <label className="kv">
                    <input type="checkbox" checked={!!task.source?.hasHeader} onChange={e=>onPatchDeep('source',{ hasHeader:e.target.checked })}/>
                    <span>Header Row</span>
                  </label>
                </>
              ) : (
                <>
                  <span className="label">Source Connection</span>
                  <textarea className="input" rows={3} value={task.source?.connection || ''} onChange={e=>onPatchDeep('source',{ connection:e.target.value })}/>
                  <div className="row-2" style={{marginTop:10}}>
                    <div>
                      <span className="label">Source Schema</span>
                      <input className="input" value={task.source?.schema || ''} onChange={e=>onPatchDeep('source',{ schema:e.target.value })}/>
                    </div>
                    <div>
                      <span className="label">Source Table</span>
                      <input className="input" value={task.source?.table || ''} onChange={e=>onPatchDeep('source',{ table:e.target.value })}/>
                    </div>
                  </div>
                </>
              )}

              {/* DESTINATION */}
              <div style={{height:10}}/>
              <div className="row-2">
                <div>
                  <span className="label">Destination Type</span>
                  <input className="input" disabled value={task.destination?.type || ''}/>
                </div>
                <div>
                  <span className="label">Upsert Key (DB only)</span>
                  <input className="input" value={task.destination?.upsertKey || ''} onChange={e=>onPatchDeep('destination',{ upsertKey:e.target.value })} disabled={isFileDst}/>
                </div>
              </div>

              {!isFileDst ? (
                <div className="row-2">
                  <div>
                    <span className="label">Database</span>
                    <input className="input" value={task.destination?.db || ''} onChange={e=>onPatchDeep('destination',{ db:e.target.value })}/>
                  </div>
                  <div>
                    <span className="label">Schema</span>
                    <input className="input" value={task.destination?.schema || ''} onChange={e=>onPatchDeep('destination',{ schema:e.target.value })}/>
                  </div>
                  <div>
                    <span className="label">Table</span>
                    <input className="input" value={task.destination?.table || ''} onChange={e=>onPatchDeep('destination',{ table:e.target.value })}/>
                  </div>
                </div>
              ) : (
                <div className="row-2">
                  <div>
                    <span className="label">Output Path</span>
                    <input className="input" value={task.destination?.path || ''} onChange={e=>onPatchDeep('destination',{ path:e.target.value })}/>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TRANSFORM rules */}
          {task.taskType==='transform' && (
            <div className="section">
              <h4>Transform Rules</h4>
              <div className="actions" style={{marginBottom:8}}>
                <button className="btn small ghost" onClick={()=>addRule('map')}>+ Map</button>
                <button className="btn small ghost" onClick={()=>addRule('cast')}>+ Cast</button>
                <button className="btn small ghost" onClick={()=>addRule('filter')}>+ Filter</button>
                <button className="btn small ghost" onClick={()=>addRule('lookup')}>+ Lookup</button>
              </div>
              {(task.rules||[]).filter(r=>['map','cast','filter','lookup'].includes(r.kind)).map(rule=>(
                <div key={rule.id} className="section" style={{marginBottom:8}}>
                  <div className="kv">
                    <span className="badge">{rule.kind}</span>
                    <button className="btn small ghost" style={{marginLeft:'auto'}} onClick={()=>removeRule(rule.id)}>Remove</button>
                  </div>
                  {rule.kind==='map' && (
                    <div className="row-2" style={{marginTop:8}}>
                      <div><span className="label">From</span><input className="input" value={rule.from} onChange={e=>updateRule(rule.id,{from:e.target.value})}/></div>
                      <div><span className="label">To</span><input className="input" value={rule.to} onChange={e=>updateRule(rule.id,{to:e.target.value})}/></div>
                    </div>
                  )}
                  {rule.kind==='cast' && (
                    <div className="row-2" style={{marginTop:8}}>
                      <div><span className="label">Column</span><input className="input" value={rule.column} onChange={e=>updateRule(rule.id,{column:e.target.value})}/></div>
                      <div><span className="label">Datatype</span><input className="input" value={rule.datatype} onChange={e=>updateRule(rule.id,{datatype:e.target.value})}/></div>
                    </div>
                  )}
                  {rule.kind==='filter' && (
                    <div style={{marginTop:8}}>
                      <span className="label">Expression</span>
                      <input className="input" value={rule.expression} onChange={e=>updateRule(rule.id,{expression:e.target.value})}/>
                    </div>
                  )}
                  {rule.kind==='lookup' && (
                    <div className="row-3" style={{marginTop:8}}>
                      <div><span className="label">Join Column</span><input className="input" value={rule.column} onChange={e=>updateRule(rule.id,{column:e.target.value})}/></div>
                      <div><span className="label">Reference</span><input className="input" value={rule.ref} onChange={e=>updateRule(rule.id,{ref:e.target.value})}/></div>
                      <div><span className="label">Key</span><input className="input" value={rule.key} onChange={e=>updateRule(rule.id,{key:e.target.value})}/></div>
                      <div><span className="label">Select</span><input className="input" value={rule.select} onChange={e=>updateRule(rule.id,{select:e.target.value})}/></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SCD rules */}
          {task.taskType==='scd' && (
            <div className="section">
              <h4>SCD Rules</h4>
              <div className="actions" style={{gap:6, marginBottom:10}}>
                <select className="select" defaultValue="" onChange={(e)=>{ const v=e.target.value; if(!v) return; addRule(v); e.target.value=''; }}>
                  <option value="">Choose SCD type</option>
                  <option value="scd1">SCD Type 1</option>
                  <option value="scd2">SCD Type 2</option>
                  <option value="scd3">SCD Type 3</option>
                </select>
                <span className="hint">Add one or more SCD rules for this task.</span>
              </div>

              {(task.rules||[]).filter(r=>['scd1','scd2','scd3'].includes(r.kind)).map(rule=>(
                <div key={rule.id} className="section" style={{marginBottom:8}}>
                  <div className="kv">
                    <span className="badge">{rule.kind.toUpperCase()}</span>
                    <button className="btn small ghost" style={{marginLeft:'auto'}} onClick={()=>removeRule(rule.id)}>Remove</button>
                  </div>

                  {rule.kind==='scd1' && (
                    <div style={{marginTop:8}}>
                      <span className="label">Business Keys</span>
                      <input className="input" value={rule.businessKeys} onChange={e=>updateRule(rule.id,{businessKeys:e.target.value})}/>
                    </div>
                  )}

                  {rule.kind==='scd2' && (
                    <div className="row-2" style={{marginTop:8}}>
                      <div><span className="label">Business Keys</span><input className="input" value={rule.businessKeys} onChange={e=>updateRule(rule.id,{businessKeys:e.target.value})}/></div>
                      <div><span className="label">Effective Date</span><input className="input" value={rule.effectiveDateCol} onChange={e=>updateRule(rule.id,{effectiveDateCol:e.target.value})}/></div>
                      <div><span className="label">Expiry Date</span><input className="input" value={rule.expiryDateCol} onChange={e=>updateRule(rule.id,{expiryDateCol:e.target.value})}/></div>
                      <div><span className="label">Current Flag</span><input className="input" value={rule.currentFlagCol} onChange={e=>updateRule(rule.id,{currentFlagCol:e.target.value})}/></div>
                    </div>
                  )}

                  {rule.kind==='scd3' && (
                    <div className="row-3" style={{marginTop:8}}>
                      <div><span className="label">Business Keys</span><input className="input" value={rule.businessKeys} onChange={e=>updateRule(rule.id,{businessKeys:e.target.value})}/></div>
                      <div><span className="label">Current Column</span><input className="input" value={rule.currentCol} onChange={e=>updateRule(rule.id,{currentCol:e.target.value})}/></div>
                      <div><span className="label">Previous Column</span><input className="input" value={rule.previousCol} onChange={e=>updateRule(rule.id,{previousCol:e.target.value})}/></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <footer>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onClose}>Done</button>
        </footer>
      </div>
    </div>
  );
}

/* tiny toast (no deps) */
function toast(msg, isError=false){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: ${isError ? '#fee2e2' : '#ecfdf5'};
    color: ${isError ? '#991b1b' : '#065f46'};
    border: 1px solid ${isError ? '#fecaca' : '#bbf7d0'};
    padding: 10px 14px; border-radius: 10px; font-size: 13px; box-shadow: var(--shadow); z-index: 60;
  `;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2300);
}
