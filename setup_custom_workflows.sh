#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "=========================================="
echo "🏗️  יצירת תהליכים מותאמים אישית"
echo "=========================================="
echo ""

# Get departments
DEPTS=$(curl -s "$API/departments?limit=50" -H "Authorization: Bearer $TOKEN")
DEPT_IDS=($(echo "$DEPTS" | grep -oE '"id":"[a-f0-9-]{36}"' | cut -d'"' -f4))

DEPT_SALES="${DEPT_IDS[0]}"
DEPT_DESIGN="${DEPT_IDS[1]:-${DEPT_IDS[0]}}"
DEPT_CUTTING="${DEPT_IDS[2]:-${DEPT_IDS[0]}}"
DEPT_PRODUCTION="${DEPT_IDS[3]:-${DEPT_IDS[0]}}"
DEPT_QA="${DEPT_IDS[4]:-${DEPT_IDS[0]}}"
DEPT_PACKAGING="${DEPT_IDS[5]:-${DEPT_IDS[0]}}"

echo "מחלקות:"
echo "  מכירות: $DEPT_SALES"
echo "  עיצוב: $DEPT_DESIGN"
echo "  חיתוך: $DEPT_CUTTING"
echo "  ייצור: $DEPT_PRODUCTION"
echo ""

# ============================================
# 1. הוספת מוצר עצי חיים
# ============================================
echo "📦 1. יוצר מוצר: עצי חיים..."
ATZEI_CHAIM=$(curl -s -X POST "$API/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "עצי חיים לספר תורה",
    "sku": "ATZEI-CHAIM-001",
    "description": "עצי חיים מפוארים לספר תורה עם חריטה וציפוי כסף",
    "price": 18000,
    "stockQuantity": 2,
    "category": "תשמישי קדושה",
    "status": "ACTIVE"
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ -n "$ATZEI_CHAIM" ]; then
  echo "   ✅ נוצר: $ATZEI_CHAIM"
else
  echo "   ⚠️  כבר קיים - מושך ID קיים"
  ATZEI_CHAIM=$(curl -s "$API/products?limit=100" -H "Authorization: Bearer $TOKEN" | grep -B 2 "עצי חיים" | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)
  echo "   ID: $ATZEI_CHAIM"
fi
echo ""

# Get all products
PRODUCTS=$(curl -s "$API/products?limit=100" -H "Authorization: Bearer $TOKEN")

# מוצר 1: פרוכת
PAROCHET_ID=$(echo "$PRODUCTS" | grep -B 2 "פרוכת" | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)
# מוצר 2: גרטל
GARTEL_ID=$(echo "$PRODUCTS" | grep -B 2 "גרטל" | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)
# מוצר 3: כיסוי בימה
BIMA_ID=$(echo "$PRODUCTS" | grep -B 2 "בימה" | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)
# מוצר 4: כיסוי ספר תורה
SEFER_TORAH_ID=$(echo "$PRODUCTS" | grep -B 2 "ספר תורה" | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)
# מוצר 5: תיק טלית
TALIT_BAG_ID=$(echo "$PRODUCTS" | grep -B 2 "תיק טלית" | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)
# מוצר 6: כיסוי טלית
TALIT_COVER_ID=$(echo "$PRODUCTS" | grep -B 2 "כיסוי טלית" | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)

echo "מוצרים:"
echo "  פרוכת: $PAROCHET_ID"
echo "  גרטל: $GARTEL_ID"
echo "  כיסוי בימה: $BIMA_ID"
echo "  עצי חיים: $ATZEI_CHAIM"
echo ""

