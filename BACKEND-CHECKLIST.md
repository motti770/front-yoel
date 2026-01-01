# Backend Checklist - Dynamic Leads Pipeline

## סיכום שינויים נדרשים

הפרונט-אנד עודכן לעבוד עם **Pipeline דינמי** שמגיע מה-Workflows במקום שלבים קבועים בקוד.
הבק-אנד צריך לתמוך בשדות החדשים ובלוגיקה החדשה.

---

## 1️⃣ עדכון Schema של Leads

### שדות חדשים נדרשים:

```sql
ALTER TABLE leads ADD COLUMN pipeline_stage_id VARCHAR(50) DEFAULT 'stage-new';
ALTER TABLE leads ADD COLUMN stage_updated_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN sales_workflow_id UUID REFERENCES workflows(id);
ALTER TABLE leads ADD COLUMN current_sales_step_id VARCHAR(50);
ALTER TABLE leads ADD COLUMN selected_product_id UUID REFERENCES products(id);
ALTER TABLE leads ADD COLUMN selected_variant_id UUID REFERENCES products(id);
ALTER TABLE leads ADD COLUMN product_configuration JSONB;
ALTER TABLE leads ADD COLUMN estimated_price DECIMAL(10,2);
ALTER TABLE leads ADD COLUMN lost_reason TEXT;
ALTER TABLE leads ADD COLUMN converted_to_order_id UUID REFERENCES orders(id);

CREATE INDEX idx_leads_pipeline_stage ON leads(pipeline_stage_id);
CREATE INDEX idx_leads_sales_workflow ON leads(sales_workflow_id);
```

### מיפוי שדות:
| שדה Frontend (camelCase) | שדה Backend (snake_case) | סוג | תיאור |
|---|---|---|---|
| `pipelineStageId` | `pipeline_stage_id` | VARCHAR(50) | ID של שלב ב-Pipeline (למשל: `stage-new`, `stage-contacted`) |
| `stageUpdatedAt` | `stage_updated_at` | TIMESTAMP | מתי הליד עבר לשלב הנוכחי |
| `salesWorkflowId` | `sales_workflow_id` | UUID | ID של workflow מכירה (מסוג SALES) |
| `currentSalesStepId` | `current_sales_step_id` | VARCHAR(50) | ID של שלב נוכחי ב-workflow המכירה |
| `selectedProductId` | `selected_product_id` | UUID | מוצר שהליד בחר |
| `selectedVariantId` | `selected_variant_id` | UUID | וריאנט ספציפי שנבחר |
| `productConfiguration` | `product_configuration` | JSONB | פרמטרים שהליד בחר למוצר |
| `estimatedPrice` | `estimated_price` | DECIMAL | מחיר משוער |
| `lostReason` | `lost_reason` | TEXT | סיבת אובדן (אם נסגר כ-Lost) |
| `convertedToOrderId` | `converted_to_order_id` | UUID | ID הזמנה שנוצרה מהליד |

---

## 2️⃣ עדכון Workflows API

### סוג workflow חדש: `LEAD_PIPELINE`

הפרונט-אנד מצפה ל-workflow מסוג `type: 'LEAD_PIPELINE'` שמגדיר את שלבי ה-Pipeline הראשי.

```json
{
  "id": "pipeline-main",
  "name": "תהליך מכירות ראשי",
  "code": "LEAD_PIPELINE_MAIN",
  "type": "LEAD_PIPELINE",
  "isDefault": true,
  "isActive": true,
  "steps": [
    {
      "id": "stage-new",
      "name": "ליד חדש",
      "stepOrder": 1,
      "color": "#667eea",
      "slaHours": 24,
      "isActive": true
    },
    {
      "id": "stage-contacted",
      "name": "יצירת קשר",
      "stepOrder": 2,
      "color": "#4facfe",
      "slaHours": 48
    },
    {
      "id": "stage-qualified",
      "name": "זיהוי צורך",
      "stepOrder": 3,
      "color": "#00f2fe",
      "slaHours": 72
    },
    {
      "id": "stage-product",
      "name": "בחירת מוצר",
      "stepOrder": 4,
      "color": "#a855f7",
      "slaHours": 96
    },
    {
      "id": "stage-quote",
      "name": "הצעת מחיר",
      "stepOrder": 5,
      "color": "#f59e0b",
      "slaHours": 120
    },
    {
      "id": "stage-negotiation",
      "name": "משא ומתן",
      "stepOrder": 6,
      "color": "#ef4444",
      "slaHours": 168
    },
    {
      "id": "stage-deposit",
      "name": "ממתין למקדמה",
      "stepOrder": 7,
      "color": "#10b981",
      "slaHours": 72
    },
    {
      "id": "stage-won",
      "name": "זכייה",
      "stepOrder": 100,
      "color": "#22c55e",
      "isClosed": true,
      "isWon": true
    },
    {
      "id": "stage-lost",
      "name": "אבוד",
      "stepOrder": 101,
      "color": "#ef4444",
      "isClosed": true,
      "isLost": true
    }
  ]
}
```

