import { useState } from 'react';
import Button from './Button';
import { reportsAPI } from '../../services/api';

/**
 * ============================================
 * COMPONENTE: FILE DOWNLOAD
 * Descarga de archivos en múltiples formatos
 * ============================================
 */

const FileDownload = ({ filters = {}, className = '' }) => {
  const [downloading, setDownloading] = useState(null);

  /**
   * Descargar archivo
   */
  const handleDownload = async (type) => {
    setDownloading(type);

    try {
      const response = await reportsAPI.export(type, filters);

      // Crear blob y descargar
      const blob = new Blob([response.data], {
        type: getContentType(type),
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${Date.now()}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      alert('Error al descargar el archivo');
    } finally {
      setDownloading(null);
    }
  };

  /**
   * Obtener content type según el formato
   */
  const getContentType = (type) => {
    const types = {
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
      json: 'application/json',
    };
    return types[type] || 'application/octet-stream';
  };

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      <Button
        variant="success"
        size="sm"
        onClick={() => handleDownload('csv')}
        loading={downloading === 'csv'}
        disabled={downloading && downloading !== 'csv'}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      >
        CSV
      </Button>

      <Button
        variant="success"
        size="sm"
        onClick={() => handleDownload('xlsx')}
        loading={downloading === 'xlsx'}
        disabled={downloading && downloading !== 'xlsx'}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      >
        Excel
      </Button>

      <Button
        variant="danger"
        size="sm"
        onClick={() => handleDownload('pdf')}
        loading={downloading === 'pdf'}
        disabled={downloading && downloading !== 'pdf'}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      >
        PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownload('json')}
        loading={downloading === 'json'}
        disabled={downloading && downloading !== 'json'}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      >
        JSON
      </Button>
    </div>
  );
};

export default FileDownload;
