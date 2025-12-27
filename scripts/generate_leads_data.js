import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIRST_NAMES = [
    'יוסי', 'אברהם', 'יצחק', 'יעקב', 'משה', 'אהרון', 'דוד', 'שלמה', 'דניאל', 'מיכאל',
    'שרה', 'רבקה', 'רחל', 'לאה', 'מרים', 'אסתר', 'רות', 'נועה', 'תמר', 'מיכל',
    'חיים', 'שמעון', 'לוי', 'יהודה', 'יוסף', 'בנימין', 'גד', 'אשר', 'נפתלי', 'זבולון',
    'דינה', 'חנה', 'פנינה', 'שולמית', 'אביגיל', 'בת שבע', 'אלישבע', 'ורד', 'יעל', 'טליה',
    'רוני', 'אריאל', 'עוז', 'טל', 'אורי', 'נועם', 'איתי', 'גיא', 'עידן', 'עומר'
];

const LAST_NAMES = [
    'כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'דהן', 'אברהם', 'פרידמן', 'מלכה', 'אזולאי',
    'כץ', 'יוסף', 'חדד', 'עמר', 'אוחיון', 'גבאי', 'בנימין', 'לרנר', 'שפירא', 'ברק',
    'הלוי', 'ששון', 'גולן', 'סגל', 'קדוש', 'נחום', 'שוורץ', 'אשכנזי', 'לנדאו', 'רוזן',
    'סולומון', 'אלבז', 'אמסלם', 'בוזגלו', 'נגר', 'מוסקוביץ', 'וייס', 'גרינברג', 'שמש', 'בר'
];

const COMPANIES = [
    'מוסך הצפון', 'קייטרינג משובח', 'משרד רואי חשבון', 'סטודיו לעיצוב', 'חברת הובלות',
    'דפוס דיגיטלי', 'מסעדת היוקרה', 'חנות פרחים', 'מרפאת שיניים', 'מכון כושר',
    'טכנולוגיות בע״מ', 'שירותי ענן', 'אבטחת מידע', 'שיווק דיגיטלי', 'ייעוץ עסקי',
    'נדל״ן ישראל', 'רהיטי איכות', 'בגדי מעצבים', 'ספא בוטיק', 'מספרת העיר',
    'מוצרי חשמל', 'רשת מזון', 'בית קפה', 'חנות תכשיטים', 'ציוד משרדי',
    'חומרי בניין', 'חברת ניקיון', 'גינון ונוף', 'מערכות מיזוג', 'שירותי רכב',
    'מרכז למידה', 'גן ילדים', 'בית אבות', 'חברת ביטוח', 'סוכנות נסיעות',
    'השכרת רכב', 'תיקון סלולר', 'מעבדה ממוחשבת', 'ייבוא ושיווק', 'הפצות לוגיסטיקה',
    'עורכי דין שותפים', 'נוטריון ציבורי', 'שמאי מקרקעין', 'מהנדסי בניין', 'אדריכלים ומעצבים',
    'פתרונות פיננסיים', 'הלוואות ומשכנתאות', 'המרכז לריהוט', 'עולם המים', 'סטארטאפ ניישן'
];

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION']; // Common CRM statuses
const SOURCES = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'GOOGLE', 'WEBSITE', 'REFERRAL', 'COLD_CALL'];

// Helper to get random item
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate random Israeli phone number
function generatePhone() {
    const prefix = getRandom(['050', '052', '053', '054', '055', '058', '051', '059', '056', '057']);
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `${prefix}-${String(number).substring(1)}`;
}

// Generate random email
function generateEmail(idx) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'wallanet.co.il', 'company.com'];
    return `lead${idx + 1}@${Math.floor(Math.random() * 10000)}.com`;
}

const leads = [];

for (let i = 0; i < 50; i++) {
    const firstName = getRandom(FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);

    const lead = {
        name: `${firstName} ${lastName}`,
        email: generateEmail(i),
        phone: generatePhone(),
        company: getRandom(COMPANIES),
        status: getRandom(STATUSES),
        source: getRandom(SOURCES),
        estimatedValue: Math.floor(Math.random() * 50000) + 1000 // Value between 1000 and 51000
    };

    leads.push(lead);
}

// Output directory
const OUTPUT_DIR = path.resolve(__dirname, '../public/samples');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 1. JSON
const jsonPath = path.join(OUTPUT_DIR, 'generated_leads_50.json');
fs.writeFileSync(jsonPath, JSON.stringify(leads, null, 2), 'utf-8');
console.log(`Created JSON: ${jsonPath}`);

// 2. CSV
const headers = Object.keys(leads[0]).join(',');
const csvRows = leads.map(lead => {
    return Object.values(lead).map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',');
});
const csvContent = [headers, ...csvRows].join('\n');
const csvPath = path.join(OUTPUT_DIR, 'generated_leads_50.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log(`Created CSV: ${csvPath}`);

// 3. Excel (XLSX)
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(leads);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
const xlsxPath = path.join(OUTPUT_DIR, 'generated_leads_50.xlsx');
XLSX.writeFile(workbook, xlsxPath);
console.log(`Created XLSX: ${xlsxPath}`);

console.log('Done.');
