# 📋 Backend Requirements - Parochet CRM System

**תאריך:** 30 בדצמבר 2025
**גרסה:** 2.0 - מעודכן לאחר בניית OrderLifecycleWizard
**סטטוס:** מוכן לפיתוח

---

## 🎯 סקירה כללית

מסמך זה מפרט את דרישות ה-Backend עבור מערכת CRM לניהול פרוכות (וילונות ארון קודש). המערכת כוללת:
- 31 מוצרי פרוכת (1 base + 30 variants: 10 דגמים × 3 רמות מורכבות)
- 22 פרמטרים דינמיים להתאמה אישית
- תהליך ייצור עם 7 שלבים ו-42 יום
- חישוב מחיר דינמי מורכב
- ניהול Leads → Orders → Production workflow

**הערה חשובה:** כרגע כל הנתונים שמורים ב-localStorage. כל המבנים והלוגיקה מוכנים - רק צריך להעביר ל-Database אמיתי ולבנות API.

**מה כבר בנוי ב-Frontend:**
- ✅ OrderLifecycleWizard מלא (5 שלבים)
- ✅ ProductConfigurator עם 8 סוגי פרמטרים
- ✅ חישוב מחיר בזמן אמת
- ✅ יצירת הזמנה + Workflow tasks
- ✅ עדכון Lead ל-WON
- ✅ UI מלא ומעוצב

---

## 📊 Database Schema

### 1. Products Table

```sql
CREATE TABLE products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- RITUAL, CUSTOM, etc.
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, DISCONTINUED

    -- Hierarchy (for variants)
    parent_product_id VARCHAR(100) NULL,
    design_tag VARCHAR(100) NULL,
    complexity_level VARCHAR(20) NULL, -- SIMPLE, MEDIUM, FULL
    catalog_code VARCHAR(50) NULL,

    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'ILS',

    -- Production
    workflow_id VARCHAR(100) NULL,
    production_time_days INT DEFAULT 0,

    -- Media
    image_url VARCHAR(500) NULL,
    gallery JSON NULL, -- Array of image URLs

    -- Metadata
    description TEXT NULL,
    description_en TEXT NULL,
    tags JSON NULL, -- Array of tags

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,

    -- Foreign Keys
    FOREIGN KEY (parent_product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_parent ON products(parent_product_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_design ON products(design_tag);
```

**דוגמה לנתונים:**
```json
{
  "id": "parochet-keter-vezer-full",
  "name": "פרוכת כתר וזר - רקמה מלאה",
  "name_en": "Crown & Wreath Parochet - Full Embroidery",
  "sku": "PAROCHET-KVZ-FULL",
  "category": "RITUAL",
  "status": "ACTIVE",
  "parent_product_id": "parochet-base",
  "design_tag": "כתר וזר",
  "complexity_level": "FULL",
  "catalog_code": "B1Z0",
  "base_price": 8500.00,
  "currency": "ILS",
  "workflow_id": "workflow-parochet-7-steps",
  "production_time_days": 42,
  "image_url": "/images/parochet-keter-vezer-full.jpg"
}
```

---

### 2. Parameters Table

```sql
CREATE TABLE parameters (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NULL,
    type VARCHAR(50) NOT NULL, -- NUMBER, TEXT, SELECT, COLOR, BOOLEAN, FILE_UPLOAD, DATE, SELECT_WITH_NUMBER
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT NULL,

    -- Display
    label VARCHAR(255) NOT NULL,
    label_en VARCHAR(255) NULL,
    placeholder VARCHAR(255) NULL,
    help_text TEXT NULL,
    display_order INT DEFAULT 0,

    -- Validation rules (JSON)
    validation_rules JSON NULL,
    /* Example:
    {
      "min": 50,
      "max": 300,
      "step": 10,
      "pattern": "^[\\u0590-\\u05FF\\s]+$",
      "hebrewOnly": true,
      "maxFileSize": 5242880,
      "allowedExtensions": ["jpg", "png", "pdf"]
    }
    */

    -- Options (for SELECT/COLOR types)
    options JSON NULL,
    /* Example:
    [
      {
        "id": "small",
        "label": "קטן (80×120 cm)",
        "value": "small",
        "priceImpact": 0,
        "colorHex": null,
        "metadata": {}
      }
    ]
    */

    -- Price formula (for NUMBER types)
    price_formula VARCHAR(255) NULL, -- e.g., "value * 4"

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_parameters_type ON parameters(type);
CREATE INDEX idx_parameters_order ON parameters(display_order);
```

