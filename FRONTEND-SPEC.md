# 📋 FRONTEND SPECIFICATION - The Shul CRM
**תאריך:** 29 בדצמבר 2025
**סטטוס:** 67% מושלם מלא | 28% חלקי | 5% לא מושלם

---

## 📊 **סיכום מהיר**

| מדד | ערך |
|-----|-----|
| **סה"כ דפים** | 18 |
| **דפים מלאים** | 12 (67%) ✅ |
| **דפים חלקיים** | 5 (28%) 🔄 |
| **דפים לא מושלמים** | 1 (5%) ❌ |
| **קומפוננטים** | 7 |
| **שורות קוד** | ~15,000+ |
| **שירותי API** | 11 |
| **דפים ללא API** | 6 |

---

## 🟢 **דפים שעובדים מעולה (12)**

### 1. **Dashboard.jsx** ✅
- **תיאור:** דף ראשי עם KPIs וסטטיסטיקות
- **פיצ'רים:**
  - כרטיסי KPI (הזמנות, משימות, לידים, הכנסות)
  - גרפים (Recharts)
  - פעילויות אחרונות
  - מוצרים מובילים
- **API:** orders, tasks, leads
- **סטטוס:** ✅ מושלם - עובד מצוין

---

### 2. **Leads.jsx** ✅
- **תיאור:** ניהול לידים עם Pipeline
- **פיצ'רים:**
  - לוח Kanban עם Drag & Drop
  - שלבי מכירה (NEW → WON/LOST)
  - המרה ללקוח
  - ייבוא המוני
  - סינון וחיפוש
  - בחירת מוצר + Workflow
- **API:** leads, customers, orders
- **סטטוס:** ✅ מושלם
- **⚠️ לתקן:** למחוק ~10 console.log (שורות 138, 296, 437, 444, 1555, 1578)

---

### 3. **Customers.jsx** ✅
- **תיאור:** ניהול לקוחות
- **פיצ'רים:**
  - CRUD מלא
  - חיפוש וסינון
  - סטטוס (ACTIVE, INACTIVE, PROSPECT)
  - פרטי חברה ואיש קשר
- **API:** customers
- **סטטוס:** ✅ מושלם - קוד נקי

---

### 4. **Products.jsx** ✅
- **תיאור:** קטלוג מוצרים
- **פיצ'רים:**
  - רשת/רשימה
  - פרמטרים מותאמים (צבעים, מידות)
  - ProductConfigurator
  - גלריית תמונות
  - ניהול מלאי
- **API:** products, parameters
- **סטטוס:** ✅ מושלם

---

### 5. **Orders.jsx** ✅
- **תיאור:** ניהול הזמנות
- **פיצ'רים:**
  - תצוגות מרובות (טבלה, קנבאן)
  - Workflow סטטוס (PENDING → DELIVERED)
  - קישור ללקוח ומוצר
  - יצירת משימות אוטומטית
  - עדיפות ומעקב משלוח
- **API:** orders, customers, products, workflows, tasks
- **סטטוס:** ✅ מושלם
- **⚠️ לתקן:** console.log בשורה 108

---

### 6. **Tasks.jsx** ✅
- **תיאור:** ניהול משימות
- **פיצ'רים:**
  - רשימה + סינון
  - שיוך לעובדים
  - ארגון לפי מחלקה
  - עדיפות (LOW → URGENT)
  - סטטוס (PENDING → COMPLETED)
- **API:** tasks, orders, users, departments
- **סטטוס:** ✅ מושלם

---

### 7. **Workflows.jsx** ✅
- **תיאור:** ניהול תהליכים (ייצור + מכירות)
- **פיצ'רים:**
  - **תהליכי ייצור:** שלבים + מחלקות
  - **Pipeline מכירות:** שלבים + SLA
  - סידור מחדש (חצים למעלה/מטה)
  - שכפול Workflow
  - צבעי מחלקה
- **API:** workflows, workflowSteps, departments
- **סטטוס:** ✅ מושלם (830 שורות)
- **⚠️ לתקן:** console.log בשורות 114, 300, 328-357

---

### 8. **Parameters.jsx** ✅
- **תיאור:** פרמטרים למוצרים
- **פיצ'רים:**
  - סוגים: TEXT, SELECT, COLOR, NUMBER, DATE
  - אופציות + מחיר
  - בורר צבעים
  - סדר תצוגה
  - רב-לשוני
