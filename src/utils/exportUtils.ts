// Utility functions for exporting data to CSV and PDF

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (data: any[], filename: string, title: string) => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Create a simple HTML table for PDF generation
  const headers = Object.keys(data[0]);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px;
          color: #333;
        }
        h1 { 
          color: #FF6B35; 
          text-align: center;
          margin-bottom: 30px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 12px; 
          text-align: left;
          font-size: 12px;
        }
        th { 
          background-color: #f8f9fa; 
          font-weight: bold;
          color: #495057;
        }
        tr:nth-child(even) { 
          background-color: #f8f9fa; 
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Relatório gerado pelo CRM-DGA - ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
  `;

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};

export const formatReportData = (deals: any[], clients: any[], users: any[], pipelineStatuses: any[]) => {
  return deals.map(deal => {
    const client = clients.find(c => c.id === deal.clientId);
    const owner = users.find(u => u.id === deal.ownerId);
    const status = pipelineStatuses.find(s => s.id === deal.statusId);
    
    return {
      'Título do Negócio': deal.title,
      'Cliente': client?.name || 'N/A',
      'Empresa': client?.company || 'N/A',
      'Valor': new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(deal.value),
      'Probabilidade': `${(deal.probability * 100).toFixed(0)}%`,
      'Status': status?.name || 'N/A',
      'Responsável': owner?.name || 'N/A',
      'Data de Criação': new Date(deal.createdAt).toLocaleDateString('pt-BR'),
      'Última Atualização': new Date(deal.updatedAt).toLocaleDateString('pt-BR')
    };
  });
};

export const formatSalesPerformanceData = (salesPerformance: any[]) => {
  return salesPerformance.map(performer => ({
    'Nome': performer.name,
    'Função': performer.role,
    'Total de Negócios': performer.totalDeals,
    'Negócios Fechados': performer.wonDeals,
    'Taxa de Conversão': `${performer.conversionRate.toFixed(1)}%`,
    'Receita Total': new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(performer.revenue)
  }));
};