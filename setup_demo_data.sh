#!/bin/bash

# Token for API access
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "=========================================="
echo "🚀 יצירת נתוני דמו לפרויקט יואל CRM"
echo "=========================================="
echo ""

# Arrays to store IDs
declare -a PRODUCT_IDS
declare -a CUSTOMER_IDS
declare -a PARAMETER_IDS

# -------------------------------------------
# STEP 1: Create 5 Products
# -------------------------------------------
echo "📦 שלב 1: יצירת 5 מוצרים..."
echo ""

PRODUCTS=(
  '{"name": "כיסוי ספר תורה", "sku": "TORAH-COVER-001", "description": "כיסוי מפואר לספר תורה הכולל רקמה אומנותית, אפשרות לגרטל, ועיטורים מזהב", "category": "ספרי תורה", "price": 4500, "isActive": true}'
  '{"name": "גרטל לספר תורה", "sku": "GARTEL-001", "description": "גרטל איכותי לספר תורה, רקמה עם שם התורם והקדשה", "category": "ספרי תורה", "price": 800, "isActive": true}'
  '{"name": "פרוכת לארון קודש", "sku": "PAROCHET-001", "description": "פרוכת מהודרת לארון הקודש עם עיטורי זהב ורקמה אומנותית", "category": "ריהוט בית כנסת", "price": 12000, "isActive": true}'
  '{"name": "כיסוי בימה ועמוד", "sku": "BIMA-COVER-001", "description": "כיסוי לבימה ועמוד חזן, תואם לפרוכת, רקמה מותאמת אישית", "category": "ריהוט בית כנסת", "price": 5500, "isActive": true}'
  '{"name": "תיק טלית ותפילין", "sku": "TALIT-BAG-001", "description": "תיק איכותי לטלית ותפילין עם רקמת שם ועיטורים", "category": "תשמישי קדושה", "price": 450, "isActive": true}'
)

for i in "${!PRODUCTS[@]}"; do
  echo "  יוצר מוצר $((i+1))..."
  RESPONSE=$(curl -s -X POST "$API/products" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "${PRODUCTS[$i]}")
  PROD_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -n "$PROD_ID" ]; then
    PRODUCT_IDS+=("$PROD_ID")
    echo "    ✅ ID: $PROD_ID"
  else
    echo "    ❌ שגיאה: $RESPONSE"
  fi
done

echo ""
echo "מוצרים שנוצרו: ${#PRODUCT_IDS[@]}"
echo ""

# -------------------------------------------
# STEP 2: Create Parameters (תתי דגמים)
# -------------------------------------------
echo "🎨 שלב 2: יצירת 10 פרמטרים (תתי דגמים)..."
echo ""

# Parameter 1: צבע בד
echo "  יוצר פרמטר: צבע בד..."
PARAM1=$(curl -s -X POST "$API/parameters" \
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
      {"value": "white", "label": "לבן", "colorHex": "#FFFFFF", "priceImpact": 50, "sortOrder": 5}
    ]
  }')
PARAM1_ID=$(echo "$PARAM1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM1_ID")
echo "    ✅ צבע בד: $PARAM1_ID"

# Parameter 2: צבע רקמה
echo "  יוצר פרמטר: צבע רקמה..."
PARAM2=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "צבע רקמה",
    "code": "EMBROIDERY_COLOR",
    "type": "COLOR",
    "description": "בחירת צבע הרקמה",
    "isRequired": true,
    "options": [
      {"value": "gold", "label": "זהב", "colorHex": "#FFD700", "priceImpact": 200, "sortOrder": 1},
      {"value": "silver", "label": "כסף", "colorHex": "#C0C0C0", "priceImpact": 150, "sortOrder": 2},
      {"value": "white", "label": "לבן", "colorHex": "#FFFFFF", "priceImpact": 0, "sortOrder": 3},
      {"value": "cream", "label": "שמנת", "colorHex": "#FFFDD0", "priceImpact": 50, "sortOrder": 4}
    ]
  }')
PARAM2_ID=$(echo "$PARAM2" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM2_ID")
echo "    ✅ צבע רקמה: $PARAM2_ID"

# Parameter 3: סגנון עיצוב
echo "  יוצר פרמטר: סגנון עיצוב..."
PARAM3=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "סגנון עיצוב",
    "code": "DESIGN_STYLE",
    "type": "SELECT",
    "description": "בחירת סגנון העיצוב הכללי",
    "isRequired": true,
    "options": [
      {"value": "classic", "label": "קלאסי", "priceImpact": 0, "sortOrder": 1},
      {"value": "modern", "label": "מודרני", "priceImpact": 300, "sortOrder": 2},
      {"value": "traditional", "label": "מסורתי", "priceImpact": 0, "sortOrder": 3},
      {"value": "artistic", "label": "אומנותי", "priceImpact": 500, "sortOrder": 4},
      {"value": "minimalist", "label": "מינימליסטי", "priceImpact": 200, "sortOrder": 5}
    ]
  }')
