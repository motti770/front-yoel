#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDk4NmJkNi0zYWY4LTQzY2QtOWFmZi1hY2RkYjdkOWY5NmYiLCJlbWFpbCI6ImFkbWluQHlvZWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2OTU4NDMxLCJleHAiOjE3NjcwNDQ4MzF9.Alg9pMpSSrbjphqCqOz2n1MRPjAdExFkcyjFTi4vGXM"
API="https://crm-api.app.mottidokib.com"

echo "=========================================="
echo "📊 בדיקת נתונים במערכת"
echo "=========================================="
echo ""

echo "=== 📦 מוצרים ==="
curl -s "$API/products?limit=50" -H "Authorization: Bearer $TOKEN" | grep -o '"name":"[^"]*"' | sort | uniq -c
echo ""

echo "=== 👥 לקוחות ==="
curl -s "$API/customers?limit=50" -H "Authorization: Bearer $TOKEN" | grep -o '"name":"[^"]*"' | sort | uniq -c
echo ""

echo "=== 📋 סה\"כ הזמנות ==="
curl -s "$API/orders?limit=1" -H "Authorization: Bearer $TOKEN" | grep -o '"total":[0-9]*'
echo ""

echo "=== 🎨 פרמטרים ==="
curl -s "$API/parameters?limit=50" -H "Authorization: Bearer $TOKEN" | grep -o '"name":"[^"]*"' | sort | uniq -c
echo ""

echo "=== 📞 לידים ==="
curl -s "$API/leads?limit=1" -H "Authorization: Bearer $TOKEN" | grep -o '"total":[0-9]*'
echo ""

echo "=========================================="
echo "✅ בדיקה הסתיימה!"
echo "   אם יש מספר > 1 ליד פריט = כפילות"
echo "=========================================="
