# 🎨 Design Guidelines - The Shul CRM

מסמך זה מגדיר את הנחיות העיצוב של המערכת. כל מפתח חייב לעקוב אחר ההנחיות האלה כדי לשמור על עקביות.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Views & Layouts](#views--layouts)
7. [Icons](#icons)
8. [Animations](#animations)
9. [RTL Support](#rtl-support)
10. [Responsive Design](#responsive-design)
11. [Best Practices](#best-practices)

---

## Overview

### Design Philosophy
- **Premium & Modern**: Dark theme with glassmorphism effects
- **Data-Rich**: Multiple view types for different data consumption preferences
- **Accessible**: Clear hierarchy, proper contrast, readable fonts
- **Responsive**: Works on mobile, tablet, laptop, and desktop

### Tech Stack
- **Framework**: React + Vite
- **Icons**: Lucide React
- **Fonts**: Inter (body), Outfit (headings)
- **CSS**: Vanilla CSS with CSS Variables

---

## Color Palette

### Primary Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--primary` | `#667eea` | Main actions, links, focus states |
| `--primary-dark` | `#5568d3` | Hover states |
| `--primary-light` | `#8b9ef5` | Light accents |
| `--secondary` | `#f5576c` | Secondary actions |

### Semantic Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--success` | `#00f2fe` | Success states, positive values |
| `--warning` | `#fee140` | Warnings, low stock |
| `--danger` | `#ff6b6b` | Errors, delete actions |
| `--info` | `#4facfe` | Information, in-progress |

### Gradients
```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
```

### Background Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-primary` | `#0f0f1e` | Main background |
| `--bg-secondary` | `#1a1a2e` | Cards, sidebar |
| `--bg-tertiary` | `#252541` | Hover states |
| `--bg-card` | `rgba(255, 255, 255, 0.05)` | Card backgrounds |
| `--bg-hover` | `rgba(255, 255, 255, 0.08)` | Hover states |

### Text Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--text-primary` | `#ffffff` | Main text, headings |
| `--text-secondary` | `#b4b4c8` | Body text, descriptions |
| `--text-tertiary` | `#8888a0` | Muted text, labels |

### Border Colors
```css
--border-color: rgba(255, 255, 255, 0.1);
--border-hover: rgba(255, 255, 255, 0.2);
```

---

## Typography

### Font Families
```css
/* Body Text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Headings */
font-family: 'Outfit', 'Inter', sans-serif;
```

### Font Sizes
| Size | Value | Usage |
|------|-------|-------|
| xs | `0.75rem` (12px) | Badges, labels |
| sm | `0.875rem` (14px) | Body text, buttons |
| base | `1rem` (16px) | Default text |
| md | `1.125rem` (18px) | Card titles |
| lg | `1.25rem` (20px) | Section headers |
| xl | `1.5rem` (24px) | Page titles |
| 2xl | `2rem` (32px) | Dashboard headers |

### Font Weights
| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Buttons, labels |
| Semibold | 600 | Subheadings, badges |
| Bold | 700 | Headings, emphasis |

---

## Spacing

| Variable | Value | Usage |
|----------|-------|-------|
| `--spacing-xs` | `0.25rem` (4px) | Tight gaps |
| `--spacing-sm` | `0.5rem` (8px) | Small gaps |
| `--spacing-md` | `1rem` (16px) | Standard gaps |
| `--spacing-lg` | `1.5rem` (24px) | Section gaps |
| `--spacing-xl` | `2rem` (32px) | Page sections |
| `--spacing-2xl` | `3rem` (48px) | Major sections |

---

## Components

### Glass Card
```css
.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}
```

### Buttons
| Class | Usage |
|-------|-------|
| `.btn-primary` | Main actions (Save, Create) |
| `.btn-secondary` | Secondary actions |
| `.btn-outline` | Tertiary actions (Cancel) |
| `.btn-danger` | Destructive actions (Delete) |

Button sizes:
- Default: `padding: 0.75rem 1.5rem`
- Small (`.btn-sm`): `padding: 0.5rem 1rem`

### Form Inputs
```css
.form-input {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 0.75rem 1rem;
    color: var(--text-primary);
}

.form-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
```

### Badges / Status Tags
```css
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    /* צבע רקע ב-opacity נמוך עם צבע טקסט מלא */
    background: ${color}20;
    color: ${color};
}
```

### Toast Notifications
- Position: Bottom-right (LTR) / Bottom-left (RTL)
- Duration: 3 seconds
- Colors: Success (green), Error (red)

---

## Views & Layouts

### Available View Types
1. **Table View**: Spreadsheet-like, data-dense
2. **Grid View**: Cards in a responsive grid
3. **List View**: Compact horizontal rows
4. **Kanban View**: Columns by status/category
5. **Pipeline View**: Visual funnel
6. **Calendar View**: Date-based display
7. **Gantt View**: Timeline display (for orders/tasks)

### View Switcher Component
```jsx
<ViewSwitcher 
    currentView={currentView}
    onViewChange={setCurrentView}
    language={language}
    availableViews={[VIEW_TYPES.TABLE, VIEW_TYPES.GRID, VIEW_TYPES.LIST, VIEW_TYPES.KANBAN]}
/>
```

### Grouping (Monday.com / ClickUp Style)

The grouping system allows users to organize data into custom groups with drag-and-drop support.

#### Group Structure
```jsx
const [groups, setGroups] = useState([
    { 
        id: 'group-1', 
        name: 'VIP', 
        color: '#667eea', 
        itemIds: [],      // IDs of items in this group
        collapsed: false  // Whether group is collapsed
    },
    // ... more groups
]);
```

#### Required State
```jsx
// Groups state
const [groups, setGroups] = useState([...]);
const [showGroupView, setShowGroupView] = useState(false);
const [showAddGroupModal, setShowAddGroupModal] = useState(false);
const [newGroupName, setNewGroupName] = useState('');
const [draggedItem, setDraggedItem] = useState(null);
```

#### Group Handlers Pattern
```jsx
// Create new group
const addGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        itemIds: [],
        collapsed: false
    };
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setShowAddGroupModal(false);
};

// Toggle collapse
const toggleGroupCollapse = (groupId) => {
    setGroups(groups.map(g =>
        g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
    ));
};

// Move item to group
const moveItemToGroup = (itemId, targetGroupId) => {
    setGroups(groups.map(g => ({
        ...g,
        itemIds: g.id === targetGroupId
            ? [...g.itemIds.filter(id => id !== itemId), itemId]
            : g.itemIds.filter(id => id !== itemId)
    })));
};

// Delete group
const deleteGroup = (groupId) => {
    setGroups(groups.filter(g => g.id !== groupId));
};

// Get ungrouped items
const getUngroupedItems = () => {
    const allGroupedIds = groups.flatMap(g => g.itemIds);
    return filteredItems.filter(item => !allGroupedIds.includes(item.id));
};
```

#### Drag & Drop Handlers
```jsx
const handleDragStart = (e, itemId) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
};

const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
};

const handleDrop = (e, groupId) => {
    e.preventDefault();
    if (draggedItem) {
        moveItemToGroup(draggedItem, groupId);
        setDraggedItem(null);
    }
};
```

#### Groups Toggle in Header
```jsx
<button
    className={`btn btn-outline groups-btn ${showGroupView ? 'active' : ''}`}
    onClick={() => setShowGroupView(!showGroupView)}
>
    <Users size={18} />
    {language === 'he' ? 'קבוצות' : 'Groups'}
</button>
{showGroupView && (
    <button className="btn btn-outline" onClick={() => setShowAddGroupModal(true)}>
        <FolderPlus size={18} />
    </button>
)}
{!showGroupView && <ViewSwitcher ... />}
```

#### Groups View Structure
```jsx
<div className="groups-view">
    {groups.map(group => (
        <div className="group-section" onDrop={(e) => handleDrop(e, group.id)}>
            <div className="group-header" style={{ borderColor: group.color }}>
                <button onClick={() => toggleGroupCollapse(group.id)}>
                    {group.collapsed ? <ChevronRight /> : <ChevronDown />}
                </button>
                <div className="group-color" style={{ background: group.color }} />
                <span className="group-name">{group.name}</span>
                <span className="group-count">{group.itemIds.length}</span>
            </div>
            {!group.collapsed && (
                <div className="group-content">
                    {/* Items table or empty message */}
                </div>
            )}
        </div>
    ))}
    {/* Ungrouped section */}
</div>
```

#### CSS Classes for Groups
- `.groups-btn.active` - Active state for toggle button
- `.groups-view` - Container for groups view
- `.group-section` - Individual group container
- `.group-header` - Group header with color border
- `.group-color` - Color dot indicator
- `.group-name` - Group name text
- `.group-count` - Item count badge
- `.group-content` - Content area
- `.empty-group` - Empty state with dashed border
- `.drag-handle` - Drag handle for items

### Page Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Page Header (Title + Groups Toggle + Views)     │
├─────────────────────────────────────────────────┤
│ Toolbar (Search + Filters + Export)             │
├─────────────────────────────────────────────────┤
│ Content Area:                                   │
│   - If showGroupView: renderGroupsView()        │
│   - Else: renderContent() based on currentView  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🗂️ Groups Per Board - דרישות הטמעה

### חובה! כל הבורדים הרלוונטיים חייבים לתמוך בקבוצות בסגנון Monday.com

---

### ⚠️ הבהרה חשובה מאוד!

**קבוצות הן שכבת ארגון/סדר, לא תחליף לתצוגות!**

```
┌─────────────────────────────────────────────────┐
│ View Types (תצוגות):                            │
│   Table | Grid | List | Kanban | Calendar       │
├─────────────────────────────────────────────────┤
│ Groups (קבוצות) - שכבה מעל התצוגה:              │
│   ┌───────────────┐ ┌───────────────┐           │
│   │ קבוצה VIP     │ │ קבוצה חדשים   │           │
│   │ [פריטים...]   │ │ [פריטים...]   │           │
│   └───────────────┘ └───────────────┘           │
│   הקבוצות מופיעות בכל סוג תצוגה!                │
└─────────────────────────────────────────────────┘
```

**עקרונות:**
1. ✅ קבוצות עובדות **בתוך** כל סוגי התצוגות (טבלה, גריד, רשימה וכו')
2. ✅ כל תצוגה מציגה את הפריטים **מקובצים** לפי הקבוצות
3. ✅ המשתמש יכול להחליף תצוגה והקבוצות נשארות
4. ✅ צריך כפתור **"הסתר קבוצות ריקות"** - כדי לא לראות קבוצות ריקות למעלה
5. ❌ קבוצות לא מחליפות את התצוגות!

---

### 🔘 כפתורי UI נדרשים

```jsx
<div className="header-controls">
    {/* Toggle Groups */}
    <button onClick={() => setShowGroups(!showGroups)}>
        <Users size={18} />
        קבוצות
    </button>
    
    {/* Hide Empty Groups */}
    {showGroups && (
        <button onClick={() => setHideEmptyGroups(!hideEmptyGroups)}>
            {hideEmptyGroups ? <Eye /> : <EyeOff />}
            {hideEmptyGroups ? 'הצג קבוצות ריקות' : 'הסתר קבוצות ריקות'}
        </button>
    )}
    
    {/* View Switcher - Always available! */}
    <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
</div>
```

**States נדרשים:**
```jsx
const [showGroups, setShowGroups] = useState(true);     // מציג/מסתיר קבוצות
const [hideEmptyGroups, setHideEmptyGroups] = useState(true);  // מסתיר קבוצות ריקות
const [currentView, setCurrentView] = useState('table');  // סוג תצוגה
```

---

### 📋 רשימת הבורדים ודרישות הקבוצות שלהם

| בורד | צריך קבוצות? | קבוצות ברירת מחדל | סטטוס |
|------|--------------|-------------------|--------|
| **Customers** (לקוחות) | ✅ כן | VIP, לקוחות חדשים, לא פעילים | ✅ הוטמע |
| **Products** (מוצרים) | ✅ כן | מוצרים חמים, מלאי נמוך, מוצרים חדשים | ✅ הוטמע |
| **Leads** (לידים) | ✅ כן | חם, קר, VIP, מאתר, מהפניה | ⏳ עדיין לא |
| **Orders** (הזמנות) | ✅ כן | בהמתנה, בייצור, מוכן למשלוח, הושלם | ⏳ עדיין לא |
| **Tasks** (משימות) | ✅ כן | היום, השבוע, בעתיד, הושלם | ⏳ עדיין לא |
| **Workflows** (תהליכים) | ❌ לא | - | לא רלוונטי |
| **Dashboard** (דשבורד) | ❌ לא | - | לא רלוונטי |
| **Calendar** (לוח שנה) | ❌ לא | - | לא רלוונטי |
| **Users** (משתמשים) | ✅ אופציונלי | לפי מחלקה | ⏳ עדיין לא |
| **Departments** (מחלקות) | ❌ לא | - | לא רלוונטי |

---

### 📦 דרישות הטמעה לכל בורד

#### 1. Customers (לקוחות) ✅
**LocalStorage Key:** `customers-groups`
**קבוצות ברירת מחדל:**
```javascript
[
    { id: 'group-1', name: 'VIP', color: '#667eea', itemIds: [], collapsed: false },
    { id: 'group-2', name: 'לקוחות חדשים', color: '#00f2fe', itemIds: [], collapsed: false },
    { id: 'group-3', name: 'לא פעילים', color: '#8888a0', itemIds: [], collapsed: false }
]
```
**שדות להציג בכל פריט:**
- שם לקוח + חברה
- אימייל
- טלפון
- סטטוס (פעיל/לא פעיל)
- כפתורי פעולה (עריכה, מחיקה)

---

#### 2. Products (מוצרים) ✅
**LocalStorage Key:** `products-groups`
**קבוצות ברירת מחדל:**
```javascript
[
    { id: 'group-1', name: 'מוצרים חמים', color: '#f5576c', itemIds: [], collapsed: false },
    { id: 'group-2', name: 'מלאי נמוך', color: '#fee140', itemIds: [], collapsed: false },
    { id: 'group-3', name: 'מוצרים חדשים', color: '#00f2fe', itemIds: [], collapsed: false }
]
```
**שדות להציג בכל פריט:**
- שם מוצר + תמונה
- SKU
- מחיר
- מלאי
- קטגוריה
- סטטוס
- כפתורי פעולה

---

#### 3. Leads (לידים) ⏳ לא הוטמע
**LocalStorage Key:** `leads-groups`
**קבוצות ברירת מחדל מומלצות:**
```javascript
[
    { id: 'group-1', name: 'לידים חמים', color: '#f5576c', itemIds: [], collapsed: false },
    { id: 'group-2', name: 'לידים קרים', color: '#4facfe', itemIds: [], collapsed: false },
    { id: 'group-3', name: 'VIP', color: '#667eea', itemIds: [], collapsed: false },
    { id: 'group-4', name: 'מאתר', color: '#00f2fe', itemIds: [], collapsed: false },
    { id: 'group-5', name: 'מהפניה', color: '#fee140', itemIds: [], collapsed: false }
]
```
**שדות להציג בכל פריט:**
- שם איש קשר + חברה
- אימייל
- טלפון
- מקור (Source)
- שלב (Stage) עם צבע
- ערך משוער
- תאריך מעקב הבא
- כפתורי פעולה

**סוגי תצוגות נדרשים:**
| תצוגה | סטטוס | הערות |
|-------|--------|-------|
| Table | ⏳ חסר | טבלה עם כל הפרטים |
| Grid | ⏳ חסר | כרטיסים בגריד |
| List | ⏳ חסר | רשימה קומפקטית |
| Kanban | ⏳ חסר | עמודות לפי מקור (Source) |
| Pipeline | ✅ קיים | עמודות לפי שלב (Stage) - כבר מומש |
| Calendar | ⏳ חסר | לפי תאריך מעקב הבא |

**הערה חשובה:** 
כרגע עמוד ה-Leads כולל רק Pipeline View. צריך להוסיף:
1. ViewSwitcher עם כל סוגי התצוגות
2. Groups support עם drag & drop
3. כפתור "הסתר קבוצות ריקות"
4. שמירה ב-localStorage

---

#### 4. Orders (הזמנות) ⏳ לא הוטמע
**LocalStorage Key:** `orders-groups`
**קבוצות ברירת מחדל מומלצות:**
```javascript
[
    { id: 'group-1', name: 'ממתין', color: '#fee140', itemIds: [], collapsed: false },
    { id: 'group-2', name: 'בייצור', color: '#4facfe', itemIds: [], collapsed: false },
    { id: 'group-3', name: 'מוכן למשלוח', color: '#667eea', itemIds: [], collapsed: false },
    { id: 'group-4', name: 'הושלם', color: '#00f2fe', itemIds: [], collapsed: false },
    { id: 'group-5', name: 'דחוף', color: '#f5576c', itemIds: [], collapsed: false }
]
```
**שדות להציג בכל פריט:**
- מספר הזמנה
- שם לקוח
- סכום
- תאריך
- סטטוס
- כפתורי פעולה

---

#### 5. Tasks (משימות) ⏳ לא הוטמע
**LocalStorage Key:** `tasks-groups`
**קבוצות ברירת מחדל מומלצות:**
```javascript
[
    { id: 'group-1', name: 'היום', color: '#f5576c', itemIds: [], collapsed: false },
    { id: 'group-2', name: 'השבוע', color: '#fee140', itemIds: [], collapsed: false },
    { id: 'group-3', name: 'בהמשך', color: '#4facfe', itemIds: [], collapsed: false },
    { id: 'group-4', name: 'הושלם', color: '#00f2fe', itemIds: [], collapsed: false }
]
```
**שדות להציג בכל פריט:**
- כותרת משימה
- מחלקה
- עדיפות
- תאריך יעד
- סטטוס
- כפתורי פעולה

---

### 🔧 States חובה לכל בורד עם קבוצות

כל בורד שתומך בקבוצות **חייב** לכלול את ה-states הבאים:

```jsx
// Groups state - load from localStorage
const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('BOARD_NAME-groups');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse groups', e);
        }
    }
    return [/* default groups */];
});

// Group view toggle
const [showGroupView, setShowGroupView] = useState(false);

// Add group modal
const [showAddGroupModal, setShowAddGroupModal] = useState(false);

// New group name input
const [newGroupName, setNewGroupName] = useState('');

// Save groups to localStorage when they change
useEffect(() => {
    localStorage.setItem('BOARD_NAME-groups', JSON.stringify(groups));
}, [groups]);
```

---

### 🎯 פונקציות חובה

כל בורד עם קבוצות **חייב** לכלול את הפונקציות הבאות:

| פונקציה | תיאור |
|---------|--------|
| `addGroup()` | יצירת קבוצה חדשה |
| `toggleGroupCollapse(groupId)` | פתיחה/סגירה של קבוצה |
| `moveItemToGroup(itemId, groupId)` | העברת פריט לקבוצה |
| `deleteGroup(groupId)` | מחיקת קבוצה (אופציונלי) |
| `getUngroupedItems()` | קבלת פריטים שלא בקבוצה |
| `renderItemForGroup(item)` | רינדור פריט בתוך קבוצה |

---

### 🧩 שימוש בקומפוננט GroupedBoard (מומלץ!)

במקום לממש מחדש את הלוגיקה, יש להשתמש בקומפוננט `GroupedBoard`:

```jsx
import GroupedBoard from '../components/GroupedBoard';

// בתוך renderContent:
return (
    <GroupedBoard
        items={filteredItems}
        groups={groups}
        onGroupsChange={setGroups}
        renderItem={renderItemCard}
        itemIdField="id"
        language={language}
        emptyStateIcon={<Package size={48} />}
        emptyStateText={language === 'he' ? 'לא נמצאו פריטים' : 'No items found'}
    />
);
```

**Props של GroupedBoard:**
| Prop | Type | תיאור |
|------|------|--------|
| `items` | Array | מערך הפריטים המפולטרים |
| `groups` | Array | מערך הקבוצות |
| `onGroupsChange` | Function | פונקציה לעדכון קבוצות |
| `renderItem` | Function | פונקציה לרינדור פריט |
| `itemIdField` | String | שם השדה של ה-ID (ברירת מחדל: "id") |
| `language` | String | שפה נוכחית |
| `emptyStateIcon` | JSX | אייקון למצב ריק |
| `emptyStateText` | String | טקסט למצב ריק |

---

### ✅ צ'קליסט להטמעת קבוצות בבורד חדש

- [ ] הוספת LocalStorage key ייחודי
- [ ] הגדרת קבוצות ברירת מחדל
- [ ] הוספת כל ה-states הנדרשים
- [ ] הוספת useEffect לשמירה ב-localStorage
- [ ] הוספת כפתור "Groups" בהדר
- [ ] הוספת כפתור "New Group"
- [ ] יצירת פונקציית `renderItemCard`
- [ ] שימוש ב-`GroupedBoard` component
- [ ] הוספת Modal לקבוצה חדשה
- [ ] בדיקה בעברית ובאנגלית
- [ ] בדיקה ברזולוציות שונות

---

## Icons

### Icon Library
Using **Lucide React** for all icons.

```jsx
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
```

### Icon Sizes
| Size | Pixels | Usage |
|------|--------|-------|
| xs | 12 | Inline text |
| sm | 14-16 | Buttons, badges |
| md | 18-20 | Actions, nav |
| lg | 24 | Headers |
| xl | 40-48 | Empty states |

### Common Icons
| Icon | Usage |
|------|-------|
| `Plus` | Add new item |
| `Search` | Search input |
| `Filter` | Filter options |
| `Eye` | View details |
| `Edit` | Edit item |
| `Trash2` | Delete item |
| `Check` | Save, Complete |
| `X` | Close, Cancel |
| `ChevronDown/Up` | Expand/Collapse |
| `MoreHorizontal` | More options |

---

## Animations

### CSS Variables
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Standard Animations
```css
/* Fade In */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Card Hover */
.card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
}
```

### Loading States
- Use `<Loader2 className="spinner" />` with spin animation
- Show skeleton placeholders for content loading

---

## RTL Support

### Language Detection
```jsx
const isRTL = language === 'he';
```

### Direction Classes
```css
[dir="rtl"] .element {
    /* RTL-specific styles */
}
```

### Key Considerations
- Sidebar on the right for Hebrew
- Text alignment adjusts automatically
- Icons that indicate direction should flip

---

## 📱 Responsive Design - חובה לכל המכשירים!

### ⚠️ חשוב מאוד!
**כל רכיב וכל דף חייב לעבוד ולהיראות טוב ב-4 סוגי מסכים:**

---

### 🖥️ Device Breakpoints

| Name | Width | מכשירים טיפוסיים | דרישות |
|------|-------|------------------|---------|
| **Mobile** | < 640px | iPhone, Android phones | תצוגה עמודית, תפריט המבורגר |
| **Tablet** | 640px - 1024px | iPad, Android tablets | תצוגה גמישה, 2 עמודות |
| **Laptop** | 1024px - 1440px | MacBook, laptops קטנים | תמיכה מלאה בסיידבר |
| **Desktop** | > 1440px | מסכים גדולים | ניצול מקסימלי של שטח |

---

### 📐 CSS Media Queries

```css
/* Mobile - Phones */
@media (max-width: 639px) {
    .sidebar { display: none; }
    .hamburger-menu { display: flex; }
    .cards-grid { grid-template-columns: 1fr; }
    .table-container { overflow-x: auto; }
    .modal-content { width: 95%; margin: 10px; }
}

/* Tablet - iPad, Android Tablets */
@media (min-width: 640px) and (max-width: 1023px) {
    .sidebar { width: 80px; }
    .sidebar .nav-label { display: none; }
    .cards-grid { grid-template-columns: repeat(2, 1fr); }
    .modal-content { width: 90%; max-width: 600px; }
}

/* Laptop - MacBook, Small Laptops */
@media (min-width: 1024px) and (max-width: 1439px) {
    .sidebar { width: 240px; }
    .cards-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Desktop - Large Screens */
@media (min-width: 1440px) {
    .sidebar { width: 280px; }
    .cards-grid { grid-template-columns: repeat(4, 1fr); }
    .page-content { max-width: 1800px; margin: 0 auto; }
}
```

---

### 📱 Mobile-Specific Requirements

| רכיב | התנהגות במובייל |
|------|-----------------|
| **Sidebar** | הופך לתפריט המבורגר מתקפל |
| **Tables** | גלילה אופקית עם sticky עמודה ראשונה |
| **Cards Grid** | עמודה אחת |
| **Modals** | רוחב 95%, גובה מקסימלי 90vh |
| **Buttons** | מינימום 44px גובה (touch-friendly) |
| **Forms** | שדות ברוחב מלא, כפתורים מוערמים |
| **Kanban** | גלילה אופקית בין עמודות |
| **Groups** | כותרות מתכווצות, קבוצות מתקפלןת |
| **Search** | מסתתר ונפתח בלחיצה |
| **Filters** | נפתחים כ-modal/dropdown |

---

### 📐 Tablet (iPad) Requirements

| רכיב | התנהגות בטאבלט |
|------|----------------|
| **Sidebar** | מכווץ לאייקונים בלבד |
| **Tables** | עמודות נבחרות, השאר מוסתרות |
| **Cards Grid** | 2 עמודות |
| **Modals** | 90% רוחב, מקסימום 600px |
| **Groups** | תצוגה מלאה עם הקטנת font |

---

### 💻 Laptop (MacBook) Requirements

| רכיב | התנהגות בלפטופ |
|------|----------------|
| **Sidebar** | מלא עם טקסט, אפשרות לכיווץ |
| **Tables** | כל העמודות |
| **Cards Grid** | 3 עמודות |
| **Modals** | 80% רוחב, מקסימום 800px |

---

### 🖥️ Desktop Requirements

| רכיב | התנהגות בדסקטופ |
|------|-----------------|
| **Sidebar** | מלא ורחב יותר |
| **Content** | ממורכז עם max-width |
| **Cards Grid** | 4+ עמודות |
| **Side Panels** | אפשרות לפאנלים צדדיים |

---

### ✅ Responsive Checklist

בכל רכיב חדש, וודא:

- [ ] **Mobile Portrait** (320px - 414px) - עובד?
- [ ] **Mobile Landscape** (568px - 812px) - עובד?
- [ ] **iPad Portrait** (768px) - עובד?
- [ ] **iPad Landscape** (1024px) - עובד?
- [ ] **MacBook Air** (1280px) - עובד?
- [ ] **MacBook Pro** (1440px) - עובד?
- [ ] **Desktop 1080p** (1920px) - עובד?
- [ ] **Desktop 4K** (2560px+) - עובד?

---

### 🎨 Text Contrast Requirements - חשוב!

**בעיה נפוצה: טקסט כהה על רקע כהה**

```css
/* ❌ WRONG - קשה לקרוא */
.dark-bg { background: #1a1a2e; }
.dark-text { color: #333; }

/* ✅ CORRECT - ניגודיות טובה */
.dark-bg { background: #1a1a2e; }
.light-text { color: #ffffff; }
.muted-text { color: #b4b4c8; }
```

**כללי ניגודיות:**
- רקע כהה = טקסט בהיר (לבן או אפור בהיר)
- רקע בהיר = טקסט כהה
- יחס ניגודיות מינימלי: 4.5:1 לטקסט רגיל, 3:1 לטקסט גדול
- בדוק ב-WCAG Contrast Checker

**צבעי טקסט מומלצים על רקע כהה:**
| סוג | צבע | שימוש |
|-----|------|-------|
| Primary | `#ffffff` | כותרות, טקסט חשוב |
| Secondary | `#b4b4c8` | תיאורים, body text |
| Muted | `#8888a0` | labels, hints |
| Disabled | `#5a5a70` | אלמנטים לא פעילים |

---

## Best Practices

### Do's ✅
1. **Use CSS Variables** - Never hardcode colors or spacing
2. **Consistent Spacing** - Use spacing variables only
3. **Glass Cards** - Use `.glass-card` for card elements
4. **Semantic Colors** - Green for success, red for errors
5. **Loading States** - Always show loading indicators
6. **Empty States** - Provide helpful messages when no data
7. **Hover Effects** - Subtle animations on interactive elements
8. **Keyboard Navigation** - Ensure focusable elements are accessible

### Don'ts ❌
1. **Don't use plain colors** - Use gradients for buttons
2. **Don't skip transitions** - All state changes should animate
3. **Don't ignore RTL** - Test every feature in Hebrew
4. **Don't hardcode text** - Use translation function `t()`
5. **Don't mix icon libraries** - Only use Lucide React
6. **Don't skip error states** - Always handle API errors gracefully

### Code Structure
```
src/
├── components/          # Reusable components
│   ├── Modal.jsx
│   ├── ViewSwitcher.jsx
│   └── ExportDropdown.jsx
├── pages/               # Page components
│   ├── Customers.jsx
│   ├── Customers.css
│   └── ...
├── services/            # API services
│   └── api.js
├── contexts/            # React contexts
│   ├── AuthContext.jsx
│   └── LanguageContext.jsx
├── data/                # Static data
│   └── mockData.js
└── index.css            # Global styles & variables
```

---

## Component Checklist

When creating a new page component:

- [ ] Import ViewSwitcher if multiple views needed
- [ ] State for: `loading`, `error`, `data`, `searchTerm`, `filters`
- [ ] Use `glass-card` class for containers
- [ ] Implement loading and error states
- [ ] Add toast notifications for actions
- [ ] Support Hebrew, English, Ukrainian labels
- [ ] Test RTL layout
- [ ] Make responsive (mobile/tablet/desktop)
- [ ] Add empty state for no data
- [ ] Use semantic color coding

---

*Last Updated: December 2024*
