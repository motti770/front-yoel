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

### 6. 🎯 Leads (לידים ומכירות)

**תיאור:**
ניהול לידים ומכירות בסגנון Sales Pipeline.
ליד הוא לקוח פוטנציאלי שעובר שלבים עד להפיכתו ללקוח.
כולל מעקב אחרי מקור הליד, שלב במשפך המכירות, וערך משוער.

**Entity:**
```
Lead (ליד):
├── id: UUID
├── name: string (שם איש קשר)
├── email: string
├── phone: string?
├── company: string? (שם החברה/ארגון)
├── source: enum (WEBSITE, REFERRAL, COLD_CALL, SOCIAL, EVENT, OTHER)
├── stage: enum (NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST)
├── estimatedValue: number? (ערך משוער בש"ח)
├── notes: string?
├── nextFollowUp: DateTime? (תאריך מעקב הבא)
├── lastContact: DateTime? (תאריך קשר אחרון)
├── assignedToId: UUID? (FK -> User) - אחראי על הליד
├── convertedToCustomerId: UUID? (FK -> Customer) - אם הומר ללקוח
├── isActive: boolean
├── createdAt: DateTime
├── updatedAt: DateTime
```

**API Endpoints נדרשים:**
```
GET    /leads                    - רשימת לידים (pagination, search, filter by stage/source)
GET    /leads/:id                - ליד בודד
POST   /leads                    - יצירת ליד
PUT    /leads/:id                - עדכון ליד (כולל שינוי שלב)
DELETE /leads/:id                - מחיקת ליד
PUT    /leads/:id/stage          - עדכון שלב בלבד (לדרג אנד דרופ)
POST   /leads/:id/convert        - המרת ליד ללקוח (יוצר Customer חדש)
GET    /leads/pipeline           - סטטיסטיקות Pipeline (כמות לפי שלב, סכומים)
```

**לוגיקה חשובה:**
- כאשר ליד מסומן כ-WON, יש לאפשר המרה אוטומטית ללקוח חדש
- שמירת היסטוריית שינויים בשלבים (אופציונלי)
- התראות על לידים שעבר זמן ה-followUp שלהם

**UI קיים:**
- עמוד Leads מלא עם Pipeline View (Kanban style)
- דראג אנד דרופ בין שלבים
- טפסי הוספה/עריכה/מחיקה
- ייבוא בצובר (Bulk Import)
- מטריקות: סה"כ לידים, ערך פוטנציאלי, שיעור המרה

**הערה:** כרגע ה-Frontend משתמש ב-Mock Data כי ה-API לא קיים!

**עדיפות:** גבוהה
**סטטוס:** ממתין - UI מוכן, ממתין ל-API

---

### 7. 📁 Advanced File Browser (מערכת קבצים מתקדמת)

**תיאור:**
מערכת ניהול קבצים מתקדמת בסגנון תיקייה במחשב.
אנשי הצוות (מעצבים, בעלי מלאכה) צריכים גישה מהירה לכל הנכסים הדיגיטליים:
בדים, דוגמאות, תבניות, קבצי Adobe, ועוד.

**למה זה חשוב:**
- המעצבת צריכה לראות **תצוגה מקדימה (Thumbnail)** לפני שהיא פותחת קובץ
- צריך להיות **מהיר ונוח** להעלות קבצים ולפתוח באילוסטרייטור/פוטושופ
- הנכסים צריכים להיות **מסודרים לפי קטגוריות** (בדים, עיצובים, תבניות)
- התחושה צריכה להיות כמו **תיקייה במחשב**, לא כמו "מערכת העלאת קבצים"

**דרישות UI:**

```
┌────────────────────────────────────────────────────────────────┐
│ 📁 מנהל הקבצים                                                 │
├────────────────────────────────────────────────────────────────┤
│ [← חזרה] [📁 בדים] > [📁 משי] > [📁 דוגמאות]                    │
├───────────────┬────────────────────────────────────────────────┤
│               │                                                │
│  📁 בדים      │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  📁 עיצובים   │  │thumb│ │thumb│ │thumb│ │thumb│              │
│  📁 תבניות    │  │ .ai │ │ .ai │ │ .psd│ │ .jpg│              │
│  📁 לוגואים   │  └─────┘ └─────┘ └─────┘ └─────┘              │
│  📁 מוצרים    │  fabric1  fabric2  design1  preview           │
│               │                                                │
│  ───────────  │  ┌─────┐ ┌─────┐ ┌─────┐                      │
│  📁 אחרונים   │  │thumb│ │thumb│ │thumb│                      │
│  ⭐ מועדפים  │  │ .eps│ │ .ai │ │ .pdf│                      │
│               │  └─────┘ └─────┘ └─────┘                      │
│               │  logo1    template  spec                       │
└───────────────┴────────────────────────────────────────────────┘
```

**Entities נדרשים:**

