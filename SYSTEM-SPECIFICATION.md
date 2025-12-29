# 📋 מסמך אפיון מערכת - The Shul CRM
## System Specification Document

**גרסה:** 1.0  
**תאריך:** 28 בדצמבר 2025  
**לקוח:** יואל - מפעל יודאיקה

---

# 1. סקירה כללית (Executive Summary)

## 1.1 מטרת המערכת
מערכת CRM מלאה לניהול מפעל יודאיקה - מליד ראשון ועד מוצר מוגמר.

## 1.2 משתמשי המערכת
| תפקיד | כמות משוערת | הרשאות |
|-------|------------|--------|
| מנהל (ADMIN) | 2-3 | גישה מלאה לכל המערכת |
| מנהל מכירות (MANAGER) | 2-3 | גישה ללידים, לקוחות, הזמנות |
| עובד ייצור (EMPLOYEE) | ~45 | רק משימות שהוקצו לו |

## 1.3 סביבות
| סביבה | URL | שימוש |
|-------|-----|-------|
| Development | http://localhost:5173 | פיתוח |
| Production | https://the-shul.app.mottidokib.com | לקוחות |
| API | https://crm-api.app.mottidokib.com | Backend |

---

# 2. מודל נתונים (Data Model)

## 2.1 ישויות עיקריות (Entities)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Lead     │────>│  Customer   │────>│    Order    │
│   (ליד)     │     │   (לקוח)    │     │  (הזמנה)    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               │ 1:N
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Product   │────>│ OrderItem   │────>│    Task     │
│  (מוצר)     │     │(פריט בהזמנה)│     │  (משימה)    │
└──────┬──────┘     └─────────────┘     └──────┬──────┘
       │                                        │
       │                                        │
       ▼                                        ▼