- **API:** parameters
- **סטטוס:** ✅ מושלם (502 שורות)

---

### 9. **Departments.jsx** ✅
- **תיאור:** ניהול מחלקות
- **פיצ'רים:**
  - CRUD מחלקות
  - בורר צבעים למיתוג
  - ספירת עובדים ומשימות
  - RBAC (Admin/Manager בלבד)
- **API:** departments
- **סטטוס:** ✅ מושלם (316 שורות)

---

### 10. **ImportPage.jsx** ✅
- **תיאור:** ייבוא המוני
- **פיצ'רים:**
  - בחירת סוג (customers, products, orders)
  - BulkImporter
  - מיפוי שדות
  - ייבואים אחרונים
- **API:** customers, products, orders
- **סטטוס:** ✅ מושלם (248 שורות)

---

### 11. **LoginPage.jsx** ✅
- **תיאור:** התחברות
- **פיצ'רים:**
  - טופס email/password
  - הצגת/הסתרת סיסמה
  - כפתור Test Credentials
  - AuthContext
- **API:** authService
- **סטטוס:** ✅ מושלם (131 שורות)

---

### 12. **UsersPage.jsx** 🔄
- **תיאור:** ניהול משתמשים (Admin)
- **פיצ'רים:**
  - CRUD משתמשים
  - תפקידים (ADMIN, MANAGER, EMPLOYEE)
  - שיוך למחלקה
  - חיפוש וסינון
- **API:** users
- **סטטוס:** 🔄 חלקי - יש קוד fallback (שורות 88-158)
- **⚠️ הערה:** קוד הגנתי למקרה של כשל API

---

## 🟡 **דפים שצריכים חיבור ל-API (5)**

### 13. **CalendarPage.jsx** 🔄 **עדיפות גבוהה!**
- **תיאור:** לוח שנה ואירועים
- **פיצ'רים:**
  - ניווט חודשים
  - סוגי אירועים (פגישה, שיחה, וידאו, משימה)
  - הוספת אירועים מהירה
- **API:** ❌ **אין! משתמש ב-Mock Data**
- **סטטוס:** 🔄 UI מושלם, אין Backend
- **⚠️ קריטי:** שורות 40-46 - אירועים hardcoded
- **משימה:**
  - צריך Events API (CRUD)
  - אירועים לפי משתמש
  - סוגי אירועים
- **הערכה:** 2-3 ימים

---

### 14. **AssetLibrary.jsx** 🔄
- **תיאור:** ספריית ציורים ונכסים
- **פיצ'רים:**
  - תצוגת Grid
  - סינון לפי קטגוריה (ציורים, לוגואים, תבניות)
  - חיפוש לפי תגים
  - Upload placeholder
- **API:** ❌ **אין! Mock Data**
- **סטטוס:** 🔄 UI מושלם, אין Backend
- **משימה:**
  - Assets API
  - העלאת קבצים אמיתית
  - אחסון קבצים (S3/Local)
- **הערכה:** 3-4 ימים

---

### 15. **StockOrders.jsx** 🔄 **עדיפות גבוהה!**
- **תיאור:** הזמנות ייצור למלאי
- **פיצ'רים:**
  - יצירת הזמנת מלאי
  - בחירת מוצר מ-MOCK_PRODUCTS
  - כמות ותאריך יעד
  - סטטוס + Progress
  - הערכת עלות
- **API:** ❌ **אין! Mock Data**
- **סטטוס:** 🔄 UI מושלם (330 שורות)
- **משימה:**
  - Stock Orders API
  - חיבור למוצרים אמיתיים
  - מעקב ייצור
- **הערכה:** 2-3 ימים

---

### 16. **Analytics.jsx** 🔄 **עדיפות גבוהה!**
- **תיאור:** דשבורד אנליטיקס (Admin/Manager)
- **פיצ'רים:**
  - KPI כרטיסים (מכירות, הזמנות, AVG)
  - גרפי מגמות (Recharts)
  - מוצרים מובילים
  - עומס מחלקות
  - ביצועים לפי מחלקה
- **API:** ❌ **אין! Mock Data**
- **סטטוס:** 🔄 UI מושלם (232 שורות)
- **משימה:**
  - Analytics API אמיתי
  - חישובי מטריקות
  - סינון תאריכים
- **הערכה:** 3-4 ימים

