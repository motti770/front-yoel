# 🚨 דוח בעיות קריטיות - Backend Down!

**תאריך:** 29 בדצמבר 2025, 12:50
**חומרה:** 🔴 **קריטי מאוד!**

---

## סיכום מהיר

**כמעט כל ה-Backend לא עובד!**
רק endpoint אחד עובד (`/auth/me`), כל השאר מחזירים 500 Error.

---

## 📊 ממצאים - מה עובד ומה לא

### ✅ עובד (רק 1!):
| Endpoint | Status | תיאור |
|----------|--------|-------|
| `GET /auth/me` | ✅ 200 OK | בדיקת משתמש מחובר |

### ❌ לא עובד (כולם!):

| Endpoint | Status | נבדק בדף |
|----------|--------|----------|
| `GET /leads` | ❌ 500 | Leads |
| `GET /customers` | ❌ 500 | Customers |
| `GET /products` | ❌ 500 | Products |
| `GET /workflows/active` | ❌ 500 | Products, Workflows |
| `GET /analytics/dashboard` | ❌ 500 | Dashboard |
| `GET /analytics/revenue-trends` | ❌ 500 | Dashboard |
| `GET /analytics/tasks` | ❌ 500 | Dashboard |
| `GET /tasks` | ❌ 500 | Dashboard |

---

## 🔍 פרטים טכניים

### בדיקה 1: Customers
```
Request: GET https://crm-api.app.mottidokib.com/customers?page=1&limit=100
Response: 500 Internal Server Error

Error in console:
Failed to load resource: the server responded with a status of 500
```

### בדיקה 2: Products
```
Request: GET https://crm-api.app.mottidokib.com/products?page=1&limit=100
Response: 500 Internal Server Error

Request: GET https://crm-api.app.mottidokib.com/workflows/active
Response: 500 Internal Server Error
```

### בדיקה 3: Dashboard
```
Request: GET https://crm-api.app.mottidokib.com/analytics/dashboard
Response: 500 Internal Server Error

Request: GET https://crm-api.app.mottidokib.com/analytics/revenue-trends
Response: 500 Internal Server Error

Request: GET https://crm-api.app.mottidokib.com/analytics/tasks
Response: 500 Internal Server Error

Request: GET https://crm-api.app.mottidokib.com/tasks?page=1&limit=5&status=PENDING
Response: 500 Internal Server Error
```

---

## 💡 סיבות אפשריות

### 1. בסיס הנתונים Down 🔴
**סבירות: גבוהה מאוד**

הסימנים:
- רק `/auth/me` עובד (לא צריך DB query מורכב)
- כל שאר ה-endpoints (שצריכים DB) מחזירים 500

**איך לבדוק:**
```bash
# התחבר לשרת
ssh user@crm-api.app.mottidokib.com

# בדוק logs
pm2 logs backend
# או
docker logs crm-backend

# בדוק חיבור ל-PostgreSQL
psql -U postgres -h localhost -d crm_db
```

---

### 2. Migration לא רץ / טבלאות לא קיימות 🔴
**סבירות: בינונית**

אולי:
- Migrations לא רצו
- טבלאות נמחקו בטעות
- שינוי שם database

**איך לתקן:**
```bash
# רוץ migrations
npm run db:migrate
# או
npx prisma migrate deploy

# בדוק טבלאות
psql -U postgres -d crm_db -c "\dt"
```

---

### 3. שגיאה בקוד Backend (לא סביר) 🟡
**סבירות: נמוכה**

אם היתה שגיאה בקוד, כנראה רק endpoint אחד היה נופל, לא כולם.

---

### 4. Connection String שגוי / Credentials 🔴
**סבירות: בינונית-גבוהה**

בדוק ב-`.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

### 5. השרת Down לחלוטין? ❌
**לא!** - `/auth/me` עובד, אז השרת רץ.

---

## ⚡ מה לעשות עכשיו - פעולות מיידיות

### צעד 1: בדוק Backend Logs 🔍

```bash
# אם זה PM2:
pm2 logs backend

# אם זה Docker:
docker logs crm-backend

# אם זה systemd:
journalctl -u crm-backend -f
```

**חפש שגיאות כמו:**
- `Connection refused`
- `ECONNREFUSED`
- `Database not found`
- `relation "customers" does not exist`

---

### צעד 2: בדוק חיבור לDatabase 🗄️

```bash
# נסה להתחבר ישירות
psql -U postgres -h localhost -d crm_db

# אם עובד, בדוק טבלאות:
\dt

# בדוק אם יש טבלת customers:
SELECT * FROM customers LIMIT 1;
```

---

### צעד 3: בדוק .env קובץ ⚙️

```bash
# הצג משתני סביבה
cat /path/to/backend/.env

# וודא ש:
DATABASE_URL=postgresql://...  # נכון
NODE_ENV=production
PORT=3000
```

---

### צעד 4: נסה Restart 🔄

```bash
# PM2:
pm2 restart backend

# Docker:
docker restart crm-backend

# Systemd:
sudo systemctl restart crm-backend
```

---

### צעד 5: אם כלום לא עוזר - רוץ Migrations 🔧

```bash
cd /path/to/backend

# Prisma:
npx prisma migrate deploy
npx prisma generate

# או אם יש npm script:
npm run db:migrate
```

---

## 📞 מה אני ממליץ

### דחיפות ראשונה:
1. **בדוק logs** - תראה בדיוק מה השגיאה
2. **בדוק DB connection** - זה הסיבה הכי סבירה
3. **בדוק שהטבלאות קיימות**

### אם אתה צריך עזרה:
אני יכול לעזור לך:
- לקרוא logs
- לכתוב migration scripts
- לתקן את ה-database schema

---

## 🎯 סטטוס Frontend

ה-**Frontend תקין לחלוטין!** ✅

הבעיה היא **רק ב-Backend**.

כל הדפים נראים טוב, הקוד תקין, הבקשות נשלחות נכון.
הבעיה היא שהשרת לא עונה.

---

## 📋 צעדים הבאים

1. ✅ Frontend - מוכן ופועל
2. 🔴 Backend - **דורש תיקון מיידי**
3. ⏸️ בדיקת תהליכים - ממתין לתיקון Backend

**אחרי שה-Backend יעבוד, אני אמשיך לבדוק:**
- Products ← Parameters
- Workflows ← Steps
- Orders ← Customers + Products
- Tasks ← Auto-creation

---

**נוצר על ידי: Claude Code**
**תאריך: 29/12/2025 12:50**
