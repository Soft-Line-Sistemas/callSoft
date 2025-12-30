import { TicketMetrics } from '@/lib/api';

/**
 * Export ticket metrics data to CSV format
 */
export function exportTicketMetricsToCSV(
  metrics: TicketMetrics | undefined,
  tenantName: string
): void {
  if (!metrics) {
    console.warn('No metrics data available for export');
    return;
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];

  // Prepare CSV content
  const lines: string[] = [];

  // Header
  lines.push(`Relatório de Métricas - ${tenantName}`);
  lines.push(`Data de Geração: ${now.toLocaleString('pt-BR')}`);
  lines.push('');

  // Summary metrics
  lines.push('RESUMO GERAL');
  lines.push('Métrica,Valor');

  const totalTickets = metrics.statusCounts
    ? Object.values(metrics.statusCounts).reduce((acc, val) => acc + val, 0)
    : 0;

  lines.push(`Total de Tickets,${totalTickets}`);
  lines.push(`Tickets Solicitados,${metrics.statusCounts?.SOLICITADO ?? 0}`);
  lines.push(`Tickets Pendentes,${metrics.statusCounts?.PENDENTE_ATENDIMENTO ?? 0}`);
  lines.push(`Tickets em Atendimento,${metrics.statusCounts?.EM_ATENDIMENTO ?? 0}`);
  lines.push(`Tickets Concluídos,${metrics.statusCounts?.CONCLUIDO ?? 0}`);
  lines.push(`Tickets Cancelados,${metrics.statusCounts?.CANCELADO ?? 0}`);

  if (metrics.averageTimeToFirstAttendanceMinutes != null) {
    lines.push(
      `Tempo Médio de Atendimento (min),${Math.round(metrics.averageTimeToFirstAttendanceMinutes)}`
    );
  }

  lines.push('');

  // Volume by date
  if (metrics.volumeByDate && metrics.volumeByDate.length > 0) {
    lines.push('VOLUME POR DATA');
    lines.push('Data,Total de Tickets');
    metrics.volumeByDate.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString('pt-BR');
      lines.push(`${date},${item.total}`);
    });
  }

  // Create CSV blob and download
  const csvContent = lines.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-tickets-${timestamp}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export ticket metrics data to PDF format
 */
export function exportTicketMetricsToPDF(
  metrics: TicketMetrics | undefined,
  tenantName: string
): void {
  if (!metrics) {
    console.warn('No metrics data available for export');
    return;
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];

  const totalTickets = metrics.statusCounts
    ? Object.values(metrics.statusCounts).reduce((acc, val) => acc + val, 0)
    : 0;

  // Create a printable HTML document
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para exportar o PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Métricas - ${tenantName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        h1 {
          color: #1e293b;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }
        h2 {
          color: #475569;
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .header-info {
          margin-bottom: 30px;
          font-size: 14px;
          color: #64748b;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .metric-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          background: #f8fafc;
        }
        .metric-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 5px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f1f5f9;
          font-weight: 600;
          color: #475569;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>Relatório de Métricas - ${tenantName}</h1>

      <div class="header-info">
        <strong>Data de Geração:</strong> ${now.toLocaleString('pt-BR')}<br>
      </div>

      <h2>Resumo Geral</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total de Tickets</div>
          <div class="metric-value">${totalTickets}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tickets Solicitados</div>
          <div class="metric-value">${metrics.statusCounts?.SOLICITADO ?? 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tickets Pendentes</div>
          <div class="metric-value">${metrics.statusCounts?.PENDENTE_ATENDIMENTO ?? 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tickets em Atendimento</div>
          <div class="metric-value">${metrics.statusCounts?.EM_ATENDIMENTO ?? 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tickets Concluídos</div>
          <div class="metric-value">${metrics.statusCounts?.CONCLUIDO ?? 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Tickets Cancelados</div>
          <div class="metric-value">${metrics.statusCounts?.CANCELADO ?? 0}</div>
        </div>
        ${
          metrics.averageTimeToFirstAttendanceMinutes != null
            ? `
        <div class="metric-card">
          <div class="metric-label">Tempo Médio de Atendimento (min)</div>
          <div class="metric-value">${Math.round(metrics.averageTimeToFirstAttendanceMinutes)}</div>
        </div>
        `
            : ''
        }
      </div>

      ${
        metrics.volumeByDate && metrics.volumeByDate.length > 0
          ? `
      <h2>Volume por Data</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Total de Tickets</th>
          </tr>
        </thead>
        <tbody>
          ${metrics.volumeByDate
            .map(
              (item) => `
            <tr>
              <td>${new Date(item.date).toLocaleDateString('pt-BR')}</td>
              <td>${item.total}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      `
          : ''
      }

      <div class="no-print" style="margin-top: 40px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Imprimir / Salvar como PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 10px;">
          Fechar
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