```
FileFolder (תיקייה):
├── id: UUID
├── name: string
├── parentFolderId: UUID? (null = root)
├── path: string (e.g., "/בדים/משי/דוגמאות")
├── icon: string? (אייקון מותאם)
├── color: string? (צבע מותאם)
├── sortOrder: number
├── createdBy: UUID (User)
├── createdAt: DateTime
├── updatedAt: DateTime

ProductFile (קובץ - הרחבה של File קיים):
├── id: UUID
├── folderId: UUID (FK -> FileFolder)
├── name: string
├── originalName: string
├── mimeType: string
├── size: number (bytes)
├── url: string (S3/cloud URL)
├── thumbnailUrl: string? (generated preview)
├── metadata: JSON {
│     width?: number,
│     height?: number,
│     colorSpace?: string,
│     dpi?: number,
│     layers?: string[],
│     usedFonts?: string[]
│   }
├── tags: string[]
├── favorited: boolean
├── viewCount: number
├── lastViewedAt: DateTime?
├── productId: UUID? (FK -> Product, if linked)
├── createdBy: UUID
├── createdAt: DateTime
├── updatedAt: DateTime
```

**API Endpoints נדרשים:**

```
Folders:
GET    /file-browser/folders           - כל התיקיות (tree structure)
GET    /file-browser/folders/:id       - תיקייה עם תוכן
POST   /file-browser/folders           - יצירת תיקייה
PUT    /file-browser/folders/:id       - עדכון (שם, צבע, מיקום)
DELETE /file-browser/folders/:id       - מחיקת תיקייה (recursive?)
POST   /file-browser/folders/:id/move  - העברת תיקייה

Files:
GET    /file-browser/files             - קבצים (pagination, filter by folder)
GET    /file-browser/files/:id         - פרטי קובץ
POST   /file-browser/files/upload      - העלאת קובץ (כולל folder)
PUT    /file-browser/files/:id         - עדכון metadata
DELETE /file-browser/files/:id         - מחיקת קובץ
POST   /file-browser/files/:id/move    - העברת קובץ לתיקייה אחרת
POST   /file-browser/files/:id/copy    - העתקת קובץ
GET    /file-browser/files/:id/download - הורדת קובץ
POST   /file-browser/files/:id/favorite - הוספה למועדפים

Search & Filters:
GET    /file-browser/search            - חיפוש קבצים (שם, תגיות, סוג)
GET    /file-browser/recent            - קבצים אחרונים
GET    /file-browser/favorites         - מועדפים
GET    /file-browser/by-type/:type     - קבצים לפי סוג (ai, psd, jpg...)

Thumbnail Generation:
POST   /file-browser/files/:id/generate-thumbnail - יצירת thumbnail
```

**תכונות UI נדרשות:**

| תכונה | תיאור | עדיפות |
|-------|--------|---------|
| **Thumbnails** | תצוגה מקדימה לכל קובץ (גם AI, PSD) | גבוהה |
| **Tree Navigation** | עץ תיקיות בצד שמאל | גבוהה |
| **Breadcrumbs** | נתיב נוכחי למעלה | גבוהה |
| **Grid/List View** | מעבר בין תצוגות | גבוהה |
| **Drag & Drop Upload** | גרירת קבצים מהמחשב | גבוהה |
| **Drag & Drop Organize** | גרירה בין תיקיות | גבוהה |
| **Quick Preview** | לחיצה כפולה = תצוגה מקדימה גדולה | בינונית |
| **Open in App** | פתיחה ישירה באילוסטרייטור | בינונית |
| **Multi-select** | בחירת מספר קבצים | בינונית |
| **Context Menu** | קליק ימני עם אפשרויות | בינונית |
| **Search** | חיפוש מהיר בשם/תגיות | גבוהה |
| **Tags** | הוספת תגיות לקבצים | בינונית |
| **Favorites** | סימון כמועדף | בינונית |
| **Recent Files** | קבצים אחרונים שנצפו | בינונית |

**טכנולוגיות מומלצות:**
- **Thumbnail Generation**: Sharp (Node.js) או Cloudinary
- **Adobe Files Preview**: Adobe Creative SDK או שירות חיצוני
- **Storage**: S3 / Cloudflare R2 / Supabase Storage
- **Drag & Drop**: react-dnd או react-dropzone

**עדיפות:** גבוהה מאוד (קריטי לצוות העיצוב!)
**סטטוס:** ממתין - לא התחיל

---

## 📊 סיכום עדיפויות

| פיצ'ר | עדיפות | מורכבות | הערות |
|-------|--------|---------|-------|
| Companies & Contacts | גבוהה | גבוהה | דרוש לניהול לקוחות נכון |
| **Advanced File Browser** | **גבוהה מאוד** | גבוהה | קריטי לצוות העיצוב! |
| Leads API | גבוהה | בינונית | UI מלא קיים, ממתין ל-API |
| Sub-Products | בינונית | בינונית | UI קיים, ממתין ל-API |
| Groups API | בינונית | בינונית | כרגע עובד עם localStorage |
| Product History | נמוכה | נמוכה | Nice to have |
| Primary Image | נמוכה | נמוכה | Nice to have |

---

## 🔄 עדכונים

**14/12/2025:**
- נוסף: Advanced File Browser requirement (מערכת קבצים בסגנון תיקייה במחשב)
- נוסף: Leads API requirement (עמוד UI מלא קיים עם Pipeline)

**13/12/2025:**
- נוסף: Companies & Contacts requirement
- נוסף: Sub-Products requirement
- נוסף: Product History requirement
- נוסף: Groups API requirement
- נוסף: Primary Image requirement
