// Translation system for Hebrew and Ukrainian
// Hebrew is the default, Ukrainian is for overseas departments

export const translations = {
    he: {
        // Navigation
        dashboard: 'Dashboard',
        customers: 'לקוחות',
        leads: 'לידים',
        products: 'מוצרים',
        orders: 'הזמנות',
        tasks: 'משימות',
        workflows: 'תהליכים',
        departments: 'מחלקות',
        parameters: 'פרמטרים',
        assets: 'ספריית נכסים',
        stockOrders: 'ייצור למלאי',
        materials: 'חומרי גלם',
        import: 'ייבוא',
        calendar: 'לוח שנה',
        analytics: 'אנליטיקס',
        users: 'משתמשים',
        settings: 'הגדרות',

        // Common
        search: 'חיפוש...',
        filter: 'סינון',
        export: 'ייצוא',
        add: 'הוסף',
        edit: 'עריכה',
        delete: 'מחיקה',
        save: 'שמור',
        cancel: 'ביטול',
        view: 'צפייה',
        viewAs: 'צפייה כ:',
        all: 'הכל',

        // Roles
        admin: 'מנהל ראשי',
        manager: 'מנהל',
        employee: 'עובד',

        // Status
        active: 'פעיל',
        inactive: 'לא פעיל',
        pending: 'ממתין',
        inProgress: 'בביצוע',
        completed: 'הושלם',
        blocked: 'חסום',
        cancelled: 'בוטל',
        processing: 'בעיבוד',

        // Dashboard
        totalRevenue: 'סה"כ הכנסות',
        totalOrders: 'הזמנות',
        totalCustomers: 'לקוחות',
        activeTasks: 'משימות פעילות',
        recentActivity: 'פעילות אחרונה',
        revenueTrend: 'מגמת הכנסות',
        tasksByStatus: 'משימות לפי סטטוס',
        tasksByDepartment: 'משימות לפי מחלקה',
        myTasks: 'המשימות שלי',
        openTasks: 'משימות פתוחות',
        welcome: 'שלום',

        // Customers
        customerName: 'שם',
        company: 'חברה',
        email: 'אימייל',
        phone: 'טלפון',
        status: 'סטטוס',
        totalOrdersCount: 'הזמנות',
        totalSpent: 'סה"כ קניות',
        actions: 'פעולות',
        newCustomer: 'לקוח חדש',

        // Products
        productName: 'שם מוצר',
        sku: 'מק"ט',
        price: 'מחיר',
        stock: 'מלאי',
        category: 'קטגוריה',
        outOfStock: 'אזל מהמלאי',
        lowStock: 'מלאי נמוך',
        newProduct: 'מוצר חדש',
        ritual: 'יודאיקה',
        furniture: 'ריהוט',
        personal: 'אישי',

        // Orders
        orderNumber: 'מספר הזמנה',
        customer: 'לקוח',
        items: 'פריטים',
        total: 'סה"כ',
        date: 'תאריך',
        notes: 'הערות',
        orderItems: 'פריטי הזמנה',
        newOrder: 'הזמנה חדשה',
        updateStatus: 'עדכון סטטוס',
        fullView: 'צפייה מלאה',

        // Tasks
        taskTitle: 'כותרת',
        priority: 'עדיפות',
        dueDate: 'תאריך יעד',
        assignedTo: 'משויך ל',
        assign: 'הקצאה',
        startWork: 'התחל עבודה',
        completeTask: 'סיום משימה',
        noTasks: 'אין משימות',
        days: 'ימים',
        newTask: 'משימה חדשה',
        high: 'גבוה',
        medium: 'בינוני',
        low: 'נמוך',

        // Workflows
        workflowName: 'שם תהליך',
        steps: 'שלבים',
        productsCount: 'מוצרים',
        addStep: 'הוסף שלב',
        newWorkflow: 'תהליך חדש',
        workflowSteps: 'שלבי התהליך',

        // Departments
        departmentName: 'שם מחלקה',
        employees: 'עובדים',
        newDepartment: 'מחלקה חדשה',

        // Parameters
        parameterName: 'שם פרמטר',
        type: 'סוג',
        required: 'חובה',
        options: 'אפשרויות',
        addOption: 'הוסף אפשרות',
        priceImpact: 'השפעה על מחיר',
        newParameter: 'פרמטר חדש',
        text: 'טקסט',
        select: 'בחירה',
        color: 'צבע',
        number: 'מספר',
        dateType: 'תאריך',

        // Calendar
        newEvent: 'אירוע חדש',
        upcomingEvents: 'אירועים קרובים',
        meeting: 'פגישה',
        call: 'שיחה',
        video: 'וידאו',
        task: 'משימה',

        // Analytics
        salesAnalytics: 'נתוני מכירות',
        topProducts: 'מוצרים מובילים',
        teamPerformance: 'ביצועי צוות',
        averageOrder: 'ממוצע הזמנה',
        workload: 'עומס עבודה',

        // Settings
        profile: 'פרטי חשבון',
        firstName: 'שם פרטי',
        lastName: 'שם משפחה',
        notifications: 'התראות',
        emailNotifications: 'התראות אימייל',
        pushNotifications: 'התראות Push',
        smsNotifications: 'התראות SMS',
        appearance: 'מראה',
        theme: 'ערכת נושא',
        dark: 'כהה',
        light: 'בהיר',
        auto: 'אוטומטי',
        primaryColor: 'צבע ראשי',
        security: 'אבטחה',
        currentPassword: 'סיסמה נוכחית',
        newPassword: 'סיסמה חדשה',
        confirmPassword: 'אימות סיסמה',
        updatePassword: 'עדכון סיסמה',
        saveChanges: 'שמור שינויים',

        // Users
        userManagement: 'ניהול משתמשים',
        newUser: 'משתמש חדש',
        role: 'תפקיד',
        department: 'מחלקה',
        permissions: 'הרשאות',
        noAccess: 'אין הרשאה',
        adminOnly: 'רק מנהלים ראשיים יכולים לגשת לדף זה',

        // Language
        language: 'שפה',
        hebrew: 'עברית',
        ukrainian: 'אוקראינית'
    },

    uk: {
        // Navigation
        dashboard: 'Головна',
        customers: 'Клієнти',
        leads: 'Ліди',
        products: 'Продукти',
        orders: 'Замовлення',
        tasks: 'Завдання',
        workflows: 'Процеси',
        departments: 'Відділи',
        parameters: 'Параметри',
        assets: 'Бібліотека активів',
        stockOrders: 'Виробництво на склад',
        materials: 'Матеріали',
        import: 'Імпорт',
        calendar: 'Календар',
        analytics: 'Аналітика',
        users: 'Користувачі',
        settings: 'Налаштування',

        // Common
        search: 'Пошук...',
        filter: 'Фільтр',
        export: 'Експорт',
        add: 'Додати',
        edit: 'Редагувати',
        delete: 'Видалити',
        save: 'Зберегти',
        cancel: 'Скасувати',
        view: 'Переглянути',
        viewAs: 'Переглянути як:',
        all: 'Всі',

        // Roles
        admin: 'Головний адміністратор',
        manager: 'Менеджер',
        employee: 'Співробітник',

        // Status
        active: 'Активний',
        inactive: 'Неактивний',
        pending: 'Очікує',
        inProgress: 'В роботі',
        completed: 'Виконано',
        blocked: 'Заблоковано',
        cancelled: 'Скасовано',
        processing: 'Обробка',

        // Dashboard
        totalRevenue: 'Загальний дохід',
        totalOrders: 'Замовлення',
        totalCustomers: 'Клієнти',
        activeTasks: 'Активні завдання',
        recentActivity: 'Остання активність',
        revenueTrend: 'Тренд доходів',
        tasksByStatus: 'Завдання за статусом',
        tasksByDepartment: 'Завдання за відділом',
        myTasks: 'Мої завдання',
        openTasks: 'Відкриті завдання',
        welcome: 'Привіт',

        // Customers
        customerName: 'Ім\'я',
        company: 'Компанія',
        email: 'Електронна пошта',
        phone: 'Телефон',
        status: 'Статус',
        totalOrdersCount: 'Замовлення',
        totalSpent: 'Загальні витрати',
        actions: 'Дії',
        newCustomer: 'Новий клієнт',

        // Products
        productName: 'Назва продукту',
        sku: 'Артикул',
        price: 'Ціна',
        stock: 'Запас',
        category: 'Категорія',
        outOfStock: 'Немає в наявності',
        lowStock: 'Низький запас',
        newProduct: 'Новий продукт',
        ritual: 'Юдаїка',
        furniture: 'Меблі',
        personal: 'Особисте',

        // Orders
        orderNumber: 'Номер замовлення',
        customer: 'Клієнт',
        items: 'Товари',
        total: 'Всього',
        date: 'Дата',
        notes: 'Примітки',
        orderItems: 'Товари замовлення',
        newOrder: 'Нове замовлення',
        updateStatus: 'Оновити статус',
        fullView: 'Повний перегляд',

        // Tasks
        taskTitle: 'Назва',
        priority: 'Пріоритет',
        dueDate: 'Термін',
        assignedTo: 'Призначено',
        assign: 'Призначити',
        startWork: 'Почати роботу',
        completeTask: 'Завершити завдання',
        noTasks: 'Немає завдань',
        days: 'днів',
        newTask: 'Нове завдання',
        high: 'Високий',
        medium: 'Середній',
        low: 'Низький',

        // Workflows
        workflowName: 'Назва процесу',
        steps: 'Кроки',
        productsCount: 'Продукти',
        addStep: 'Додати крок',
        newWorkflow: 'Новий процес',
        workflowSteps: 'Кроки процесу',

        // Departments
        departmentName: 'Назва відділу',
        employees: 'Співробітники',
        newDepartment: 'Новий відділ',

        // Parameters
        parameterName: 'Назва параметра',
        type: 'Тип',
        required: 'Обов\'язково',
        options: 'Опції',
        addOption: 'Додати опцію',
        priceImpact: 'Вплив на ціну',
        newParameter: 'Новий параметр',
        text: 'Текст',
        select: 'Вибір',
        color: 'Колір',
        number: 'Число',
        dateType: 'Дата',

        // Calendar
        newEvent: 'Нова подія',
        upcomingEvents: 'Майбутні події',
        meeting: 'Зустріч',
        call: 'Дзвінок',
        video: 'Відео',
        task: 'Завдання',

        // Analytics
        salesAnalytics: 'Аналітика продажів',
        topProducts: 'Топ продукти',
        teamPerformance: 'Продуктивність команди',
        averageOrder: 'Середнє замовлення',
        workload: 'Навантаження',

        // Settings
        profile: 'Профіль',
        firstName: 'Ім\'я',
        lastName: 'Прізвище',
        notifications: 'Сповіщення',
        emailNotifications: 'Email сповіщення',
        pushNotifications: 'Push сповіщення',
        smsNotifications: 'SMS сповіщення',
        appearance: 'Зовнішній вигляд',
        theme: 'Тема',
        dark: 'Темна',
        light: 'Світла',
        auto: 'Авто',
        primaryColor: 'Основний колір',
        security: 'Безпека',
        currentPassword: 'Поточний пароль',
        newPassword: 'Новий пароль',
        confirmPassword: 'Підтвердити пароль',
        updatePassword: 'Оновити пароль',
        saveChanges: 'Зберегти зміни',

        // Users
        userManagement: 'Управління користувачами',
        newUser: 'Новий користувач',
        role: 'Роль',
        department: 'Відділ',
        permissions: 'Дозволи',
        noAccess: 'Немає доступу',
        adminOnly: 'Тільки головні адміністратори мають доступ до цієї сторінки',

        // Language
        language: 'Мова',
        hebrew: 'Іврит',
        ukrainian: 'Українська'
    }
};

