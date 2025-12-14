#!/bin/bash

echo "🔄 מרענן את המערכת..."
echo ""
echo "📦 1. עוצר את השרת..."
# Kill any existing vite processes
pkill -f vite || true

echo ""
echo "🧹 2. מנקה cache של Vite..."
rm -rf node_modules/.vite
rm -rf dist

echo ""
echo "✨ 3. מתחיל את השרת מחדש..."
npm run dev &

echo ""
echo "⏳ ממתין לשרת להיטען..."
sleep 5

echo ""
echo "✅ השרת רץ!"
echo ""
echo "🌐 עכשיו:"
echo "   1. בדפדפן - לחץ Cmd+Shift+R (Mac) או Ctrl+Shift+R (Windows)"
echo "   2. או: פתח DevTools (F12) → Application → Clear Storage → Clear site data"
echo "   3. לאחר מכן רענן את הדף"
echo ""
echo "📍 כתובת: http://localhost:5173"
