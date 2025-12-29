# Frontend Changes - Leads Pipeline Integration

**תאריך:** 29 בדצמבר 2025  
**מטרה:** חיבור פייפליין ליידים לשלבי Workflow של מוצרים

---

## 📋 סיכום השינויים ב-Frontend

### שינויים בקובץ `src/pages/Leads.jsx`:

1. **הוספת שדה `productId` לטופס הליד**
   - נוסף dropdown לבחירת מוצר בטופס יצירת/עריכת ליד
   - השדה הוא אופציונלי - ליד יכול להיות ללא מוצר

2. **טעינת מוצרים ו-Workflows**
   - הדף טוען את רשימת המוצרים והworkflows בעת טעינה
   - משתמש ב-`productsService.getAll()` ו-`workflowsService.getActive()`

3. **תצוגת Pipeline דינמית**
   - אם לליד יש `productId`, מוצג הpipeline של הworkflow המקושר למוצר
   - אם אין `productId`, מוצגים שלבי מכירה גנריים

4. **הצגת מוצר בגריד**
   - בתצוגת Grid, ליידים עם מוצר מקושר מציגים את שם המוצר

---

## ⚠️ דרישות Backend - לתשומת לב המפתח

### 1. טבלת `leads` - וידוא שדה `product_id`

**נדרש לוודא שהשדה הבא קיים בטבלה:**

```sql
ALTER TABLE leads ADD COLUMN product_id UUID REFERENCES products(id);
```

**אם השדה כבר קיים - מעולה! ✅**  
**אם לא - יש להוסיף אותו.**

בדיקה:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads' AND column_name = 'product_id';
```

---

### 2. API Endpoints - תמיכה ב-`productId`

#### POST `/leads` - יצירת ליד חדש

**Body צריך לתמוך ב:**
```json
{
  "name": "שם הליד",
  "email": "email@example.com",
  "phone": "050-1234567",
  "company": "שם חברה",
  "source": "WEBSITE",
  "stage": "NEW",
  "estimatedValue": 10000,
  "notes": "הערות",
  "productId": "uuid-of-product",  // ⬅️ שדה חדש - אופציונלי
  "nextFollowUp": "2025-01-15"
}
```

#### PUT `/leads/:id` - עדכון ליד

**Body צריך לתמוך באותם שדות כמו POST**, כולל `productId`.

---

### 3. GET `/workflows/active` - Workflows פעילים

**Frontend מצפה לקבל:**
```json
{
  "success": true,
  "data": [
    {
      "id": "workflow-uuid",
      "name": "Parochet Production",
      "steps": [
        {
          "id": "step-uuid",
          "name": "ליד חדש",
          "order": 1
        },
        {
          "id": "step-uuid-2",
          "name": "הדמיה",
          "order": 2
        },
        {
          "id": "step-uuid-3",
          "name": "אישור הצעת מחיר",
          "order": 3
        }
      ]
    }
  ]
}
```

**או בפורמט paginated:**
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

### 4. מוצרים עם `workflowId`

**חשוב:** המוצרים צריכים להחזיר את ה-`workflowId` שלהם כדי שה-Frontend יוכל לקשר ליד → מוצר → workflow.

**GET `/products` צריך להחזיר:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product-uuid",
        "name": "פרוכת",
        "sku": "PAR-001",
        "workflowId": "workflow-uuid",  // ⬅️ חשוב!
        ...
      }
    ]
  }
}
```

---

## 🧪 בדיקות שיש לבצע ב-Backend

### 1. בדיקת שדה `product_id`
```sql
-- בדוק אם השדה קיים
\d leads

-- אם לא קיים, הוסף:
ALTER TABLE leads ADD COLUMN product_id UUID REFERENCES products(id);

-- הוסף index לביצועים
CREATE INDEX idx_leads_product ON leads(product_id);
```

### 2. בדיקת Validation
וודא שהvalidation מאפשר `productId` כ-optional UUID:
```typescript
// דוגמה ב-Zod
productId: z.string().uuid().optional()
```

### 3. בדיקת תשובת API
```bash
# בדוק שליד עם productId נשמר ומוחזר נכון
curl -X POST https://crm-api.app.mottidokib.com/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "source": "WEBSITE",
    "stage": "NEW",
    "estimatedValue": 5000,
    "productId": "EXISTING_PRODUCT_UUID"
  }'
```

---

## 📊 תרשים זרימה

```
User → יוצר ליד → בוחר מוצר
                      ↓
          Frontend שולח productId ל-Backend
                      ↓
          Backend שומר ב-leads.product_id
                      ↓
          Frontend טוען ליד + מוצר + workflow
                      ↓
          מציג Pipeline עם שלבי הworkflow הספציפי למוצר
```

---

## ✅ Checklist למפתח Backend

- [ ] וידוא שטבלת `leads` כוללת שדה `product_id UUID`
- [ ] הוספת index על `product_id` לביצועים
- [ ] Validation ב-API תומך ב-`productId` (optional)
- [ ] POST `/leads` שומר את `productId` כראוי
- [ ] PUT `/leads/:id` מאפשר עדכון `productId`
- [ ] GET `/leads` מחזיר `productId` בכל ליד
- [ ] GET `/workflows/active` מחזיר workflows עם steps ו-order
- [ ] GET `/products` מחזיר `workflowId` בכל מוצר
- [ ] בדיקות E2E: יצירה/עדכון/קריאה של ליד עם מוצר

---

## 🔗 קבצים רלוונטיים

- **Frontend**: `src/pages/Leads.jsx`
- **API Service**: `src/services/api.js` (leadsService, productsService, workflowsService)
- **Backend Requirements**: `BACKEND-REQUIREMENTS.md` (שורה 18-85)
- **תיעוד זה**: `BACKEND-ASSETS-REQUIREMENTS.md`

---

**הערות נוספות:**
- הקוד ב-Frontend מטפל בחן שה-API עשוי להחזיר array ישירות או בפורמט paginated
- אם `productId` ריק או לא קיים, המערכת מציגה שלבים גנריים (fallback)
- מומלץ להוסיף logging ב-Backend לבדוק שה-`productId` נשמר ומוחזר נכון
