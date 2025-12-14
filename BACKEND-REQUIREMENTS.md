# Backend Development Requirements
## עדכון אחרון: 13 בדצמבר 2025

מסמך זה מרכז את כל הדרישות לפיתוח ה-Backend שנאספו במהלך פיתוח ה-Frontend.
כל פיצ'ר חדש שדורש API יתווסף לכאן.

---

## 📋 רשימת דרישות

### 1. 🏢 Companies & Contacts (חברות ואנשי קשר)

**תיאור:**
מודל של חברות/ארגונים (למשל: בית כנסת) עם מספר אנשי קשר מחוברים.
לקוח אחד (בית כנסת) יכול להיות לו כמה אנשי קשר שמזמינים בשמו.

**Entities נדרשים:**

```
Company (חברה/ארגון)
├── id: UUID
├── name: string (שם החברה/בית הכנסת)
├── type: enum (SYNAGOGUE, ORGANIZATION, BUSINESS, PRIVATE)
├── address: string?
├── city: string?
├── phone: string?
├── email: string?
├── website: string?
├── notes: string?
├── isActive: boolean
├── createdAt: DateTime
├── updatedAt: DateTime
└── contacts: Contact[]

Contact (איש קשר)
├── id: UUID
├── firstName: string
├── lastName: string
├── email: string
├── phone: string?
├── role: string? (גבאי, יו"ר, רב, מזכיר)
├── companyId: UUID (FK -> Company)
├── isPrimary: boolean (איש קשר ראשי)
├── isActive: boolean
├── createdAt: DateTime
├── updatedAt: DateTime
└── company: Company
```

**API Endpoints נדרשים:**

```
Companies:
GET    /companies              - רשימת חברות (pagination, search, filter by type)
GET    /companies/:id          - חברה בודדת עם אנשי קשר
POST   /companies              - יצירת חברה
PUT    /companies/:id          - עדכון חברה
DELETE /companies/:id          - מחיקת חברה

Contacts:
GET    /contacts               - רשימת אנשי קשר (pagination, search, filter by companyId)
GET    /contacts/:id           - איש קשר בודד
POST   /contacts               - יצירת איש קשר
PUT    /contacts/:id           - עדכון איש קשר
DELETE /contacts/:id           - מחיקת איש קשר
GET    /companies/:id/contacts - אנשי קשר של חברה ספציפית
```

**שינויים ב-Orders:**
- להוסיף `companyId` להזמנה
- להוסיף `contactId` להזמנה (איש הקשר שביצע)
- לשמור את שניהם - גם החברה וגם איש הקשר

**עדיפות:** גבוהה
**סטטוס:** ממתין

---

### 2. 📦 Sub-Products (תתי-מוצרים)

**תיאור:**
אפשרות לקשר מוצרים יחד ליצירת מוצר מורכב.
למשל: טלית מורכבת ממספר חלקים.

**שדות נדרשים:**

```
Product (הרחבה):
├── parentProductId: UUID? (FK -> Product) - אם זה תת-מוצר
├── subProducts: ProductRelation[] - רשימת תתי-מוצרים

ProductRelation:
├── id: UUID
├── parentProductId: UUID
├── childProductId: UUID
├── quantity: number (כמות תתי-מוצרים)
├── sortOrder: number
```

**API Endpoints:**
```
GET    /products/:id/sub-products      - תתי-מוצרים של מוצר
POST   /products/:id/sub-products      - הוספת תת-מוצר
PUT    /products/sub-products/:id      - עדכון (למשל כמות)
DELETE /products/sub-products/:id      - הסרת קשר
```

**עדיפות:** בינונית
**סטטוס:** ממתין

---

### 3. 📜 Product History (היסטוריית מוצר)

**תיאור:**
מעקב אחרי שינויים במוצר לאורך זמן.

**Entity:**
```
ProductHistory:
├── id: UUID
├── productId: UUID
├── fieldChanged: string
├── oldValue: string?
├── newValue: string?
├── changedBy: UUID (User)
├── changedAt: DateTime
├── changeType: enum (CREATE, UPDATE, DELETE)
```

**API Endpoints:**
```
GET /products/:id/history - היסטוריית שינויים של מוצר
```

**עדיפות:** נמוכה
**סטטוס:** ממתין

---

### 4. 🗂️ Groups (קבוצות ב-Board)

**תיאור:**
קבוצות לארגון פריטים בלוחות (Boards) - בסגנון Monday.com.
המשתמש יוצר קבוצות וגורר אליהן פריטים.

**Entity:**
```
BoardGroup:
├── id: UUID
├── boardType: enum (CUSTOMERS, PRODUCTS, ORDERS, TASKS)
├── name: string
├── color: string (hex)
├── sortOrder: number
├── isCollapsed: boolean
├── userId: UUID (יוצר הקבוצה - או null לקבוצות גלובליות)
├── createdAt: DateTime
├── updatedAt: DateTime

BoardGroupItem:
├── id: UUID
├── groupId: UUID (FK -> BoardGroup)
├── itemId: UUID (ID של הפריט - customer/product/etc)
├── sortOrder: number
```

**API Endpoints:**
```
GET    /boards/:boardType/groups           - קבוצות של לוח
POST   /boards/:boardType/groups           - יצירת קבוצה
PUT    /boards/groups/:id                  - עדכון קבוצה (שם, צבע, collapsed)
DELETE /boards/groups/:id                  - מחיקת קבוצה
POST   /boards/groups/:id/items            - הוספת פריט לקבוצה
DELETE /boards/groups/:groupId/items/:itemId - הסרת פריט מקבוצה
PUT    /boards/groups/:id/reorder          - שינוי סדר קבוצות
```

**עדיפות:** בינונית
**סטטוס:** ממתין (כרגע נשמר ב-localStorage)

---

### 5. 🖼️ Product Primary Image

**תיאור:**
הגדרת תמונה ראשית למוצר מתוך הקבצים המצורפים.

**שדה נדרש:**
```
Product:
├── primaryImageId: UUID? (FK -> File)
```

**או:**
```
File:
├── isPrimary: boolean (לפי entityType + entityId)
```

**עדיפות:** נמוכה
**סטטוס:** ממתין

---

## 📊 סיכום עדיפויות

| פיצ'ר | עדיפות | מורכבות | הערות |
|-------|--------|---------|-------|
| Companies & Contacts | גבוהה | גבוהה | דרוש לניהול לקוחות נכון |
| Sub-Products | בינונית | בינונית | UI קיים, ממתין ל-API |
| Groups API | בינונית | בינונית | כרגע עובד עם localStorage |
| Product History | נמוכה | נמוכה | Nice to have |
| Primary Image | נמוכה | נמוכה | Nice to have |

---

## 🔄 עדכונים

**13/12/2025:**
- נוסף: Companies & Contacts requirement
- נוסף: Sub-Products requirement
- נוסף: Product History requirement
- נוסף: Groups API requirement
- נוסף: Primary Image requirement
