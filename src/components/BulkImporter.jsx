/**
 * BulkImporter Component
 *
 * A comprehensive, multi-step file import wizard that handles various file formats
 * and provides intelligent field mapping, data validation, and progress tracking.
 *
 * @component
 *
 * @description
 * This component provides a complete data import workflow with four main steps:
 * 1. **Upload**: Drag-and-drop or file picker for multiple file formats
 * 2. **Mapping**: Intelligent auto-mapping of source columns to target fields
 * 3. **Preview**: Visual validation of mapped data with error highlighting
 * 4. **Import**: Batch import with real-time progress tracking and error reporting
 *
 * @features
 * - Multi-format support: CSV, Excel (.xlsx, .xls), JSON, Images, PDF
 * - Intelligent auto-mapping with three strategies:
 *   - Common field name aliases (e.g., "email", "e-mail", "mail")
 *   - Exact case-insensitive key matching
 *   - Fuzzy matching based on substring containment
 * - Real-time data validation with required field checking
 * - Batch import with progress tracking
 * - Bilingual support (Hebrew/English)
 * - Comprehensive error handling and reporting
 * - Sample file downloads for user guidance
 *
 * @example
 * ```jsx
 * <BulkImporter
 *   entityType="customers"
 *   targetFields={[
 *     { key: 'name', label: 'Full Name', type: 'text', required: true },
 *     { key: 'email', label: 'Email', type: 'email', required: true },
 *     { key: 'phone', label: 'Phone', type: 'tel', required: false }
 *   ]}
 *   onImport={async (row) => {
 *     // Process the row data
 *     const result = await api.customers.create(row);
 *     return result;
 *   }}
 *   language="he"
 *   onClose={() => setShowImporter(false)}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} [props.entityType='customers'] - Type of entity being imported (customers, products, orders)
 * @param {Array<{key: string, label: string, type: string, required: boolean}>} props.targetFields -
 *   Array of target field definitions that the imported data will be mapped to
 * @param {Function} props.onImport - Async callback function to handle importing each row.
 *   Should return a result object with optional `_action: 'updated'` property if the row was updated rather than created.
 * @param {string} [props.language='he'] - UI language ('he' for Hebrew, 'en' for English)
 * @param {Function} [props.onClose] - Callback function when the importer is closed
 *
 * @returns {JSX.Element} A modal-style import wizard interface
 *
 * @author Front Yoel System
 * @since 1.0.0
 */

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

/**
 * Supported file types configuration
 * @constant {Object}
 */
