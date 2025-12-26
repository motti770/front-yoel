# 📊 סיכום מצב הפרויקט - The Shul CRM
**תאריך עדכון:** 22 בדצמבר 2025

---

## 🎯 מטרת המערכת

מערכת CRM מלאה לניהול מפעל יודאיקה:
- **ניהול לידים ולקוחות** - מהפנייה הראשונה ועד מכירה
- **ניהול הזמנות** - עם התאמה אישית (צבעים, ציורים, הקדשות)
- **ניהול משימות** - לכל המחלקות (סקיצה, רקמה, ייצור, QA)
- **ניהול מלאי** - בדים, חומרים, ספקים (שלב 2)
- **פורטל לקוח** - לקוח רואה את סטטוס ההזמנה שלו

---

## 👥 משתמשי המערכת

| תפקיד | מחלקה | מה עושה במערכת |
|--------|--------|----------------|
| **מנהל** | הנהלה | רואה הכל, מגדיר הגדרות, בקרת איכות |
| **איש מכירות** | מכירות | מטפל בלידים, יוצר הזמנות |
| **מעצבת סקיצה** | עיצוב | יוצרת סקיצות ראשוניות |
| **מעצבת רקמה** | עיצוב | עיצוב רקמה מפורט |
| **עובד מכונה** | ייצור | הפעלת מכונות |
| **עובד ייצור** | ייצור | הרכבה ועבודה ידנית |

---

## ✅ מה קיים - Backend (API)

| Entity | API קיים | Endpoints | הערות |
|--------|---------|-----------|--------|
| **Auth** | ✅ מלא | login, register, me, Google OAuth | JWT + API Keys |
| **Users** | ✅ מלא | CRUD + roles | לפי מחלקה |
| **Customers** | ✅ מלא | CRUD + search + filter | עובד |
| **Products** | ✅ מלא | CRUD + stock + parameters | עובד |
| **Orders** | ✅ מלא | CRUD + items + status | עובד |
| **Tasks** | ✅ מלא | CRUD + assign + complete | עובד |
| **Workflows** | ✅ מלא | CRUD + steps + link to product | עובד |
| **Departments** | ✅ מלא | CRUD | עובד |
| **Parameters** | ✅ מלא | CRUD + options + assign | עובד |
| **Files** | ✅ מלא | upload + download | Supabase Storage |
| **Analytics** | ✅ חלקי | dashboard stats | עובד |
| **Leads** | ❌ **חסר!** | - | **צריך לבנות** |
| **Inventory** | ❌ חסר | - | שלב 2 |
| **Suppliers** | ❌ חסר | - | שלב 2 |
| **Notifications** | ❌ חסר | - | שלב 2 |
| **Customer Portal** | ❌ חסר | - | שלב 1/2 |

**סה"כ Backend:** ~85% מוכן לשלב 1 (חסר בעיקר Leads)

---

## ✅ מה קיים - Frontend (דפים)

| דף | קיים | מחובר ל-API | תצוגות | קבוצות | הערות |
|----|------|------------|--------|--------|--------|
| **Login** | ✅ | ✅ מלא | - | - | עובד מצוין |
| **Dashboard** | ✅ | ⚠️ חלקי | - | - | צריך התאמה לRole |
| **Customers** | ✅ | ✅ מלא | 6 סוגים | ✅ | **הכי מפותח!** |
| **Products** | ✅ | ✅ מלא | 6 סוגים | ✅ | עם פרמטרים |
| **Orders** | ✅ | ⚠️ חלקי | 6 סוגים | ❌ | צריך טופס חכם |
| **Tasks** | ✅ | ⚠️ חלקי | כרטיסים | ❌ | צריך לפי Role |
| **Leads** | ✅ | ❌ **Mock!** | Pipeline | ❌ | **ממתין ל-API** |
| **Workflows** | ✅ | ✅ מלא | - | - | עובד |
| **Parameters** | ✅ | ✅ מלא | - | - | עובד |
| **Departments** | ✅ | ✅ מלא | - | - | עובד |
| **Calendar** | ✅ | ⚠️ חלקי | לוח | - | צריך חיבור |
| **Analytics** | ✅ | ⚠️ חלקי | גרפים | - | צריך חיבור |
| **Settings** | ✅ | ⚠️ חלקי | - | - | עובד |
| **Users** | ✅ | ✅ מלא | - | - | Admin only |
| **Import** | ✅ | ⚠️ | - | - | ייבוא בצובר |

