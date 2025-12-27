import { useState, useRef, useCallback } from 'react';
import {
    Upload,
    FileSpreadsheet,
    FileImage,
    FileText,
    X,
    Check,
    AlertTriangle,
    Loader2,
    ChevronRight,
    ChevronLeft,
    ArrowRight,
    RefreshCw,
    Wand2,
    Link,
    Unlink,
    Eye,
    Download,
    Trash2,
    HelpCircle,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './BulkImporter.css';

// Supported file types
const SUPPORTED_TYPES = {
    spreadsheet: ['.csv', '.xlsx', '.xls'],
    json: ['.json'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    document: ['.pdf']
};

const ALL_TYPES = [...SUPPORTED_TYPES.spreadsheet, ...SUPPORTED_TYPES.json, ...SUPPORTED_TYPES.image, ...SUPPORTED_TYPES.document];

// Step indicators
const STEPS = [
    { id: 1, name: 'upload', label: { he: 'העלאת קובץ', en: 'Upload File' } },
    { id: 2, name: 'mapping', label: { he: 'התאמת שדות', en: 'Field Mapping' } },
    { id: 3, name: 'preview', label: { he: 'תצוגה מקדימה', en: 'Preview' } },
    { id: 4, name: 'import', label: { he: 'ייבוא', en: 'Import' } }
];

function BulkImporter({
    entityType = 'customers', // customers, products, orders
    targetFields = [], // Array of { key, label, type, required }
    onImport, // Function to handle the import
    language = 'he',
    onClose
}) {
    // Steps
    const [currentStep, setCurrentStep] = useState(1);

    // File handling
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Data
    const [rawData, setRawData] = useState([]);
    const [sourceColumns, setSourceColumns] = useState([]);
    const [fieldMappings, setFieldMappings] = useState({}); // { targetField: sourceColumn }

    // Import status
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importResults, setImportResults] = useState(null);
    const [error, setError] = useState(null);

    // Labels
    const labels = {
        he: {
            title: 'ייבוא נתונים',
            dragDrop: 'גרור קבצים לכאן או לחץ לבחירה',
            supportedFormats: 'פורמטים נתמכים: CSV, Excel, תמונות, PDF',
            selectedFile: 'קובץ נבחר',
            changeFile: 'שנה קובץ',
            autoMapping: 'התאמה אוטומטית',
            manualMapping: 'התאמה ידנית',
            sourceColumn: 'עמודת מקור',
            targetField: 'שדה יעד',
            required: 'חובה',
            optional: 'אופציונלי',
            unmapped: 'לא ממופה',
            previewData: 'תצוגה מקדימה',
            rowsToImport: 'שורות לייבוא',
            validRows: 'שורות תקינות',
            invalidRows: 'שורות עם שגיאות',
            startImport: 'התחל ייבוא',
            importing: 'מייבא...',
            importComplete: 'הייבוא הושלם',
            importFailed: 'שגיאה בייבוא',
            successCount: 'נוספו בהצלחה',
            failCount: 'נכשלו',
            close: 'סגור',
            back: 'חזור',
            next: 'הבא',
            finish: 'סיום',
            noData: 'אין נתונים בקובץ',
            processingFile: 'מעבד קובץ...'
        },
        en: {
            title: 'Import Data',
            dragDrop: 'Drag files here or click to select',
            supportedFormats: 'Supported formats: CSV, Excel, Images, PDF',
            selectedFile: 'Selected file',
            changeFile: 'Change file',
            autoMapping: 'Auto Mapping',
            manualMapping: 'Manual Mapping',
            sourceColumn: 'Source Column',
            targetField: 'Target Field',
            required: 'Required',
            optional: 'Optional',
            unmapped: 'Unmapped',
            previewData: 'Preview Data',
            rowsToImport: 'Rows to import',
            validRows: 'Valid rows',
            invalidRows: 'Rows with errors',
            startImport: 'Start Import',
            importing: 'Importing...',
            importComplete: 'Import Complete',
            importFailed: 'Import Failed',
            successCount: 'Successfully added',
            failCount: 'Failed',
            close: 'Close',
            back: 'Back',
            next: 'Next',
            finish: 'Finish',
            noData: 'No data in file',
            processingFile: 'Processing file...'
        }
    };

    const t = labels[language] || labels.he;

    // File type detection
    const getFileType = (filename) => {
        const ext = '.' + filename.split('.').pop().toLowerCase();
        if (SUPPORTED_TYPES.spreadsheet.includes(ext)) return 'spreadsheet';
        if (SUPPORTED_TYPES.json.includes(ext)) return 'json';
        if (SUPPORTED_TYPES.image.includes(ext)) return 'image';
        if (SUPPORTED_TYPES.document.includes(ext)) return 'document';
        return null;
    };

    // Process uploaded file
    const processFile = async (uploadedFile) => {
        setError(null);
        const type = getFileType(uploadedFile.name);

        if (!type) {
            setError(`Unsupported file type. Supported: ${ALL_TYPES.join(', ')}`);
            return;
        }

        setFile(uploadedFile);
        setFileType(type);

        try {
            if (type === 'spreadsheet') {
                await processSpreadsheet(uploadedFile);
            } else if (type === 'json') {
                await processJSON(uploadedFile);
            } else if (type === 'image') {
                processImage(uploadedFile);
            } else if (type === 'document') {
                processPDF(uploadedFile);
            }
        } catch (err) {
            setError(err.message || 'Error processing file');
        }
    };

    // Process JSON
    const processJSON = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    let dataArray = [];

                    if (Array.isArray(json)) {
                        dataArray = json;
                    } else if (json.data && Array.isArray(json.data)) {
                        dataArray = json.data;
                    } else if (json.items && Array.isArray(json.items)) {
                        dataArray = json.items;
                    } else {
                        // Single object? try to wrap
                        dataArray = [json];
                    }

                    if (dataArray.length === 0) {
                        reject(new Error(t.noData));
                        return;
                    }

                    // Extract headers from first Item (or all items if inconsistent)
                    const headers = Array.from(new Set(dataArray.flatMap(Object.keys)));

                    setSourceColumns(headers);
                    setRawData(dataArray);
                    autoMapFields(headers);
                    setCurrentStep(2);
                    resolve();
                } catch (err) {
                    reject(new Error('Invalid JSON format'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    };

    // Process spreadsheet (CSV/Excel)
    const processSpreadsheet = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Get first sheet
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    if (jsonData.length < 2) {
                        reject(new Error(t.noData));
                        return;
                    }

                    // First row is headers
                    const headers = jsonData[0].map(h => String(h || '').trim());
                    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

                    // Convert to objects
                    const dataObjects = rows.map(row => {
                        const obj = {};
                        headers.forEach((header, i) => {
                            obj[header] = row[i];
                        });
                        return obj;
                    });

                    setSourceColumns(headers);
                    setRawData(dataObjects);

                    // Auto-map fields
                    autoMapFields(headers);

                    // Move to mapping step
                    setCurrentStep(2);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    };

    // Process image
    const processImage = (file) => {
        // For images, we create a single row with the image
        setRawData([{ imageFile: file, fileName: file.name }]);
        setSourceColumns(['fileName', 'imageFile']);
        setCurrentStep(2);
    };

    // Process PDF
    const processPDF = (file) => {
        // For PDFs, we note that we need server-side processing
        setRawData([{ pdfFile: file, fileName: file.name }]);
        setSourceColumns(['fileName', 'pdfFile']);
        setCurrentStep(2);
    };

    // Auto-map fields based on column name similarity
    const autoMapFields = (columns) => {
        const mappings = {};

        targetFields.forEach(field => {
            // Try to find a matching source column
            const fieldNameLower = field.key.toLowerCase();
            const fieldLabelLower = (field.label || '').toLowerCase();

            const matchedColumn = columns.find(col => {
                const colLower = col.toLowerCase();
                return colLower === fieldNameLower ||
                    colLower === fieldLabelLower ||
                    colLower.includes(fieldNameLower) ||
                    fieldNameLower.includes(colLower) ||
                    colLower.includes(fieldLabelLower) ||
                    fieldLabelLower.includes(colLower);
            });

            if (matchedColumn) {
                mappings[field.key] = matchedColumn;
            }
        });

        setFieldMappings(mappings);
    };

    // Handle field mapping change
    const handleMappingChange = (targetField, sourceColumn) => {
        setFieldMappings(prev => ({
            ...prev,
            [targetField]: sourceColumn || null
        }));
    };

    // Get mapped data for preview/import
    const getMappedData = useCallback(() => {
        return rawData.map((row, index) => {
            const mappedRow = { _rowIndex: index + 1 };
            let isValid = true;

            targetFields.forEach(field => {
                const sourceCol = fieldMappings[field.key];
                const value = sourceCol ? row[sourceCol] : null;
                mappedRow[field.key] = value;

                // Check if required field is missing
                if (field.required && (value === null || value === undefined || value === '')) {
                    isValid = false;
                }
            });

            mappedRow._isValid = isValid;
            return mappedRow;
        });
    }, [rawData, fieldMappings, targetFields]);

    // Count valid/invalid rows
    const getRowCounts = useCallback(() => {
        const mapped = getMappedData();
        const valid = mapped.filter(r => r._isValid).length;
        const invalid = mapped.filter(r => !r._isValid).length;
        return { total: mapped.length, valid, invalid };
    }, [getMappedData]);

    // Handle import
    const handleImport = async () => {
        setImporting(true);
        setImportProgress(0);
        setImportResults(null);

        const dataToImport = getMappedData().filter(r => r._isValid);
        const results = { success: 0, failed: 0, errors: [] };

        try {
            for (let i = 0; i < dataToImport.length; i++) {
                const row = dataToImport[i];

                // Remove internal fields
                const cleanRow = { ...row };
                delete cleanRow._rowIndex;
                delete cleanRow._isValid;

                try {
                    if (onImport) {
                        await onImport(cleanRow);
                    }
                    results.success++;
                } catch (err) {
                    results.failed++;
                    results.errors.push({ row: row._rowIndex, error: err.message });
                }

                setImportProgress(Math.round(((i + 1) / dataToImport.length) * 100));
            }

            setImportResults(results);
            setCurrentStep(4);
        } catch (err) {
            setError(err.message);
        } finally {
            setImporting(false);
        }
    };

    // Drag & Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    // Render step indicator
    const renderStepIndicator = () => (
        <div className="step-indicator">
            {STEPS.map((step, index) => (
                <div
                    key={step.id}
                    className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                >
                    <div className="step-number">
                        {currentStep > step.id ? <Check size={16} /> : step.id}
                    </div>
                    <span className="step-label">{step.label[language] || step.label.he}</span>
                    {index < STEPS.length - 1 && <div className="step-connector" />}
                </div>
            ))}
        </div>
    );

    // Render upload step
    const renderUploadStep = () => (
        <div className="upload-step">
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALL_TYPES.join(',')}
                    onChange={handleFileSelect}
                    hidden
                />

                {!file ? (
                    <>
                        <div className="drop-zone-icon">
                            <Upload size={48} />
                        </div>
                        <h3>{t.dragDrop}</h3>
                        <p>{t.supportedFormats}</p>

                        <div className="file-type-icons">
                            <div className="file-type-icon">
                                <FileSpreadsheet size={24} />
                                <span>CSV/Excel</span>
                            </div>
                            <div className="file-type-icon">
                                <FileImage size={24} />
                                <span>Images</span>
                            </div>
                            <div className="file-type-icon">
                                <FileText size={24} />
                                <span>PDF</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' }}>
                            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                                {language === 'he' ? 'להורדת קבצים לדוגמה:' : 'Download sample files:'}
                            </p>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                <a href="/samples/leads_sample.csv" download className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm">
                                    <FileSpreadsheet size={14} /> CSV
                                </a>
                                <a href="/samples/leads_sample.json" download className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm">
                                    <FileText size={14} /> JSON
                                </a>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="selected-file">
                        <div className="file-icon">
                            {fileType === 'spreadsheet' && <FileSpreadsheet size={32} />}
                            {fileType === 'image' && <FileImage size={32} />}
                            {fileType === 'document' && <FileText size={32} />}
                        </div>
                        <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button
                            className="change-file-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setRawData([]);
                                setSourceColumns([]);
                                setFieldMappings({});
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );

    // Render mapping step
    const renderMappingStep = () => {
        const requiredFields = targetFields.filter(f => f.required);
        const optionalFields = targetFields.filter(f => !f.required);
        const mappedRequiredCount = requiredFields.filter(f => fieldMappings[f.key]).length;

        return (
            <div className="mapping-step">
                <div className="mapping-header">
                    <div className="mapping-stats">
                        <span className="stat">
                            <CheckCircle2 size={16} className="success" />
                            {mappedRequiredCount}/{requiredFields.length} {t.required}
                        </span>
                        <span className="stat">
                            <Info size={16} className="info" />
                            {rawData.length} {language === 'he' ? 'שורות' : 'rows'}
                        </span>
                    </div>
                    <button className="btn btn-outline auto-map-btn" onClick={() => autoMapFields(sourceColumns)}>
                        <Wand2 size={16} />
                        {t.autoMapping}
                    </button>
                </div>

                <div className="mapping-grid">
                    <div className="mapping-section">
                        <h4 className="section-title required">{t.required}</h4>
                        {requiredFields.map(field => (
                            <div key={field.key} className={`mapping-row ${fieldMappings[field.key] ? 'mapped' : 'unmapped'}`}>
                                <div className="target-field">
                                    <span className="field-label">{field.label}</span>
                                    <span className="field-type">{field.type}</span>
                                </div>
                                <div className="mapping-arrow">
                                    {fieldMappings[field.key] ? (
                                        <Link size={16} className="linked" />
                                    ) : (
                                        <Unlink size={16} className="unlinked" />
                                    )}
                                </div>
                                <select
                                    className="source-select"
                                    value={fieldMappings[field.key] || ''}
                                    onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                >
                                    <option value="">{t.unmapped}</option>
                                    {sourceColumns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {optionalFields.length > 0 && (
                        <div className="mapping-section">
                            <h4 className="section-title optional">{t.optional}</h4>
                            {optionalFields.map(field => (
                                <div key={field.key} className={`mapping-row ${fieldMappings[field.key] ? 'mapped' : ''}`}>
                                    <div className="target-field">
                                        <span className="field-label">{field.label}</span>
                                        <span className="field-type">{field.type}</span>
                                    </div>
                                    <div className="mapping-arrow">
                                        {fieldMappings[field.key] ? (
                                            <Link size={16} className="linked" />
                                        ) : (
                                            <Unlink size={16} className="unlinked" />
                                        )}
                                    </div>
                                    <select
                                        className="source-select"
                                        value={fieldMappings[field.key] || ''}
                                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                    >
                                        <option value="">{t.unmapped}</option>
                                        {sourceColumns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render preview step
    const renderPreviewStep = () => {
        const mappedData = getMappedData();
        const counts = getRowCounts();
        const displayFields = targetFields.filter(f => fieldMappings[f.key]);

        return (
            <div className="preview-step">
                <div className="preview-stats">
                    <div className="stat-card">
                        <span className="stat-value">{counts.total}</span>
                        <span className="stat-label">{t.rowsToImport}</span>
                    </div>
                    <div className="stat-card success">
                        <CheckCircle2 size={20} />
                        <span className="stat-value">{counts.valid}</span>
                        <span className="stat-label">{t.validRows}</span>
                    </div>
                    <div className="stat-card error">
                        <XCircle size={20} />
                        <span className="stat-value">{counts.invalid}</span>
                        <span className="stat-label">{t.invalidRows}</span>
                    </div>
                </div>

                <div className="preview-table-container">
                    <table className="preview-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th className="status-col"></th>
                                {displayFields.map(field => (
                                    <th key={field.key}>{field.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {mappedData.slice(0, 50).map((row, index) => (
                                <tr key={index} className={row._isValid ? 'valid' : 'invalid'}>
                                    <td className="row-num">{row._rowIndex}</td>
                                    <td className="status-col">
                                        {row._isValid ? (
                                            <CheckCircle2 size={16} className="valid-icon" />
                                        ) : (
                                            <XCircle size={16} className="invalid-icon" />
                                        )}
                                    </td>
                                    {displayFields.map(field => (
                                        <td key={field.key} className={!row[field.key] && field.required ? 'missing' : ''}>
                                            {String(row[field.key] || '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {mappedData.length > 50 && (
                        <div className="table-more">
                            +{mappedData.length - 50} {language === 'he' ? 'שורות נוספות' : 'more rows'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render import step (progress/results)
    const renderImportStep = () => (
        <div className="import-step">
            {importing ? (
                <div className="import-progress">
                    <Loader2 className="spinner" size={48} />
                    <h3>{t.importing}</h3>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${importProgress}%` }} />
                    </div>
                    <span className="progress-text">{importProgress}%</span>
                </div>
            ) : importResults ? (
                <div className="import-results">
                    <div className={`result-icon ${importResults.failed === 0 ? 'success' : 'partial'}`}>
                        {importResults.failed === 0 ? (
                            <CheckCircle2 size={64} />
                        ) : (
                            <AlertTriangle size={64} />
                        )}
                    </div>
                    <h3>{importResults.failed === 0 ? t.importComplete : t.importFailed}</h3>

                    <div className="result-stats">
                        <div className="result-stat success">
                            <CheckCircle2 size={20} />
                            <span>{importResults.success}</span>
                            <span>{t.successCount}</span>
                        </div>
                        {importResults.failed > 0 && (
                            <div className="result-stat error">
                                <XCircle size={20} />
                                <span>{importResults.failed}</span>
                                <span>{t.failCount}</span>
                            </div>
                        )}
                    </div>

                    {importResults.errors.length > 0 && (
                        <div className="error-list">
                            <h4>{language === 'he' ? 'שגיאות' : 'Errors'}</h4>
                            {importResults.errors.slice(0, 5).map((err, i) => (
                                <div key={i} className="error-item">
                                    <span>Row {err.row}:</span> {err.error}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return renderUploadStep();
            case 2: return renderMappingStep();
            case 3: return renderPreviewStep();
            case 4: return renderImportStep();
            default: return null;
        }
    };

    // Can proceed to next step?
    const canProceed = () => {
        switch (currentStep) {
            case 1: return file && rawData.length > 0;
            case 2: {
                const requiredFields = targetFields.filter(f => f.required);
                return requiredFields.every(f => fieldMappings[f.key]);
            }
            case 3: return getRowCounts().valid > 0;
            default: return false;
        }
    };

    return (
        <div className="bulk-importer">
            <div className="importer-header">
                <h2>
                    <Upload size={24} />
                    {t.title}
                </h2>
                {onClose && (
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                )}
            </div>

            {renderStepIndicator()}

            <div className="importer-content">
                {renderStepContent()}
            </div>

            <div className="importer-footer">
                {currentStep > 1 && currentStep < 4 && (
                    <button
                        className="btn btn-outline"
                        onClick={() => setCurrentStep(prev => prev - 1)}
                    >
                        {language === 'he' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        {t.back}
                    </button>
                )}

                <div className="footer-spacer" />

                {currentStep < 3 && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        disabled={!canProceed()}
                    >
                        {t.next}
                        {language === 'he' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                )}

                {currentStep === 3 && (
                    <button
                        className="btn btn-primary"
                        onClick={handleImport}
                        disabled={!canProceed() || importing}
                    >
                        {importing ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                        {t.startImport}
                    </button>
                )}

                {currentStep === 4 && (
                    <button className="btn btn-primary" onClick={onClose}>
                        {t.finish}
                    </button>
                )}
            </div>
        </div>
    );
}

export default BulkImporter;
