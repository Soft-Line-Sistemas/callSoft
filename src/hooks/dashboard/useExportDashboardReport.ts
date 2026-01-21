import { useMutation } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.service';
import type { DashboardExportParams } from '@/types/dashboard.types';
import { downloadBlob } from '@/lib/download';

const getFileExtension = (format: DashboardExportParams['formato']): string => {
  if (format === 'xlsx') return 'xlsx';
  if (format === 'pdf') return 'pdf';
  return 'csv';
};

export const useExportDashboardReport = () => {
  return useMutation<Blob, Error, DashboardExportParams>({
    mutationFn: (params) => dashboardApi.exportReport(params),
    onSuccess: (blob, params) => {
      downloadBlob(
        blob,
        `dashboard-report-${new Date().toISOString()}.${getFileExtension(params.formato)}`
      );
    },
  });
};
