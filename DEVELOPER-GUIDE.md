# 📋 מסמך פיתוח מלא - The Shul CRM
## למפתח Backend + Frontend

**תאריך:** 28 בדצמבר 2025  
**סטטוס נוכחי:** 75% הושלם  
**מה נשאר:** Backend APIs + השלמת Frontend

---

# 📁 מבנה הפרויקט

## Frontend (React + Vite)
```
src/
├── components/          # רכיבים משותפים
├── contexts/           # AuthContext, ThemeContext
├── data/               # translations, mockData
├── pages/              # דפי האפליקציה
│   ├── Dashboard.jsx
│   ├── Leads.jsx       # ניהול לידים + Pipeline
│   ├── Customers.jsx   # ניהול לקוחות
│   ├── Products.jsx    # ניהול מוצרים
│   ├── Orders.jsx      # ניהול הזמנות
│   ├── Tasks.jsx       # ניהול משימות
│   ├── Workflows.jsx   # תהליכי עבודה + מכירות
│   ├── StockOrders.jsx # ייצור למלאי (חדש!)
│   └── ...
├── services/
│   └── api.js          # שירותי API
└── App.jsx             # ניתוב ראשי
```

---

# ✅ חלק א': מה קיים ועובד

## 1. התחברות ומשתמשים ✅
- Login עם email + password (Supabase Auth)
- הרשאות: ADMIN, MANAGER, EMPLOYEE
- ניהול משתמשים בדף Users

## 2. ניהול לקוחות ✅
- CRUD מלא (יצירה, קריאה, עדכון, מחיקה)
- חיפוש וסינון
- ייצוא לאקסל
- קבוצות לקוחות

## 3. ניהול מוצרים ✅
- CRUD מלא
- פרמטרים (צבעים, מידות)
- שיוך לתהליך עבודה

## 4. תהליכי עבודה (ייצור) ✅
- הגדרת תהליכים
- שלבים עם סדר
- שיוך למחלקות
- זמנים משוערים

---

# 🔄 חלק ב': מה חלקית עובד (צריך Backend)

## 1. ניהול לידים

### מה קיים ב-Frontend:
- [x] רשימת לידים (Table, Grid, Pipeline, Calendar)
- [x] הוספת ליד (טופס מלא)
- [x] עריכת ליד
- [x] גרירת ליד בין שלבים (Pipeline)
- [x] ייבוא לידים מ-CSV/Excel
- [x] Timeline של שלבים
- [x] SLA + התראות חריגה

### מה צריך מ-Backend:

```javascript
// API נדרש:

// 1. Get all leads with filters
GET /api/leads?stage=NEW&assignedTo=userId&page=1&limit=20

// 2. Create lead
POST /api/leads
Body: {
  name: string,
  email: string,
  phone: string,
  company: string,
  source: 'WEBSITE' | 'REFERRAL' | 'COLD_CALL' | 'SOCIAL' | 'EVENT' | 'OTHER',
  stage: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST',
  estimatedValue: number,
  notes: string,
  assignedTo: userId,
  stageUpdatedAt: timestamp  // לחישוב SLA
}

// 3. Update lead
PUT /api/leads/:id
Body: { stage, notes, ... }

// 4. Delete lead
DELETE /api/leads/:id

// 5. Convert lead to customer
POST /api/leads/:id/convert
Response: { customerId, orderId? }

// 6. Bulk import
POST /api/leads/bulk
Body: { leads: [...] }
```

### Database Schema (Leads):
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  source VARCHAR(50) DEFAULT 'OTHER',
  stage VARCHAR(50) DEFAULT 'NEW',
  estimated_value DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  stage_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
```

---

## 2. Pipeline מכירות (שלבים מותאמים)

### מה קיים ב-Frontend:
- [x] ניהול שלבים בדף Workflows (טאב "תהליך מכירות")
- [x] הוספה/עריכה/מחיקה של שלבים
- [x] צבעים ו-SLA לכל שלב
- [x] שמירה ב-localStorage (זמני!)

### מה צריך מ-Backend:

```javascript
// API נדרש:

// 1. Get sales pipeline stages
GET /api/sales-pipeline/stages

// 2. Update stages
PUT /api/sales-pipeline/stages
Body: {
  stages: [
    { id: 'NEW', label: 'חדש', color: '#667eea', slaHours: 24, order: 1 },
    { id: 'CONTACTED', label: 'יצירת קשר', color: '#4facfe', slaHours: 48, order: 2 },
    // ...
  ]
}

