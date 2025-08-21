// Sidebar modules
export const TASK_TYPES = [
  { type: 'file_to_db',    label: 'File → DB' },
  { type: 'db_to_db',      label: 'DB → DB' },
  { type: 'db_to_file',    label: 'DB → File' },
  { type: 'scd_transform', label: 'SCD Transformation' },
  { type: 'sql_transform', label: 'SQL Transformation' },
]


export const MODULE_SCHEMAS = {
  file_to_db: {
    source: [
      { key: 'sourceType', label: 'Source Type', input: 'select', options: ['CSV', 'JSON', 'TX'] },
      { key: 'path',       label: 'File Path / URL', input: 'text' },
      { key: 'delimiter',  label: 'Delimiter (CSV)', input: 'text' },
    ],
    destination: [
      { key: 'dbConn', label: 'DB Connection Name', input: 'text' },
      { key: 'schema', label: 'Target Schema',      input: 'text' },
      { key: 'table',  label: 'Target Table',       input: 'text' },
      { key: 'columns',   label: 'Column Mapping (src→tgt JSON)', input: 'textarea' },
    ],
  },

  db_to_db: {
    source: [
      { key: 'srcConn',   label: 'Source DB Connection', input: 'text' },
      { key: 'srcSchema', label: 'Source Schema',        input: 'text' },
      { key: 'srcTable',  label: 'Source Table',         input: 'text' },
      { key: 'filter',    label: 'Optional WHERE Filter', input: 'text' },
    ],
    destination: [
      { key: 'tgtConn',   label: 'Target DB Connection', input: 'text' },
      { key: 'tgtSchema', label: 'Target Schema',        input: 'text' },
      { key: 'tgtTable',  label: 'Target Table',         input: 'text' },
      { key: 'columns',   label: 'Column Mapping (src→tgt JSON)', input: 'textarea' },
    ],
  },

  db_to_file: {
    source: [
      { key: 'dbConn', label: 'DB Connection Name', input: 'text' },
      { key: 'schema', label: 'Schema',             input: 'text' },
      { key: 'table',  label: 'Table',              input: 'text' },
      { key: 'select', label: 'Columns (comma-sep)', input: 'text' },
      { key: 'where',  label: 'WHERE (optional)',   input: 'text' },
    ],
    destination: [
      { key: 'destType',      label: 'Destination Type', input: 'select', options: ['CSV','JSON','TXT'] },
      { key: 'path',          label: 'Output Path',    input: 'text' },
      { key: 'delimiter',     label: 'Delimiter (CSV)', input: 'text' },
      { key: 'includeHeader', label: 'Include Header', input: 'select', options: ['true','false'] },
      { key: 'columns',   label: 'Column Mapping (src→tgt JSON)', input: 'textarea' },
    ],
  },

  scd_transform: {
    source: [
      { key: 'conn',         label: 'DB Connection', input: 'text' },
      { key: 'srcSchema',    label: 'Source Schema', input: 'text' },
      { key: 'srcTable',     label: 'Source Table',  input: 'text' },
      { key: 'businessKeys', label: 'Business Keys (comma-sep)', input: 'text' },
      { key: 'updateCols',   label: 'Tracked Columns (comma-sep)', input: 'text' },
    ],
    destination: [
      { key: 'tgtSchema',    label: 'Target Schema',        input: 'text' },
      { key: 'tgtTable',     label: 'Target Table',         input: 'text' },
      { key: 'effectiveFrom', label: 'Effective From Column', input: 'text' },
      { key: 'effectiveTo',  label: 'Effective To Column',  input: 'text' },
      { key: 'isCurrent',    label: 'Current Flag Column',  input: 'text' },
    ],
  },

  sql_transform: {
    source: [
      { key: 'conn',   label: 'DB Connection', input: 'text' },
      { key: 'schema', label: 'Default Schema', input: 'text' },
      { key: 'sql',    label: 'SQL Statement',  input: 'textarea' },
    ],
    destination: [
      { key: 'tgtSchema', label: 'Target Schema (optional)', input: 'text' },
      { key: 'tgtTable',  label: 'Target Table (optional)',  input: 'text' },
      { key: 'mode',      label: 'Write Mode (if target set)', input: 'select', options: ['append','truncate-insert','merge'] },
    ],
  },
}
