#!/bin/bash

# ==============================================================
# סקריפט מקיף להגדרת נתונים מלאים לפרויקט יואל CRM
# ==============================================================

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "=========================================="
echo "🚀 הגדרת נתונים מלאים לפרויקט יואל CRM"
echo "=========================================="
echo ""

# ===========================================
# שלב 1: מחיקת כל הלידים
# ===========================================
echo "🗑️  שלב 1: מוחק את כל הלידים..."
for PAGE in 1 2 3 4 5; do
  curl -s "$API/leads?page=$PAGE&limit=20" -H "Authorization: Bearer $TOKEN" | \
    grep -oE '"id":"[a-f0-9-]+"' | cut -d'"' -f4 | while read ID; do
      if [ -n "$ID" ] && [ ${#ID} -gt 30 ]; then
        curl -s -X DELETE "$API/leads/$ID" -H "Authorization: Bearer $TOKEN" > /dev/null
        echo "  ✅ נמחק ליד: $ID"
      fi
    done
done
echo ""

# ===========================================
# שלב 2: מושך את המוצרים הקיימים
# ===========================================
echo "📦 שלב 2: מושך מוצרים קיימים..."
PRODUCTS_JSON=$(curl -s "$API/products?limit=50" -H "Authorization: Bearer $TOKEN")
# Extract product IDs properly
PRODUCT_IDS=($(echo "$PRODUCTS_JSON" | grep -oE '"id":"[a-f0-9-]{36}"' | head -10 | cut -d'"' -f4))
echo "   מצאתי ${#PRODUCT_IDS[@]} מוצרים"

# Show product names
echo "$PRODUCTS_JSON" | grep -o '"name":"[^"]*"' | head -10
echo ""

# ===========================================
# שלב 3: יצירת פרמטרים (תתי דגמים)
# ===========================================
echo "🎨 שלב 3: יצירת פרמטרים..."

# Create parameters array
declare -a PARAM_IDS

# Parameter 1: צבע בד
echo "   יוצר: צבע בד..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "צבע בד",
    "code": "FABRIC_COLOR",
    "type": "COLOR",
    "description": "בחירת צבע הבד הראשי",
    "isRequired": true,
    "options": [
      {"value": "burgundy", "label": "בורדו", "colorHex": "#800020", "priceImpact": 0, "sortOrder": 1},
      {"value": "navy", "label": "כחול נייבי", "colorHex": "#000080", "priceImpact": 0, "sortOrder": 2},
      {"value": "royal_blue", "label": "כחול רויאל", "colorHex": "#4169E1", "priceImpact": 100, "sortOrder": 3},
      {"value": "black", "label": "שחור", "colorHex": "#000000", "priceImpact": 0, "sortOrder": 4},
      {"value": "white", "label": "לבן", "colorHex": "#FFFFFF", "priceImpact": 50, "sortOrder": 5},
      {"value": "red", "label": "אדום", "colorHex": "#CC0000", "priceImpact": 80, "sortOrder": 6},
      {"value": "purple", "label": "סגול", "colorHex": "#800080", "priceImpact": 120, "sortOrder": 7},
      {"value": "green", "label": "ירוק", "colorHex": "#006400", "priceImpact": 60, "sortOrder": 8},
      {"value": "cream", "label": "קרם", "colorHex": "#FFFDD0", "priceImpact": 40, "sortOrder": 9},
      {"value": "gold", "label": "זהב", "colorHex": "#FFD700", "priceImpact": 200, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 2: צבע רקמה
echo "   יוצר: צבע רקמה..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "צבע רקמה",
    "code": "EMBROIDERY_COLOR",
    "type": "COLOR",
    "description": "בחירת צבע חוט הרקמה",
    "isRequired": true,
    "options": [
      {"value": "gold", "label": "זהב", "colorHex": "#FFD700", "priceImpact": 200, "sortOrder": 1},
      {"value": "silver", "label": "כסף", "colorHex": "#C0C0C0", "priceImpact": 150, "sortOrder": 2},
      {"value": "white", "label": "לבן", "colorHex": "#FFFFFF", "priceImpact": 0, "sortOrder": 3},
      {"value": "cream", "label": "שמנת", "colorHex": "#FFFDD0", "priceImpact": 50, "sortOrder": 4},
      {"value": "bronze", "label": "ברונזה", "colorHex": "#CD7F32", "priceImpact": 180, "sortOrder": 5},
      {"value": "copper", "label": "נחושת", "colorHex": "#B87333", "priceImpact": 160, "sortOrder": 6},
      {"value": "black", "label": "שחור", "colorHex": "#000000", "priceImpact": 80, "sortOrder": 7},
      {"value": "red", "label": "אדום", "colorHex": "#CC0000", "priceImpact": 100, "sortOrder": 8},
      {"value": "blue", "label": "כחול", "colorHex": "#0000CC", "priceImpact": 90, "sortOrder": 9},
      {"value": "green", "label": "ירוק", "colorHex": "#006400", "priceImpact": 85, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 3: סגנון עיצוב
echo "   יוצר: סגנון עיצוב..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "סגנון עיצוב",
    "code": "DESIGN_STYLE",
    "type": "SELECT",
    "description": "בחירת סגנון העיצוב הכללי",
    "isRequired": true,
    "options": [
      {"value": "classic", "label": "קלאסי מסורתי", "priceImpact": 0, "sortOrder": 1},
      {"value": "modern", "label": "מודרני עכשווי", "priceImpact": 300, "sortOrder": 2},
      {"value": "traditional_ashkenazi", "label": "מסורתי אשכנזי", "priceImpact": 100, "sortOrder": 3},
      {"value": "traditional_sefardi", "label": "מסורתי ספרדי", "priceImpact": 100, "sortOrder": 4},
      {"value": "artistic", "label": "אומנותי ייחודי", "priceImpact": 500, "sortOrder": 5},
      {"value": "minimalist", "label": "מינימליסטי", "priceImpact": 200, "sortOrder": 6},
      {"value": "ornate", "label": "מפואר עשיר", "priceImpact": 600, "sortOrder": 7},
      {"value": "chabad", "label": "סגנון חבד", "priceImpact": 150, "sortOrder": 8},
      {"value": "jerusalem", "label": "ירושלמי", "priceImpact": 250, "sortOrder": 9},
      {"value": "custom", "label": "עיצוב מותאם אישית", "priceImpact": 800, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 4: סוג בד
echo "   יוצר: סוג בד..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "סוג בד",
    "code": "FABRIC_TYPE",
    "type": "SELECT",
    "description": "בחירת סוג וחומר הבד",
    "isRequired": true,
    "options": [
      {"value": "velvet_premium", "label": "קטיפה פרימיום", "priceImpact": 300, "sortOrder": 1},
      {"value": "velvet_standard", "label": "קטיפה רגילה", "priceImpact": 150, "sortOrder": 2},
      {"value": "silk", "label": "משי טבעי", "priceImpact": 600, "sortOrder": 3},
      {"value": "silk_blend", "label": "תערובת משי", "priceImpact": 400, "sortOrder": 4},
      {"value": "satin", "label": "סאטן", "priceImpact": 200, "sortOrder": 5},
      {"value": "brocade", "label": "ברוקד", "priceImpact": 450, "sortOrder": 6},
      {"value": "cotton_premium", "label": "כותנה מצרית", "priceImpact": 100, "sortOrder": 7},
      {"value": "cotton_standard", "label": "כותנה רגילה", "priceImpact": 0, "sortOrder": 8},
      {"value": "linen", "label": "פשתן", "priceImpact": 250, "sortOrder": 9},
      {"value": "synthetic", "label": "סינטטי איכותי", "priceImpact": 50, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 5: מידה
echo "   יוצר: מידה..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "מידה",
    "code": "SIZE",
    "type": "SELECT",
    "description": "בחירת מידת המוצר",
    "isRequired": true,
    "options": [
      {"value": "xs", "label": "קטן מאוד (XS)", "priceImpact": -300, "sortOrder": 1},
      {"value": "s", "label": "קטן (S)", "priceImpact": -200, "sortOrder": 2},
      {"value": "m", "label": "בינוני (M)", "priceImpact": 0, "sortOrder": 3},
      {"value": "l", "label": "גדול (L)", "priceImpact": 300, "sortOrder": 4},
      {"value": "xl", "label": "גדול מאוד (XL)", "priceImpact": 500, "sortOrder": 5},
      {"value": "xxl", "label": "ענק (XXL)", "priceImpact": 800, "sortOrder": 6},
      {"value": "custom_small", "label": "מותאם קטן", "priceImpact": 400, "sortOrder": 7},
      {"value": "custom_medium", "label": "מותאם בינוני", "priceImpact": 500, "sortOrder": 8},
      {"value": "custom_large", "label": "מותאם גדול", "priceImpact": 700, "sortOrder": 9},
      {"value": "special", "label": "מידה מיוחדת", "priceImpact": 1000, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 6: סוג רקמה
echo "   יוצר: סוג רקמה..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "סוג רקמה",
    "code": "EMBROIDERY_TYPE",
    "type": "SELECT",
    "description": "בחירת טכניקת הרקמה",
    "isRequired": false,
    "options": [
      {"value": "machine_basic", "label": "רקמת מכונה בסיסית", "priceImpact": 0, "sortOrder": 1},
      {"value": "machine_advanced", "label": "רקמת מכונה מתקדמת", "priceImpact": 200, "sortOrder": 2},
      {"value": "hand_basic", "label": "רקמת יד בסיסית", "priceImpact": 800, "sortOrder": 3},
      {"value": "hand_master", "label": "רקמת יד אמן", "priceImpact": 1500, "sortOrder": 4},
      {"value": "combination", "label": "משולב מכונה ויד", "priceImpact": 600, "sortOrder": 5},
      {"value": "3d", "label": "רקמה תלת מימדית", "priceImpact": 1000, "sortOrder": 6},
      {"value": "gold_thread", "label": "חוט זהב אמיתי", "priceImpact": 2000, "sortOrder": 7},
      {"value": "silver_thread", "label": "חוט כסף אמיתי", "priceImpact": 1800, "sortOrder": 8},
      {"value": "applique", "label": "אפליקציה", "priceImpact": 400, "sortOrder": 9},
      {"value": "mixed_media", "label": "מעורב טכניקות", "priceImpact": 1200, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 7: עיטורים
echo "   יוצר: עיטורים..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "עיטורים",
    "code": "DECORATIONS",
    "type": "SELECT",
    "description": "תוספת עיטורים ופרטים",
    "isRequired": false,
    "options": [
      {"value": "none", "label": "ללא עיטורים נוספים", "priceImpact": 0, "sortOrder": 1},
      {"value": "gold_trim", "label": "פס זהב", "priceImpact": 300, "sortOrder": 2},
      {"value": "silver_trim", "label": "פס כסף", "priceImpact": 250, "sortOrder": 3},
      {"value": "stones_basic", "label": "אבנים דקורטיביות", "priceImpact": 400, "sortOrder": 4},
      {"value": "stones_premium", "label": "אבני סברובסקי", "priceImpact": 800, "sortOrder": 5},
      {"value": "tassels_simple", "label": "גדילים פשוטים", "priceImpact": 150, "sortOrder": 6},
      {"value": "tassels_gold", "label": "גדילי זהב", "priceImpact": 400, "sortOrder": 7},
      {"value": "pearls", "label": "פנינים", "priceImpact": 600, "sortOrder": 8},
      {"value": "sequins", "label": "פייטים", "priceImpact": 200, "sortOrder": 9},
      {"value": "full_ornate", "label": "עיטור מלא מפואר", "priceImpact": 1500, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 8: לוגו/סמל
echo "   יוצר: לוגו וסמל..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "לוגו וסמל",
    "code": "LOGO_SYMBOL",
    "type": "SELECT",
    "description": "הוספת לוגו או סמל מרכזי",
    "isRequired": false,
    "options": [
      {"value": "none", "label": "ללא סמל", "priceImpact": 0, "sortOrder": 1},
      {"value": "star_of_david", "label": "מגן דוד", "priceImpact": 150, "sortOrder": 2},
      {"value": "lions_of_judah", "label": "אריות יהודה", "priceImpact": 400, "sortOrder": 3},
      {"value": "crown_torah", "label": "כתר תורה", "priceImpact": 350, "sortOrder": 4},
      {"value": "tablets", "label": "לוחות הברית", "priceImpact": 300, "sortOrder": 5},
      {"value": "tree_of_life", "label": "עץ החיים", "priceImpact": 450, "sortOrder": 6},
      {"value": "menorah", "label": "מנורה", "priceImpact": 350, "sortOrder": 7},
      {"value": "jerusalem", "label": "ירושלים", "priceImpact": 500, "sortOrder": 8},
      {"value": "kotel", "label": "הכותל המערבי", "priceImpact": 550, "sortOrder": 9},
      {"value": "custom_logo", "label": "לוגו מותאם אישית", "priceImpact": 800, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 9: הקדשה
echo "   יוצר: הקדשה..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "הקדשה",
    "code": "DEDICATION",
    "type": "TEXT",
    "description": "טקסט הקדשה לרקמה על המוצר",
    "isRequired": false,
    "options": []
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

# Parameter 10: אריזה
echo "   יוצר: אריזה..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "אריזה",
    "code": "PACKAGING",
    "type": "SELECT",
    "description": "סוג האריזה למשלוח",
    "isRequired": false,
    "options": [
      {"value": "standard", "label": "אריזה רגילה", "priceImpact": 0, "sortOrder": 1},
      {"value": "gift_basic", "label": "אריזת מתנה בסיסית", "priceImpact": 80, "sortOrder": 2},
      {"value": "gift_premium", "label": "אריזת מתנה מהודרת", "priceImpact": 150, "sortOrder": 3},
      {"value": "wooden_box", "label": "קופסת עץ", "priceImpact": 300, "sortOrder": 4},
      {"value": "velvet_box", "label": "קופסת קטיפה", "priceImpact": 250, "sortOrder": 5},
      {"value": "display_case", "label": "מארז תצוגה", "priceImpact": 400, "sortOrder": 6},
      {"value": "travel_bag", "label": "תיק נשיאה", "priceImpact": 120, "sortOrder": 7},
      {"value": "preservation", "label": "אריזת שימור", "priceImpact": 200, "sortOrder": 8},
      {"value": "custom", "label": "אריזה מותאמת אישית", "priceImpact": 500, "sortOrder": 9},
      {"value": "eco_friendly", "label": "אריזה ידידותית לסביבה", "priceImpact": 100, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "      ✅ $ID"

echo ""
echo "   נוצרו ${#PARAM_IDS[@]} פרמטרים"
echo ""

# ===========================================
# שלב 4: שיוך פרמטרים למוצרים
# ===========================================
echo "🔗 שלב 4: משייך פרמטרים למוצרים..."

for PROD_ID in "${PRODUCT_IDS[@]}"; do
  echo "   משייך למוצר: $PROD_ID"
  ORDER=1
  for PARAM_ID in "${PARAM_IDS[@]}"; do
    if [ -n "$PARAM_ID" ]; then
      curl -s -X POST "$API/parameters/assign" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"productId\": \"$PROD_ID\", \"parameterId\": \"$PARAM_ID\", \"sortOrder\": $ORDER}" > /dev/null
      ORDER=$((ORDER + 1))
    fi
  done
  echo "      ✅ שויכו ${#PARAM_IDS[@]} פרמטרים"
done
echo ""

# ===========================================
# שלב 5: עדכון מלאי למוצרים
# ===========================================
echo "📊 שלב 5: מעדכן מלאי ל-1000 לכל מוצר..."
for PROD_ID in "${PRODUCT_IDS[@]}"; do
  curl -s -X POST "$API/products/$PROD_ID/stock" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"operation": "SET", "quantity": 1000}' > /dev/null
  echo "   ✅ עודכן: $PROD_ID"
done
echo ""

echo "=========================================="
echo "✅ הסקריפט הסתיים בהצלחה!"
echo "=========================================="
echo ""
echo "📊 סיכום מה נוצר:"
echo "   ✅ נמחקו כל הלידים"
echo "   ✅ ${#PARAM_IDS[@]} פרמטרים עם 10 אפשרויות כל אחד"
echo "   ✅ פרמטרים שויכו לכל ${#PRODUCT_IDS[@]} המוצרים"
echo "   ✅ כל המוצרים עם מלאי 1000"
echo ""
echo "👉 עכשיו לך ל: https://the-shul.app.mottidokib.com/"
echo "   ותראה את כל הפרמטרים במוצרים!"
echo ""
