# דרישות Backend - ספריית איורים (Asset Library)

## סקירה כללית

ספריית האיורים היא מודול לניהול ציורים, לוגואים ותבניות שמשמשים לעיצוב מוצרי הרקמה.

## מודל הנתונים

### טבלה: assets

- id (UUID)
- name (VARCHAR 255)
- description (TEXT)
- category (ENUM: ציורים, לוגואים, תבניות, סמלים, מסגרות)
- imageUrl (VARCHAR 500)
- thumbnailUrl (VARCHAR 500)
- fileSize (INTEGER)
- mimeType (VARCHAR 50)
- isActive (BOOLEAN)
- usageCount (INTEGER)
- createdById (UUID FK)
- createdAt, updatedAt (TIMESTAMP)

### טבלה: asset_tags

- id, assetId, tag
- UNIQUE (assetId, tag)

## API Endpoints

### GET /assets
סינון: category, search, tags, isActive
מיון: name, createdAt, usageCount

### POST /assets
העלאת תמונה + metadata
יצירת thumbnail אוטומטית

### PUT /assets/:id
עדכון שם, תיאור, קטגוריה, תגיות

### DELETE /assets/:id
מחיקה מ-Storage + DB

### GET /assets/tags
רשימת תגיות פופולריות

### GET /assets/categories
רשימת קטגוריות + ספירה

## Storage (Supabase)
Bucket: assets
Max size: 10MB
Types: PNG, JPG, SVG, WEBP

*מסמך זה נוצר ב: 2025-12-29*