PARAM3_ID=$(echo "$PARAM3" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM3_ID")
echo "    ✅ סגנון עיצוב: $PARAM3_ID"

# Parameter 4: סוג בד
echo "  יוצר פרמטר: סוג בד..."
PARAM4=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "סוג בד",
    "code": "FABRIC_TYPE",
    "type": "SELECT",
    "description": "בחירת סוג הבד",
    "isRequired": true,
    "options": [
      {"value": "velvet", "label": "קטיפה", "priceImpact": 150, "sortOrder": 1},
      {"value": "silk", "label": "משי", "priceImpact": 400, "sortOrder": 2},
      {"value": "satin", "label": "סאטן", "priceImpact": 200, "sortOrder": 3},
      {"value": "cotton", "label": "כותנה", "priceImpact": 0, "sortOrder": 4}
    ]
  }')
PARAM4_ID=$(echo "$PARAM4" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM4_ID")
echo "    ✅ סוג בד: $PARAM4_ID"

# Parameter 5: מידה
echo "  יוצר פרמטר: מידה..."
PARAM5=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "מידה",
    "code": "SIZE",
    "type": "SELECT",
    "description": "בחירת מידת המוצר",
    "isRequired": true,
    "options": [
      {"value": "small", "label": "קטן", "priceImpact": -200, "sortOrder": 1},
      {"value": "medium", "label": "בינוני", "priceImpact": 0, "sortOrder": 2},
      {"value": "large", "label": "גדול", "priceImpact": 300, "sortOrder": 3},
      {"value": "custom", "label": "מותאם אישית", "priceImpact": 500, "sortOrder": 4}
    ]
  }')
PARAM5_ID=$(echo "$PARAM5" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM5_ID")
echo "    ✅ מידה: $PARAM5_ID"

# Parameter 6: סוג רקמה
echo "  יוצר פרמטר: סוג רקמה..."
PARAM6=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "סוג רקמה",
    "code": "EMBROIDERY_TYPE",
    "type": "SELECT",
    "description": "בחירת סוג הרקמה",
    "isRequired": false,
    "options": [
      {"value": "machine", "label": "רקמת מכונה", "priceImpact": 0, "sortOrder": 1},
      {"value": "hand", "label": "רקמת יד", "priceImpact": 1500, "sortOrder": 2},
      {"value": "combination", "label": "משולב", "priceImpact": 800, "sortOrder": 3}
    ]
  }')
PARAM6_ID=$(echo "$PARAM6" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM6_ID")
echo "    ✅ סוג רקמה: $PARAM6_ID"

# Parameter 7: עיטורים
echo "  יוצר פרמטר: עיטורים..."
PARAM7=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "עיטורים",
    "code": "DECORATIONS",
    "type": "SELECT",
    "description": "תוספת עיטורים למוצר",
    "isRequired": false,
    "options": [
      {"value": "none", "label": "ללא", "priceImpact": 0, "sortOrder": 1},
      {"value": "gold_trim", "label": "פס זהב", "priceImpact": 300, "sortOrder": 2},
      {"value": "silver_trim", "label": "פס כסף", "priceImpact": 250, "sortOrder": 3},
      {"value": "stones", "label": "אבנים", "priceImpact": 600, "sortOrder": 4},
      {"value": "tassels", "label": "גדילים", "priceImpact": 200, "sortOrder": 5}
    ]
  }')
PARAM7_ID=$(echo "$PARAM7" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM7_ID")
echo "    ✅ עיטורים: $PARAM7_ID"

# Parameter 8: הקדשה
echo "  יוצר פרמטר: הקדשה..."
PARAM8=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "הקדשה",
    "code": "DEDICATION",
    "type": "TEXT",
    "description": "טקסט הקדשה לרקמה",
    "isRequired": false,
    "options": []
  }')
