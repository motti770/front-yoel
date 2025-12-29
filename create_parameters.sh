#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "=========================================="
echo "🎨 יצירת 10 פרמטרים עם תיקון"
echo "=========================================="
echo ""

declare -a PARAM_IDS

# Parameter 1: צבע בד
echo "1️⃣  יוצר: צבע בד..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "צבע בד",
    "code": "fabric_color",
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
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null || echo "")
if [ -n "$ID" ]; then
  PARAM_IDS+=("$ID")
  echo "   ✅ נוצר: $ID"
else
  echo "   ❌ Error: $(echo $R | head -c 200)"
fi

# Parameter 2: צבע רקמה
echo "2️⃣  יוצר: צבע רקמה..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "צבע רקמה",
    "code": "embroidery_color",
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
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null || echo "")
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ נוצר: $ID" || echo "   ❌ Error"

# Parameter 3: סגנון עיצוב
echo "3️⃣  יוצר: סגנון עיצוב..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "סגנון עיצוב",
    "code": "design_style",
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
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null || echo "")
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ נוצר: $ID" || echo "   ❌ Error"

# Parameter 4: סוג בד
echo "4️⃣  יוצר: סוג בד..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "סוג בד",
    "code": "fabric_type",
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
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null || echo "")
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ נוצר: $ID" || echo "   ❌ Error"

# Parameter 5: מידה
echo "5️⃣  יוצר: מידה..."
R=$(curl -s -X POST "$API/parameters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "מידה",
    "code": "size",
    "type": "SELECT",
    "description": "בחירת מידת המוצר",
    "isRequired": true,
    "options": [
      {"value": "xs", "label": "קטן מאוד", "priceImpact": -300, "sortOrder": 1},
      {"value": "s", "label": "קטן", "priceImpact": -200, "sortOrder": 2},
      {"value": "m", "label": "בינוני", "priceImpact": 0, "sortOrder": 3},
      {"value": "l", "label": "גדול", "priceImpact": 300, "sortOrder": 4},
      {"value": "xl", "label": "גדול מאוד", "priceImpact": 500, "sortOrder": 5},
      {"value": "xxl", "label": "ענק", "priceImpact": 800, "sortOrder": 6},
      {"value": "custom_small", "label": "מותאם קטן", "priceImpact": 400, "sortOrder": 7},
      {"value": "custom_medium", "label": "מותאם בינוני", "priceImpact": 500, "sortOrder": 8},
      {"value": "custom_large", "label": "מותאם גדול", "priceImpact": 700, "sortOrder": 9},
      {"value": "special", "label": "מידה מיוחדת", "priceImpact": 1000, "sortOrder": 10}
    ]
  }')
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null || echo "")
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ נוצר: $ID" || echo "   ❌ Error"

echo ""
echo "✅ נוצרו ${#PARAM_IDS[@]} פרמטרים!"
echo ""
echo "🔗 משייך למוצרים..."

# Get products
PRODUCT_IDS=($(curl -s "$API/products?limit=50" -H "Authorization: Bearer $TOKEN" | grep -oE '"id":"[a-f0-9-]{36}"' | cut -d'"' -f4 | head -10))

for PROD_ID in "${PRODUCT_IDS[@]}"; do
  echo "   משייך למוצר: $PROD_ID"
  ORDER=1
  for PARAM_ID in "${PARAM_IDS[@]}"; do
    curl -s -X POST "$API/parameters/assign" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"productId\": \"$PROD_ID\", \"parameterId\": \"$PARAM_ID\", \"sortOrder\": $ORDER}" > /dev/null
    ORDER=$((ORDER + 1))
  done
  echo "      ✅ שויכו ${#PARAM_IDS[@]} פרמטרים"
done

echo ""
echo "=========================================="
echo "✅ הסתיים!"
echo "=========================================="