### עדכון GET /workflows/active

הפרונט-אנד מסנן לפי `type`:
- `type: 'LEAD_PIPELINE'` → שלבי Pipeline ראשי
- `type: 'SALES'` → תהליכי מכירה למוצרים
- `type: 'PRODUCTION'` → תהליכי ייצור

---

## 3️⃣ עדכון Leads API

### POST /leads - יצירת ליד
```json
{
  "name": "משה כהן",
  "email": "moshe@example.com",
  "phone": "052-1234567",
  "company": "בית כנסת אהבת שלום",
  "source": "WEBSITE",
  "budget": 50000,
  "notes": "מעוניין בפרוכת",
  "pipelineStageId": "stage-new"  // ← חדש!
}
```

### PUT /leads/:id - עדכון ליד
```json
{
  "pipelineStageId": "stage-contacted",
  "stageUpdatedAt": "2025-12-30T10:00:00Z",
  "selectedProductId": "parochet",
  "salesWorkflowId": "101",
  "currentSalesStepId": "step-101-0",
  "productConfiguration": {
    "fabric": "velvet-burgundy",
    "height": "250",
    "width": "180"
  },
  "estimatedPrice": 45000
}
```

### GET /leads - רשימת לידים
כל ליד צריך להחזיר:
```json
{
  "id": "uuid",
  "name": "משה כהן",
  "email": "moshe@example.com",
  "phone": "052-1234567",
  "company": "בית כנסת אהבת שלום",
  "pipelineStageId": "stage-contacted",
  "stageUpdatedAt": "2025-12-30T10:00:00Z",
  "source": "WEBSITE",
  "budget": 50000,
  "selectedProductId": "parochet",
  "salesWorkflowId": "101",
  "currentSalesStepId": "step-101-0",
  "productConfiguration": {...},
  "estimatedPrice": 45000,
  "createdAt": "2025-12-28T08:00:00Z"
}
```

---

## 4️⃣ לוגיקה חדשה (אופציונלי)

### התאמה אוטומטית של שלב

כשליד בוחר מוצר (PUT עם `selectedProductId`), הבק-אנד יכול:
1. למצוא את ה-`salesWorkflowId` של המוצר
2. לעדכן אוטומטית את `salesWorkflowId` ו-`currentSalesStepId` של הליד

### חישוב SLA

כל שלב ב-Pipeline יש לו `slaHours`. הפרונט-אנד מחשב חריגות לפי:
```javascript
const hoursInStage = (now - stageUpdatedAt) / (1000 * 60 * 60);
const isOverdue = hoursInStage > stage.slaHours;
```

---

## 5️⃣ נתוני Mock (לבדיקה)

הפרונט-אנד כולל נתוני mock עם 14 לידים לדוגמה ב-`api.js`.
אפשר להשתמש בהם כבסיס ל-seed data בבק-אנד.

---

## 6️⃣ בדיקות מהירות

```bash
# 1. בדוק שהעמודות קיימות
psql -d postgres-yoel -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads';"

# 2. בדוק workflows
curl -H "Authorization: Bearer TOKEN" https://crm-api.app.mottidokib.com/workflows/active | jq '.data[] | select(.type == "LEAD_PIPELINE")'

# 3. צור ליד עם שדות חדשים
curl -X POST https://crm-api.app.mottidokib.com/leads \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@test.com",
    "source": "WEBSITE",
    "pipelineStageId": "stage-new",
    "budget": 50000
  }'

# 4. עדכן שלב
curl -X PUT https://crm-api.app.mottidokib.com/leads/LEAD_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pipelineStageId": "stage-contacted",
    "stageUpdatedAt": "2025-12-30T10:00:00Z"
  }'
```

---

## סיכום עדיפויות

| עדיפות | משימה | סטטוס |
|---|---|---|
| 🔴 גבוהה | הוספת עמודה `pipeline_stage_id` | חסר |
| 🔴 גבוהה | הוספת עמודה `stage_updated_at` | חסר |
| 🟠 בינונית | הוספת עמודות מוצר (`selected_product_id`, וכו') | חסר |
| 🟠 בינונית | יצירת workflow מסוג LEAD_PIPELINE | חסר |
| 🟢 נמוכה | לוגיקת התאמה אוטומטית | אופציונלי |

---

**עודכן:** 1 ינואר 2026
**גרסת Frontend:** MOCK_DATA_VERSION = 20
