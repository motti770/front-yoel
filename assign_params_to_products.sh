#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "🔗 שיוך כל הפרמטרים לכל המוצרים..."
echo ""

# Get all parameters
PARAMS=$(curl -s "$API/parameters?limit=100" -H "Authorization: Bearer $TOKEN")
PARAM_IDS=($(echo "$PARAMS" | grep -oE '"id":"[a-f0-9-]{36}"' | cut -d'"' -f4))

echo "✅ מצאתי ${#PARAM_IDS[@]} פרמטרים"

# Get all products
PRODS=$(curl -s "$API/products?limit=100" -H "Authorization: Bearer $TOKEN")
PROD_IDS=($(echo "$PRODS" | grep -oE '"id":"[a-f0-9-]{36}"' | cut -d'"' -f4))

echo "✅ מצאתי ${#PROD_IDS[@]} מוצרים"
echo ""

# Assign each parameter to each product
for PROD_ID in "${PROD_IDS[@]}"; do
  PROD_NAME=$(echo "$PRODS" | grep -B 2 "\"id\":\"$PROD_ID\"" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "�� משייך למוצר: $PROD_NAME"
  
  ORDER=1
  for PARAM_ID in "${PARAM_IDS[@]}"; do
    RESULT=$(curl -s -X POST "$API/parameters/assign" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"productId\":\"$PROD_ID\",\"parameterId\":\"$PARAM_ID\",\"sortOrder\":$ORDER}")
    
    # Check if success
    if echo "$RESULT" | grep -q '"success":true'; then
      echo "   ✅ שויך פרמטר $ORDER"
    else
      echo "   ⚠️  פרמטר $ORDER: $(echo $RESULT | head -c 80)"
    fi
    ORDER=$((ORDER + 1))
  done
  echo ""
done

echo "✅ סיום!"