# ============================================
# תהליך 1: פרוכת - תהליך מורכב ומפואר
# ============================================
echo "🔶 תהליך 1: פרוכת (מורכב ומפואר)"
WF1=$(curl -s -X POST "$API/workflows" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ייצור פרוכת מהודרת",
    "code": "parochet_deluxe",
    "description": "תהליך מלא לייצור פרוכת עם רקמה מורכבת ועיטורים",
    "isActive": true
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ -n "$WF1" ]; then
  echo "   ✅ Workflow: $WF1"
  # שלבים לפרוכת
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"קבלת הזמנה ואישור פרטים\",\"departmentId\":\"$DEPT_SALES\",\"stepOrder\":1,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"עיצוב סקיצה ראשונית\",\"departmentId\":\"$DEPT_DESIGN\",\"stepOrder\":2,\"estimatedDurationDays\":3}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"אישור סקיצה מהלקוח\",\"departmentId\":\"$DEPT_SALES\",\"stepOrder\":3,\"estimatedDurationDays\":2}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"בחירת בדים והזמנה\",\"departmentId\":\"$DEPT_CUTTING\",\"stepOrder\":4,\"estimatedDurationDays\":5}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"חיתוך בדים לפי מידות\",\"departmentId\":\"$DEPT_CUTTING\",\"stepOrder\":5,\"estimatedDurationDays\":2}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"רקמה מורכבת - שלב 1\",\"departmentId\":\"$DEPT_DESIGN\",\"stepOrder\":6,\"estimatedDurationDays\":10}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"רקמה מורכבת - שלב 2 (פרטים)\",\"departmentId\":\"$DEPT_DESIGN\",\"stepOrder\":7,\"estimatedDurationDays\":7}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"תפירה וגימור\",\"departmentId\":\"$DEPT_PRODUCTION\",\"stepOrder\":8,\"estimatedDurationDays\":3}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"הוספת עיטורים וגדילים\",\"departmentId\":\"$DEPT_PRODUCTION\",\"stepOrder\":9,\"estimatedDurationDays\":2}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"בקרת איכות סופית\",\"departmentId\":\"$DEPT_QA\",\"stepOrder\":10,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"אריזה מהודרת\",\"departmentId\":\"$DEPT_PACKAGING\",\"stepOrder\":11,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF1/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"משלוח ללקוח\",\"departmentId\":\"$DEPT_SALES\",\"stepOrder\":12,\"estimatedDurationDays\":3}" > /dev/null
  
  # שיוך למוצר
  [ -n "$PAROCHET_ID" ] && curl -s -X PUT "$API/products/$PAROCHET_ID" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"workflowId\":\"$WF1\"}" > /dev/null
  
  echo "   ✅ 12 שלבים (~37 ימים)"
fi
echo ""

# ============================================
# תהליך 2: גרטל - תהליך פשוט וקצר
# ============================================
echo "🔷 תהליך 2: גרטל (פשוט וקצר)"
WF2=$(curl -s -X POST "$API/workflows" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ייצור גרטל",
    "code": "gartel_simple",
    "description": "תהליך מהיר לייצור גרטל עם רקמה בסיסית",
    "isActive": true
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ -n "$WF2" ]; then
  echo "   ✅ Workflow: $WF2"
  curl -s -X POST "$API/workflows/$WF2/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"קבלת הזמנה\",\"departmentId\":\"$DEPT_SALES\",\"stepOrder\":1,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF2/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"בחירת בד וצבע\",\"departmentId\":\"$DEPT_CUTTING\",\"stepOrder\":2,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF2/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"חיתוך\",\"departmentId\":\"$DEPT_CUTTING\",\"stepOrder\":3,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF2/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"רקמת שם/לוגו\",\"departmentId\":\"$DEPT_DESIGN\",\"stepOrder\":4,\"estimatedDurationDays\":2}" > /dev/null
  curl -s -X POST "$API/workflows/$WF2/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"תפירה\",\"departmentId\":\"$DEPT_PRODUCTION\",\"stepOrder\":5,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF2/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"אריזה ומשלוח\",\"departmentId\":\"$DEPT_PACKAGING\",\"stepOrder\":6,\"estimatedDurationDays\":1}" > /dev/null
  
  [ -n "$GARTEL_ID" ] && curl -s -X PUT "$API/products/$GARTEL_ID" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"workflowId\":\"$WF2\"}" > /dev/null
  
  echo "   ✅ 6 שלבים (~7 ימים)"
fi
echo ""