**דפים חסרים:**
| דף | נדרש לשלב | תיאור |
|----|----------|--------|
| **Customer Portal** | 1 | דף שלקוח רואה את ההזמנה שלו |
| **My Tasks** | 1 | דף משימות אישיות לעובד |
| **Order Builder** | 1 | טופס יצירת הזמנה חכם |
| **Lead Convert** | 1 | המרת ליד ללקוח+הזמנה |
| **Inventory** | 2 | ניהול מלאי |
| **Suppliers** | 2 | ניהול ספקים |
| **File Browser** | 2 | מערכת קבצים מתקדמת |
| **Reports** | 2 | דוחות מתקדמים |

**סה"כ Frontend:** ~70% מוכן לשלב 1

---

## � QA - מה באמת עובד ומה לא?

### ⚠️ חשוב להבין:
הרבה דברים **נראים** שהם עובדים, אבל **לא באמת מחוברים** לבק-אנד או שחסר בהם לוגיקה.

### 🟢 עובד באמת (מחובר ל-API):

| דף/פיצ'ר | מה עובד | נבדק? |
|----------|---------|-------|
| **Login** | התחברות עם email+password | ✅ |
| **Customers - רשימה** | טעינה, חיפוש, מחיקה | ✅ |
| **Customers - הוספה/עריכה** | יצירה ועדכון לקוח | ✅ |
| **Products - רשימה** | טעינה, חיפוש | ✅ |
| **Products - פרמטרים** | שיוך פרמטרים למוצר | ⚠️ |
| **Workflows** | CRUD + שלבים | ✅ |
| **Departments** | CRUD | ✅ |
| **Parameters** | CRUD + options | ✅ |

### 🟡 עובד חלקית (צריך בדיקה/תיקון):

| דף/פיצ'ר | מה הבעיה | מה צריך |
|----------|----------|---------|
| **Orders - יצירה** | הטופס לא מלא/חכם | לבנות Order Builder |
| **Orders - עדכון סטטוס** | לבדוק אם עובד | בדיקה |
| **Tasks - רשימה** | מציג, אבל לא ברור אם מסנן נכון | בדיקה |
| **Tasks - שיוך לעובד** | לבדוק אם עובד | בדיקה |
| **Tasks - סימון כהושלם** | לבדוק | בדיקה |
| **Dashboard - מספרים** | לא ברור אם הנתונים אמיתיים | בדיקה |
| **Calendar** | לא ברור מה מקור הנתונים | בדיקה |
| **Analytics** | לא ברור אם מחובר | בדיקה |

### 🔴 לא עובד (Mock Data / UI בלבד):

| דף/פיצ'ר | מצב | מה חסר |
|----------|-----|--------|
| **Leads - הכל** | ❌ Mock Data | צריך API בBackend |
| **Leads - Drag & Drop** | UI בלבד | לא נשמר בשרת |
| **Leads - המרה ללקוח** | ❌ לא קיים | צריך לבנות |
| **יצירת משימות אוטומטית** | ❌ לא קיים | צריך בBackend |
| **התראות** | ❌ לא קיים | צריך הכל |
| **פורטל לקוח** | ❌ לא קיים | צריך הכל |
| **מלאי** | ❌ לא קיים | שלב 2 |
| **ספקים** | ❌ לא קיים | שלב 2 |
| **מערכת קבצים חכמה** | ❌ לא קיים | שלב 1.5 |

### 📋 משימות QA לפני שממשיכים:

- [ ] לעבור על כל דף ולבדוק מה באמת עובד
- [ ] לתעד באגים
- [ ] לוודא שה-API קריאות תקינות
- [ ] לבדוק Responsive (מובייל/טאבלט)
- [ ] לבדוק RTL תקין

---

## �🔴 מה צריך לבנות - Backend

### עדיפות גבוהה (שלב 1):

#### 1. Leads API ⚠️ קריטי!
```
POST   /leads              - יצירת ליד
GET    /leads              - רשימת לידים (pagination, filter)
GET    /leads/:id          - ליד בודד
PUT    /leads/:id          - עדכון ליד
DELETE /leads/:id          - מחיקת ליד
PUT    /leads/:id/stage    - עדכון שלב (drag & drop)
POST   /leads/:id/convert  - המרה ללקוח + הזמנה
GET    /leads/pipeline     - סטטיסטיקות
```

**Entity:**
```typescript
Lead {
  id: UUID
  name: string           // שם איש קשר
  email: string
  phone: string
  company: string?       // שם בית הכנסת/ארגון
  source: enum           // WEBSITE, REFERRAL, WHATSAPP, COLD_CALL, EVENT
  stage: enum            // NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST
  estimatedValue: number
  notes: string
  nextFollowUp: DateTime
  assignedToId: UUID     // איש מכירות אחראי
  convertedToCustomerId: UUID?  // אם הומר ללקוח
  createdAt, updatedAt
}
```

