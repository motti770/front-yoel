# דרישות Backend - מערכת CRM
## מסמך למפתח Backend

---

## 1. ניהול Pipeline מכירות (לפי מוצר)

### הסבר:
כל מוצר יכול להיות עם תהליך מכירה שונה. למשל:
- פרוכת: ליד חדש → הדמיה מעצבת → אישור לקוח → הצעת מחיר → זכייה
- כיפות: ליד חדש → הצעת מחיר → זכייה

### Endpoints נדרשים:

```
GET /products/:productId/sales-pipeline
```
החזרת שלבי המכירה של מוצר מסוים

```
PUT /products/:productId/sales-pipeline
```
עדכון שלבי המכירה של מוצר
Body:
```json
{
  "stages": [
    { "id": "NEW", "label": "חדש", "color": "#6366f1", "order": 1 },
    { "id": "DESIGN", "label": "הדמיה", "color": "#8b5cf6", "order": 2 },
    { "id": "QUOTE", "label": "הצעת מחיר", "color": "#f59e0b", "order": 3 },
    { "id": "WON", "label": "זכייה", "color": "#10b981", "order": 4 },
    { "id": "LOST", "label": "הפסד", "color": "#ef4444", "order": 5 }
  ]
}
```

### מבנה DB מוצע:
```sql
CREATE TABLE product_sales_stages (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  stage_id VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. ייצור למלאי (Stock Production Orders)

### הסבר:
הזמנות ייצור פנימיות שלא קשורות ללקוח. למשל: "ייצור 1000 כיפות למלאי".
כולל הערכת עלות אוטומטית.

### Endpoints נדרשים:

```
GET /stock-orders
```
רשימת כל הזמנות הייצור למלאי

```
POST /stock-orders
```
יצירת הזמנת מלאי חדשה
Body:
```json
{
  "productId": "uuid",
  "quantity": 1000,
  "notes": "כיפות שחורות למלאי",
  "targetDate": "2025-02-01"
}
```

Response כולל הערכת עלות:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "productId": "uuid",
    "quantity": 1000,
    "estimatedCost": 15000,
    "costBreakdown": {
      "materials": 10000,
      "labor": 4000,
      "overhead": 1000
    },
    "status": "PENDING"
  }
}
```

```
PUT /stock-orders/:id/status
```
עדכון סטטוס (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)

### מבנה DB מוצע:
```sql
CREATE TABLE stock_orders (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'PENDING',
  notes TEXT,
  target_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. תמחור מוצרים (לחישוב עלות)

### הסבר:
כדי לחשב הערכת עלות, צריך להגדיר עלויות חומרים ועבודה לכל מוצר.

### Endpoints נדרשים:

```
GET /products/:id/pricing
```

```
PUT /products/:id/pricing
```
Body:
```json
{
  "materialCost": 10,
  "laborCost": 4,
  "overheadPercent": 10
}
```

### מבנה DB מוצע:
```sql
ALTER TABLE products ADD COLUMN material_cost DECIMAL(10,2);
ALTER TABLE products ADD COLUMN labor_cost DECIMAL(10,2);
ALTER TABLE products ADD COLUMN overhead_percent INT DEFAULT 10;
```

---

## 4. עדכונים נוספים נדרשים

### בטבלת Leads:
- הוספת שדה `product_id` כדי לדעת איזה מוצר הליד מעוניין בו
- השלב (`stage`) יהיה דינמי לפי ה-Pipeline של המוצר

```sql
ALTER TABLE leads ADD COLUMN product_id UUID REFERENCES products(id);
```

---

## סיכום Endpoints חדשים:

| Method | Endpoint | תיאור |
|--------|----------|-------|
| GET | /products/:id/sales-pipeline | שלבי מכירה של מוצר |
| PUT | /products/:id/sales-pipeline | עדכון שלבי מכירה |
| GET | /products/:id/pricing | תמחור מוצר |
| PUT | /products/:id/pricing | עדכון תמחור |
| GET | /stock-orders | רשימת הזמנות מלאי |
| POST | /stock-orders | יצירת הזמנת מלאי |
| PUT | /stock-orders/:id/status | עדכון סטטוס |
| GET | /stock-orders/:id | פרטי הזמנת מלאי |

---

## הערות:
- כל ה-Endpoints דורשים Authorization (Bearer token)
- תשובות בפורמט: `{ success: boolean, data: {...}, error?: {...} }`
- שדות תאריך בפורמט ISO 8601