---

### 17. **SettingsPage.jsx** 🔄
- **תיאור:** הגדרות משתמש ומערכת
- **פיצ'רים:**
  - ניהול פרופיל
  - העדפות התראות
  - בחירת ערכת נושא
  - בורר צבע ראשי
  - **ניהול שלבי Pipeline** (Admin/Manager)
  - שינוי סיסמה
- **API:** ❌ רק localStorage + ThemeContext
- **סטטוס:** 🔄 UI מושלם (414 שורות)
- **משימה:**
  - חיבור שמירת פרופיל ל-API
  - API לשינוי סיסמה
  - שמירת הגדרות
- **הערכה:** 1 יום

---

## 🔴 **דפים לא מושלמים (1)**

### 18. **Assets.jsx** ❌
- **תיאור:** דפדפן נכסים פשוט
- **פיצ'רים:**
  - Grid פלייסהולדר
  - חיפוש
  - כפתור העלאה
- **API:** אין
- **סטטוס:** ❌ רק Shell (60 שורות)
- **משימה:**
  - **אופציה 1:** להשלים פונקציונליות
  - **אופציה 2:** למחוק ולהפנות ל-AssetLibrary
- **הערכה:** 1 יום (אופציה 1) או 1 שעה (אופציה 2)

---

## 🧩 **קומפוננטים (7)**

### **Modal.jsx** ✅
- **שימוש:** בכל הדפים
- **Props:** isOpen, onClose, title, children, size
- **סטטוס:** ✅ מושלם (28 שורות)

---

### **BulkImporter.jsx** ✅ **קומפוננט Enterprise!**
- **שימוש:** ImportPage, Leads
- **פיצ'רים:**
  - אשף 4 שלבים (Upload → Mapping → Preview → Import)
  - תומך: CSV, Excel, JSON, תמונות, PDF
  - Auto-mapping חכם
  - ולידציה
  - מעקב Progress
  - דיווח שגיאות
- **סטטוס:** ✅ מושלם! (878 שורות)
- **הערה:** ברמת Production מלאה

---

### **ExportDropdown.jsx** ✅
- **שימוש:** דפי רשימות
- **פיצ'רים:**
  - ייצוא ל-CSV
  - ייצוא ל-Excel (XML)
  - ייצוא ל-Google Sheets
  - תמיכה בעברית (BOM)
- **סטטוס:** ✅ מושלם (248 שורות)

---

### **GroupedBoard.jsx** ✅ (לא בשימוש)
- **פוטנציאל:** Kanban board
- **פיצ'רים:**
  - Drag & Drop
  - ניהול קבוצות
  - צבעים
  - קיפול
- **סטטוס:** ✅ מוכן לשימוש (383 שורות)
- **המלצה:** לשלב ב-Tasks או Leads

---

### **ViewSwitcher.jsx** ✅ (לא בשימוש מלא)
- **פיצ'רים:** החלפת תצוגות (Table, Grid, List, Kanban, Calendar, Gantt)
- **סטטוס:** ✅ מוכן לשימוש (94 שורות)
- **המלצה:** לשלב בכל דפי הרשימות

---

### **ProductConfigurator.jsx** ✅
- **שימוש:** Products page
- **פיצ'רים:** בחירת פרמטרים, חישוב מחיר
- **סטטוס:** ✅ מושלם

---

### **ProductDetailModal.jsx** ✅
- **שימוש:** Products page
- **פיצ'רים:** מידע מוצר מפורט
- **סטטוס:** ✅ כמעט מושלם
- **⚠️ TODO:** שורה 592 - צריך History API

---

## 🔥 **עדיפויות - מה לעשות קודם**

### **🔴 עדיפות גבוהה (חובה!)**

| משימה | תיאור | זמן משוער |
|-------|-------|----------|
| **1. Calendar API** | חיבור אירועים אמיתיים | 2-3 ימים |
| **2. מחיקת Debug** | למחוק כל ה-console.log | 1 שעה |
| **3. Stock Orders API** | Backend למלאי | 2-3 ימים |
| **4. Analytics API** | מטריקות אמיתיות | 3-4 ימים |

---

### **🟡 עדיפות בינונית (חשוב)**