// Departments that use Ukrainian (עיצוב רקמה ומפעל ייצור)
export const ukrainianDepartments = ['dept-1', 'dept-6']; // עיצוב רקמה ומפעל ייצור - באוקראינה

// English translations
translations.en = {
    // Navigation
    dashboard: 'Dashboard',
    customers: 'Customers',
    leads: 'Leads',
    products: 'Products',
    orders: 'Orders',
    tasks: 'Tasks',
    workflows: 'Workflows',
    departments: 'Departments',
    parameters: 'Parameters',
    assets: 'Asset Library',
    stockOrders: 'Stock Production',
    materials: 'Materials',
    import: 'Import',
    calendar: 'Calendar',
    analytics: 'Analytics',
    users: 'Users',
    settings: 'Settings',

    // Common
    search: 'Search...',
    filter: 'Filter',
    export: 'Export',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    view: 'View',
    viewAs: 'View as:',
    all: 'All',
    close: 'Close',
    confirm: 'Confirm',

    // Roles
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Employee',

    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    blocked: 'Blocked',
    cancelled: 'Cancelled',
    processing: 'Processing',

    // Dashboard
    totalRevenue: 'Total Revenue',
    totalOrders: 'Orders',
    totalCustomers: 'Customers',
    activeTasks: 'Active Tasks',
    recentActivity: 'Recent Activity',
    revenueTrend: 'Revenue Trend',
    tasksByStatus: 'Tasks by Status',
    tasksByDepartment: 'Tasks by Department',
    myTasks: 'My Tasks',
    openTasks: 'Open Tasks',
    welcome: 'Welcome',

    // Customers
    customerName: 'Name',
    company: 'Company',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    totalOrdersCount: 'Orders',
    totalSpent: 'Total Spent',
    actions: 'Actions',
    newCustomer: 'New Customer',

    // Products
    productName: 'Product Name',
    sku: 'SKU',
    price: 'Price',
    stock: 'Stock',
    category: 'Category',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    newProduct: 'New Product',
    ritual: 'Judaica',
    furniture: 'Furniture',
    personal: 'Personal',

    // Orders
    orderNumber: 'Order Number',
    customer: 'Customer',
    items: 'Items',
    total: 'Total',
    date: 'Date',
    notes: 'Notes',
    orderItems: 'Order Items',
    newOrder: 'New Order',
    updateStatus: 'Update Status',
    fullView: 'Full View',

    // Tasks
    taskTitle: 'Title',
    priority: 'Priority',
    dueDate: 'Due Date',
    assignedTo: 'Assigned To',
    assign: 'Assign',
    startWork: 'Start Work',
    completeTask: 'Complete Task',
    noTasks: 'No Tasks',
    days: 'days',
    newTask: 'New Task',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Workflows
    workflowName: 'Workflow Name',
    steps: 'Steps',
    productsCount: 'Products',
    addStep: 'Add Step',
    newWorkflow: 'New Workflow',
    workflowSteps: 'Workflow Steps',

    // Departments
    departmentName: 'Department Name',
    employees: 'Employees',
    newDepartment: 'New Department',

    // Parameters
    parameterName: 'Parameter Name',
    type: 'Type',
    required: 'Required',
    options: 'Options',
    addOption: 'Add Option',
    priceImpact: 'Price Impact',
    newParameter: 'New Parameter',
    text: 'Text',
    select: 'Select',
    color: 'Color',
    number: 'Number',
    dateType: 'Date',

    // Calendar
    newEvent: 'New Event',
    upcomingEvents: 'Upcoming Events',
    meeting: 'Meeting',
    call: 'Call',
    video: 'Video',
    task: 'Task',

    // Analytics
    salesAnalytics: 'Sales Analytics',
    topProducts: 'Top Products',
    teamPerformance: 'Team Performance',
    averageOrder: 'Average Order',
    workload: 'Workload',

    // Settings
    profile: 'Profile',
    firstName: 'First Name',
    lastName: 'Last Name',
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    smsNotifications: 'SMS Notifications',
    appearance: 'Appearance',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    auto: 'Auto',
    primaryColor: 'Primary Color',
    security: 'Security',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    updatePassword: 'Update Password',
    saveChanges: 'Save Changes',

    // Users
    userManagement: 'User Management',
    newUser: 'New User',
    role: 'Role',
    department: 'Department',
    permissions: 'Permissions',
    noAccess: 'No Access',
    adminOnly: 'Only administrators can access this page',

    // Language
    language: 'Language',
    hebrew: 'Hebrew',
    ukrainian: 'Ukrainian',
    english: 'English'
};

// Get language for user based on department
export const getUserLanguage = (user) => {
    if (user.departmentId && ukrainianDepartments.includes(user.departmentId)) {
        return 'uk';
    }
    return 'he';
};

// Translation hook helper
export const useTranslation = (language = 'he') => {
    const t = (key) => {
        return translations[language]?.[key] || translations.he[key] || key;
    };
    return { t, language };
};

// Get translated value or fallback
export const t = (key, language = 'he') => {
    return translations[language]?.[key] || translations.he[key] || key;
};