**דוגמה לנתונים:**
```json
{
  "id": "param-height",
  "name": "גובה",
  "name_en": "Height",
  "type": "NUMBER",
  "is_required": true,
  "label": "גובה הפרוכת (ס\"מ)",
  "placeholder": "150",
  "help_text": "גובה בסנטימטרים - כל ס\"מ מוסיף ₪4",
  "display_order": 1,
  "validation_rules": {
    "min": 50,
    "max": 300,
    "step": 10
  },
  "price_formula": "value * 4"
}
```

---

### 3. Product_Parameters Junction Table (אופציונלי)

```sql
CREATE TABLE product_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL,
    parameter_id VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (parameter_id) REFERENCES parameters(id) ON DELETE CASCADE,

    UNIQUE KEY unique_product_param (product_id, parameter_id)
);

CREATE INDEX idx_product_params_product ON product_parameters(product_id);
CREATE INDEX idx_product_params_parameter ON product_parameters(parameter_id);
```

**הערה:** כרגע כל הפרמטרים שמתחילים ב-`param-` מתאימים לכל הפרוכות. בעתיד אפשר לשייך פרמטרים ספציפיים למוצרים ספציפיים.

---

### 4. Workflows Table

```sql
CREATE TABLE workflows (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NULL,
    description TEXT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    estimated_days INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**דוגמה:**
```json
{
  "id": "workflow-parochet-7-steps",
  "name": "תהליך ייצור פרוכת מלא",
  "description": "7 שלבים עם תלויות - מעיצוב ועד משלוח",
  "status": "ACTIVE",
  "estimated_days": 42
}
```

---

### 5. Workflow_Steps Table

```sql
CREATE TABLE workflow_steps (
    id VARCHAR(100) PRIMARY KEY,
    workflow_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NULL,
    step_order INT NOT NULL,
    department_id VARCHAR(100) NULL,
    estimated_days INT DEFAULT 0,
    depends_on_step_id VARCHAR(100) NULL,

    -- Instructions for department
    instructions TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (depends_on_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL,

    UNIQUE KEY unique_workflow_order (workflow_id, step_order)
);

CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_order ON workflow_steps(step_order);
```

**דוגמה לשלבים:**
```json
[
  {
    "id": "step-1",
    "workflow_id": "workflow-parochet-7-steps",
    "name": "עיצוב סקיצה ראשוני",
    "step_order": 1,
    "department_id": "dept-design",
    "estimated_days": 3,
    "depends_on_step_id": null
  },
  {
    "id": "step-2",
    "workflow_id": "workflow-parochet-7-steps",
    "name": "אישור לקוח + תשלום ראשון",
    "step_order": 2,
    "department_id": "dept-sales",
    "estimated_days": 2,
    "depends_on_step_id": "step-1"
  },
  {
    "id": "step-3",
    "workflow_id": "workflow-parochet-7-steps",
    "name": "עיצוב רקמה + בקרה",
    "step_order": 3,
    "department_id": "dept-embroidery",
    "estimated_days": 20,
    "depends_on_step_id": "step-2"
  },
  {
    "id": "step-4",
    "workflow_id": "workflow-parochet-7-steps",
    "name": "ייצור - מכונה",
    "step_order": 4,
    "department_id": "dept-production",
    "estimated_days": 10,
    "depends_on_step_id": "step-3"
  },
  {
    "id": "step-5",
    "workflow_id": "workflow-parochet-7-steps",
    "name": "בקרת איכות סופית",
    "step_order": 5,
    "department_id": "dept-quality",
    "estimated_days": 2,
    "depends_on_step_id": "step-4"
  },
  {
    "id": "step-6",
    "workflow_id": "workflow-parochet-7-steps",
    "name": "צילום + תיאום + תשלום שני",
    "step_order": 6,
    "department_id": "dept-logistics",
    "estimated_days": 2,
    "depends_on_step_id": "step-5"
  },
  {
    "id": "step-7",
    "workflow_id": "workflow-parochet-7-steps",
    "name": "אריזה ומשלוח",
    "step_order": 7,
    "department_id": "dept-logistics",
    "estimated_days": 3,
    "depends_on_step_id": "step-6"
  }
]
```

**סה"כ:** 3 + 2 + 20 + 10 + 2 + 2 + 3 = 42 ימים

---

### 6. Departments Table

```sql
CREATE TABLE departments (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**6 מחלקות:**
```json
[
  {
    "id": "dept-design",
    "name": "מחלקת עיצוב",
    "name_en": "design",
    "description": "עיצוב סקיצות ורקמות"
  },
  {
    "id": "dept-sales",
    "name": "מחלקת מכירות",
    "name_en": "sales",
    "description": "ניהול לקוחות ותשלומים"
  },
  {
    "id": "dept-embroidery",
    "name": "מחלקת רקמה",
    "name_en": "embroidery",
    "description": "עיצוב ובקרת רקמה"
  },
  {
    "id": "dept-production",
    "name": "מחלקת ייצור",
    "name_en": "production",
    "description": "ייצור במכונות"
  },
  {
    "id": "dept-quality",
    "name": "מחלקת בקרת איכות",
    "name_en": "quality",
    "description": "בקרת איכות סופית"
  },
  {
    "id": "dept-logistics",
    "name": "מחלקת לוגיסטיקה",
    "name_en": "logistics",
    "description": "צילום, תיאום, אריזה ומשלוח"
  }
]
```

---

### 7. Orders Table (עדכון)

```sql
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,

    -- Relations
    customer_id BIGINT NOT NULL,
    lead_id BIGINT NULL,
    product_id VARCHAR(100) NOT NULL,
    workflow_id VARCHAR(100) NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PRODUCTION, COMPLETED, CANCELLED

    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    additions DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',

    -- Product Configuration (JSON)
    configuration JSON NOT NULL,
    /* Example:
    {
      "product": {
        "id": "parochet-keter-vezer-full",
        "name": "פרוכת כתר וזר - רקמה מלאה",
        "basePrice": 8500,
        "complexityLevel": "FULL",
        "designTag": "כתר וזר"
      },
      "parameters": [
        {
          "id": "param-height",
          "name": "גובה",
          "type": "NUMBER",
          "value": 150,
          "priceImpact": 600
        },
        {
          "id": "param-dedication",
          "name": "טקסט הקדשה",
          "type": "TEXT",
          "value": "לכבוד משפחת כהן",
          "priceImpact": 0
        }
      ]
    }
    */

    -- Timeline
    expected_delivery_date DATE NULL,
    actual_delivery_date DATE NULL,
    production_start_date DATE NULL,
    production_end_date DATE NULL,

    -- Metadata
    notes TEXT NULL,
    internal_notes TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_dates ON orders(expected_delivery_date, actual_delivery_date);
```

---

### 8. Order_Tasks Table

```sql
CREATE TABLE order_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    workflow_step_id VARCHAR(100) NOT NULL,

    -- Task details
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    step_order INT NOT NULL,

    -- Assignment
    department_id VARCHAR(100) NULL,
    assigned_to VARCHAR(100) NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, BLOCKED

    -- Timeline
    estimated_days INT DEFAULT 0,
    start_date DATE NULL,
    due_date DATE NULL,
    completed_date DATE NULL,

    -- Dependencies
    depends_on_task_id BIGINT NULL,

    -- Attachments/Files
    attachments JSON NULL,

    -- Metadata
    notes TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_step_id) REFERENCES workflow_steps(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (depends_on_task_id) REFERENCES order_tasks(id) ON DELETE SET NULL
);

CREATE INDEX idx_order_tasks_order ON order_tasks(order_id);
CREATE INDEX idx_order_tasks_department ON order_tasks(department_id);
CREATE INDEX idx_order_tasks_status ON order_tasks(status);
CREATE INDEX idx_order_tasks_assigned ON order_tasks(assigned_to);
```

---

### 9. Leads Table (עדכון)

```sql
CREATE TABLE leads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Contact Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),

    -- Lead Info
    source VARCHAR(50) DEFAULT 'OTHER', -- WEBSITE, REFERRAL, COLD_CALL, SOCIAL, EVENT, OTHER
    stage VARCHAR(50) DEFAULT 'NEW', -- NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST
    estimated_value DECIMAL(10,2) DEFAULT 0,

    -- Product Interest
    product_id VARCHAR(100) NULL,

    -- Assignment
    assigned_to VARCHAR(100) NULL,

    -- Notes
    notes TEXT,

    -- Timeline
    stage_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_product ON leads(product_id);
```

---

## 🔌 API Endpoints

### Products API

#### `GET /api/products`
**תיאור:** קבלת רשימת מוצרים עם פילטרים

**Query Parameters:**
```javascript
{
  page: 1,
  limit: 50,
  category: 'RITUAL',
  status: 'ACTIVE',
  parentProductId: null, // Get only base products
  search: 'פרוכת',
  sortBy: 'name',
  sortOrder: 'asc'
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    products: [
      {
        id: 'parochet-base',
        name: 'פרוכת ארון קודש',
        sku: 'PAROCHET-BASE',
        category: 'RITUAL',
        status: 'ACTIVE',
        basePrice: 0,
        parentProductId: null,
        hasVariants: true,
        variantCount: 30,
        imageUrl: '/images/parochet-base.jpg',
        createdAt: '2025-12-29T00:00:00Z'
      }
    ],
    total: 31,
    page: 1,
    totalPages: 1
  }
}
```

---

#### `GET /api/products/:id`
**תיאור:** קבלת מוצר בודד

---

#### `GET /api/products/:id/variants`
**תיאור:** קבלת כל ה-variants של מוצר base

**Response:**
```javascript
{
  success: true,
  data: {
    variants: [
      {
        id: 'parochet-keter-vezer-simple',
        name: 'פרוכת כתר וזר - רקמה פשוטה',
        complexityLevel: 'SIMPLE',
        basePrice: 5500,
        catalogCode: 'BW1Z0'
      },
      {
        id: 'parochet-keter-vezer-medium',
        name: 'פרוכת כתר וזר - רקמה בינונית',
        complexityLevel: 'MEDIUM',
        basePrice: 7000,
        catalogCode: 'A1Z0'
      },
      {
        id: 'parochet-keter-vezer-full',
        name: 'פרוכת כתר וזר - רקמה מלאה',
        complexityLevel: 'FULL',
        basePrice: 8500,
        catalogCode: 'B1Z0'
      }
    ],
    total: 3
  }
}
```

---

#### `GET /api/products/:id/parameters`
**תיאור:** קבלת כל הפרמטרים של מוצר (כרגע - כל הפרמטרים ש-id שלהם מתחיל ב-`param-`)

**Response:**
```javascript
{
  success: true,
  data: {
    parameters: [
      {
        "id": "param-height",
        "name": "גובה",
        "type": "NUMBER",
        "isRequired": true,
        "label": "גובה הפרוכת (ס\"מ)",
        "placeholder": "150",
        "helpText": "גובה בסנטימטרים",
        "displayOrder": 1,
        "validationRules": {
          "min": 50,
          "max": 300,
          "step": 10
        },
        "priceFormula": "value * 4"
      }
      // ... 21 more parameters
    ],
    total: 22
  }
}
```

---

### Orders API

#### `POST /api/orders`
**תיאור:** יצירת הזמנה חדשה (זה מה ש-OrderLifecycleWizard קורא!)

**Request Body:**
```javascript
{
  customerId: 123,
  leadId: 456, // Optional
  productId: 'parochet-keter-vezer-full',
  configuration: {
    product: {
      id: 'parochet-keter-vezer-full',
      name: 'פרוכת כתר וזר - רקמה מלאה',
      basePrice: 8500,
      complexityLevel: 'FULL',
      designTag: 'כתר וזר'
    },
    parameters: [
      {
        id: 'param-height',
        name: 'גובה',
        type: 'NUMBER',
        value: 150,
        priceImpact: 600
      },
      {
        id: 'param-width',
        name: 'רוחב',
        type: 'NUMBER',
        value: 120,
        priceImpact: 360
      },
      // ... all 22 parameters
    ]
  },
  pricing: {
    basePrice: 8500,
    additions: 2460,
    total: 10960,
    currency: 'ILS'
  },
  notes: 'הזמנה דחופה'
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    order: {
      id: 1767050278973,
      orderNumber: 'ORD-2025-001',
      customerId: 123,
      leadId: 456,
      productId: 'parochet-keter-vezer-full',
      status: 'PENDING',
      configuration: { /* ... */ },
      basePrice: 8500,
      additions: 2460,
      totalPrice: 10960,
      currency: 'ILS',
      workflowId: 'workflow-parochet-7-steps',
      expectedDeliveryDate: '2025-02-10',
      createdAt: '2025-12-30T10:00:00Z'
    },
    tasks: [
      {
        id: 1,
        orderId: 1767050278973,
        title: 'עיצוב סקיצה ראשוני',
        stepOrder: 1,
        departmentId: 'dept-design',
        status: 'PENDING',
        estimatedDays: 3,
        dueDate: '2026-01-02'
      }
      // ... 6 more tasks
    ],
    message: 'Order created successfully with 7 workflow tasks'
  }
}
```

**Logic שצריך לקרות ב-Backend:**
1. ✅ יצירת Order record
2. ✅ חישוב מחיר (לפי הלוגיקה למטה)
3. ✅ יצירת 7 Order Tasks לפי ה-Workflow
4. ✅ קביעת due dates עם dependencies (Task 2 יכול להתחיל רק אחרי Task 1 וכו')
5. ✅ אם יש leadId → עדכון Lead.status ל-WON
6. ✅ שליחת התראות למחלקות (אופציונלי)

---

#### `GET /api/orders/:id`
**תיאור:** קבלת הזמנה בודדת עם כל המידע

**Response:**
```javascript
{
  success: true,
  data: {
    order: {
      id: 1767050278973,
      orderNumber: 'ORD-2025-001',
      customer: {
        id: 123,
        name: 'משה כהן',
        phone: '050-1234567'
      },
      product: {
        id: 'parochet-keter-vezer-full',
        name: 'פרוכת כתר וזר - רקמה מלאה',
        imageUrl: '/images/...',
        complexityLevel: 'FULL'
      },
      configuration: { /* all 22 parameters */ },
      pricing: {
        basePrice: 8500,
        additions: 2460,
        total: 10960
      },
      tasks: [
        {
          id: 1,
          title: 'עיצוב סקיצה ראשוני',
          status: 'IN_PROGRESS',
          department: {
            id: 'dept-design',
            name: 'מחלקת עיצוב'
          },
          dueDate: '2026-01-02'
        }
        // ... more tasks
      ],
      timeline: {
        created: '2025-12-30',
        estimatedCompletion: '2026-02-10'
      }
    }
  }
}
```

---

### Workflows API

#### `GET /api/workflows/:id`
**תיאור:** קבלת Workflow עם כל ה-Steps

**Response:**
```javascript
{
  success: true,
  data: {
    workflow: {
      id: 'workflow-parochet-7-steps',
      name: 'תהליך ייצור פרוכת מלא',
      estimatedDays: 42,
      steps: [
        {
          id: 'step-1',
          name: 'עיצוב סקיצה ראשוני',
          order: 1,
          department: { id: 'dept-design', name: 'מחלקת עיצוב' },
          estimatedDays: 3,
          dependsOnStepId: null
        }
        // ... 6 more steps
      ]
    }
  }
}
```

---

## 💰 Price Calculation Logic

### חישוב מחיר דינמי - המלא!

**נוסחה כללית:**
```
Final Price = Base Price + Σ(Parameter Price Impacts)
```

### סוגי פרמטרים וחישוב מחיר:

#### 1. NUMBER (גובה, רוחב)
```javascript
{
  id: 'param-height',
  type: 'NUMBER',
  priceFormula: 'value * 4',

  // Selected:
  value: 150,
  priceImpact: 150 * 4 = 600
}
```

#### 2. SELECT (גודל, סוג בד)
```javascript
{
  id: 'param-size',
  type: 'SELECT',
  options: [
    { id: 'small', label: 'קטן', priceImpact: 0 },
    { id: 'medium', label: 'בינוני', priceImpact: 500 },
    { id: 'large', label: 'גדול', priceImpact: 1000 }
  ],

  // Selected:
  selectedOptionId: 'large',
  priceImpact: 1000
}
```

#### 3. BOOLEAN (תוספות כן/לא)
```javascript
{
  id: 'param-gold-thread',
  type: 'BOOLEAN',
  priceImpactIfTrue: 800,

  // Selected:
  value: true,
  priceImpact: 800
}
```

#### 4. SELECT_WITH_NUMBER (אבני סברובסקי)
```javascript
{
  id: 'param-swarovski',
  type: 'SELECT_WITH_NUMBER',
  pricePerUnit: 50,

  // Selected:
  selectedOption: 'large-stones',
  quantity: 24,
  priceImpact: 50 * 24 = 1200
}
```

#### 5. FILE_UPLOAD (עיצוב מותאם אישית)
```javascript
{
  id: 'param-custom-design',
  type: 'FILE_UPLOAD',
  priceImpact: 1500,

  // Uploaded:
  value: 'design-file.ai',
  priceImpact: 1500
}
```

#### 6. TEXT / DATE / COLOR
```javascript
// Usually no price impact
{
  id: 'param-dedication',
  type: 'TEXT',
  priceImpact: 0
}
```

### דוגמה מלאה:

```javascript
const product = {
  id: 'parochet-keter-vezer-full',
  basePrice: 8500
};

const parameters = [
  { id: 'param-height', value: 150, priceImpact: 600 },
  { id: 'param-width', value: 120, priceImpact: 360 },
  { id: 'param-dedication', value: 'לכבוד...', priceImpact: 0 },
  { id: 'param-velvet', selectedOption: 'premium', priceImpact: 500 },
  { id: 'param-hanging', selectedOption: 'rings', priceImpact: 200 },
  { id: 'param-gold-thread', value: true, priceImpact: 800 }
];

const finalPrice = 8500 + 2460 = 10960;
```

---

## 📁 File Upload Handling

### FILE_UPLOAD Parameters

```javascript
{
  id: 'param-custom-design',
  type: 'FILE_UPLOAD',
  validationRules: {
    maxFileSize: 10485760, // 10MB
    allowedExtensions: ['jpg', 'png', 'pdf', 'ai', 'psd'],
    maxFiles: 3
  },
  priceImpact: 1500
}
```

### API Endpoint

#### `POST /api/uploads/parameter-files`

**Request:** FormData
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('parameterId', 'param-custom-design');
formData.append('orderId', '1767050278973');
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: {
      id: 'file-123456',
      filename: 'design-123456.ai',
      url: 'https://cdn.example.com/uploads/orders/1767050278973/design-123456.ai',
      size: 2457600
    }
  }
}
```

---

## ✅ Data Validation

### Hebrew-only Fields (הקדשות)
```javascript
{
  pattern: /^[\u0590-\u05FF\s,.!?:;״׳'"]+$/,
  message: 'יש להזין טקסט בעברית בלבד'
}
```

### NUMBER Parameters
```javascript
{
  min: 50,
  max: 300,
  step: 10
}
```

### Price Validation
```javascript
// Backend must verify calculated price matches configuration
const calculated = calculatePrice(configuration);
if (Math.abs(calculated - order.totalPrice) > 0.01) {
  throw new Error('Price mismatch');
}
```

---

## 🚀 Performance & Caching

### Recommended Caching:
- Products: 5 min
- Parameters: 30 min
- Workflows: 1 hour

---

## 🔄 Migration from localStorage

### Export Script:
```javascript
const exportData = () => {
  return {
    products: JSON.parse(localStorage.getItem('mockProducts') || '[]'),
    parameters: JSON.parse(localStorage.getItem('mockParameters') || '[]'),
    workflows: JSON.parse(localStorage.getItem('mockWorkflows') || '[]'),
    departments: JSON.parse(localStorage.getItem('mockDepartments') || '[]'),
    orders: JSON.parse(localStorage.getItem('mockOrders') || '[]'),
    customers: JSON.parse(localStorage.getItem('mockCustomers') || '[]'),
    leads: JSON.parse(localStorage.getItem('mockLeads') || '[]')
  };
};
```

---

## 📝 Summary

### Backend Stack המומלץ:
- Node.js + Express (או NestJS)
- MySQL (או PostgreSQL)
- Sequelize/Prisma ORM
- JWT Authentication
- Multer לFile uploads
- AWS S3/CloudFlare R2 לקבצים

### סדר עדיפויות:

#### 🔴 Phase 1 (CRITICAL):
1. Database Schema
2. Products API (GET all, GET by id, GET variants, GET parameters)
3. Orders API (POST create)
4. Price calculation logic
5. Workflow tasks creation
6. Lead status update to WON

#### 🟡 Phase 2 (HIGH):
7. Products CRUD מלא
8. Parameters CRUD
9. File upload
10. Validation
11. Auth

#### 🟢 Phase 3 (MEDIUM):
12. Workflows CRUD
13. Analytics
14. Caching
15. Migration tools

---

**הכל מוכן! Frontend עובד מעולה עם localStorage - רק צריך API אמיתי! 🚀**