| משימה | תיאור | זמן משוער |
|-------|-------|----------|
| **5. Asset Library Backend** | העלאת קבצים + Storage | 3-4 ימים |
| **6. Assets.jsx** | להשלים או למחוק | 1 יום / 1 שעה |
| **7. Settings API** | שמירת פרופיל + סיסמה | 1 יום |
| **8. Refactor קומפוננטים** | לפצל Leads, Workflows | 2-3 ימים |
| **9. ProductDetailModal History** | TODO בשורה 592 | 1 יום |

---

### **🟢 עדיפות נמוכה (אפשר לחכות)**

| משימה | תיאור | זמן משוער |
|-------|-------|----------|
| **10. איחוד Pipeline** | למחוק כפילות Settings/Workflows | 2 שעות |
| **11. שילוב GroupedBoard** | ב-Leads או Tasks | 1-2 ימים |
| **12. אופטימיזציה** | Code-split, Lazy load | 1 יום |

---

## 📦 **שירותי API קיימים**

| שירות | Endpoints | דפים משתמשים |
|-------|-----------|-------------|
| authService | login, register, logout, me | LoginPage |
| usersService | CRUD | UsersPage |
| departmentsService | CRUD | Departments, Tasks, Workflows |
| customersService | CRUD | Customers, Leads, Orders |
| leadsService | CRUD | Leads, Dashboard |
| productsService | CRUD | Products, Orders, StockOrders |
| ordersService | CRUD | Orders, Dashboard, Tasks |
| tasksService | CRUD | Tasks, Dashboard, Orders |
| workflowsService | CRUD | Workflows, Orders |
| workflowStepsService | CRUD + reorder | Workflows |
| parametersService | CRUD | Parameters, Products |

**Base URL:** `http://localhost:3002/api`
**Auth:** JWT Bearer token (localStorage)

---

## ❌ **שירותי API חסרים**

| שירות נדרש | לאיזה דף | Endpoints |
|-----------|---------|-----------|
| **eventsService** | CalendarPage | CRUD, getByUser |
| **assetsService** | AssetLibrary | CRUD, upload, getByCategory |
| **stockOrdersService** | StockOrders | CRUD, updateProgress |
| **analyticsService** | Analytics | getMetrics, getRevenue, getPerformance |
| **settingsService** | SettingsPage | updateProfile, changePassword |

---

## 🐛 **בעיות ידועות**

### **Debug Code**
- **console.log** ב: api.js, Orders.jsx, Leads.jsx, Workflows.jsx
- **סה"כ:** ~20+ מופעים
- **פעולה:** למחוק הכל לפני Production

### **TODO Comments**
- ProductDetailModal.jsx:592 - "// TODO: Implement history when API is ready"

### **קבצים כבדים**
- Workflows.jsx: 830 שורות
- BulkImporter.jsx: 878 שורות
- Leads.jsx: ~1600 שורות
- **המלצה:** לפצל לקומפוננטים קטנים

### **כפילויות**
- ניהול Pipeline מופיע ב-Workflows.jsx וגם ב-SettingsPage.jsx
- **פעולה:** להחליט איפה לשמור

---

## 📅 **תוכנית עבודה מומלצת**

### **שבוע 1:**
1. ✅ מחיקת כל console.log
2. ✅ Calendar API (events CRUD)
3. ✅ Stock Orders API

### **שבוע 2:**
4. ✅ Analytics API
5. ✅ Asset Library Backend
6. ✅ Settings API

### **שבוע 3:**
7. ✅ Refactor קומפוננטים גדולים
8. ✅ השלמה/מחיקה של Assets.jsx
9. ✅ Code Review

### **שבוע 4:**
10. ✅ בדיקות ותיקונים
11. ✅ תיעוד
12. ✅ אופטימיזציה

---

## 🎯 **סיכום מהיר**

✅ **מה עובד טוב:**
- 12 דפים מלאים ומחוברים ל-API
- BulkImporter ברמה גבוהה מאוד
- ארכיטקטורה עקבית
- RBAC מלא
- תמיכה רב-לשונית

❌ **מה חסר:**
- 6 דפים ללא API (Calendar, Analytics, Stock Orders, Asset Library, Settings, Assets)
- ~20 console.log לייצור
- 1 TODO בקוד
- קבצים כבדים שצריכים פיצול

🔥 **עדיפות עליונה:**
1. Calendar API
2. Stock Orders API
3. Analytics API
4. מחיקת Debug Code

---

**מסמך זה מעודכן נכון ל-29 בדצמבר 2025**
