import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DataTable.module.css';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  caption?: string;
  striped?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  rowSelectionEnabled?: boolean;
  selectedRows?: Set<string | number>;
  onRowSelectionChange?: (selectedIds: Set<string | number>) => void;
  selectionAnnouncement?: string;
  getRowSelectionLabel?: (row: T) => string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  caption,
  striped = false,
  compact = false,
  emptyMessage,
  rowSelectionEnabled = false,
  selectedRows = new Set(),
  onRowSelectionChange,
  selectionAnnouncement,
  getRowSelectionLabel,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const tableClasses = `${styles.table} ${striped ? styles.striped : ''} ${compact ? styles.compact : ''}`;
  const captionId = caption ? `table-caption-${caption.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  const handleSelectAll = (checked: boolean) => {
    if (!onRowSelectionChange) return;
    if (checked) {
      const allIds = new Set(data.map(d => d.id));
      onRowSelectionChange(allIds);
    } else {
      onRowSelectionChange(new Set());
    }
  };

  const handleSelectRow = (id: string | number, checked: boolean) => {
    if (!onRowSelectionChange) return;
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onRowSelectionChange(newSelection);
  };

  const allSelected = data.length > 0 && data.every(d => selectedRows.has(d.id));
  const someSelected = data.some(d => selectedRows.has(d.id)) && !allSelected;

  return (
    <div className={styles.tableWrapper}>
      {selectionAnnouncement && selectedRows.size > 0 && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {selectionAnnouncement}
        </div>
      )}
      <table className={tableClasses} aria-describedby={captionId}>
        {caption && (
          <caption id={captionId} className="sr-only">
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {rowSelectionEnabled && (
              <th scope="col" className={styles.checkboxHeader}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label={allSelected ? t('common.table.deselectAllRows') : t('common.table.selectAllRows')}
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} scope="col">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (rowSelectionEnabled ? 1 : 0)} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                {emptyMessage ?? t('common.table.noData')}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id}>
                {rowSelectionEnabled && (
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      aria-label={t('common.table.selectRow', { item: getRowSelectionLabel?.(row) ?? String(row.id) })}
                    />
                  </td>
                )}
                {columns.map((col, columnIndex) => {
                  const cellContent = col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode;

                  return columnIndex === 0 ? (
                    <th key={col.key} scope="row">
                      {cellContent}
                    </th>
                  ) : (
                    <td key={col.key}>
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}