// 3. Get pipeline per product (אופציונלי)
GET /api/products/:id/sales-pipeline
```

### Database Schema (Sales Pipeline):
```sql
CREATE TABLE sales_pipeline_stages (
  id VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#667eea',
  sla_hours INTEGER,
  stage_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Default data
INSERT INTO sales_pipeline_stages (id, label, color, sla_hours, stage_order) VALUES
  ('NEW', 'חדש', '#667eea', 24, 1),
  ('CONTACTED', 'יצירת קשר', '#4facfe', 48, 2),
  ('QUALIFIED', 'מוסמך', '#00f2fe', 72, 3),
  ('PROPOSAL', 'הצעת מחיר', '#fee140', 96, 4),
  ('NEGOTIATION', 'משא ומתן', '#f5576c', 168, 5),
  ('WON', 'זכייה', '#00c853', NULL, 6),
  ('LOST', 'הפסד', '#ff5252', NULL, 7);
```

---

## 3. ייצור למלאי (Stock Orders)

### מה קיים ב-Frontend:
- [x] דף StockOrders.jsx
- [x] רשימת הזמנות מלאי
- [x] יצירת הזמנה חדשה
- [x] הערכת עלות (מ-Mock)
- [x] סטטוסים: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- [x] Progress bar
- [x] התראות חריגה

### מה צריך מ-Backend:

```javascript
// API נדרש:

// 1. Get stock orders
GET /api/stock-orders?status=PENDING&page=1

// 2. Create stock order
POST /api/stock-orders
Body: {
  productId: uuid,
  quantity: number,
  targetDate: date,
  notes: string
}

// 3. Update stock order
PUT /api/stock-orders/:id
Body: { status, progress, notes }

// 4. Get product pricing (for cost estimation)
GET /api/products/:id/pricing
Response: {
  materialCost: number,
  laborCost: number,
  overheadCost: number,
  totalCost: number
}
```

### Database Schema (Stock Orders):
```sql
CREATE TABLE stock_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  progress INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,2),
  target_date DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product pricing table
CREATE TABLE product_pricing (
  product_id UUID PRIMARY KEY REFERENCES products(id),
  material_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  overhead_cost DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# ❌ חלק ג': מה עדיין לא קיים (צריך לפתח)

## 1. ניהול הזמנות (Orders)

### Frontend צריך:
- [ ] טופס יצירת הזמנה מלא
- [ ] בחירת מוצרים עם קונפיגורציה
- [ ] חישוב מחיר אוטומטי
- [ ] עדכון סטטוס

### Backend צריך:
```javascript
POST /api/orders
Body: {
  customerId: uuid,
  items: [
    {
      productId: uuid,
      quantity: number,
      configuration: { color: 'red', size: 'L', ... },
      price: number
    }
  ],
  dueDate: date,
  notes: string
}

PUT /api/orders/:id/status
Body: { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }
```

---

## 2. ניהול משימות (Tasks)

### Frontend צריך:
- [ ] יצירת משימות אוטומטית מהזמנה
- [ ] שיוך לעובד
- [ ] סינון "המשימות שלי"
- [ ] מעבר אוטומטי לשלב הבא

### Backend צריך:
```javascript
// Auto-create tasks from order
POST /api/orders/:id/generate-tasks

// Get my tasks
GET /api/tasks?assignedTo=me&status=PENDING

// Complete task
PUT /api/tasks/:id/complete
// This should auto-advance to next workflow step
```

---

## 3. דשבורד מותאם

### Frontend צריך:
- [ ] Dashboard שונה ל-ADMIN vs EMPLOYEE
- [ ] גרפים (Chart.js או Recharts)
- [ ] KPIs אמיתיים

### Backend צריך:
```javascript
GET /api/dashboard/stats
Response: {
  leads: { total, new, won, conversionRate },
  orders: { total, pending, completed, revenue },
  tasks: { pending, overdue, completedToday }
}

GET /api/dashboard/my-stats (for employee)
Response: {
  myTasks: [...],
  myOrders: [...],
  notifications: [...]
}
```

---

# 🔧 חלק ד': תיקונים נדרשים

## 1. בעיות ידועות

| בעיה | קובץ | מה לתקן |
|------|------|---------|
| Dropdown יוצא מהמסך | App.css | CSS position |
| פעמון לא נפתח | App.jsx | Check onClick handler |
| לידים לא נשמרים | Leads.jsx | צריך Backend API |

## 2. קוד לבדיקה

```javascript
// בדוק ב-api.js אם יש endpoints נכונים:
export const leadsService = {
  getAll: (params) => apiRequest('/leads', { params }),
  create: (data) => apiRequest('/leads', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/leads/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
  convert: (id) => apiRequest(`/leads/${id}/convert`, { method: 'POST' }),
};
```

---

# 📍 סדר עדיפויות לפיתוח

## שלב 1: Backend APIs (1-2 ימים)
1. Leads CRUD
2. Sales Pipeline stages
3. Stock Orders

## שלב 2: חיבור Frontend ל-Backend (1 יום)
1. עדכון api.js
2. בדיקות
3. Fix bugs

## שלב 3: השלמת Orders + Tasks (2-3 ימים)
1. Order creation flow
2. Auto-generate tasks
3. Task management

## שלב 4: Dashboard + Polish (1 יום)
1. Stats API
2. Charts
3. Final testing

---

# 📞 צור קשר

**שאלות?** פנה ל-Motti

**Repository:** https://github.com/motti770/front-yoel.git  
**Branch:** deploy

---

*עודכן: 28 בדצמבר 2025*