#### 2. Auto-create Tasks from Workflow
כשנוצרת הזמנה → אוטומטית ליצור משימות לפי ה-Workflow של המוצר

```
POST /orders → trigger: createTasksFromWorkflow(orderId)
```

#### 3. Customer Portal Token
```
POST /customers/:id/portal-token  - יצירת לינק ייחודי
GET  /portal/:token               - גישה לפורטל (ללא login)
```

### עדיפות בינונית (שלב 2):

#### 4. Inventory APIs
```
CRUD /inventory
POST /inventory/:id/adjust
GET  /inventory/low-stock
GET  /inventory/by-parameter/:parameterId
```

#### 5. Suppliers APIs
```
CRUD /suppliers
GET  /suppliers/:id/orders
```

#### 6. Notifications APIs
```
POST /notifications
GET  /notifications/my
PUT  /notifications/:id/read
```

---

## 🔵 מה צריך לבנות - Frontend

### עדיפות גבוהה (שלב 1):

#### 1. חיבור Leads ל-API האמיתי
- **קובץ:** `src/pages/Leads.jsx`
- **מצב נוכחי:** עובד עם Mock Data
- **נדרש:** להחליף ב-API calls אמיתיים
- **זמן משוער:** 1 יום

#### 2. טופס יצירת הזמנה חכם (Order Builder)
- **מה:** טופס step-by-step
- **שלבים:**
  1. בחירת לקוח (קיים או חדש)
  2. בחירת מוצרים
  3. התאמה אישית לכל מוצר (פרמטרים)
  4. הערות והקדשות
  5. סיכום ושמירה
- **זמן משוער:** 2-3 ימים

#### 3. המרת ליד ללקוח + הזמנה
- **מה:** כפתור "המר ללקוח" בעמוד Leads
- **מה קורה:**
  1. נפתח מודל לאישור פרטים
  2. נוצר לקוח חדש
  3. אפשרות להתחיל הזמנה מיד
- **זמן משוער:** 0.5 יום

#### 4. Dashboard לפי Role
- **מנהל:** כל הסטטיסטיקות
- **עובד:** המשימות שלי + סטטוס
- **זמן משוער:** 1 יום

#### 5. דף "המשימות שלי"
- **מה:** עובד רואה רק את המשימות שלו
- **פעולות:** סמן כהתחיל / סמן כהושלם
- **זמן משוער:** 1 יום

#### 6. פורטל לקוח
- **מה:** דף ציבורי עם טוקן ייחודי
- **לקוח רואה:**
  - סטטוס הזמנה
  - שלבים שהושלמו
  - תמונות (אם הועלו)
  - אפשרות לאשר סקיצה
- **זמן משוער:** 2 ימים

### עדיפות בינונית (שלב 2):

#### 7. התראות UI
- כפתור פעמון עם counter
- Dropdown עם התראות אחרונות
- זמן: 1 יום

#### 8. ניהול מלאי (Inventory)
- עמוד חדש: רשימת פריטי מלאי
- תצוגת מלאי נמוך
- קישור לפרמטרים
- זמן: 2-3 ימים

#### 9. מערכת קבצים מתקדמת
- לצוות העיצוב
- תיקיות, תצוגה מקדימה, חיפוש
- זמן: 3-4 ימים

---

## 📋 סיכום לפי עדיפות

### 🔴 חובה לשלב 1 (MVP)

| משימה | Backend | Frontend | זמן | אחראי |
|--------|---------|----------|-----|--------|
| Leads API | ✅ צריך | - | 2 ימים | מפתח Backend |
| חיבור Leads לAPI | - | ✅ צריך | 1 יום | Frontend |
| Auto-create Tasks | ✅ צריך | - | 1 יום | מפתח Backend |
| Order Builder | - | ✅ צריך | 3 ימים | Frontend |
| Lead to Customer | ⚠️ חלקי | ✅ צריך | 1 יום | שניהם |
| Dashboard by Role | - | ✅ צריך | 1 יום | Frontend |
| My Tasks page | - | ✅ צריך | 1 יום | Frontend |
| Customer Portal | ✅ צריך | ✅ צריך | 2 ימים | שניהם |

**סה"כ שלב 1:** ~2-3 שבועות עבודה

### 🟡 חשוב לשלב 2

| משימה | Backend | Frontend |
|--------|---------|----------|
| Inventory APIs | ✅ | ✅ |
| Suppliers | ✅ | ✅ |
| Notifications | ✅ | ✅ |
| File Browser | ⚠️ | ✅ |
| WhatsApp Integration | ✅ | - |
| Reports | ⚠️ | ✅ |

**סה"כ שלב 2:** ~3-4 שבועות עבודה

