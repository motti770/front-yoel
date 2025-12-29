#!/bin/bash

# Token for API access
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "=========================================="
echo "🚀 יצירת 50 הזמנות שהושלמו"
echo "=========================================="
echo ""

# -------------------------------------------
# STEP 1: Get existing products and their IDs
# -------------------------------------------
echo "📦 שלב 1: מושך מוצרים קיימים..."
PRODUCTS_RESPONSE=$(curl -s -X GET "$API/products?limit=50" \
  -H "Authorization: Bearer $TOKEN")

# Extract product IDs
PRODUCT_IDS=($(echo "$PRODUCTS_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -10))

echo "   מצאתי ${#PRODUCT_IDS[@]} מוצרים"
echo ""

# -------------------------------------------
# STEP 2: Add stock to all products
# -------------------------------------------
echo "📊 שלב 2: מוסיף מלאי למוצרים..."
for PROD_ID in "${PRODUCT_IDS[@]}"; do
  echo "   מעדכן מלאי למוצר $PROD_ID..."
  curl -s -X POST "$API/products/$PROD_ID/stock" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"operation": "SET", "quantity": 1000}' > /dev/null
done
echo "   ✅ כל המוצרים עודכנו עם מלאי 1000"
echo ""

# -------------------------------------------
# STEP 3: Get existing customers
# -------------------------------------------
echo "👥 שלב 3: מושך לקוחות קיימים..."
CUSTOMERS_RESPONSE=$(curl -s -X GET "$API/customers?limit=50" \
  -H "Authorization: Bearer $TOKEN")

# Extract customer IDs
CUSTOMER_IDS=($(echo "$CUSTOMERS_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -20))

echo "   מצאתי ${#CUSTOMER_IDS[@]} לקוחות"
echo ""

# Check if we have enough data
if [ ${#PRODUCT_IDS[@]} -eq 0 ]; then
  echo "❌ אין מוצרים במערכת! צור מוצרים קודם."
  exit 1
fi

if [ ${#CUSTOMER_IDS[@]} -eq 0 ]; then
  echo "❌ אין לקוחות במערכת! צור לקוחות קודם."
  exit 1
fi

# -------------------------------------------
# STEP 4: Create 50 Completed Orders
# -------------------------------------------
echo "📋 שלב 4: יצירת 50 הזמנות שהושלמו..."
echo ""

# Hebrew notes array
NOTES=(
  "הזמנה לרגל בר מצווה"
  "לעילוי נשמת האב זל"
  "מתנה לבית הכנסת החדש"
  "לכבוד הכנסת ספר תורה"
  "הזמנה לרגל חנוכת בית"
  "תרומה לבית הכנסת"
  "לזכרון עולם"
  "מתנת חתונה"
  "לרגל יום השנה"
  "הזמנה דחופה לחג"
)

# Prices array for different products
PRICES=(4500 800 12000 5500 450 3000 2500 6000 1500 900)

SUCCESS_COUNT=0

for ORDER_NUM in $(seq 1 50); do
  # Random customer (cycle through them)
  CUST_INDEX=$((($ORDER_NUM - 1) % ${#CUSTOMER_IDS[@]}))
  CUSTOMER_ID="${CUSTOMER_IDS[$CUST_INDEX]}"
  
  # Random product (cycle through them)
  PROD_INDEX=$((($ORDER_NUM - 1) % ${#PRODUCT_IDS[@]}))
  PRODUCT_ID="${PRODUCT_IDS[$PROD_INDEX]}"
  
  # Random price
  PRICE_INDEX=$(($RANDOM % ${#PRICES[@]}))
  PRICE="${PRICES[$PRICE_INDEX]}"
  
  # Random quantity (1-3)
  QTY=$((1 + $RANDOM % 3))
  
  # Random note
  NOTE_INDEX=$(($RANDOM % ${#NOTES[@]}))
  NOTE="${NOTES[$NOTE_INDEX]}"
  
  # Create order JSON
  ORDER_JSON=$(cat <<EOF
{
  "customerId": "$CUSTOMER_ID",
  "items": [
    {
      "productId": "$PRODUCT_ID",
      "quantity": $QTY,
      "unitPrice": $PRICE,
      "selectedParameters": []
    }
  ],
  "notes": "$NOTE"
}
EOF
)
  
  RESPONSE=$(curl -s -X POST "$API/orders" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$ORDER_JSON")
  
  ORDER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$ORDER_ID" ]; then
    # Update order to COMPLETED status
    curl -s -X PUT "$API/orders/$ORDER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status": "COMPLETED"}' > /dev/null
    
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "  ✅ הזמנה $ORDER_NUM/50 נוצרה: $ORDER_ID"
  else
    echo "  ❌ הזמנה $ORDER_NUM נכשלה: $(echo $RESPONSE | head -c 100)"
  fi
done

echo ""
echo "=========================================="
echo "✅ הסקריפט הסתיים!"
echo "=========================================="
echo ""
echo "📊 סיכום:"
echo "   ✅ $SUCCESS_COUNT הזמנות נוצרו והושלמו בהצלחה"
echo ""
echo "👉 עכשיו אפשר להיכנס ל: https://the-shul.app.mottidokib.com/"
echo "   ולראות את כל הנתונים!"
echo ""
