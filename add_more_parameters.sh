#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "🎨 יוצר פרמטרים 6-10..."
echo ""

declare -a PARAM_IDS

# Parameter 6: סוג רקמה
echo "6️⃣  יוצר: סוג רקמה..."
R=$(curl -s -X POST "$API/parameters" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"סוג רקמה","code":"embroidery_type","type":"SELECT","description":"בחירת טכניקת הרקמה","isRequired":false,"options":[{"value":"machine_basic","label":"רקמת מכונה בסיסית","priceImpact":0,"sortOrder":1},{"value":"machine_advanced","label":"רקמת מכונה מתקדמת","priceImpact":200,"sortOrder":2},{"value":"hand_basic","label":"רקמת יד בסיסית","priceImpact":800,"sortOrder":3},{"value":"hand_master","label":"רקמת יד אמן","priceImpact":1500,"sortOrder":4},{"value":"combination","label":"משולב מכונה ויד","priceImpact":600,"sortOrder":5}]}')
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ $ID"

# Parameter 7: עיטורים
echo "7️⃣  יוצר: עיטורים..."
R=$(curl -s -X POST "$API/parameters" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"עיטורים","code":"decorations","type":"SELECT","description":"תוספת עיטורים ופרטים","isRequired":false,"options":[{"value":"none","label":"ללא","priceImpact":0,"sortOrder":1},{"value":"gold_trim","label":"פס זהב","priceImpact":300,"sortOrder":2},{"value":"silver_trim","label":"פס כסף","priceImpact":250,"sortOrder":3},{"value":"stones_basic","label":"אבנים דקורטיביות","priceImpact":400,"sortOrder":4},{"value":"tassels_simple","label":"גדילים פשוטים","priceImpact":150,"sortOrder":5}]}')
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ $ID"

# Parameter 8: לוגו
echo "8️⃣  יוצר: לוגו וסמל..."
R=$(curl -s -X POST "$API/parameters" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"לוגו וסמל","code":"logo_symbol","type":"SELECT","description":"הוספת לוגו או סמל מרכזי","isRequired":false,"options":[{"value":"none","label":"ללא","priceImpact":0,"sortOrder":1},{"value":"star_of_david","label":"מגן דוד","priceImpact":150,"sortOrder":2},{"value":"lions_of_judah","label":"אריות יהודה","priceImpact":400,"sortOrder":3},{"value":"crown_torah","label":"כתר תורה","priceImpact":350,"sortOrder":4},{"value":"tablets","label":"לוחות הברית","priceImpact":300,"sortOrder":5}]}')
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ $ID"

# Parameter 9: הקדשה
echo "9️⃣  יוצר: הקדשה..."
R=$(curl -s -X POST "$API/parameters" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"הקדשה","code":"dedication","type":"TEXT","description":"טקסט הקדשה לרקמה על המוצר","isRequired":false,"options":[]}')
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ $ID"

# Parameter 10: אריזה
echo "🔟 יוצר: אריזה..."
R=$(curl -s -X POST "$API/parameters" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"אריזה","code":"packaging","type":"SELECT","description":"סוג האריזה למשלוח","isRequired":false,"options":[{"value":"standard","label":"רגילה","priceImpact":0,"sortOrder":1},{"value":"gift_basic","label":"אריזת מתנה בסיסית","priceImpact":80,"sortOrder":2},{"value":"gift_premium","label":"מתנה מהודרת","priceImpact":150,"sortOrder":3},{"value":"wooden_box","label":"קופסת עץ","priceImpact":300,"sortOrder":4}]}')
ID=$(echo "$R" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
[ -n "$ID" ] && PARAM_IDS+=("$ID") && echo "   ✅ $ID"

echo ""
echo "✅ נוצרו ${#PARAM_IDS[@]} פרמטרים נוספים"
echo ""
echo "🔗 משייך למוצרים..."

PRODUCT_IDS=($(curl -s "$API/products?limit=50" -H "Authorization: Bearer $TOKEN" | grep -oE '"id":"[a-f0-9-]{36}"' | cut -d'"' -f4 | head -10))

for PROD_ID in "${PRODUCT_IDS[@]}"; do
  echo "   משייך למוצר: $PROD_ID"
  ORDER=6
  for PARAM_ID in "${PARAM_IDS[@]}"; do
    curl -s -X POST "$API/parameters/assign" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"productId\":\"$PROD_ID\",\"parameterId\":\"$PARAM_ID\",\"sortOrder\":$ORDER}" > /dev/null
    ORDER=$((ORDER + 1))
  done
  echo "      ✅ שויכו ${#PARAM_IDS[@]} פרמטרים"
done

echo ""
echo "✅ סיום!"