---

## 🚀 איך להמשיך

### להריץ את הפרויקט:
```bash
cd "/Users/dwbqyn/Desktop/יואל כל הגרסאות עד עכשיו/יואל 21.12/front-yoel"
npm run dev
# פתח http://localhost:5173
```

### פרטי התחברות לבדיקה:
| שדה | ערך |
|-----|-----|
| Email | admin@yoel.com |
| Password | Admin1234 |
| Role | ADMIN |

### Backend API:
- **Production:** https://api.the-shul.com
- **Docs:** ראה קובץ `API-REFERENCE.md`

---

## 📁 קבצים חשובים בפרויקט

| קובץ | תיאור |
|------|--------|
| `API-REFERENCE.md` | תיעוד מלא של ה-API |
| `DESIGN-GUIDELINES.md` | הנחיות עיצוב |
| `BACKEND-REQUIREMENTS.md` | דרישות Backend שחסרות |
| `FULL-PROJECT-STATUS.md` | **הקובץ הזה** |

---

## 📞 הערות למפתח Backend

**דחוף ביותר - Leads API:**
הפרונטאנד מוכן וממתין! יש עמוד מלא עם Pipeline, אבל עובד על Mock Data.
ברגע שיהיה API - פשוט מחליפים את הקריאות.

**Entity מומלץ:**
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  source VARCHAR(50) DEFAULT 'WEBSITE',
  stage VARCHAR(50) DEFAULT 'NEW',
  estimated_value DECIMAL(10,2),
  notes TEXT,
  next_follow_up TIMESTAMP,
  assigned_to_id UUID REFERENCES users(id),
  converted_to_customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

---

## 🎨 מערכת קבצים חכמה לצוות העיצוב (חשוב מאוד!)

### הבעיה:
כל דגם/מוצר מגיע עם הרבה קבצי גרפיקה - ציורים, צבעים, תבניות.
כשמעצבת מקבלת משימה, היא צריכה:
1. לחפש את כל הקבצים הרלוונטיים
2. להוריד אותם
3. לפתוח ב-Adobe
4. בסוף - להעלות את התוצאות למקום מסודר

### הפתרון - "ערכת עבודה" אוטומטית:

```
📦 הזמנה נוצרת עם מוצר "פרוכת דגם X"
     ↓
⚡ המערכת מכינה אוטומטית "ערכת עבודה":
     ├── 📁 ציורים/      (כל הציורים של הדגם)
     ├── 📁 צבעים/       (פלטות הצבעים)
     ├── 📁 תבניות/      (קבצי AI/PSD בסיסיים)
     └── 📄 מפרט.pdf    (מידות, הערות)
     ↓
👩‍🎨 מעצבת רואה במשימה שלה:
     [📥 הורד ערכת עבודה - 15 קבצים, 45MB]
     ↓
🖥️ לחיצה אחת → ZIP יורד → פותחת ב-Adobe
     ↓
✅ מעצבת מסיימת, לוחצת "העלה עבודה מוגמרת"
     ↓
📤 הקבצים עולים ומסתדרים אוטומטית:
     └── 📁 הזמנות/ORD-123/
         ├── 📁 סקיצות/
         ├── 📁 עיצוב סופי/
         └── 📁 קבצי ייצור/
```

### מה צריך לבנות:

#### Backend:
```
POST /products/:id/assets          - העלאת קבצים לדגם
GET  /products/:id/assets          - רשימת קבצים של דגם
GET  /orders/:id/work-package      - הורדת ערכת עבודה כ-ZIP
POST /orders/:id/deliverables      - העלאת עבודה מוגמרת
```

#### בסיס נתונים:
```
ProductAsset (קובץ מקושר לדגם)
├── id
├── productId
├── type: DRAWING | COLOR_PALETTE | TEMPLATE | REFERENCE
├── fileName
├── url
├── tags: ["ציור", "אריות", "זהב"]
└── sortOrder

OrderDeliverable (תוצר של הזמנה)
├── id
├── orderId
├── taskId
├── type: SKETCH | EMBROIDERY_DESIGN | PRODUCTION_FILE | FINAL
├── fileName
├── url
├── uploadedBy
└── createdAt
```

#### Frontend:
1. **בעמוד המוצר:** אזור לניהול קבצים של הדגם
2. **במשימה:** כפתור "הורד ערכת עבודה"
3. **במשימה:** כפתור "העלה עבודה מוגמרת"
4. **בהזמנה:** גלריה של כל הקבצים שהועלו

### עדיפות: 🔴 גבוהה (שלב 1.5 - מיד אחרי MVP)

---

**עודכן לאחרונה:** 22/12/2025 00:51