const SUPPORTED_TYPES = {
    spreadsheet: ['.csv', '.xlsx', '.xls'],
    json: ['.json'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    document: ['.pdf']
};

/**
 * Flattened array of all supported file extensions
 * @constant {string[]}
 */
const ALL_TYPES = [...SUPPORTED_TYPES.spreadsheet, ...SUPPORTED_TYPES.json, ...SUPPORTED_TYPES.image, ...SUPPORTED_TYPES.document];

/**
 * Step definitions for the import wizard
 * Each step has an ID, internal name, and bilingual label
 * @constant {Array<{id: number, name: string, label: {he: string, en: string}}>}
 */
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

    /**
     * Detects file type based on file extension
     *
     * @param {string} filename - The name of the file including extension
     * @returns {string|null} File type category ('spreadsheet', 'json', 'image', 'document') or null if unsupported
     */
    const getFileType = (filename) => {
        const ext = '.' + filename.split('.').pop().toLowerCase();
        if (SUPPORTED_TYPES.spreadsheet.includes(ext)) return 'spreadsheet';
        if (SUPPORTED_TYPES.json.includes(ext)) return 'json';
        if (SUPPORTED_TYPES.image.includes(ext)) return 'image';
        if (SUPPORTED_TYPES.document.includes(ext)) return 'document';
        return null;
    };

    /**
     * Main file processing router that delegates to format-specific processors
     *
     * This function:
     * 1. Validates the file type
     * 2. Sets the file state
     * 3. Routes to appropriate processor based on file type
     * 4. Handles processing errors
     *
     * @async
     * @param {File} uploadedFile - The File object from the browser's file input or drag-drop
     * @throws {Error} If file type is unsupported or processing fails
     */
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

    /**
     * Processes JSON files and extracts data arrays
     *
     * Handles various JSON structures:
     * - Direct array: `[{...}, {...}]`
     * - Wrapped in 'data' property: `{data: [{...}]}`
     * - Wrapped in 'items' property: `{items: [{...}]}`
     * - Single object: `{...}` (wrapped in array)
     *
     * After parsing, automatically:
     * 1. Extracts all unique keys as source columns
     * 2. Triggers auto-mapping
     * 3. Advances to mapping step
     *
     * @async
     * @param {File} file - The JSON file to process
     * @returns {Promise<void>}
     * @throws {Error} If JSON is invalid or contains no data
     */
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

    /**
     * Processes spreadsheet files (CSV, Excel .xlsx/.xls) using SheetJS library
     *
     * Processing steps:
     * 1. Reads file as ArrayBuffer
     * 2. Parses with XLSX library
     * 3. Extracts first sheet
     * 4. Converts to JSON format with first row as headers
     * 5. Filters empty rows
     * 6. Transforms row arrays into objects with headers as keys
     * 7. Triggers auto-mapping and advances to mapping step
     *
     * @async
     * @param {File} file - The spreadsheet file (CSV, XLSX, or XLS)
     * @returns {Promise<void>}
     * @throws {Error} If file has no data or parsing fails
     *
     * @example
     * // Input CSV:
     * // Name,Email,Phone
     * // John Doe,john@example.com,555-1234
     * //
     * // Produces:
     * // [{Name: 'John Doe', Email: 'john@example.com', Phone: '555-1234'}]
     */
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

    /**
     * Processes image files by creating a single-row dataset
     *
     * Images are treated as single entities with fileName and imageFile properties.
     * The file object is preserved for later upload or processing.
     *
     * @param {File} file - The image file (JPG, PNG, GIF, WEBP)
     */
    const processImage = (file) => {
        // For images, we create a single row with the image
        setRawData([{ imageFile: file, fileName: file.name }]);
        setSourceColumns(['fileName', 'imageFile']);
        setCurrentStep(2);
    };

    /**
     * Processes PDF files by creating a single-row dataset
     *
     * PDFs require server-side processing for text extraction.
     * This function prepares the file for upload and further processing.
     *
     * @param {File} file - The PDF file
     */
    const processPDF = (file) => {
        // For PDFs, we note that we need server-side processing
        setRawData([{ pdfFile: file, fileName: file.name }]);
        setSourceColumns(['fileName', 'pdfFile']);
        setCurrentStep(2);
    };

    /**
     * Predefined mapping of common field keys to their typical column name variations
     *
     * This lookup table supports multiple languages (English, Hebrew) and common variations
     * to improve auto-mapping accuracy. Used as the first strategy in autoMapFields().
     *
     * @constant {Object<string, string[]>}
     */
    const COMMON_MAPPINGS = {
        name: ['name', 'full name', 'fullname', 'שם', 'שם מלא', 'first name', 'firstName'],
        email: ['email', 'e-mail', 'mail', 'אימייל', 'דואר אלקטרוני'],
        phone: ['phone', 'mobile', 'cellphone', 'tel', 'telephone', 'טלפון', 'נייד'],
        company: ['company', 'organization', 'business', 'חברה', 'ארגון', 'companyName'],
        stage: ['stage', 'status', 'phase', 'שלב', 'סטטוס', 'leadStatus'],
        source: ['source', 'origin', 'מקור'],
        estimatedValue: ['value', 'amount', 'estimated value', 'deal value', 'שווי', 'סכום', 'ערך']
    };

    /**
     * Intelligently maps source columns to target fields using multiple strategies
     *
     * This is the core auto-mapping algorithm with three cascading strategies:
     *
     * **Strategy 1: Common Mappings Lookup**
     * - Checks if field key exists in COMMON_MAPPINGS
     * - Searches for any column name that matches predefined aliases
     * - Example: 'email' field matches columns: "email", "e-mail", "mail", "אימייל"
     *
     * **Strategy 2: Exact Key Match (Case Insensitive)**
     * - Direct comparison between field key and column name
     * - Example: 'name' field matches "Name", "NAME", "name"
     *
     * **Strategy 3: Fuzzy Match (Substring Containment)**
     * - Checks if field key is contained in column name or vice versa
     * - Also checks against field label for better matching
     * - Example: 'phone' field matches "customer_phone", "phone_number"
     *
     * **Important Notes:**
     * - Each column can only be mapped once (tracked via usedColumns Set)
     * - Strategies are tried in order; first match wins
     * - Case-insensitive matching throughout
     * - Automatically updates fieldMappings state
     *
     * @param {string[]} columns - Array of source column names from the uploaded file
     *
     * @example
     * // Given targetFields: [{key: 'email', label: 'Email Address'}, {key: 'name', ...}]
     * // And columns: ['User Email', 'Full Name', 'Phone']
     * // Results in mappings: {email: 'User Email', name: 'Full Name'}
     */
    const autoMapFields = (columns) => {
        const mappings = {};
        const usedColumns = new Set();
        const columnsLower = columns.map(c => c.toLowerCase());

        targetFields.forEach(field => {
            const fieldKey = field.key;
            let matchedColumn = null;

            // 1. Try strategy: Common Mappings
            if (COMMON_MAPPINGS[fieldKey]) {
                const aliasMatch = columns.find(col =>
                    COMMON_MAPPINGS[fieldKey].includes(col.toLowerCase()) && !usedColumns.has(col)
                );
                if (aliasMatch) matchedColumn = aliasMatch;
            }

            // 2. Try strategy: Exact Key Match (Case Insensitive)
            if (!matchedColumn) {
                const exactMatch = columns.find(col =>
                    col.toLowerCase() === fieldKey.toLowerCase() && !usedColumns.has(col)
                );
                if (exactMatch) matchedColumn = exactMatch;
            }

            // 3. Try strategy: Fuzzy Match (Contains)
            if (!matchedColumn) {
                const fuzzyMatch = columns.find(col => {
                    if (usedColumns.has(col)) return false;
                    const colLower = col.toLowerCase();
                    const keyLower = fieldKey.toLowerCase();
                    const labelLower = (field.label || '').toLowerCase();
                    return colLower.includes(keyLower) || keyLower.includes(colLower) ||
                        (labelLower && (colLower.includes(labelLower) || labelLower.includes(colLower)));
                });
                if (fuzzyMatch) matchedColumn = fuzzyMatch;
            }

            if (matchedColumn) {
                mappings[fieldKey] = matchedColumn;
                usedColumns.add(matchedColumn);
            }
        });

        setFieldMappings(mappings);
    };

    /**
     * Updates field mapping when user manually changes a mapping in the UI
     *
     * @param {string} targetField - The target field key being mapped
     * @param {string} sourceColumn - The source column name to map to (empty string to unmap)
     */
    const handleMappingChange = (targetField, sourceColumn) => {
        setFieldMappings(prev => ({
            ...prev,
            [targetField]: sourceColumn || null
        }));
    };

    /**
     * Transforms raw data into mapped format with validation status
     *
     * This function:
     * 1. Iterates through all raw data rows
     * 2. Maps source columns to target fields based on current fieldMappings
     * 3. Validates that all required fields have values
     * 4. Adds metadata: _rowIndex (1-based) and _isValid (boolean)
     *
     * @returns {Array<Object>} Array of mapped objects with validation metadata
     *
     * @example
     * // Returns:
     * // [
     * //   {_rowIndex: 1, _isValid: true, name: 'John', email: 'john@example.com'},
     * //   {_rowIndex: 2, _isValid: false, name: '', email: 'jane@example.com'}
     * // ]
     */
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

    /**
     * Calculates statistics about mapped data for display purposes
     *
     * @returns {{total: number, valid: number, invalid: number}} Row count statistics
     */
    const getRowCounts = useCallback(() => {
        const mapped = getMappedData();
        const valid = mapped.filter(r => r._isValid).length;
        const invalid = mapped.filter(r => !r._isValid).length;
        return { total: mapped.length, valid, invalid };
    }, [getMappedData]);

    /**
     * Executes the batch import process with progress tracking and error handling
     *
     * **Process Flow:**
     * 1. Filters to only valid rows (rows where all required fields have values)
     * 2. Iterates through each row sequentially
     * 3. Removes internal metadata fields (_rowIndex, _isValid)
     * 4. Calls onImport callback for each row
     * 5. Tracks success/updated/failed counts
     * 6. Updates progress percentage after each row
     * 7. Collects error details for failed rows
     * 8. Advances to results step (step 4)
     *
     * **Result Tracking:**
     * - `success`: Rows that were newly created
     * - `updated`: Rows that updated existing records (identified by `_action: 'updated'` in callback result)
     * - `failed`: Rows that threw errors during import
     * - `errors`: Array of {row: number, error: string} for failed imports
     *
     * @async
     * @returns {Promise<void>}
     *
     * @example
     * // onImport callback should return result indicating action taken:
     * // {_action: 'updated'} - for updates
     * // {} or any other object - for new creations
     * // throw Error - for failures
     */
    const handleImport = async () => {
        setImporting(true);
        setImportProgress(0);
        setImportResults(null);

        const dataToImport = getMappedData().filter(r => r._isValid);
        const results = { success: 0, updated: 0, failed: 0, errors: [] };

        try {
            for (let i = 0; i < dataToImport.length; i++) {
                const row = dataToImport[i];

                // Remove internal fields
                const cleanRow = { ...row };
                delete cleanRow._rowIndex;
                delete cleanRow._isValid;

                try {
                    let result = null;
                    if (onImport) {
                        result = await onImport(cleanRow);
                    }

                    if (result && result._action === 'updated') {
                        results.updated++;
                    } else {
                        results.success++;
                    }
                } catch (err) {
                    results.failed++;
                    results.errors.push({
                        row: row._rowIndex,
                        error: err.message || (typeof err === 'string' ? err : 'Unknown error occurred')
                    });
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

    /**
     * Handles drag over event for drag-and-drop file upload
     * @param {DragEvent} e - The drag event
     */
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    /**
     * Handles drag leave event to reset drag state
     */
    const handleDragLeave = () => {
        setIsDragging(false);
    };

    /**
     * Handles file drop event and processes the dropped file
     * @param {DragEvent} e - The drop event containing file data
     */
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    /**
     * Handles file selection from file input element
     * @param {Event} e - The change event from file input
     */
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    /**
     * Renders the step indicator component showing progress through the wizard
     * @returns {JSX.Element} Step indicator UI
     */
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

    /**
     * Renders Step 1: File upload interface with drag-and-drop
     * @returns {JSX.Element} Upload step UI
     */
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

    /**
     * Renders Step 2: Field mapping interface with auto-mapping button
     * Shows required and optional fields with dropdown selectors for source columns
     * @returns {JSX.Element} Mapping step UI
     */
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

    /**
     * Renders Step 3: Data preview with validation status
     * Shows statistics and table preview (first 50 rows) with valid/invalid indicators
     * @returns {JSX.Element} Preview step UI
     */
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

    /**
     * Renders Step 4: Import progress and results
     * Shows spinner during import, then displays success/failure statistics
     * @returns {JSX.Element} Import step UI
     */
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
                            <span>{language === 'he' ? 'חדשים' : 'Added'}</span>
                        </div>
                        {importResults.updated > 0 && (
                            <div className="result-stat warning" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                                <RefreshCw size={20} />
                                <span>{importResults.updated}</span>
                                <span>{language === 'he' ? 'עודכנו' : 'Updated'}</span>
                            </div>
                        )}
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

    /**
     * Routes to the appropriate render function based on current step
     * @returns {JSX.Element|null} Current step UI component
     */
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return renderUploadStep();
            case 2: return renderMappingStep();
            case 3: return renderPreviewStep();
            case 4: return renderImportStep();
            default: return null;
        }
    };

    /**
     * Validates whether user can proceed to the next step
     *
     * Validation rules by step:
     * - Step 1 (Upload): File must be selected and data extracted
     * - Step 2 (Mapping): All required fields must be mapped
     * - Step 3 (Preview): At least one valid row must exist
     *
     * @returns {boolean} True if user can proceed, false otherwise
     */
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
