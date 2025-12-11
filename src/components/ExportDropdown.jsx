import { useState } from 'react';
import {
    Download,
    FileSpreadsheet,
    FileText,
    ExternalLink,
    ChevronDown,
    Check
} from 'lucide-react';
import './ExportDropdown.css';

const EXPORT_FORMATS = {
    CSV: 'csv',
    EXCEL: 'excel',
    GOOGLE_SHEETS: 'google_sheets'
};

function ExportDropdown({
    data,
    columns,
    filename = 'export',
    language = 'he',
    onExport
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState(null);

    const labels = {
        he: {
            export: 'ייצוא',
            csv: 'CSV',
            excel: 'Excel',
            googleSheets: 'Google Sheets',
            exporting: 'מייצא...',
            rows: 'שורות'
        },
        uk: {
            export: 'Експорт',
            csv: 'CSV',
            excel: 'Excel',
            googleSheets: 'Google Sheets',
            exporting: 'Експорт...',
            rows: 'рядків'
        },
        en: {
            export: 'Export',
            csv: 'CSV',
            excel: 'Excel',
            googleSheets: 'Google Sheets',
            exporting: 'Exporting...',
            rows: 'rows'
        }
    };

    const t = labels[language] || labels.he;

    // Convert data to CSV string
    const toCSV = () => {
        if (!data || data.length === 0) return '';

        const headers = columns.map(col => col.label).join(',');
        const rows = data.map(row =>
            columns.map(col => {
                const value = typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : row[col.accessor];
                // Escape commas and quotes
                const escaped = String(value || '').replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        );

        return '\ufeff' + [headers, ...rows].join('\n'); // BOM for Hebrew support
    };

    // Export as CSV
    const exportCSV = () => {
        setExporting('csv');
        const csv = toCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();

        setTimeout(() => {
            setExporting(null);
            setIsOpen(false);
            onExport?.('csv', data.length);
        }, 500);
    };

    // Export as Excel (using SheetJS format - simple XLSX)
    const exportExcel = async () => {
        setExporting('excel');

        // Create a simple Excel-compatible XML (works without external libraries)
        const headers = columns.map(col => col.label);
        const rows = data.map(row =>
            columns.map(col => {
                const value = typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : row[col.accessor];
                return value || '';
            })
        );

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<?mso-application progid="Excel.Sheet"?>\n';
        xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
        xml += '<Worksheet ss:Name="Sheet1">\n<Table>\n';

        // Header row
        xml += '<Row>\n';
        headers.forEach(h => {
            xml += `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
        });
        xml += '</Row>\n';

        // Data rows
        rows.forEach(row => {
            xml += '<Row>\n';
            row.forEach(cell => {
                const type = typeof cell === 'number' ? 'Number' : 'String';
                xml += `<Cell><Data ss:Type="${type}">${escapeXml(String(cell))}</Data></Cell>\n`;
            });
            xml += '</Row>\n';
        });

        xml += '</Table>\n</Worksheet>\n</Workbook>';

        const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.xls`;
        link.click();

        setTimeout(() => {
            setExporting(null);
            setIsOpen(false);
            onExport?.('excel', data.length);
        }, 500);
    };

    // Export to Google Sheets (opens new sheet with data)
    const exportGoogleSheets = () => {
        setExporting('google_sheets');

        // Create CSV data for Google Sheets import
        const csv = toCSV();
        const encodedCsv = encodeURIComponent(csv);

        // Open Google Sheets with import
        // Note: In production, you'd use Google Sheets API
        const url = `https://docs.google.com/spreadsheets/create`;
        window.open(url, '_blank');

        // Also copy to clipboard for easy paste
        navigator.clipboard.writeText(csv.replace(/^\ufeff/, '')).then(() => {
            setTimeout(() => {
                setExporting(null);
                setIsOpen(false);
                onExport?.('google_sheets', data.length);
            }, 500);
        });
    };

    const escapeXml = (str) => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

    const formats = [
        {
            id: EXPORT_FORMATS.CSV,
            label: t.csv,
            icon: FileText,
            action: exportCSV,
            description: language === 'he' ? 'קובץ טקסט מופרד בפסיקים' : 'Comma separated values'
        },
        {
            id: EXPORT_FORMATS.EXCEL,
            label: t.excel,
            icon: FileSpreadsheet,
            action: exportExcel,
            description: language === 'he' ? 'פתיחה ב-Excel' : 'Open in Excel'
        },
        {
            id: EXPORT_FORMATS.GOOGLE_SHEETS,
            label: t.googleSheets,
            icon: ExternalLink,
            action: exportGoogleSheets,
            description: language === 'he' ? 'פתיחה ב-Google Sheets' : 'Open in Google Sheets'
        }
    ];

    return (
        <div className="export-dropdown">
            <button
                className="btn btn-outline export-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Download size={18} />
                <span>{t.export}</span>
                <span className="export-count">{data?.length || 0} {t.rows}</span>
                <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="export-menu">
                    {formats.map(format => {
                        const Icon = format.icon;
                        const isExporting = exporting === format.id;

                        return (
                            <button
                                key={format.id}
                                className={`export-option ${isExporting ? 'exporting' : ''}`}
                                onClick={format.action}
                                disabled={isExporting}
                            >
                                <div className="export-option-icon">
                                    {isExporting ? (
                                        <div className="spinner" />
                                    ) : (
                                        <Icon size={20} />
                                    )}
                                </div>
                                <div className="export-option-info">
                                    <span className="export-option-label">{format.label}</span>
                                    <span className="export-option-desc">{format.description}</span>
                                </div>
                                {isExporting && <span className="exporting-text">{t.exporting}</span>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ExportDropdown;
