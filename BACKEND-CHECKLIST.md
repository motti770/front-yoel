# Backend Checklist - Leads Pipeline Integration

## ✅ דברים לבדוק ולתקן

### 1️⃣ בדיקת Database Schema
```bash
# התחבר ל-Postgres ובדוק:
psql -d postgres-yoel

# רוץ:
\d leads
```

**מה לחפש:**
- [x] עמודה `product_id` מסוג UUID
- [x] Foreign key ל-`products(id)`

**אם לא קיים, הרץ:**
```sql
ALTER TABLE leads ADD COLUMN product_id UUID REFERENCES products(id);
CREATE INDEX idx_leads_product ON leads(product_id);
```

---

### 2️⃣ בדיקת API Validation

בקובץ הvalidation של Leads (Zod schema), וודא:

```typescript
// צריך לכלול:
productId: z.string().uuid().optional()
```

**קובץ:** `src/validations/leads.validation.ts` (או דומה)

---

### 3️⃣ בדיקת Endpoints

#### ✅ POST /leads
- [x] מקבל `productId` optional
- [x] שומר ב-DB
- [x] מחזיר בresponse

#### ✅ PUT /leads/:id
- [x] מאפשר עדכון `productId`

#### ✅ GET /leads
- [x] מחזיר `productId` בכל ליד

---

### 4️⃣ בדיקת Workflows API

#### ✅ GET /workflows/active
צריך להחזיר:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Workflow Name",
      "steps": [
        {
          "id": "uuid",
          "name": "Step Name",
          "order": 1
        }
      ]
    }
  ]
}
```

**או:**
```json
{
  "success": true,
  "data": {
    "workflows": [...],
    "pagination": {...}
  }
}
```

---

### 5️⃣ בדיקת Products API

#### ✅ GET /products
כל מוצר צריך להחזיר `workflowId`:
```json
{
  "id": "uuid",
  "name": "Product Name",
  "workflowId": "workflow-uuid-here"  // ← חשוב!
}
```

---

## 🧪 בדיקות מהירות

```bash
# 1. בדוק שטבלה תקינה
curl -H "Authorization: Bearer TOKEN" https://crm-api.app.mottidokib.com/leads | jq '.[0].productId'

# 2. צור ליד עם מוצר
curl -X POST https://crm-api.app.mottidokib.com/leads \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","source":"WEBSITE","stage":"NEW","productId":"PRODUCT_UUID"}'

# 3. בדוק workflows
curl -H "Authorization: Bearer TOKEN" https://crm-api.app.mottidokib.com/workflows/active
```

---

## 📝 הערות

- Frontend התאים את עצמו לעבוד גם אם השדה לא קיים (fallback)
- אבל **כדי שהPipeline יעבוד נכון** - צריך את השדה `product_id`
- הקוד מוכן ועובד, רק צריך לוודא שהBackend תומך

---

**נוצר:** 29 דצמבר 2025  
**לשאלות:** ראה `BACKEND-ASSETS-REQUIREMENTS.md` לפירוט מלא
