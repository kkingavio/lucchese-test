import React from 'react';

const transactionLogs = [
  {
    transaction_id: 1012,
    entity_type: 'item',
    source_system: 'NetSuite',
    target_system: 'OracleWMS',
    status: 'SUCCESS',
    error_reason: null,
    retry_count: 0,
    last_attempt_at: '2026-03-23T11:40:00Z',
    tracking_id: 'ITEM-10023',
    payload_preview: '{"item":"ITEM-10023","qty":40,"uom":"EA"}',
    window_start: '2026-03-23T11:30:00Z',
    window_end: '2026-03-23T11:40:00Z',
    correlation_id: 'corr-item-1012',
  },
  {
    transaction_id: 1011,
    entity_type: 'vendor',
    source_system: 'NetSuite',
    target_system: 'OracleWMS',
    status: 'FAILED',
    error_reason: 'Vendor address validation failed in target system.',
    retry_count: 2,
    last_attempt_at: '2026-03-23T11:38:00Z',
    tracking_id: 'VEND-2099',
    payload_preview: '{"vendor":"VEND-2099","country":"US","currency":"USD"}',
    window_start: '2026-03-23T11:30:00Z',
    window_end: '2026-03-23T11:40:00Z',
    correlation_id: 'corr-vendor-1011',
  },
  {
    transaction_id: 1010,
    entity_type: 'purchase_order',
    source_system: 'NetSuite',
    target_system: 'OracleWMS',
    status: 'SUCCESS',
    error_reason: null,
    retry_count: 1,
    last_attempt_at: '2026-03-23T11:35:00Z',
    tracking_id: 'PO-77841',
    payload_preview: '{"po":"PO-77841","lines":6,"total":12480.55}',
    window_start: '2026-03-23T11:20:00Z',
    window_end: '2026-03-23T11:30:00Z',
    correlation_id: 'corr-po-1010',
  },
  {
    transaction_id: 1009,
    entity_type: 'sales_order',
    source_system: 'NetSuite',
    target_system: 'OracleWMS',
    status: 'RECEIVED',
    error_reason: null,
    retry_count: 0,
    last_attempt_at: '2026-03-23T11:32:00Z',
    tracking_id: 'SO-55290',
    payload_preview: '{"so":"SO-55290","customer":"Acme Retail","lines":3}',
    window_start: '2026-03-23T11:20:00Z',
    window_end: '2026-03-23T11:30:00Z',
    correlation_id: 'corr-so-1009',
  },
  {
    transaction_id: 1008,
    entity_type: 'item',
    source_system: 'NetSuite',
    target_system: 'OracleWMS',
    status: 'FAILED',
    error_reason: 'Item is inactive in source system.',
    retry_count: 1,
    last_attempt_at: '2026-03-23T11:25:00Z',
    tracking_id: 'ITEM-10021',
    payload_preview: '{"item":"ITEM-10021","status":"inactive"}',
    window_start: '2026-03-23T11:10:00Z',
    window_end: '2026-03-23T11:20:00Z',
    correlation_id: 'corr-item-1008',
  },
  {
    transaction_id: 1007,
    entity_type: 'vendor',
    source_system: 'NetSuite',
    target_system: 'OracleWMS',
    status: 'SUCCESS',
    error_reason: null,
    retry_count: 0,
    last_attempt_at: '2026-03-23T11:21:00Z',
    tracking_id: 'VEND-1802',
    payload_preview: '{"vendor":"VEND-1802","paymentTerms":"NET30"}',
    window_start: '2026-03-23T11:10:00Z',
    window_end: '2026-03-23T11:20:00Z',
    correlation_id: 'corr-vendor-1007',
  },
  {
    transaction_id: 1006,
    entity_type: 'purchase_order',
    source_system: 'NetSuite',
    target_system: 'OracleWMS',
    status: 'FAILED',
    error_reason: 'PO line 2 has invalid warehouse code.',
    retry_count: 3,
    last_attempt_at: '2026-03-23T11:15:00Z',
    tracking_id: 'PO-77830',
    payload_preview: '{"po":"PO-77830","warehouse":"WH-UNK"}',
    window_start: '2026-03-23T11:00:00Z',
    window_end: '2026-03-23T11:10:00Z',
    correlation_id: 'corr-po-1006',
  },
  {
    transaction_id: 1005,
    entity_type: 'sales_order',
    source_system: 'NetSuite',
    target_system: 'OracleWMS',
    status: 'SUCCESS',
    error_reason: null,
    retry_count: 0,
    last_attempt_at: '2026-03-23T11:08:00Z',
    tracking_id: 'SO-55250',
    payload_preview: '{"so":"SO-55250","shipMethod":"Ground"}',
    window_start: '2026-03-23T11:00:00Z',
    window_end: '2026-03-23T11:10:00Z',
    correlation_id: 'corr-so-1005',
  },
];

const entityTypes = ['item', 'vendor', 'purchase_order', 'sales_order'];

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
  const totals = transactionLogs.reduce(
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

  const entitySummary = entityTypes.map((type) => {
    const records = transactionLogs.filter((row) => row.entity_type === type);
    const failed = records.filter((row) => row.status === 'FAILED').length;
    const lastTransfer = records[0] ? formatTimestamp(records[0].last_attempt_at) : 'n/a';

    return {
      type,
      count: records.length,
      failed,
      lastTransfer,
    };
  });

  const failedTransactions = transactionLogs.filter(
    (transaction) => transaction.status === 'FAILED'
  );

  return (
    <main className="dashboard-shell">
      <section className="hero">
        <p className="eyebrow">Integration Operations</p>
        <h1>Transfer Dashboard</h1>
        <p className="hero-copy">
          Demo view powered by the DEV_TRANSACTION_LOG model for item, vendor, purchase
          order, and sales order transfers between NetSuite and OracleWMS.
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
          <span>By entity_type</span>
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
          <span>Hard-coded sample rows</span>
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
              {transactionLogs.map((row) => (
                <tr key={row.transaction_id}>
                  <td>{row.transaction_id}</td>
                  <td>{formatEntityType(row.entity_type)}</td>
                  <td>{row.tracking_id}</td>
                  <td>
                    {row.source_system} → {row.target_system}
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
          {failedTransactions.map((row) => (
            <article key={row.transaction_id} className="failure-item">
              <h3>
                {row.tracking_id} ({formatEntityType(row.entity_type)})
              </h3>
              <p>{row.error_reason}</p>
              <code>{row.payload_preview}</code>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