┌─────────────┐                         ┌─────────────┐
│  Workflow   │                         │ Department  │
│ (תהליך)     │                         │ (מחלקה)     │
└──────┬──────┘                         └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│WorkflowStep │────>│ Parameter   │
│  (שלב)      │     │ (פרמטר)     │
└─────────────┘     └─────────────┘
```

## 2.2 פירוט ישויות

### Lead (ליד)
```typescript
Lead {
  id: UUID
  name: string           // שם איש קשר
  email: string
  phone: string
  company: string        // שם בית הכנסת/ארגון
  source: enum           // WEBSITE, REFERRAL, COLD_CALL, SOCIAL, EVENT, OTHER
  stage: enum            // NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST
  estimatedValue: number // הערכת שווי העסקה
  notes: string
  assignedTo: UUID       // משויך לאיש מכירות
  stageUpdatedAt: Date   // לחישוב SLA
  createdAt: Date
  updatedAt: Date
}
```

### Customer (לקוח)
```typescript
Customer {
  id: UUID
  name: string
  email: string
  phone: string
  companyName: string
  address: string
  status: enum           // ACTIVE, INACTIVE
  source: string         // מאיפה הגיע
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

### Product (מוצר)
```typescript
Product {
  id: UUID
  name: string           // שם המוצר (פרוכת, כיפה, טלית)
  sku: string            // מק"ט
  description: string
  price: number          // מחיר בסיס
  stockQuantity: number
  category: string
  status: enum           // ACTIVE, DISCONTINUED
  workflowId: UUID       // תהליך העבודה של המוצר
  parameters: Parameter[] // פרמטרים אפשריים (צבעים, מידות)
  createdAt: Date
}
```

### Order (הזמנה)
```typescript
Order {
  id: UUID
  orderNumber: string    // ORD-20251228-001
  customerId: UUID
  status: enum           // PENDING, PROCESSING, COMPLETED, CANCELLED
  items: OrderItem[]
  totalAmount: number
  notes: string
  dueDate: Date
  createdAt: Date
  updatedAt: Date
}
```

### OrderItem (פריט בהזמנה)
```typescript
OrderItem {
  id: UUID
  orderId: UUID
  productId: UUID
  quantity: number
  unitPrice: number
  selectedParameters: [{  // מה הלקוח בחר
    parameterId: UUID
    optionId: UUID
    value: string        // "זהב", "XL", וכו'
  }]
  notes: string          // הקדשה, הערות מיוחדות
}
```

### Task (משימה)
```typescript
Task {
  id: UUID
  orderItemId: UUID
  workflowStepId: UUID   // באיזה שלב בתהליך
  departmentId: UUID
  assignedToId: UUID     // לאיזה עובד
  status: enum           // PENDING, IN_PROGRESS, COMPLETED, BLOCKED, CANCELLED
  priority: enum         // LOW, MEDIUM, HIGH, URGENT
  estimatedDuration: number // בדקות
  notes: string
  createdAt: Date
  completedAt: Date
}
```

### Workflow (תהליך עבודה)
```typescript
Workflow {
  id: UUID
  name: string           // "תהליך ייצור פרוכת"
  description: string
  isActive: boolean
  steps: WorkflowStep[]
  createdAt: Date
}
```

### WorkflowStep (שלב בתהליך)
```typescript
WorkflowStep {
  id: UUID
  workflowId: UUID
  name: string           // "סקיצה ראשונית"
  description: string
  stepOrder: number      // סדר השלב
  departmentId: UUID     // מחלקה אחראית
  estimatedDurationMinutes: number
  isRequired: boolean
}
```

### Department (מחלקה)
```typescript
Department {
  id: UUID
  name: string           // "עיצוב", "ייצור", "QA"
  description: string
  color: string          // לזיהוי ויזואלי
  isActive: boolean
}
```

### Parameter (פרמטר)
```typescript
Parameter {
  id: UUID
  name: string           // "צבע", "מידה", "סוג בד"
  type: enum             // COLOR, SIZE, TEXT, SELECT, NUMBER
  options: [{            // אפשרויות לבחירה
    id: UUID
    value: string        // "אדום", "XL"
    priceModifier: number // תוספת מחיר
    isDefault: boolean
  }]
  isActive: boolean
}
```

### User (משתמש)
```typescript
User {
  id: UUID
  email: string
  firstName: string
  lastName: string
  role: enum             // ADMIN, MANAGER, EMPLOYEE
  departmentId: UUID
  phone: string
  avatar: string
  isActive: boolean
  createdAt: Date
}
```

---

# 3. זרימות עבודה (Workflows)

## 3.1 זרימה ראשית: ליד → מוצר מוגמר

```
┌─────────────────────────────────────────────────────────────────────┐
│                         תהליך מכירה ויצור                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│  │ ליד  │───>│ קשר  │───>│מוסמך │───>│הצעה  │───>│מו"מ  │───>│זכייה │
│  │ חדש  │    │ראשון │    │      │    │מחיר  │    │      │    │      │
│  └──────┘    └──────┘    └──────┘    └──────┘    └──────┘    └──┬───┘
│                                                                  │
│                              ┌───────────────────────────────────┘
│                              │
│                              ▼
│  ┌──────────────────────────────────────────────────────────────────┐
│  │                     יצירת לקוח + הזמנה                          │
│  └──────────────────────────────────────────────────────────────────┘
│                              │
│                              ▼
│  ┌──────────────────────────────────────────────────────────────────┐
│  │   בחירת מוצרים + התאמה אישית (צבעים, מידות, הקדשות)            │
│  └──────────────────────────────────────────────────────────────────┘
│                              │
│                              ▼
│  ┌──────────────────────────────────────────────────────────────────┐
│  │              יצירת משימות אוטומטית לפי Workflow                 │
│  └──────────────────────────────────────────────────────────────────┘
│                              │
│            ┌─────────────────┼─────────────────┐
│            ▼                 ▼                 ▼
│     ┌────────────┐   ┌────────────┐   ┌────────────┐
│     │   סקיצה    │   │   רקמה    │   │   ייצור   │
│     │  (עיצוב)   │   │  (עיצוב)  │   │ (הרכבה)   │
│     └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
│           │                │                │
│           └────────────────┼────────────────┘
│                            ▼
│  ┌──────────────────────────────────────────────────────────────────┐
│  │                         QA + אריזה                              │
│  └──────────────────────────────────────────────────────────────────┘
│                              │
│                              ▼
│  ┌──────────────────────────────────────────────────────────────────┐
│  │                      הזמנה הושלמה                               │
│  └──────────────────────────────────────────────────────────────────┘
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 3.2 כל מוצר - תהליך משלו

המערכת מאפשרת להגדיר **תהליך עבודה ייחודי לכל מוצר**.

**דוגמה - פרוכת:**
```
1. סקיצה ראשונית (מחלקת עיצוב) - 2 ימים
2. אישור סקיצה מלקוח (מכירות) - 1 יום
3. עיצוב רקמה מפורט (מחלקת רקמה) - 3 ימים
4. ייצור ברקמה (מחלקת ייצור) - 5 ימים
5. תפירה וגימור (מחלקת ייצור) - 2 ימים
6. QA (מחלקת בקרת איכות) - 1 יום
7. אריזה ומשלוח (מחלקת לוגיסטיקה) - 1 יום
```

**דוגמה - כיפות (פשוט יותר):**
```
1. בחירת עיצוב (מכירות) - 1 יום
2. ייצור (מחלקת ייצור) - 3 ימים
3. QA + אריזה (מחלקת לוגיסטיקה) - 1 יום
```

---

# 4. הרשאות (Permissions)

## 4.1 מטריקס הרשאות

| פעולה | ADMIN | MANAGER | EMPLOYEE |
|-------|-------|---------|----------|
| **לידים** |||
| צפייה בכל הלידים | ✅ | ✅ | ❌ |
| יצירת ליד | ✅ | ✅ | ❌ |
| עריכת ליד | ✅ | ✅ | ❌ |
| מחיקת ליד | ✅ | ❌ | ❌ |
| המרה ללקוח | ✅ | ✅ | ❌ |
| **לקוחות** |||
| צפייה | ✅ | ✅ | חלקי* |
| יצירה | ✅ | ✅ | ❌ |
| עריכה | ✅ | ✅ | ❌ |
| מחיקה | ✅ | ❌ | ❌ |
| **הזמנות** |||
| צפייה | ✅ | ✅ | רק קשורות* |
| יצירה | ✅ | ✅ | ❌ |
| עריכה | ✅ | ✅ | ❌ |
| שינוי סטטוס | ✅ | ✅ | ❌ |
| **משימות** |||
| צפייה בכל המשימות | ✅ | ✅ | ❌ |
| צפייה במשימות שלי | ✅ | ✅ | ✅ |
| שינוי סטטוס | ✅ | ✅ | רק שלי* |
| הקצאה לעובד | ✅ | ✅ | ❌ |
| **הגדרות** |||
| מוצרים | ✅ | ✅ | ❌ |
| תהליכי עבודה | ✅ | ❌ | ❌ |
| מחלקות | ✅ | ❌ | ❌ |
| פרמטרים | ✅ | ❌ | ❌ |
| משתמשים | ✅ | ❌ | ❌ |

*חלקי = רק מה שקשור אליו

---

# 5. ממשק משתמש (UI/UX)

## 5.1 דפים עיקריים

| דף | נתיב | תיאור |
|----|------|--------|
| Login | `/login` | התחברות |
| Dashboard | `/` | מסך ראשי עם סטטיסטיקות |
| Leads | `/leads` | ניהול לידים + Pipeline |
| Customers | `/customers` | ניהול לקוחות |
| Products | `/products` | ניהול מוצרים |
| Orders | `/orders` | ניהול הזמנות |
| Tasks | `/tasks` | ניהול משימות |
| Workflows | `/workflows` | ניהול תהליכי עבודה |
| Departments | `/departments` | ניהול מחלקות |
| Parameters | `/parameters` | ניהול פרמטרים |
| Users | `/users` | ניהול משתמשים (Admin) |
| Settings | `/settings` | הגדרות |

## 5.2 תצוגות זמינות בכל דף

| תצוגה | סמל | שימוש |
|-------|-----|-------|
| Table | טבלה | רשימה מפורטת |
| Grid | כרטיסים | תצוגת קלפים |
| Pipeline/Kanban | לוח | שלבים עם גרירה |
| Calendar | לוח שנה | צפייה לפי תאריך |
| List | רשימה | תצוגה קומפקטית |
| Gantt | ציר זמן | תכנון לאורך זמן |

## 5.3 רכיבים משותפים

- **Modal** - חלון קופץ לפעולות
- **Toast** - הודעות מערכת
- **ViewSwitcher** - החלפת תצוגות
- **BulkImporter** - ייבוא מ-CSV/Excel
- **ProductConfigurator** - בחירת פרמטרים

---

# 6. API Reference (סיכום)

## 6.1 Endpoints עיקריים

| Module | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Auth | POST /auth/register | GET /auth/me | - | - |
| Leads | POST /leads | GET /leads | PUT /leads/:id | DELETE /leads/:id |
| Customers | POST /customers | GET /customers | PUT /customers/:id | DELETE /customers/:id |
| Products | POST /products | GET /products | PUT /products/:id | DELETE /products/:id |
| Orders | POST /orders | GET /orders | PUT /orders/:id | POST /orders/:id/cancel |
| Tasks | POST /tasks | GET /tasks | PUT /tasks/:id | - |
| Workflows | POST /workflows | GET /workflows | PUT /workflows/:id | DELETE /workflows/:id |
| Departments | POST /departments | GET /departments | PUT /departments/:id | DELETE /departments/:id |
| Parameters | POST /parameters | GET /parameters | PUT /parameters/:id | DELETE /parameters/:id |

## 6.2 פורמט תשובה

**הצלחה:**
```json
{
  "success": true,
  "data": { ... }
}
```

**שגיאה:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "..."
  }
}
```

---

# 7. סטאק טכנולוגי

## 7.1 Frontend
- **Framework:** React 18 + Vite
- **Styling:** CSS (Vanilla) + Glassmorphism
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Auth:** JWT Tokens (localStorage)

## 7.2 Backend
- **Framework:** Node.js + Express
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth + JWT
- **Storage:** Supabase Storage (files)
- **Hosting:** Docker + CapRover

---

# 8. שלבי פריסה

## 8.1 פריסה לפרודקשן
```bash
# Build
npm run build

# Deploy
git add .
git commit -m "Production release"
git push origin deploy
```

## 8.2 בדיקות לפני פריסה
1. בדיקה ש-`npm run build` עובר בלי שגיאות
2. בדיקה שמשתני סביבה נכונים
3. בדיקת API endpoints

---

# 9. סיכום

המערכת מספקת פתרון CRM מלא לניהול מפעל יודאיקה:

✅ ניהול לידים עם Pipeline מכירות  
✅ ניהול לקוחות ויחסים  
✅ ניהול מוצרים עם פרמטרים מותאמים  
✅ ניהול הזמנות עם התאמה אישית  
✅ יצירת משימות אוטומטית לפי תהליכי עבודה  
✅ מעקב אחרי התקדמות הייצור  
✅ הרשאות לפי תפקיד  
✅ ממשק נוח ומודרני (RTL תומך עברית)

---

*נוצר: 28/12/2025*