PARAM8_ID=$(echo "$PARAM8" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM8_ID")
echo "    ✅ הקדשה: $PARAM8_ID"

# Parameter 9: לוגו/סמל
echo "  יוצר פרמטר: לוגו/סמל..."
PARAM9=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "לוגו/סמל",
    "code": "LOGO",
    "type": "SELECT",
    "description": "הוספת לוגו או סמל",
    "isRequired": false,
    "options": [
      {"value": "none", "label": "ללא", "priceImpact": 0, "sortOrder": 1},
      {"value": "star_of_david", "label": "מגן דוד", "priceImpact": 150, "sortOrder": 2},
      {"value": "lions", "label": "אריות", "priceImpact": 400, "sortOrder": 3},
      {"value": "crown", "label": "כתר", "priceImpact": 300, "sortOrder": 4},
      {"value": "tablets", "label": "לוחות הברית", "priceImpact": 350, "sortOrder": 5},
      {"value": "custom", "label": "לוגו מותאם אישית", "priceImpact": 800, "sortOrder": 6}
    ]
  }')
PARAM9_ID=$(echo "$PARAM9" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM9_ID")
echo "    ✅ לוגו/סמל: $PARAM9_ID"

# Parameter 10: אריזה
echo "  יוצר פרמטר: אריזה..."
PARAM10=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "אריזה",
    "code": "PACKAGING",
    "type": "SELECT",
    "description": "סוג האריזה",
    "isRequired": false,
    "options": [
      {"value": "standard", "label": "רגילה", "priceImpact": 0, "sortOrder": 1},
      {"value": "gift", "label": "אריזת מתנה", "priceImpact": 100, "sortOrder": 2},
      {"value": "luxury", "label": "אריזת פרימיום", "priceImpact": 300, "sortOrder": 3}
    ]
  }')
PARAM10_ID=$(echo "$PARAM10" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PARAMETER_IDS+=("$PARAM10_ID")
echo "    ✅ אריזה: $PARAM10_ID"

echo ""
echo "פרמטרים שנוצרו: ${#PARAMETER_IDS[@]}"
echo ""

# -------------------------------------------
# STEP 3: Create Customers
# -------------------------------------------
echo "👥 שלב 3: יצירת 15 לקוחות..."
echo ""

CUSTOMERS=(
  '{"name": "בית הכנסת הגדול תל אביב", "email": "shul.telaviv@example.com", "phone": "03-1234567", "companyName": "עמותת בית הכנסת הגדול", "status": "ACTIVE"}'
  '{"name": "קהילת אור חדש ירושלים", "email": "orchadash@example.com", "phone": "02-9876543", "companyName": "קהילת אור חדש", "status": "ACTIVE"}'
  '{"name": "בית מדרש חסידי חב\"ד", "email": "chabad.shul@example.com", "phone": "03-5551234", "companyName": "בית חב\"ד המרכזי", "status": "ACTIVE"}'
  '{"name": "בית הכנסת הספרדי", "email": "sefardi.shul@example.com", "phone": "08-7654321", "companyName": "עמותת בית הכנסת הספרדי", "status": "ACTIVE"}'
  '{"name": "ישיבת מרכז הרב", "email": "merkaz.harav@example.com", "phone": "02-1112233", "companyName": "ישיבת מרכז הרב קוק", "status": "ACTIVE"}'
  '{"name": "משה כהן", "email": "moshe.cohen@example.com", "phone": "050-1234567", "companyName": "", "status": "ACTIVE"}'
  '{"name": "דוד לוי", "email": "david.levi@example.com", "phone": "052-9876543", "companyName": "", "status": "ACTIVE"}'
  '{"name": "יעקב ישראלי", "email": "yaakov.israeli@example.com", "phone": "054-5551234", "companyName": "", "status": "ACTIVE"}'
  '{"name": "אברהם גולדשטיין", "email": "avraham.gold@example.com", "phone": "058-7654321", "companyName": "חברת גולדשטיין ובניו", "status": "ACTIVE"}'
  '{"name": "שמעון פרידמן", "email": "shimon.friedman@example.com", "phone": "053-1112233", "companyName": "", "status": "ACTIVE"}'
  '{"name": "בית הכנסת ברכת אברהם", "email": "birkat.avraham@example.com", "phone": "04-3334455", "companyName": "עמותת ברכת אברהם", "status": "ACTIVE"}'
  '{"name": "בית הכנסת אהל יצחק", "email": "ohel.yitzchak@example.com", "phone": "03-6667788", "companyName": "עמותת אהל יצחק", "status": "ACTIVE"}'
  '{"name": "בית הכנסת שערי ציון", "email": "shaarei.tzion@example.com", "phone": "02-9990011", "companyName": "עמותת שערי ציון", "status": "ACTIVE"}'
  '{"name": "ישראל שפירא", "email": "israel.shapira@example.com", "phone": "050-8889999", "companyName": "", "status": "ACTIVE"}'
  '{"name": "בית הכנסת בית יעקב", "email": "beit.yaakov@example.com", "phone": "09-2223344", "companyName": "עמותת בית יעקב", "status": "ACTIVE"}'
)

for i in "${!CUSTOMERS[@]}"; do
  echo "  יוצר לקוח $((i+1))..."
  RESPONSE=$(curl -s -X POST "$API/customers" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "${CUSTOMERS[$i]}")
  CUST_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -n "$CUST_ID" ]; then
    CUSTOMER_IDS+=("$CUST_ID")
    echo "    ✅ ID: $CUST_ID"
  else
    echo "    ❌ שגיאה: $RESPONSE"
  fi
