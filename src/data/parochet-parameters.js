/**
 * Parochet Parameters Data - COMPLETE VERSION
 * Based on actual production form: טופס הזמנת פרוכת.pdf
 *
 * All parameters are customization options selected at order time
 */

const parochetParameters = [
    // ========== מידות (DIMENSIONS) ==========
    {
        id: 'param-height',
        name: 'גובה הפרוכת',
        nameEn: 'height',
        type: 'NUMBER',
        unit: 'CM',
        isRequired: true,
        description: 'גובה הפרוכת כולל טבעות ופרנזים',
        validationRules: {
            min: 50,
            max: 500,
            errorMessages: {
                min: 'גובה מינימלי: 50 ס"מ',
                max: 'גובה מקסימלי: 500 ס"מ'
            }
        },
        priceImpactFormula: 'height * 10' // ₪10 per cm
    },

    {
        id: 'param-width',
        name: 'רוחב הפרוכת',
        nameEn: 'width',
        type: 'NUMBER',
        unit: 'CM',
        isRequired: true,
        description: 'רוחב הפרוכת',
        validationRules: {
            min: 50,
            max: 500,
            errorMessages: {
                min: 'רוחב מינימלי: 50 ס"מ',
                max: 'רוחב מקסימלי: 500 ס"מ'
            }
        },
        priceImpactFormula: 'width * 8' // ₪8 per cm
    },

    {
        id: 'param-hidden-area-top',
        name: 'שטח נסתר עליון',
        nameEn: 'hidden-area-top',
        type: 'NUMBER_OR_NONE',
        unit: 'CM',
        isRequired: false,
        description: 'האם יש שטח נסתר עליון? אם כן - באיזה גובה?',
        options: [
            { id: 'without', label: 'ללא', priceImpact: 0 },
            { id: 'custom', label: 'מותאם אישית', requiresInput: true, priceImpact: 200 }
        ]
    },

    {
        id: 'param-hidden-area-sides',
        name: 'שטח נסתר בצדדים',
        nameEn: 'hidden-area-sides',
        type: 'NUMBER_OR_NONE',
        unit: 'CM',
        isRequired: false,
        description: 'האם יש שטח נסתר בצדדים? אם כן - באיזה גובה?',
        options: [
            { id: 'without', label: 'ללא', priceImpact: 0 },
            { id: 'custom', label: 'מותאם אישית', requiresInput: true, priceImpact: 300 }
        ]
    },

    // ========== הקדשות וטקסטים (DEDICATIONS & TEXTS) ==========
    {
        id: 'param-dedication-1',
        name: 'ההקדשה 1',
        nameEn: 'dedication-1',
        type: 'TEXT',
        isRequired: true,
        description: 'טקסט ההקדשה הראשון - חייב להיות בעברית בלבד',
        validationRules: {
            min: 3,
            max: 150,
            pattern: '^[\\u0590-\\u05FF\\s,.!?:;״׳\'"\\-]+$',
            hebrewOnly: true,
            errorMessages: {
                min: 'טקסט ההקדשה חייב להכיל לפחות 3 תווים',
                max: 'טקסט ההקדשה לא יכול לעבור 150 תווים',
                pattern: 'ניתן להשתמש רק בתווים בעברית וסימני פיסוק',
                hebrewOnly: 'טקסט ההקדשה חייב להיות בעברית בלבד'
            }
        },
        placeholder: 'לעילוי נשמת...',
        maxLength: 150,
        priceImpact: 0
    },

    {
        id: 'param-dedication-2',
        name: 'ההקדשה 2',
        nameEn: 'dedication-2',
        type: 'TEXT',
        isRequired: false,
        description: 'טקסט ההקדשה השני (אופציונלי)',
        validationRules: {
            min: 0,
            max: 150,
            pattern: '^[\\u0590-\\u05FF\\s,.!?:;״׳\'"\\-]*$',
            hebrewOnly: true
        },
        placeholder: 'הקדשה נוספת (אופציונלי)',
        maxLength: 150,
        priceImpact: 150
    },

    {
        id: 'param-phrase',
        name: 'פסוק / פרזה',
        nameEn: 'phrase',
        type: 'TEXT',
        isRequired: false,
        description: 'פסוק או פרזה נוספת',
        validationRules: {
            min: 0,
            max: 200,
            pattern: '^[\\u0590-\\u05FF\\s,.!?:;״׳\'"\\-]*$',
            hebrewOnly: true
        },
        placeholder: 'פסוק או פרזה',
        maxLength: 200,
        priceImpact: 200
    },

    {
        id: 'param-font-style',
        name: 'פונט של הכיתוב',
        nameEn: 'font-style',
        type: 'SELECT',
        isRequired: false,
        description: 'סגנון הכתב להקדשות',
        options: [
            {
                id: 'montova',
                label: 'מונטובה',
                labelEn: 'Montova',
                priceImpact: 0,
                fontFamily: 'Narkisim, serif'
            },
            {
                id: 'ashkenaz',
                label: 'אשכנז',
                labelEn: 'Ashkenaz',
                priceImpact: 0,
                fontFamily: 'Narkisim, serif'
            },
            {
                id: 'sfarad',
                label: 'ספרד',
                labelEn: 'Sfarad',
                priceImpact: 0,
                fontFamily: 'David, serif'
            },
            {
                id: 'stam',
                label: 'כתב סת"ם',
                labelEn: 'STAM Script',
                priceImpact: 300,
                fontFamily: 'Shuneet, serif',
                note: 'כתב ידני מיוחד - תוספת מחיר'
            },
            {
                id: 'modern',
                label: 'מודרני',
                labelEn: 'Modern',
                priceImpact: 0,
                fontFamily: 'Assistant, sans-serif'
            }
        ]
    },

    {
        id: 'param-font-color',
        name: 'צבע פונט',
        nameEn: 'font-color',
        type: 'COLOR',
        isRequired: false,
        description: 'צבע הכתב להקדשות',
        options: [
            {
                id: 'silver',
                label: 'כסף',
                labelEn: 'Silver',
                colorHex: '#C0C0C0',
                colorRGB: 'rgb(192, 192, 192)',
                priceImpact: 0
            },
            {
                id: 'gold',
                label: 'זהב',
                labelEn: 'Gold',
                colorHex: '#FFD700',
                colorRGB: 'rgb(255, 215, 0)',
                priceImpact: 100
            }
        ]
    },

    // ========== צבעים וחומרים (COLORS & MATERIALS) ==========
    {
        id: 'param-velvet-color',
        name: 'צבע הקטיפה',
        nameEn: 'velvet-color',
        type: 'SELECT',
        isRequired: true,
        description: 'צבע בד הקטיפה העיקרי',
        options: [
            { id: 'navy-blue', label: 'כחול כהה', labelEn: 'Navy blue', colorHex: '#000080', priceImpact: 0 },
            { id: 'white', label: 'לבן', labelEn: 'White', colorHex: '#FFFFFF', priceImpact: 0 },
            { id: 'black', label: 'שחור', labelEn: 'Black', colorHex: '#000000', priceImpact: 0 },
            { id: 'bordeaux-wine', label: 'בורדו יין', labelEn: 'Bordeaux wine', colorHex: '#800020', priceImpact: 0 },
            { id: 'eggplant-burgundy', label: 'בורדו חציל', labelEn: 'Eggplant burgundy', colorHex: '#614051', priceImpact: 0 },
            { id: 'royal-blue', label: 'כחול רויאל', labelEn: 'Royal blue', colorHex: '#4169E1', priceImpact: 0 },
            { id: 'brown', label: 'חום', labelEn: 'Brown', colorHex: '#8B4513', priceImpact: 0 },
            { id: 'green', label: 'ירוק', labelEn: 'Green', colorHex: '#228B22', priceImpact: 0 },
            { id: 'gray', label: 'אפור', labelEn: 'Gray', colorHex: '#808080', priceImpact: 0 }
        ]
    },

    {
        id: 'param-embroidery-thread-color',
        name: 'צבע חוט רקמה',
        nameEn: 'embroidery-thread-color',
        type: 'COLOR',
        isRequired: false,
        description: 'צבע החוט לרקמה',
        options: [
            {
                id: 'silver',
                label: 'כסף',
                labelEn: 'Silver',
                colorHex: '#C0C0C0',
                colorRGB: 'rgb(192, 192, 192)',
                priceImpact: 0
            },
            {
                id: 'gold',
                label: 'זהב',
                labelEn: 'Gold',
                colorHex: '#FFD700',
                colorRGB: 'rgb(255, 215, 0)',
                priceImpact: 0
            }
        ]
    },

    // ========== תוספות (ADDITIONS) ==========
    {
        id: 'param-kaporet',
        name: 'כפורת אמיתית',
        nameEn: 'kaporet',
        type: 'BOOLEAN',
        isRequired: false,
        description: 'בד נוסף למעלה (Kaporet)',
        options: [
            { id: 'yes', label: 'כן', labelEn: 'Yes', priceImpact: 800 },
            { id: 'no', label: 'לא', labelEn: 'No', priceImpact: 0 }
        ]
    },

    {
        id: 'param-swarovski-stones',
        name: 'אבני סברובסקי',
        nameEn: 'swarovski-stones',
        type: 'SELECT_WITH_NUMBER',
        isRequired: false,
        description: 'האם להוסיף אבני סברובסקי?',
        options: [
            { id: 'yes', label: 'כן', labelEn: 'Yes', requiresInput: true, priceImpactFormula: 'count * 15' },
            { id: 'without', label: 'ללא', labelEn: 'Without', priceImpact: 0 }
        ],
        inputLabel: 'כמות אבנים משוערת',
        inputPlaceholder: 'הזן מספר'
    },

    {
        id: 'param-applications',
        name: 'אפליקציות',
        nameEn: 'applications',
        type: 'SELECT_WITH_OPTIONS',
        isRequired: false,
        description: 'האם יש אפליקציות? אם כן - עם ספוג?',
        options: [
            { id: 'without', label: 'ללא', labelEn: 'Without', priceImpact: 0 },
            {
                id: 'with-sponge-5mm',
                label: 'עם ספוג 5 מ"מ',
                labelEn: 'With 5mm sponge',
                priceImpact: 500
            },
            {
                id: 'with-sponge-10mm',
                label: 'עם ספוג 10 מ"מ',
                labelEn: 'With 10mm sponge',
                priceImpact: 700
            },
            {
                id: 'without-sponge',
                label: 'ללא ספוג',
                labelEn: 'Without sponge',
                priceImpact: 400
            }
        ]
    },

    {
        id: 'param-sponge-in-sewing',
        name: 'ספוג בתפירה',
        nameEn: 'sponge-in-sewing',
        type: 'SELECT',
        isRequired: false,
        description: 'האם להוסיף ספוג בזמן התפירה?',
        options: [
            { id: 'yes', label: 'כן', labelEn: 'Yes', priceImpact: 300 },
            { id: 'no', label: 'לא', labelEn: 'No', priceImpact: 0 }
        ]
    },

    // ========== פרנזים (FRINGES) ==========
    {
        id: 'param-fringes-sides',
        name: 'פרנזים בצדדים',
        nameEn: 'fringes-sides',
        type: 'SELECT',
        isRequired: false,
        description: 'סוג הפרנזים בצדדי הפרוכת',
        options: [
            { id: 'without', label: 'ללא', labelEn: 'Without', priceImpact: 0 },
            { id: 'simple', label: 'פשוט', labelEn: 'Simple', priceImpact: 200 },
            { id: 'medium', label: 'בינוני', labelEn: 'Medium', priceImpact: 350 },
            { id: 'luxury', label: 'מהודר', labelEn: 'Luxury', priceImpact: 500 }
        ]
    },

    {
        id: 'param-fringes-top',
        name: 'פרנזים בכפורת',
        nameEn: 'fringes-top',
        type: 'SELECT',
        isRequired: false,
        description: 'סוג הפרנזים בכפורת (למעלה)',
        options: [
            { id: 'without', label: 'ללא', labelEn: 'Without', priceImpact: 0 },
            { id: 'simple', label: 'פשוט', labelEn: 'Simple', priceImpact: 150 },
            { id: 'medium', label: 'בינוני', labelEn: 'Medium', priceImpact: 250 },
            { id: 'luxury', label: 'מהודר', labelEn: 'Luxury', priceImpact: 400 }
        ]
    },

    {
        id: 'param-fringes-bottom',
        name: 'פרנזים למטה',
        nameEn: 'fringes-bottom',
        type: 'SELECT',
        isRequired: false,
        description: 'סוג הפרנזים בתחתית הפרוכת',
        options: [
            { id: 'without', label: 'ללא', labelEn: 'Without', priceImpact: 0 },
            { id: 'simple', label: 'פשוט', labelEn: 'Simple', priceImpact: 200 },
            { id: 'medium', label: 'בינוני', labelEn: 'Medium', priceImpact: 350 },
            { id: 'luxury', label: 'מהודר', labelEn: 'Luxury', priceImpact: 500 }
        ]
    },

    // ========== סוג תפיסה / טבעות (HOLDING TYPE / RINGS) ==========
    {
        id: 'param-holding-type',
        name: 'סוג תפיסה',
        nameEn: 'holding-type',
        type: 'SELECT',
        isRequired: true,
        description: 'אופן התלייה של הפרוכת',
        options: [
            {
                id: 'curtain-rail',
                label: 'מסילת וילון',
                labelEn: 'Curtain rail',
                priceImpact: 0
            },
            {
                id: 'silver-rings-3cm',
                label: 'טבעות כסף עובי מוט 3 ס"מ (5 ס"מ עד לבד)',
                labelEn: 'Silver rings rod thickness 3 cm (5 cm up to fabric)',
                priceImpact: 300
            },
            {
                id: 'gold-rings-3cm',
                label: 'טבעות זהב עובי מוט 3 ס"מ (5 ס"מ עד לבד)',
                labelEn: 'Gold rings rod thickness 3 cm (5 cm up to fabric)',
                priceImpact: 400
            },
            {
                id: 'wooden-rings-natural',
                label: 'טבעות עץ צבע בהיר',
                labelEn: 'Natural color wooden rings',
                priceImpact: 250
            },
            {
                id: 'wooden-rings-dark',
                label: 'טבעות עץ צבע חום כהה',
                labelEn: 'Dark brown wooden rings',
                priceImpact: 250
            },
            {
                id: 'rings-4cm',
                label: 'טבעות עובי מוט 4 ס"מ (8 ס"מ עד לבד)',
                labelEn: 'Rod thickness rings 4 cm (8 cm up to felt)',
                priceImpact: 500
            }
        ]
    },

    // ========== קבצים (FILES) ==========
    {
        id: 'param-design-files',
        name: 'קבצים מתאימים',
        nameEn: 'design-files',
        type: 'FILE_UPLOAD',
        isRequired: false,
        description: 'קובץ רקמה, קובץ צבעים, חישוב מרכזים וכו׳',
        maxFiles: 5,
        maxSizePerFile: 10 * 1024 * 1024, // 10MB
        acceptedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.dst', '.emb', '.zip'],
        priceImpact: 0
    },

    {
        id: 'param-application-files',
        name: 'קבצים שקשורים לאפליקציות',
        nameEn: 'application-files',
        type: 'FILE_UPLOAD',
        isRequired: false,
        description: 'קבצים עבור אפליקציות',
        maxFiles: 5,
        maxSizePerFile: 10 * 1024 * 1024, // 10MB
        acceptedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.dst', '.emb', '.zip'],
        priceImpact: 0,
        showOnlyIf: { parameterId: 'param-applications', values: ['with-sponge-5mm', 'with-sponge-10mm', 'without-sponge'] }
    },

    // ========== הוראות מיוחדות (SPECIAL INSTRUCTIONS) ==========
    {
        id: 'param-special-instructions',
        name: 'הוראות מיוחדות',
        nameEn: 'special-instructions',
        type: 'TEXTAREA',
        isRequired: false,
        description: 'הערות והנחיות מיוחדות',
        placeholder: 'הוסף הערות או הנחיות מיוחדות...',
        maxLength: 500,
        priceImpact: 0
    }
];

// Future parameters (will be added when raw materials module is ready)
const futureParameters = [
    {
        id: 'param-fabric-color',
        name: 'צבע בד',
        type: 'SELECT_FROM_INVENTORY',
        isRequired: false,
        description: 'צבע הבד - תלוי במלאי חומרי גלם',
        note: 'יתווסף כאשר מודול חומרי הגלם יהיה מוכן'
    },
    {
        id: 'param-thread-color-inventory',
        name: 'צבע חוט רקמה (ממלאי)',
        type: 'SELECT_FROM_INVENTORY',
        isRequired: false,
        description: 'צבע החוט לרקמה - תלוי במלאי חומרי גלם',
        note: 'יתווסף כאשר מודול חומרי הגלם יהיה מוכן'
    }
];

export { parochetParameters, futureParameters };
