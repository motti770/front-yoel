# הרחבות נדרשות ל-API
**תאריך:** 1 בינואר 2026

---

## מה חסר?

### 1. לידים (Leads) - חסר לגמרי

**יישות חדשה:** Lead (ליד)

**שדות:**
- name, email, phone, company
- source (מאיפה הגיע: WEBSITE, REFERRAL, PHONE וכו')
- stage (שלב: NEW, CONTACTED, QUALIFIED, PRODUCT, QUOTE, NEGOTIATION, DEPOSIT, WON, LOST)
- estimatedValue (ערך משוער)
- notes
- assignedToId → קשור ל-User
- productId → קשור ל-Product (מוצר שמעניין אותו)
- nextFollowUp (תאריך מעקב הבא)
- convertedToOrderId → קשור ל-Order (אחרי המרה)

**Endpoints:**
```
GET    /leads              - רשימה עם פילטרים (stage, source, search)
GET    /leads/:id          - ליד בודד
POST   /leads              - יצירה
PUT    /leads/:id          - עדכון
DELETE /leads/:id          - מחיקה
POST   /leads/:id/convert  - המרה להזמנה (ראה למטה)
```

**המרה להזמנה (convert):**
1. צור Customer מנתוני הליד (או מצא קיים לפי email)
2. צור Order עם המוצר שנבחר
3. עדכן הליד: stage=WON, convertedToOrderId=ההזמנה החדשה
4. החזר: { customerId, orderId }

---

### 2. חומרים/מלאי (Materials) - חסר לגמרי

**יישות חדשה:** Material (חומר)

**שדות:**
- name, nameEn, code
- category (FABRIC, THREAD, ACCESSORY, BACKING)
- type (velvet, silk, cotton וכו')
- colorHex
- supplier
- stockQuantity, stockUnit (כמות ויחידה)
- reorderLevel (מתי להתריע)
- unitCost, salePrice
- location (מיקום במחסן)
- isActive

**קשר למוצרים:** טבלת קישור product_materials (איזה חומרים משמשים לאיזה מוצר)

**Endpoints:**
```
GET    /materials              - רשימה עם פילטרים (category, lowStockOnly, search)
GET    /materials/:id          - חומר בודד
POST   /materials              - יצירה
PUT    /materials/:id          - עדכון
DELETE /materials/:id          - מחיקה
PUT    /materials/:id/stock    - עדכון מלאי (operation: ADD/SUBTRACT/SET, quantity)
GET    /materials/low-stock    - חומרים מתחת לרף המינימום
GET    /materials/product/:productId  - חומרים למוצר מסוים
```

**לוגיקה חשובה:**
כשמלאי יורד מתחת ל-reorderLevel → ליצור Notification אוטומטית!

---

### 3. התראות (Notifications) - חסר לגמרי

**יישות חדשה:** Notification (התראה)

**שדות:**
- userId (למי, או null לכולם)
- type (STOCK_LOW, ORDER_CREATED, TASK_ASSIGNED וכו')
- priority (low, normal, high, critical)
- title, titleEn
- message, messageEn
- entityType, entityId (מה קשור להתראה)
- actionUrl (לאן לנווט בלחיצה)
- read (נקרא?)
- dismissed (בוטל?)

**Endpoints:**
```
GET    /notifications              - רשימת התראות למשתמש
GET    /notifications/unread-count - מספר לא נקראו (לבאדג')
PUT    /notifications/:id/read     - סימון כנקרא
POST   /notifications/read-all     - סימון הכל כנקרא
PUT    /notifications/:id/dismiss  - ביטול
DELETE /notifications/:id          - מחיקה
```

---

## שיפורים לדברים קיימים

### Products - להוסיף שדה:
- `salesWorkflowId` → קשור ל-Workflow (תהליך מכירה)

### Workflows - להוסיף שדות:
- `type` (PRODUCTION / SALES)

**שלבי Workflow (WorkflowStep) - שדות חדשים לשיוך משימות:**
- `assignmentType` (AUTO_DEPARTMENT / SPECIFIC_ROLE / SPECIFIC_USER)
  - AUTO_DEPARTMENT = שיוך אוטומטי לעובד הכי פחות עמוס במחלקה
  - SPECIFIC_ROLE = שיוך לפי תפקיד (מנהל, עובד בכיר, עובד זוטר)
  - SPECIFIC_USER = שיוך לעובד ספציפי
- `assignToRole` (string, optional) - תפקיד לשיוך (רק כש-assignmentType=SPECIFIC_ROLE)
- `assignToUserId` (string, optional) - מזהה עובד לשיוך (רק כש-assignmentType=SPECIFIC_USER)

**לוגיקת "הכי פחות עמוס":**
כשיוצרים Task עם assignmentType=AUTO_DEPARTMENT:
1. מצא את כל העובדים במחלקה הרלוונטית
2. ספור לכל אחד כמה Tasks פתוחות יש לו (status != COMPLETED)
3. שייך לעובד עם הכי פחות משימות פתוחות

### Orders - לוודא:
- כשיוצרים הזמנה ויש workflow למוצר → ליצור Tasks אוטומטית לכל שלב

---

## סדר עדיפויות

1. **Materials + Notifications** (בסיס - צריך להתראות מלאי)
2. **Leads** (פיצ'ר מכירות שלם)
3. **שיפורים לקיים** (קישורי workflow)

---

זהו! שאלות → יואל