# ============================================
# תהליך 3: כיסוי בימה - תהליך בינוני
# ============================================
echo "🔶 תהליך 3: כיסוי בימה (בינוני)"
WF3=$(curl -s -X POST "$API/workflows" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ייצור כיסוי בימה",
    "code": "bima_cover",
    "description": "תהליך לייצור כיסוי בימה מותאם",
    "isActive": true
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ -n "$WF3" ]; then
  echo "   ✅ Workflow: $WF3"
  curl -s -X POST "$API/workflows/$WF3/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"קבלת מידות בימה\",\"departmentId\":\"$DEPT_SALES\",\"stepOrder\":1,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF3/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"עיצוב לפי מידות\",\"departmentId\":\"$DEPT_DESIGN\",\"stepOrder\":2,\"estimatedDurationDays\":2}" > /dev/null
  curl -s -X POST "$API/workflows/$WF3/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"הזמנת בדים\",\"departmentId\":\"$DEPT_CUTTING\",\"stepOrder\":3,\"estimatedDurationDays\":3}" > /dev/null
  curl -s -X POST "$API/workflows/$WF3/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"חיתוך לפי תבנית\",\"departmentId\":\"$DEPT_CUTTING\",\"stepOrder\":4,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF3/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"רקמת עיטורים\",\"departmentId\":\"$DEPT_DESIGN\",\"stepOrder\":5,\"estimatedDurationDays\":5}" > /dev/null
  curl -s -X POST "$API/workflows/$WF3/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"תפירה וחיזוקים\",\"departmentId\":\"$DEPT_PRODUCTION\",\"stepOrder\":6,\"estimatedDurationDays\":2}" > /dev/null
  curl -s -X POST "$API/workflows/$WF3/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"בדיקה והתקנה (אופציונלי)\",\"departmentId\":\"$DEPT_QA\",\"stepOrder\":7,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF3/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"אריזה ומשלוח\",\"departmentId\":\"$DEPT_PACKAGING\",\"stepOrder\":8,\"estimatedDurationDays\":2}" > /dev/null
  
  [ -n "$BIMA_ID" ] && curl -s -X PUT "$API/products/$BIMA_ID" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"workflowId\":\"$WF3\"}" > /dev/null
  
  echo "   ✅ 8 שלבים (~17 ימים)"
fi
echo ""

# ============================================
# תהליך 4: עצי חיים - עבודת עץ וחריטה
# ============================================
echo "🔷 תהליך 4: עצי חיים (עבודת עץ + חריטה + ציפוי)"
WF4=$(curl -s -X POST "$API/workflows" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ייצור עצי חיים",
    "code": "atzei_chaim_production",
    "description": "תהליך מיוחד לעצי חיים - עבודת עץ, חריטה וציפוי כסף",
    "isActive": true
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ -n "$WF4" ]; then
  echo "   ✅ Workflow: $WF4"
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"קבלת הזמנה ובחירת עיצוב\",\"departmentId\":\"$DEPT_SALES\",\"stepOrder\":1,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"עיצוב חריטה ולוגואים\",\"departmentId\":\"$DEPT_DESIGN\",\"stepOrder\":2,\"estimatedDurationDays\":2}" > /dev/null
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"הזמנת חומרי גלם (עץ איכותי)\",\"departmentId\":\"$DEPT_PRODUCTION\",\"stepOrder\":3,\"estimatedDurationDays\":7}" > /dev/null
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"עיבוד עץ וחריטה - ספק חיצוני\",\"departmentId\":\"$DEPT_PRODUCTION\",\"stepOrder\":4,\"estimatedDurationDays\":14}" > /dev/null
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"ציפוי כסף - ספק חיצוני\",\"departmentId\":\"$DEPT_PRODUCTION\",\"stepOrder\":5,\"estimatedDurationDays\":10}" > /dev/null
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"הרכבה וליטוש\",\"departmentId\":\"$DEPT_PRODUCTION\",\"stepOrder\":6,\"estimatedDurationDays\":3}" > /dev/null
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"בקרת איכות מחמירה\",\"departmentId\":\"$DEPT_QA\",\"stepOrder\":7,\"estimatedDurationDays\":2}" > /dev/null
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"אריזה מיוחדת (מגן)\",\"departmentId\":\"$DEPT_PACKAGING\",\"stepOrder\":8,\"estimatedDurationDays\":1}" > /dev/null
  curl -s -X POST "$API/workflows/$WF4/steps" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"משלוח מבוטח\",\"departmentId\":\"$DEPT_SALES\",\"stepOrder\":9,\"estimatedDurationDays\":2}" > /dev/null
  
  [ -n "$ATZEI_CHAIM" ] && curl -s -X PUT "$API/products/$ATZEI_CHAIM" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"workflowId\":\"$WF4\"}" > /dev/null
  
  echo "   ✅ 9 שלבים (~42 ימים)"
fi
echo ""

echo "=========================================="
echo "✅ הושלם!"
echo "=========================================="
echo ""
echo "📊 סיכום:"
echo "  🔶 פרוכת: 12 שלבים, ~37 ימים (מורכב)"
echo "  🔷 גרטל: 6 שלבים, ~7 ימים (פשוט)"
echo "  🔶 כיסוי בימה: 8 שלבים, ~17 ימים (בינוני)"
echo "  🔷 עצי חיים: 9 שלבים, ~42 ימים (עבודת עץ)"
echo ""
