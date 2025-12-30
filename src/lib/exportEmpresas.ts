import { EmpresaResponse } from '@/services/empresas.service';

/**
 * Export empresas data to CSV format
 */
export function exportEmpresasToCSV(
  empresas: EmpresaResponse[] | undefined,
  tenantName: string
): void {
  if (!empresas || empresas.length === 0) {
    console.warn('No empresas data available for export');
    alert('Nenhuma empresa disponível para exportar');
    return;
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];

  // Prepare CSV content
  const lines: string[] = [];

  // Header
  lines.push(`Relatório de Empresas - ${tenantName}`);
  lines.push(`Data de Geração: ${now.toLocaleString('pt-BR')}`);
  lines.push(`Total de Empresas: ${empresas.length}`);
  lines.push('');

  // Table header
  lines.push('Código,Nome Fantasia,Razão Social,CNPJ,Telefone,Telefone Secundário,Endereço,Cidade,Estado,CEP,Status');

  // Table rows
  empresas.forEach((empresa) => {
    const row = [
      empresa.codEmp ?? '',
      (empresa.nomeFantasia ?? '').replace(/,/g, ';'),
      (empresa.razaoSocial ?? '').replace(/,/g, ';'),
      empresa.cnpj ?? '',
      empresa.telefone ?? '',
      empresa.telefoneSec ?? '',
      (empresa.endereco ?? '').replace(/,/g, ';'),
      empresa.cidade ?? '',
      empresa.estado ?? '',
      empresa.cep ?? '',
      empresa.ativo ? 'Ativo' : 'Inativo'
    ];
    lines.push(row.join(','));
  });

  // Create CSV blob and download
  const csvContent = lines.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-empresas-${timestamp}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export empresas data to PDF format
 */
export function exportEmpresasToPDF(
  empresas: EmpresaResponse[] | undefined,
  tenantName: string
): void {
  if (!empresas || empresas.length === 0) {
    console.warn('No empresas data available for export');
    alert('Nenhuma empresa disponível para exportar');
    return;
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];

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
      <title>Relatório de Empresas - ${tenantName}</title>
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
        .header-info {
          margin-bottom: 30px;
          font-size: 14px;
          color: #64748b;
        }
        .summary {
          background: #f1f5f9;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
          font-size: 16px;
          font-weight: 600;
          color: #475569;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 8px;
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
        .status-ativo {
          color: #16a34a;
          font-weight: 600;
        }
        .status-inativo {
          color: #dc2626;
          font-weight: 600;
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
      <h1>Relatório de Empresas - ${tenantName}</h1>

      <div class="header-info">
        <strong>Data de Geração:</strong> ${now.toLocaleString('pt-BR')}<br>
      </div>

      <div class="summary">
        Total de Empresas: ${empresas.length}
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome Fantasia</th>
            <th>Razão Social</th>
            <th>CNPJ</th>
            <th>Telefone</th>
            <th>Cidade/Estado</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${empresas
            .map(
              (empresa) => `
            <tr>
              <td>${empresa.codEmp ?? '-'}</td>
              <td>${empresa.nomeFantasia ?? '-'}</td>
              <td>${empresa.razaoSocial ?? '-'}</td>
              <td>${empresa.cnpj ?? '-'}</td>
              <td>${empresa.telefone ?? '-'}</td>
              <td>${empresa.cidade ? `${empresa.cidade}, ${empresa.estado || ''}` : '-'}</td>
              <td class="${empresa.ativo ? 'status-ativo' : 'status-inativo'}">
                ${empresa.ativo ? 'Ativo' : 'Inativo'}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

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
