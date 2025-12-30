/**
 * Parochet Workflow Data
 * 7-step production process with dependencies
 *
 * Total: 42 days (3+2+20+10+2+2+3)
 */

const parochetWorkflow = {
  id: 'workflow-parochet-7-steps',
  name: 'תהליך ייצור פרוכת מלא',
  nameEn: 'parochet-full-production',
  description: 'תהליך ייצור פרוכת ב-7 שלבים עם תלויות בין השלבים',
  status: 'ACTIVE',
  category: 'RITUAL',
  estimatedDays: 42,

  // Steps with dependencies
  steps: [
    {
      id: 'step-1',
      stepNumber: 1,
      name: 'עיצוב סקיצה ראשוני',
      nameEn: 'initial-sketch-design',
      order: 1,
      departmentId: 'dept-design',
      departmentName: 'מחלקת עיצוב',
      estimatedDays: 3,
      dependsOnStepId: null,
      description: 'עיצוב סקיצה ראשונית לפי בחירת הלקוח ודרישותיו',
      taskTemplate: {
        title: 'עיצוב סקיצה ראשוני - {productName}',
        description: 'לעצב סקיצה ראשונית עבור לקוח {customerName}\n\nפרטי ההזמנה:\n- דגם: {designTag}\n- רמת מורכבות: {complexityLevel}\n- גודל: {size}\n- טקסט הקדשה: {dedicationText}',
        priority: 'MEDIUM'
      }
    },
    {
      id: 'step-2',
      stepNumber: 2,
      name: 'אישור לקוח + תשלום ראשון',
      nameEn: 'customer-approval-payment1',
      order: 2,
      departmentId: 'dept-sales',
      departmentName: 'מחלקת מכירות',
      estimatedDays: 2,
      dependsOnStepId: 'step-1',
      description: 'שליחת הסקיצה ללקוח לאישור וקבלת תשלום ראשון (50%)',
      taskTemplate: {
        title: 'אישור לקוח + תשלום ראשון - {productName}',
        description: 'לשלוח סקיצה ללקוח {customerName} לאישור\n\nסכום לתשלום: {firstPayment} ₪ (50% מהמחיר הכולל)\n\nאחרי אישור והעברת התשלום - לעדכן סטטוס המשימה לסיום',
        priority: 'HIGH'
      }
    },
    {
      id: 'step-3',
      stepNumber: 3,
      name: 'עיצוב רקמה + בקרה',
      nameEn: 'embroidery-design-control',
      order: 3,
      departmentId: 'dept-embroidery',
      departmentName: 'מחלקת רקמה',
      estimatedDays: 20,
      dependsOnStepId: 'step-2',
      description: 'עיצוב הרקמה המפורט ובקרת איכות על העיצוב',
      taskTemplate: {
        title: 'עיצוב רקמה + בקרה - {productName}',
        description: 'לעצב רקמה מפורטת עבור:\n- דגם: {designTag}\n- רמת מורכבות: {complexityLevel}\n- הקדשה: {dedicationText}\n- פונט: {fontStyle}\n- צבע פונט: {fontColor}\n\nלבצע בקרת איכות על העיצוב לפני המשך לייצור',
        priority: 'MEDIUM'
      }
    },
    {
      id: 'step-4',
      stepNumber: 4,
      name: 'ייצור - מכונה',
      nameEn: 'machine-production',
      order: 4,
      departmentId: 'dept-production',
      departmentName: 'מחלקת ייצור',
      estimatedDays: 10,
      dependsOnStepId: 'step-3',
      description: 'ייצור הפרוכת במכונת הרקמה',
      taskTemplate: {
        title: 'ייצור במכונה - {productName}',
        description: 'לייצר את הפרוכת במכונת הרקמה:\n- גודל: {size}\n- קובץ עיצוב: {designFile}\n\nלוודא שהמכונה מכוילת נכון ולעקוב אחרי התהליך',
        priority: 'HIGH'
      }
    },
    {
      id: 'step-5',
      stepNumber: 5,
      name: 'בקרת איכות סופית',
      nameEn: 'final-quality-control',
      order: 5,
      departmentId: 'dept-quality',
      departmentName: 'מחלקת בקרת איכות',
      estimatedDays: 2,
      dependsOnStepId: 'step-4',
      description: 'בדיקת איכות סופית של המוצר המוגמר',
      taskTemplate: {
        title: 'בקרת איכות סופית - {productName}',
        description: 'לבדוק איכות הפרוכת המוגמרת:\n✓ רקמה ללא פגמים\n✓ צבעים נכונים\n✓ טקסט הקדשה נכון\n✓ גודל תקין\n✓ גימור מסודר\n\nאם יש בעיה - להחזיר לשלב הרלוונטי',
        priority: 'HIGH'
      }
    },
    {
      id: 'step-6',
      stepNumber: 6,
      name: 'צילום + תיאום + תשלום שני',
      nameEn: 'photo-coordination-payment2',
      order: 6,
      departmentId: 'dept-logistics',
      departmentName: 'מחלקת לוגיסטיקה',
      estimatedDays: 2,
      dependsOnStepId: 'step-5',
      description: 'צילום המוצר, תיאום עם הלקוח וקבלת תשלום שני (50%)',
      taskTemplate: {
        title: 'צילום + תיאום + תשלום שני - {productName}',
        description: 'לצלם את הפרוכת המוגמרת\nלתאם עם הלקוח {customerName} את המשלוח\nלקבל תשלום שני: {secondPayment} ₪ (50% נותרים)\n\nאחרי קבלת התשלום - לעדכן סטטוס המשימה',
        priority: 'HIGH'
      }
    },
    {
      id: 'step-7',
      stepNumber: 7,
      name: 'אריזה ומשלוח',
      nameEn: 'packing-shipping',
      order: 7,
      departmentId: 'dept-logistics',
      departmentName: 'מחלקת לוגיסטיקה',
      estimatedDays: 3,
      dependsOnStepId: 'step-6',
      description: 'אריזה מקצועית ומשלוח ללקוח',
      taskTemplate: {
        title: 'אריזה ומשלוח - {productName}',
        description: 'לארוז את הפרוכת באריזה מקצועית\nלתאם משלוח עם הלקוח {customerName}\n\nכתובת משלוח: {shippingAddress}\nטלפון: {customerPhone}\n\nלעדכן את הלקוח עם מספר מעקב',
        priority: 'MEDIUM'
      }
    }
  ],

  // Metadata
  createdAt: '2025-12-29T00:00:00Z',
  updatedAt: '2025-12-29T00:00:00Z',
  createdBy: 'system',

  // Settings
  settings: {
    autoCreateTasks: true,
    sendNotifications: true,
    trackProgress: true,
    allowSkipSteps: false // Can't skip steps - must follow order
  }
};

export { parochetWorkflow };
