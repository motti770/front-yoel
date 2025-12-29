#!/bin/bash

# ==============================================================
# סקריפט ליצירת שלבי תהליך (Workflow Steps)
# ==============================================================

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "=========================================="
echo "🔧 יצירת שלבי תהליכי עבודה (Workflows)"
echo "=========================================="
echo ""

# ===========================================
# שלב 1: מושך מחלקות קיימות
# ===========================================
echo "🏢 שלב 1: מושך מחלקות קיימות..."
DEPTS_JSON=$(curl -s "$API/departments?limit=50" -H "Authorization: Bearer $TOKEN")
echo "$DEPTS_JSON" | grep -o '"name":"[^"]*"'

# Extract department IDs
DEPT_IDS=($(echo "$DEPTS_JSON" | grep -oE '"id":"[a-f0-9-]{36}"' | head -10 | cut -d'"' -f4))
echo "   מצאתי ${#DEPT_IDS[@]} מחלקות"

# Use first few departments for workflow steps
DEPT_SALES="${DEPT_IDS[0]}"
DEPT_DESIGN="${DEPT_IDS[1]:-${DEPT_IDS[0]}}"
DEPT_PRODUCTION="${DEPT_IDS[2]:-${DEPT_IDS[0]}}"
DEPT_QA="${DEPT_IDS[3]:-${DEPT_IDS[0]}}"

echo "   מחלקת מכירות: $DEPT_SALES"
echo "   מחלקת עיצוב: $DEPT_DESIGN"
echo "   מחלקת ייצור: $DEPT_PRODUCTION"
echo "   מחלקת בקרת איכות: $DEPT_QA"
echo ""

# ===========================================
# שלב 2: מושך תהליכים קיימים
# ===========================================
echo "📋 שלב 2: מושך תהליכים קיימים..."
WF_JSON=$(curl -s "$API/workflows?limit=50" -H "Authorization: Bearer $TOKEN")
echo "$WF_JSON" | grep -o '"name":"[^"]*"'

# Extract workflow IDs
WORKFLOW_IDS=($(echo "$WF_JSON" | grep -oE '"id":"[a-f0-9-]{36}"' | cut -d'"' -f4))
echo ""
echo "   מצאתי ${#WORKFLOW_IDS[@]} תהליכים"
echo ""

# ===========================================
# שלב 3: יוצר שלבים לכל תהליך
# ===========================================
echo "⚙️  שלב 3: יוצר שלבים לכל תהליך..."
echo ""

for WF_ID in "${WORKFLOW_IDS[@]}"; do
  if [ -n "$WF_ID" ] && [ ${#WF_ID} -gt 30 ]; then
    echo "   📝 תהליך: $WF_ID"
    
    # Get workflow name
    WF_DETAILS=$(curl -s "$API/workflows/$WF_ID" -H "Authorization: Bearer $TOKEN")
    WF_NAME=$(echo "$WF_DETAILS" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "      שם: $WF_NAME"
    
    # Check if workflow already has steps
    EXISTING_STEPS=$(echo "$WF_DETAILS" | grep -o '"steps":\[' || echo "")
    
    # Create 9 workflow steps
    echo "      יוצר 9 שלבים..."
    
    # Step 1: קבלת הזמנה
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"קבלת הזמנה ואימות פרטים\", \"departmentId\": \"$DEPT_SALES\", \"stepOrder\": 1, \"estimatedDurationDays\": 1, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 1: קבלת הזמנה"
    
    # Step 2: עיצוב סקיצה ראשונית
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"עיצוב סקיצה ראשונית\", \"departmentId\": \"$DEPT_DESIGN\", \"stepOrder\": 2, \"estimatedDurationDays\": 3, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 2: עיצוב סקיצה"
    
    # Step 3: אישור סקיצה מלקוח
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"אישור סקיצה מלקוח\", \"departmentId\": \"$DEPT_SALES\", \"stepOrder\": 3, \"estimatedDurationDays\": 2, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 3: אישור סקיצה"
    
    # Step 4: עיצוב רקמה מפורט
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"עיצוב רקמה מפורט\", \"departmentId\": \"$DEPT_DESIGN\", \"stepOrder\": 4, \"estimatedDurationDays\": 5, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 4: עיצוב רקמה"
    
    # Step 5: אישור עיצוב רקמה
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"אישור עיצוב רקמה סופי\", \"departmentId\": \"$DEPT_SALES\", \"stepOrder\": 5, \"estimatedDurationDays\": 1, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 5: אישור רקמה"
    
    # Step 6: ייצור וביצוע רקמה
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"ייצור וביצוע רקמה\", \"departmentId\": \"$DEPT_PRODUCTION\", \"stepOrder\": 6, \"estimatedDurationDays\": 14, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 6: ייצור"
    
    # Step 7: בקרת איכות
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"בקרת איכות וגימור\", \"departmentId\": \"$DEPT_QA\", \"stepOrder\": 7, \"estimatedDurationDays\": 2, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 7: בקרת איכות"
    
    # Step 8: אריזה
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"אריזה והכנה למשלוח\", \"departmentId\": \"$DEPT_PRODUCTION\", \"stepOrder\": 8, \"estimatedDurationDays\": 1, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 8: אריזה"
    
    # Step 9: משלוח
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"משלוח ומסירה ללקוח\", \"departmentId\": \"$DEPT_SALES\", \"stepOrder\": 9, \"estimatedDurationDays\": 3, \"isActive\": true}" > /dev/null
    echo "      ✓ שלב 9: משלוח"
    
    echo "      ✅ נוצרו 9 שלבים לתהליך!"
    echo ""
  fi
done

echo "=========================================="
echo "✅ סקריפט שלבי תהליך הסתיים!"
echo "=========================================="
echo ""
echo "📊 לכל תהליך נוצרו 9 שלבים:"
echo "   1️⃣  קבלת הזמנה ואימות פרטים (1 יום)"
echo "   2️⃣  עיצוב סקיצה ראשונית (3 ימים)"
echo "   3️⃣  אישור סקיצה מלקוח (2 ימים)"
echo "   4️⃣  עיצוב רקמה מפורט (5 ימים)"
echo "   5️⃣  אישור עיצוב רקמה סופי (1 יום)"
echo "   6️⃣  ייצור וביצוע רקמה (14 ימים)"
echo "   7️⃣  בקרת איכות וגימור (2 ימים)"
echo "   8️⃣  אריזה והכנה למשלוח (1 יום)"
echo "   9️⃣  משלוח ומסירה ללקוח (3 ימים)"
echo ""
echo "   ⏱️  סה\"כ זמן תהליך: ~32 ימים"
echo ""