done

echo ""
echo "לקוחות שנוצרו: ${#CUSTOMER_IDS[@]}"
echo ""

# -------------------------------------------
# STEP 4: Create 50 Completed Orders
# -------------------------------------------
echo "📋 שלב 4: יצירת 50 הזמנות שהושלמו..."
echo ""

# Random Hebrew notes for orders
NOTES=(
  "הזמנה לרגל בר מצווה"
  "לעילוי נשמת האב ז\"ל"
  "מתנה לבית הכנסת החדש"
  "לכבוד הכנסת ספר תורה"
  "הזמנה לרגל חנוכת בית"
  "תרומה לבית הכנסת"
  "לזכרון עולם"
  "מתנת חתונה"
  "לרגל יום השנה לפטירה"
  "הזמנה דחופה לחג"
)

# Generate 50 orders
for ORDER_NUM in $(seq 1 50); do
  echo "  יוצר הזמנה $ORDER_NUM/50..."
  
  # Random customer (cycle through them)
  CUST_INDEX=$((($ORDER_NUM - 1) % ${#CUSTOMER_IDS[@]}))
  CUSTOMER_ID="${CUSTOMER_IDS[$CUST_INDEX]}"
  
  # Random product
  PROD_INDEX=$((($ORDER_NUM - 1) % ${#PRODUCT_IDS[@]}))
  PRODUCT_ID="${PRODUCT_IDS[$PROD_INDEX]}"
  
  # Random price based on product
  case $PROD_INDEX in
    0) PRICE=$((4500 + $RANDOM % 2000)) ;;
    1) PRICE=$((800 + $RANDOM % 500)) ;;
    2) PRICE=$((12000 + $RANDOM % 5000)) ;;
    3) PRICE=$((5500 + $RANDOM % 2000)) ;;
    4) PRICE=$((450 + $RANDOM % 300)) ;;
  esac
  
  # Random quantity (1-3)
  QTY=$((1 + $RANDOM % 3))
  
  # Random note
  NOTE_INDEX=$(($RANDOM % ${#NOTES[@]}))
  NOTE="${NOTES[$NOTE_INDEX]}"
  
  # Create order
  ORDER_DATA="{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": $QTY,
        \"unitPrice\": $PRICE,
        \"selectedParameters\": []
      }
    ],
    \"notes\": \"$NOTE\"
  }"
  
  RESPONSE=$(curl -s -X POST "$API/orders" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$ORDER_DATA")
  
  ORDER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$ORDER_ID" ]; then
    # Update order to COMPLETED status
    curl -s -X PUT "$API/orders/$ORDER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status": "COMPLETED"}' > /dev/null
    
    echo "    ✅ הזמנה $ORDER_NUM: $ORDER_ID (COMPLETED)"
  else
    echo "    ❌ שגיאה: $RESPONSE"
  fi
done

echo ""
echo "=========================================="
echo "✅ הסקריפט הסתיים בהצלחה!"
echo "=========================================="
echo ""
echo "📊 סיכום:"
echo "   ✅ ${#PRODUCT_IDS[@]} מוצרים נוצרו"
echo "   ✅ ${#PARAMETER_IDS[@]} פרמטרים (תתי דגמים) נוצרו"
echo "   ✅ ${#CUSTOMER_IDS[@]} לקוחות נוצרו"
echo "   ✅ 50 הזמנות שהושלמו נוצרו"
echo ""
echo "👉 עכשיו אפשר להיכנס ל: https://the-shul.app.mottidokib.com/"
echo "   ולראות את כל הנתונים!"
echo ""
