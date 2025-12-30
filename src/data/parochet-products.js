/**
 * Parochet Products Data
 * 30 products = 10 designs × 3 complexity levels
 *
 * Based on catalog: פרוכת 10 עמודים.pdf
 *
 * Complexity Levels:
 * - SIMPLE (BW): רקמה פשוטה - Simple drawing
 * - MEDIUM (A): רקמה בינונית - Medium complexity
 * - FULL (B): רקמה מלאה - Full/elaborate embroidery
 */

const designs = [
  {
    id: 'keter-vezer',
    nameHe: 'כתר וזר',
    catalogPrefix: 'Z0',
    description: 'עיצוב קלאסי עם כתר ומוטיבים של זרים'
  },
  {
    id: 'yerushalaim-agol',
    nameHe: 'ירושלים עגול',
    catalogPrefix: 'Z1',
    description: 'עיצוב עגול עם נוף ירושלים'
  },
  {
    id: 'meateret-malkhut',
    nameHe: 'מעטרת מלכות',
    catalogPrefix: 'Z2',
    description: 'עיצוב מלכותי מפואר'
  },
  {
    id: 'shaar-vilna-full',
    nameHe: 'שער וילנא רקמה מלאה',
    catalogPrefix: 'Z3',
    description: 'שער וילנא עם רקמה מלאה ומפורטת'
  },
  {
    id: 'etz-chaim',
    nameHe: 'עץ חיים',
    catalogPrefix: 'Z4',
    description: 'עיצוב עץ החיים המסורתי'
  },
  {
    id: 'keter-chevronski',
    nameHe: 'כתר ואבני חברונסקי',
    catalogPrefix: 'Z5',
    description: 'עיצוב עם כתר ואבנים מסורתיות'
  },
  {
    id: 'shaar-vilna-tchum',
    nameHe: 'שער וילנא תחום',
    catalogPrefix: 'Z6',
    description: 'שער וילנא בעיצוב תחום'
  },
  {
    id: 'beit-mikdash',
    nameHe: 'בית מקדש רקמה מלאה',
    catalogPrefix: 'Z7',
    description: 'בית המקדש עם רקמה מלאה ומפורטת'
  },
  {
    id: 'kinot-shaar-tzvi',
    nameHe: 'כינות שער צבי',
    catalogPrefix: 'Z8',
    description: 'עיצוב שער צבי עם מוטיבי כינות'
  },
  {
    id: 'shaar-harachamim',
    nameHe: 'שער והרחמים',
    catalogPrefix: 'Z9',
    description: 'שער הרחמים - עיצוב מרגש ומפואר'
  }
];

const complexityLevels = [
  {
    id: 'SIMPLE',
    nameHe: 'רקמה פשוטה',
    catalogSize: 'BW',
    basePrice: 5500,
    description: 'ציור פשוט, מחיר נמוך יותר'
  },
  {
    id: 'MEDIUM',
    nameHe: 'רקמה בינונית',
    catalogSize: 'A',
    basePrice: 7000,
    description: 'ציור בינוני, איזון בין מחיר לאיכות'
  },
  {
    id: 'FULL',
    nameHe: 'רקמה מלאה',
    catalogSize: 'B',
    basePrice: 8500,
    description: 'ציור מפואר ומפורט, המחיר הגבוה ביותר'
  }
];

// Generate 30 products (10 designs × 3 complexity levels)
const parochetProducts = [];

designs.forEach(design => {
  complexityLevels.forEach(level => {
    parochetProducts.push({
      id: `parochet-${design.id}-${level.id.toLowerCase()}`,
      name: `פרוכת ${design.nameHe} - ${level.nameHe}`,
      sku: `PAROCHET-${design.id.toUpperCase()}-${level.id}`,
      category: 'RITUAL',
      status: 'ACTIVE',

      // Hierarchy
      parentProductId: 'parochet-base',
      designTag: design.nameHe,
      complexityLevel: level.id,
      catalogCode: `${level.catalogSize}1${design.catalogPrefix}`,

      // Pricing
      basePrice: level.basePrice,

      // Production
      workflowId: 'workflow-parochet-7-steps',
      productionTime: 42, // 42 days total

      // Description
      description: `${design.description} - ${level.description}`,

      // Image (placeholder)
      imageUrl: `/images/parochet/${design.id}-${level.id.toLowerCase()}.jpg`,

      // Parameters - will be selected at order time
      parameterAssignments: [
        { parameterId: 'param-size', isRequired: true },
        { parameterId: 'param-font-style', isRequired: false },
        { parameterId: 'param-font-color', isRequired: false },
        { parameterId: 'param-dedication-text', isRequired: true }
      ],

      // Metadata
      createdAt: '2025-12-29T00:00:00Z',
      updatedAt: '2025-12-29T00:00:00Z'
    });
  });
});

// Base product (parent for all 30 variants)
const parochetBase = {
  id: 'parochet-base',
  name: 'פרוכת ארון קודש',
  sku: 'PAROCHET-BASE',
  category: 'RITUAL',
  status: 'ACTIVE',
  basePrice: 0,
  parentProductId: null,
  description: 'פרוכת מהודרת לארון הקודש - 10 דגמים בשלוש רמות מורכבות',
  workflowId: 'workflow-parochet-7-steps',
  productionTime: 42,
  imageUrl: '/images/parochet/parochet-base.jpg',
  createdAt: '2025-12-29T00:00:00Z',
  updatedAt: '2025-12-29T00:00:00Z'
};

export { parochetProducts, parochetBase, designs, complexityLevels };
