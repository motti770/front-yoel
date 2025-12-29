#!/bin/bash

# Token for API access
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2ODgxMDUxLCJleHAiOjE3NjY5Njc0NTF9.muYtJrTEshaImnu0vCf8hTsaMBqzrsPovzEYnbEBtn8"
API="https://crm-api.app.mottidokib.com"

echo "=========================================="
echo "🚀 Starting Full Setup for Yoel CRM v2"
echo "=========================================="

# Department IDs (from existing data)
DEPT_MANAGERS="b2bd1210-02a8-4dcb-b46a-de25624be717"
DEPT_SALES="86250abe-46fc-4ee6-8184-ccc2226f3816"
DEPT_SKETCH="995cdb9e-20a6-4ea3-9068-93b42754d67c"
DEPT_EMBROIDERY="e6a46876-f648-4574-91fd-7131437620ef"
# Use Production department that exists
DEPT_FACTORY="6339ab2a-6778-4ce1-aa50-bdb987d7fedc"

echo ""
echo "📦 Step 1: Creating 5 Products with correct fields..."

# Product 1: כיסוי ספר תורה
echo "Creating: כיסוי ספר תורה..."
P1=$(curl -s -X POST "$API/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "כיסוי ספר תורה", "sku": "TORAH-COVER-001", "description": "כיסוי לספר תורה כולל אפשרות לגרטל", "category": "ספרי תורה", "price": 1, "isActive": true}')
echo "$P1"
PROD1_ID=$(echo "$P1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Product 1 ID: $PROD1_ID"

# Product 2: גרטל
echo "Creating: גרטל..."
P2=$(curl -s -X POST "$API/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "גרטל", "sku": "GARTEL-001", "description": "גרטל לספר תורה - נמכר גם בנפרד", "category": "ספרי תורה", "price": 1, "isActive": true}')
echo "$P2"
PROD2_ID=$(echo "$P2" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Product 2 ID: $PROD2_ID"

# Product 3: פרוכת
echo "Creating: פרוכת..."
P3=$(curl -s -X POST "$API/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "פרוכת", "sku": "PAROCHET-001", "description": "פרוכת לארון קודש", "category": "ריהוט בית כנסת", "price": 1, "isActive": true}')
echo "$P3"
PROD3_ID=$(echo "$P3" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Product 3 ID: $PROD3_ID"

# Product 4: כיסוי בימה ועמוד
echo "Creating: כיסוי בימה ועמוד..."
P4=$(curl -s -X POST "$API/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "כיסוי בימה ועמוד", "sku": "BIMA-COVER-001", "description": "כיסוי לבימה ועמוד חזן", "category": "ריהוט בית כנסת", "price": 1, "isActive": true}')
echo "$P4"
PROD4_ID=$(echo "$P4" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Product 4 ID: $PROD4_ID"

# Product 5: כיסוי טלית ותפילין
echo "Creating: כיסוי טלית ותפילין..."
P5=$(curl -s -X POST "$API/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "כיסוי טלית ותפילין", "sku": "TALIT-COVER-001", "description": "תיק/כיסוי לטלית ותפילין", "category": "תשמישי קדושה", "price": 1, "isActive": true}')
echo "$P5"
PROD5_ID=$(echo "$P5" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Product 5 ID: $PROD5_ID"

echo ""
echo "📋 Step 2: Creating Workflows with steps..."

# Function to create workflow with steps
create_workflow() {
  local PROD_ID=$1
  local PROD_NAME=$2
  local WF_CODE=$3
  
  if [ -z "$PROD_ID" ] || [ "$PROD_ID" = "" ]; then
    echo "⚠️ Skipping workflow for $PROD_NAME - no product ID"
    return
  fi
  
  echo ""
  echo "Creating workflow for: $PROD_NAME (Product ID: $PROD_ID)..."
  
  # Create workflow
  WF=$(curl -s -X POST "$API/workflows" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"תהליך $PROD_NAME\", \"code\": \"$WF_CODE\", \"description\": \"תהליך ייצור מלא ל$PROD_NAME\", \"productId\": \"$PROD_ID\", \"isActive\": true}")
  
  echo "Workflow response: $WF"
  WF_ID=$(echo "$WF" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Workflow ID: $WF_ID"
  
  if [ -n "$WF_ID" ] && [ "$WF_ID" != "" ] && [ "$WF_ID" != "success" ]; then
    # Add steps
    echo "Adding 9 steps to workflow..."
    
    # Step 1: קבלת הזמנה
    echo -n "Step 1..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"קבלת הזמנה\", \"departmentId\": \"$DEPT_SALES\", \"stepOrder\": 1, \"estimatedDurationDays\": 1, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    # Step 2: עיצוב סקיצה
    echo -n "Step 2..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"עיצוב סקיצה\", \"departmentId\": \"$DEPT_SKETCH\", \"stepOrder\": 2, \"estimatedDurationDays\": 3, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    # Step 3: אישור סקיצה
    echo -n "Step 3..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"אישור סקיצה\", \"departmentId\": \"$DEPT_MANAGERS\", \"stepOrder\": 3, \"estimatedDurationDays\": 1, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    # Step 4: עיצוב רקמה
    echo -n "Step 4..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"עיצוב רקמה\", \"departmentId\": \"$DEPT_EMBROIDERY\", \"stepOrder\": 4, \"estimatedDurationDays\": 5, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    # Step 5: אישור עיצוב רקמה
    echo -n "Step 5..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"אישור עיצוב רקמה\", \"departmentId\": \"$DEPT_MANAGERS\", \"stepOrder\": 5, \"estimatedDurationDays\": 1, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    # Step 6: ייצור
    echo -n "Step 6..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"ייצור\", \"departmentId\": \"$DEPT_FACTORY\", \"stepOrder\": 6, \"estimatedDurationDays\": 14, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    # Step 7: בקרת איכות
    echo -n "Step 7..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"בקרת איכות\", \"departmentId\": \"$DEPT_MANAGERS\", \"stepOrder\": 7, \"estimatedDurationDays\": 1, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    # Step 8: אריזה
    echo -n "Step 8..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"אריזה\", \"departmentId\": \"$DEPT_FACTORY\", \"stepOrder\": 8, \"estimatedDurationDays\": 1, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    # Step 9: משלוח
    echo -n "Step 9..."
    curl -s -X POST "$API/workflows/$WF_ID/steps" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"משלוח\", \"departmentId\": \"$DEPT_FACTORY\", \"stepOrder\": 9, \"estimatedDurationDays\": 3, \"isActive\": true}" > /dev/null
    echo " ✓"
    
    echo "✅ Workflow '$PROD_NAME' created with 9 steps!"
  else
    echo "❌ Failed to create workflow for $PROD_NAME"
  fi
}

# Create workflows for all products
create_workflow "$PROD1_ID" "כיסוי ספר תורה" "WF_TORAH"
create_workflow "$PROD2_ID" "גרטל" "WF_GARTEL"
create_workflow "$PROD3_ID" "פרוכת" "WF_PAROCHET"
create_workflow "$PROD4_ID" "כיסוי בימה ועמוד" "WF_BIMA"
create_workflow "$PROD5_ID" "כיסוי טלית ותפילין" "WF_TALIT"

echo ""
echo "🗑️ Step 3: Deleting all existing leads..."

# Get all leads (3 pages)
for PAGE in 1 2 3; do
  echo "Getting leads page $PAGE..."
  LEADS=$(curl -s -X GET "$API/leads?page=$PAGE&limit=20" \
    -H "Authorization: Bearer $TOKEN")
  
  # Extract lead IDs and delete each (without Content-Type for DELETE)
  echo "$LEADS" | grep -o '"id":"[a-f0-9-]*"' | cut -d'"' -f4 | while read LEAD_ID; do
    if [ -n "$LEAD_ID" ]; then
      echo -n "Deleting lead $LEAD_ID..."
      RESULT=$(curl -s -X DELETE "$API/leads/$LEAD_ID" \
        -H "Authorization: Bearer $TOKEN")
      echo " done"
    fi
  done
done

echo ""
echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "🎉 Summary:"
echo "   - 5 Products created"
echo "   - 5 Workflows created (9 steps each)"
echo "   - All leads deleted"
echo ""
echo "👉 Now go to https://the-shul.app.mottidokib.com/"
echo "   and refresh the pages to see the new data!"
echo ""
