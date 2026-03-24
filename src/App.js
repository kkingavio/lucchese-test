import React, { useMemo, useState } from 'react';
import { entityTypes, statusTypes, transactionLogs } from './data/transactionLogs';

const environmentOptions = [
  { value: 'LOCAL', label: 'Local', tableName: 'dbo.LOCAL_TRANSACTION_LOG' },
  { value: 'DEV', label: 'Dev', tableName: 'dbo.DEV_TRANSACTION_LOG' },
  { value: 'PROD', label: 'Prod', tableName: 'dbo.PROD_TRANSACTION_LOG' },
];

function formatEntityType(type) {
  return type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatTimestamp(value) {
  if (!value) {
    return 'n/a';
  }

  return new Date(value).toLocaleString();
}

function statusClassName(status) {
  if (status === 'SUCCESS') {
    return 'status status--success';
  }

  if (status === 'FAILED') {
    return 'status status--failed';
  }

  return 'status status--received';
}

function App() {
  const [selectedEnvironment, setSelectedEnvironment] = useState('LOCAL');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeEnvironment =
    environmentOptions.find((option) => option.value === selectedEnvironment) ||
    environmentOptions[0];

  const filteredLogs = useMemo(() => {
    const fromTimestamp = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTimestamp = dateTo ? new Date(dateTo).getTime() : null;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return transactionLogs.filter((row) => {
      if (selectedEntity !== 'ALL' && row.entity_type !== selectedEntity) {
        return false;
      }

      if (selectedStatus !== 'ALL' && row.status !== selectedStatus) {
        return false;
      }

      if (normalizedSearch) {
        const searchableValue = [
          row.tracking_id,
          row.correlation_id,
          row.entity_type,
          row.source_system,
          row.target_system,
          row.status,
          row.error_reason,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableValue.includes(normalizedSearch)) {
          return false;
        }
      }

      const lastAttemptTimestamp = row.last_attempt_at
        ? new Date(row.last_attempt_at).getTime()
        : null;

      if (fromTimestamp && (!lastAttemptTimestamp || lastAttemptTimestamp < fromTimestamp)) {
        return false;
      }

      if (toTimestamp && (!lastAttemptTimestamp || lastAttemptTimestamp > toTimestamp)) {
        return false;
      }

      return true;
    });
  }, [selectedEntity, selectedStatus, dateFrom, dateTo, searchTerm]);

  const totals = filteredLogs.reduce(
    (accumulator, transaction) => {
      accumulator.total += 1;
      accumulator[transaction.status] += 1;
      return accumulator;
    },
    { total: 0, SUCCESS: 0, FAILED: 0, RECEIVED: 0 }
  );

  const successRate = totals.total
    ? Math.round((totals.SUCCESS / totals.total) * 100)
    : 0;

  const entitySummary = entityTypes
    .filter((type) => type !== 'ALL')
    .map((type) => {
      const records = filteredLogs.filter((row) => row.entity_type === type);
      const failed = records.filter((row) => row.status === 'FAILED').length;
      const lastTransfer = records[0] ? formatTimestamp(records[0].last_attempt_at) : 'n/a';

      return {
        type,
        count: records.length,
        failed,
        lastTransfer,
      };
    });

  const failedTransactions = filteredLogs.filter(
    (transaction) => transaction.status === 'FAILED'
  );

  function clearFilters() {
    setSelectedEntity('ALL');
    setSelectedStatus('ALL');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-layout">
        <aside className="filters-panel">
          <div className="filters-header">
            <p className="eyebrow">Filter Menu</p>
            <h2>Transfer Filters</h2>
            <p>
              Showing {filteredLogs.length} of {transactionLogs.length} rows
            </p>
          </div>

          <label className="filter-field" htmlFor="entity-filter">
            Entity Type
            <select
              id="entity-filter"
              value={selectedEntity}
              onChange={(event) => setSelectedEntity(event.target.value)}
            >
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'ALL' ? 'All entities' : formatEntityType(type)}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field" htmlFor="status-filter">
            Status
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              {statusTypes.map((status) => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All statuses' : status}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field" htmlFor="date-from-filter">
            Last Attempt From
            <input
              id="date-from-filter"
              type="datetime-local"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>

          <label className="filter-field" htmlFor="search-filter">
            Free Text Search
            <input
              id="search-filter"
              type="text"
              value={searchTerm}
              placeholder="Tracking ID, correlation, status..."
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="filter-field" htmlFor="date-to-filter">
            Last Attempt To
            <input
              id="date-to-filter"
              type="datetime-local"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </label>

          <button className="clear-button" type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </aside>

        <div className="content-column">
          <section className="hero">
            <div className="hero-top-row">
              <p className="eyebrow">Integration Operations</p>
              <label className="environment-switch" htmlFor="environment-switch">
                Environment
                <select
                  id="environment-switch"
                  value={selectedEnvironment}
                  onChange={(event) => setSelectedEnvironment(event.target.value)}
                >
                  {environmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <h1>Transfer Dashboard</h1>
            <p className="hero-copy">
              Demo view powered by the DEV_TRANSACTION_LOG model for item, vendor,
              purchase order, and sales order transfers between NetSuite and OracleWMS.
              Active table: {activeEnvironment.tableName}.
            </p>
          </section>

          <section className="metrics-grid" aria-label="Transfer metrics">
            <article className="metric-card">
              <p>Total Transfers</p>
              <strong>{totals.total}</strong>
            </article>
            <article className="metric-card">
              <p>Success Rate</p>
              <strong>{successRate}%</strong>
            </article>
            <article className="metric-card">
              <p>Failed</p>
              <strong>{totals.FAILED}</strong>
            </article>
            <article className="metric-card">
              <p>Received</p>
              <strong>{totals.RECEIVED}</strong>
            </article>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>Entity Coverage</h2>
              <span>By entity_type (filtered)</span>
            </div>
            <div className="entity-grid">
              {entitySummary.map((entity) => (
                <article key={entity.type} className="entity-card">
                  <h3>{formatEntityType(entity.type)}</h3>
                  <p>{entity.count} transfers</p>
                  <p>{entity.failed} failed</p>
                  <p>Last attempt: {entity.lastTransfer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>Recent Transaction Log</h2>
              <span>{activeEnvironment.label} view ({activeEnvironment.tableName})</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Entity</th>
                    <th>Tracking ID</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Retry</th>
                    <th>Last Attempt</th>
                    <th>Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((row) => (
                    <tr key={row.transaction_id}>
                      <td>{row.transaction_id}</td>
                      <td>{formatEntityType(row.entity_type)}</td>
                      <td>{row.tracking_id}</td>
                      <td>
                        {row.source_system} to {row.target_system}
                      </td>
                      <td>
                        <span className={statusClassName(row.status)}>{row.status}</span>
                      </td>
                      <td>{row.retry_count}</td>
                      <td>{formatTimestamp(row.last_attempt_at)}</td>
                      <td>{row.correlation_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title-row">
              <h2>Failure Queue</h2>
              <span>Error reason from `error_reason`</span>
            </div>
            <div className="failure-list">
              {failedTransactions.length > 0 ? (
                failedTransactions.map((row) => (
                  <article key={row.transaction_id} className="failure-item">
                    <h3>
                      {row.tracking_id} ({formatEntityType(row.entity_type)})
                    </h3>
                    <p>{row.error_reason}</p>
                    <code>{row.payload_preview}</code>
                  </article>
                ))
              ) : (
                <article className="failure-item">
                  <h3>No failed transfers for this filter set</h3>
                  <p>Try widening the date range or changing status to ALL.</p>
                </article>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
