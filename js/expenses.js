let currentUser = null;
let allExpenses = [];
let filteredExpenses = [];
let pivotData = {};
let userCategories = [];
let itemSuggestions = [];
let currentEditingCategory = null;
let categoryLocked = true;
let newCategoryIcon = '📌';
let editingCategoryId = null;
let pieChart = null;
let barChart = null;
let lineChart = null;
let currentPivotView = 'table';

const defaultCategories = [
    { name: 'Groceries', icon: '🛒' },
    { name: 'Personal', icon: '👤' },
    { name: 'Shop', icon: '🏪' },
    { name: 'Bills/Tax', icon: '💳' },
    { name: 'Transport', icon: '🏭' },
    { name: 'Education', icon: '🏫' },
    { name: 'Rent', icon: '🏛️' },
    { name: 'Medical', icon: '⚕️' },
    { name: 'Food', icon: '🍽️' },
    { name: 'Mobile/Internet', icon: '📱' },
    { name: 'Clothing', icon: '👗' },
    { name: 'Entertainment', icon: '🎮' },
    { name: 'Others', icon: '💼' }
];

const spellingMap = {
    'grocerys': 'Groceries', 'grocery': 'Groceries', 'groceris': 'Groceries',
    'bazar': 'Groceries', 'bajar': 'Groceries', 'market': 'Groceries',
    'personel': 'Personal', 'parsonal': 'Personal',
    'byaktigat': 'Personal', 'bektigot': 'Personal',
    'bil': 'Bills/Tax', 'bill': 'Bills/Tax', 'tax': 'Bills/Tax',
    'transport': 'Transport', 'transprt': 'Transport', 'travel': 'Transport',
    'jatayat': 'Transport', 'jatajat': 'Transport',
    'education': 'Education', 'educaton': 'Education', 'study': 'Education',
    'sikha': 'Education', 'shikha': 'Education', 'porasona': 'Education',
    'rent': 'Rent', 'vara': 'Rent', 'bhara': 'Rent',
    'medical': 'Medical', 'medicine': 'Medical', 'doctor': 'Doctor', 'hospital': 'Hospital',
    'chikitsa': 'Medical', 'osudh': 'Medical', 'oushodh': 'Medical',
    'food': 'Food', 'khabar': 'Food', 'khawa': 'Food',
    'mobile': 'Mobile/Internet', 'internet': 'Mobile/Internet', 'phone': 'Mobile/Internet',
    'cloth': 'Clothing', 'clothes': 'Clothing', 'dress': 'Clothing',
    'kapor': 'Clothing', 'kapur': 'Clothing', 'poshak': 'Clothing',
    'entertainment': 'Entertainment', 'fun': 'Entertainment', 'movie': 'Entertainment',
    'manoranjan': 'Entertainment', 'binodon': 'Entertainment',
    'shop': 'Shop', 'dokan': 'Shop', 'store': 'Shop',
    'other': 'Others', 'onno': 'Others', 'onnano': 'Others',
    'বাজার': 'Groceries',
    'ব্যক্তিগত': 'Personal',
    'দোকান': 'Shop',
    'বিল': 'Bills/Tax', 'ট্যাক্স': 'Bills/Tax',
    'যাতায়াত': 'Transport', 'যাতাজাত': 'Transport',
    'শিক্ষা': 'Education', 'পড়াশোনা': 'Education',
    'ভাড়া': 'Rent',
    'চিকিৎসা': 'Medical', 'ওষুধ': 'Medical',
    'খাবার': 'Food', 'খাওয়া': 'Food',
    'মোবাইল': 'Mobile/Internet', 'ইন্টারনেট': 'Mobile/Internet',
    'কাপড়': 'Clothing', 'পোশাক': 'Clothing',
    'মনোরঞ্জন': 'Entertainment', 'বিনোদন': 'Entertainment',
    'অন্যান্য': 'Others'
};

// Item name spelling corrections
const itemSpellingMap = {
    'ric': 'Rice', 'rce': 'Rice', 'rise': 'Rice',
    'wheet': 'Wheat', 'whete': 'Wheat',
    'flor': 'Flour', 'flowr': 'Flour',
    'suger': 'Sugar', 'sugr': 'Sugar', 'shugar': 'Sugar',
    'slt': 'Salt', 'solt': 'Salt',
    'oyl': 'Oil', 'oel': 'Oil',
    'mlk': 'Milk', 'milc': 'Milk', 'mlik': 'Milk',
    'eg': 'Egg', 'egs': 'Eggs', 'agg': 'Egg',
    'chiken': 'Chicken', 'chikin': 'Chicken', 'chikn': 'Chicken',
    'fsh': 'Fish', 'fis': 'Fish', 'phish': 'Fish',
    'met': 'Meat', 'mete': 'Meat',
    'vegitable': 'Vegetable', 'vegtable': 'Vegetable', 'veggie': 'Vegetable',
    'frut': 'Fruit', 'froot': 'Fruit',
    'bred': 'Bread', 'brd': 'Bread', 'berad': 'Bread',
    'buter': 'Butter', 'butr': 'Butter', 'buttr': 'Butter',
    'chees': 'Cheese', 'chese': 'Cheese', 'cheez': 'Cheese',
    'coffe': 'Coffee', 'cofee': 'Coffee', 'kafi': 'Coffee',
    'te': 'Tea', 'tee': 'Tea', 'chai': 'Tea',
    'snak': 'Snack', 'snaks': 'Snacks', 'snacc': 'Snack',
    'piza': 'Pizza', 'pitza': 'Pizza', 'pijja': 'Pizza',
    'burgr': 'Burger', 'burgar': 'Burger', 'burgur': 'Burger',
    'biriyani': 'Biryani', 'biriani': 'Biryani', 'birani': 'Biryani',
    'petrl': 'Petrol', 'petroll': 'Petrol',
    'disel': 'Diesel', 'deisel': 'Diesel', 'diesl': 'Diesel',
    'medicin': 'Medicine', 'medcine': 'Medicine', 'medisin': 'Medicine',
    'docter': 'Doctor', 'doctr': 'Doctor', 'dokter': 'Doctor',
    'hospitl': 'Hospital', 'hosptal': 'Hospital', 'hosptl': 'Hospital',
    'buk': 'Book', 'bok': 'Book', 'boook': 'Book',
    'notbok': 'Notebook', 'notbook': 'Notebook', 'note book': 'Notebook',
    'shrt': 'Shirt', 'shart': 'Shirt', 'shurt': 'Shirt',
    'pent': 'Pant', 'pants': 'Pants', 'pents': 'Pants',
    'sho': 'Shoe', 'shoo': 'Shoe', 'shue': 'Shoe',
    'movi': 'Movie', 'movee': 'Movie', 'moive': 'Movie',
    'recharge': 'Recharge', 'recharg': 'Recharge', 'recharj': 'Recharge',
    'electrisity': 'Electricity', 'electricty': 'Electricity', 'bijli': 'Electricity',
    'wter': 'Water', 'watr': 'Water', 'watir': 'Water',
    'intrnet': 'Internet', 'intarnet': 'Internet', 'net': 'Internet',
    'mobil': 'Mobile', 'moble': 'Mobile', 'mobail': 'Mobile',
    'phon': 'Phone', 'fone': 'Phone', 'phn': 'Phone'
};

// Smart category detection based on item name
const itemCategoryMap = {
    // Groceries
    'rice': 'Groceries', 'wheat': 'Groceries', 'flour': 'Groceries', 'atta': 'Groceries',
    'dal': 'Groceries', 'lentil': 'Groceries', 'oil': 'Groceries', 'ghee': 'Groceries',
    'sugar': 'Groceries', 'salt': 'Groceries', 'spice': 'Groceries', 'masala': 'Groceries',
    'vegetable': 'Groceries', 'fruit': 'Groceries', 'milk': 'Groceries', 'egg': 'Groceries',
    'chicken': 'Groceries', 'fish': 'Groceries', 'meat': 'Groceries',
    'চাল': 'Groceries', 'আটা': 'Groceries', 'ডাল': 'Groceries', 'তেল': 'Groceries',
    'চিনি': 'Groceries', 'লবণ': 'Groceries', 'মসলা': 'Groceries', 'সবজি': 'Groceries',
    'ফল': 'Groceries', 'দুধ': 'Groceries', 'ডিম': 'Groceries', 'মাছ': 'Groceries', 'মাংস': 'Groceries',
    
    // Food
    'restaurant': 'Food', 'hotel': 'Food', 'cafe': 'Food', 'coffee': 'Food',
    'tea': 'Food', 'breakfast': 'Food', 'lunch': 'Food', 'dinner': 'Food',
    'snack': 'Food', 'pizza': 'Food', 'burger': 'Food', 'biryani': 'Food',
    'রেস্টুরেন্ট': 'Food', 'হোটেল': 'Food', 'চা': 'Food', 'কফি': 'Food',
    'নাস্তা': 'Food', 'খাবার': 'Food', 'বিরিয়ানি': 'Food',
    
    // Transport
    'petrol': 'Transport', 'diesel': 'Transport', 'fuel': 'Transport', 'gas': 'Transport',
    'bus': 'Transport', 'train': 'Transport', 'taxi': 'Transport', 'uber': 'Transport',
    'ola': 'Transport', 'auto': 'Transport', 'rickshaw': 'Transport', 'metro': 'Transport',
    'parking': 'Transport', 'toll': 'Transport',
    'পেট্রোল': 'Transport', 'ডিজেল': 'Transport', 'বাস': 'Transport', 'ট্রেন': 'Transport',
    'ট্যাক্সি': 'Transport', 'রিকশা': 'Transport', 'মেট্রো': 'Transport',
    
    // Bills/Tax
    'electricity': 'Bills/Tax', 'water': 'Bills/Tax', 'gas bill': 'Bills/Tax',
    'internet bill': 'Bills/Tax', 'phone bill': 'Bills/Tax', 'recharge': 'Bills/Tax',
    'insurance': 'Bills/Tax', 'emi': 'Bills/Tax', 'loan': 'Bills/Tax',
    'বিদ্যুৎ': 'Bills/Tax', 'পানি': 'Bills/Tax', 'গ্যাস': 'Bills/Tax',
    'ইন্টারনেট': 'Bills/Tax', 'রিচার্জ': 'Bills/Tax', 'বিমা': 'Bills/Tax',
    
    // Medical
    'medicine': 'Medical', 'tablet': 'Medical', 'syrup': 'Medical', 'injection': 'Medical',
    'doctor': 'Medical', 'hospital': 'Medical', 'clinic': 'Medical', 'pharmacy': 'Medical',
    'test': 'Medical', 'xray': 'Medical', 'scan': 'Medical', 'checkup': 'Medical',
    'ওষুধ': 'Medical', 'ট্যাবলেট': 'Medical', 'ডাক্তার': 'Medical', 'হাসপাতাল': 'Medical',
    'ক্লিনিক': 'Medical', 'পরীক্ষা': 'Medical', 'চেকআপ': 'Medical',
    
    // Education
    'book': 'Education', 'notebook': 'Education', 'pen': 'Education', 'pencil': 'Education',
    'school': 'Education', 'college': 'Education', 'tuition': 'Education', 'course': 'Education',
    'exam': 'Education', 'fee': 'Education', 'uniform': 'Education',
    'বই': 'Education', 'খাতা': 'Education', 'কলম': 'Education', 'স্কুল': 'Education',
    'কলেজ': 'Education', 'টিউশন': 'Education', 'পরীক্ষা': 'Education', 'ফি': 'Education',
    
    // Clothing
    'shirt': 'Clothing', 'pant': 'Clothing', 'shoe': 'Clothing', 'sandal': 'Clothing',
    'saree': 'Clothing', 'kurta': 'Clothing', 'jeans': 'Clothing', 'dress': 'Clothing',
    'শার্ট': 'Clothing', 'প্যান্ট': 'Clothing', 'জুতা': 'Clothing', 'শাড়ি': 'Clothing',
    'কুর্তা': 'Clothing', 'জিন্স': 'Clothing',
    
    // Entertainment
    'movie': 'Entertainment', 'cinema': 'Entertainment', 'ticket': 'Entertainment',
    'game': 'Entertainment', 'toy': 'Entertainment', 'gift': 'Entertainment',
    'party': 'Entertainment', 'celebration': 'Entertainment',
    'সিনেমা': 'Entertainment', 'টিকিট': 'Entertainment', 'খেলা': 'Entertainment',
    'উপহার': 'Entertainment', 'পার্টি': 'Entertainment',
    
    // Personal
    'haircut': 'Personal', 'salon': 'Personal', 'parlour': 'Personal',
    'cosmetic': 'Personal', 'soap': 'Personal', 'shampoo': 'Personal',
    'toothpaste': 'Personal', 'cream': 'Personal',
    'চুল কাটা': 'Personal', 'সেলুন': 'Personal', 'সাবান': 'Personal',
    'শ্যাম্পু': 'Personal', 'টুথপেস্ট': 'Personal',
    
    // Rent
    'rent': 'Rent', 'house rent': 'Rent', 'room rent': 'Rent',
    'ভাড়া': 'Rent', 'বাড়ি ভাড়া': 'Rent',
    
    // Mobile/Internet
    'mobile': 'Mobile/Internet', 'phone': 'Mobile/Internet', 'internet': 'Mobile/Internet',
    'wifi': 'Mobile/Internet', 'data': 'Mobile/Internet', 'broadband': 'Mobile/Internet',
    'মোবাইল': 'Mobile/Internet', 'ফোন': 'Mobile/Internet', 'ইন্টারনেট': 'Mobile/Internet',
    'ওয়াইফাই': 'Mobile/Internet', 'ডাটা': 'Mobile/Internet'
};

function showToast(msg, type = 'info') {
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:${colors[type]};color:white;padding:15px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.onload = async () => {
    const session = await checkAuth(true);
    currentUser = session.user;
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('pivotPeriod').addEventListener('change', function() {
        const customInputs = this.value === 'custom';
        document.getElementById('pivotStartDate').style.display = customInputs ? 'block' : 'none';
        document.getElementById('pivotEndDate').style.display = customInputs ? 'block' : 'none';
    });
    
    await initializeCategories();
    loadExpenses();
    loadFrequentItems();
    requestMicrophonePermission();
};

function requestMicrophonePermission() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // Permission will be requested when user clicks voice button
    }
}

async function initializeCategories() {
    const { data: existing } = await _supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', currentUser.id);
    
    if (!existing || existing.length === 0) {
        const categoriesToInsert = defaultCategories.map(cat => ({
            user_id: currentUser.id,
            category_name: cat.name,
            icon: cat.icon,
            is_default: true
        }));
        
        await _supabase.from('expense_categories').insert(categoriesToInsert);
    }
    
    await loadCategories();
}

async function loadCategories() {
    const { data, error } = await _supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('category_name');
    
    if (!error) {
        userCategories = data || [];
        renderCategoryList();
    }
}

function renderCategoryList() {
    const datalist = document.getElementById('categoryList');
    datalist.innerHTML = '';
    
    userCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = `${cat.icon} ${cat.category_name}`;
        datalist.appendChild(option);
    });
}

async function addNewCategory(categoryName, icon) {
    const { error } = await _supabase.from('expense_categories').insert({
        user_id: currentUser.id,
        category_name: categoryName,
        icon: icon,
        is_default: false
    });
    
    if (!error) {
        await loadCategories();
    }
    
    return !error;
}

async function addExpense() {
    const date = document.getElementById('expDate').value;
    const rawItem = document.getElementById('expItem').value.trim();
    const cat = document.getElementById('expCat').value.trim();
    const amount = parseFloat(document.getElementById('expAmount').value);

    if (!rawItem || !cat || !amount || amount <= 0) {
        showToast('Please fill all fields!', 'error');
        return;
    }

    const item = autoCorrectItemName(rawItem);
    const normalizedCat = await normalizeCategoryName(cat);

    const btn = document.querySelector('.btn-save-new');
    btn.disabled = true;
    btn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 1s linear infinite;"></i> Saving...';

    const { error } = await _supabase.from('personal_expenses').insert({
        user_id: currentUser.id,
        e_date: date,
        item_name: item,
        category: normalizedCat,
        amount: amount
    });

    if (error) {
        showToast('Error: ' + error.message, 'error');
    } else {
        document.getElementById('expItem').value = '';
        document.getElementById('expCat').value = '';
        document.getElementById('expAmount').value = '';
        document.getElementById('expItem').focus();
        categoryLocked = true;
        document.getElementById('expCat').readOnly = true;
        document.getElementById('expCat').style.background = '#f8fafc';
        document.getElementById('catLockIcon').className = 'ri-lock-unlock-line';
        showToast('✅ Expense added!', 'success');
        loadExpenses();
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="ri-save-line"></i> Save';
}

async function normalizeCategoryName(input) {
    if (!input) return '💼 Others';
    
    const formatted = input.trim().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    const lowerInput = formatted.toLowerCase();
    
    if (spellingMap[lowerInput]) {
        return findCategoryWithIcon(spellingMap[lowerInput]);
    }
    
    const matchedCategory = userCategories.find(cat => 
        cat.category_name.toLowerCase() === lowerInput
    );
    
    if (matchedCategory) {
        return `${matchedCategory.icon} ${matchedCategory.category_name}`;
    }
    
    const existingCategories = new Set();
    allExpenses.forEach(ex => {
        if (ex.category) {
            existingCategories.add(ex.category);
        }
    });
    
    for (let existingCat of existingCategories) {
        const cleanExisting = existingCat.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        if (cleanExisting.toLowerCase() === lowerInput) {
            return existingCat;
        }
    }
    
    const icon = '📌';
    await addNewCategory(formatted, icon);
    return `${icon} ${formatted}`;
}

function findCategoryWithIcon(categoryName) {
    const matchedCategory = userCategories.find(cat => 
        cat.category_name === categoryName
    );
    
    if (matchedCategory) {
        return `${matchedCategory.icon} ${matchedCategory.category_name}`;
    }
    
    return `💼 ${categoryName}`;
}

function autoCorrectItemName(input) {
    if (!input) return '';
    
    const lowerInput = input.toLowerCase().trim();
    
    // Check if exact match in spelling correction map
    if (itemSpellingMap[lowerInput]) {
        return itemSpellingMap[lowerInput];
    }
    
    // Check if any word in the input matches
    const words = lowerInput.split(' ');
    const correctedWords = words.map(word => {
        return itemSpellingMap[word] || word;
    });
    
    // Capitalize first letter of each word
    return correctedWords.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

async function loadExpenses() {
    const { data, error } = await _supabase.from('personal_expenses')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('e_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (!error) {
        allExpenses = data || [];
        applyPivotFilter();
        renderUI(allExpenses);
        loadFrequentItems();
    }
}

function applyPivotFilter() {
    const period = document.getElementById('pivotPeriod').value;
    const minAmount = parseFloat(document.getElementById('minAmount').value) || 0;
    const maxAmount = parseFloat(document.getElementById('maxAmount').value) || Infinity;
    const sortBy = document.getElementById('sortBy').value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate, endDate;
    
    if (period === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    } else if (period === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
    } else if (period === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
    } else if (period === 'custom') {
        startDate = document.getElementById('pivotStartDate').value;
        endDate = document.getElementById('pivotEndDate').value;
        if (!startDate || !endDate) return;
    } else {
        filteredExpenses = allExpenses;
        renderPivotTable(minAmount, maxAmount, sortBy);
        return;
    }
    
    filteredExpenses = allExpenses.filter(ex => {
        return ex.e_date >= startDate && ex.e_date <= endDate;
    });
    
    renderPivotTable(minAmount, maxAmount, sortBy);
}

function renderPivotTable(minAmount = 0, maxAmount = Infinity, sortBy = 'amount-desc') {
    const pivotBody = document.getElementById('pivotBody');
    pivotData = {};
    let grandTotal = 0;
    
    filteredExpenses.forEach(ex => {
        const category = ex.category || '💼 Others';
        if (!pivotData[category]) {
            pivotData[category] = { total: 0, count: 0, items: [] };
        }
        pivotData[category].total += parseFloat(ex.amount);
        pivotData[category].count += 1;
        pivotData[category].items.push({
            date: ex.e_date,
            item: ex.item_name,
            amount: parseFloat(ex.amount)
        });
        grandTotal += parseFloat(ex.amount);
    });
    
    // Filter by amount range
    let categories = Object.entries(pivotData).filter(([cat, data]) => {
        return data.total >= minAmount && data.total <= maxAmount;
    });
    
    // Sort categories
    categories.sort((a, b) => {
        const [catA, dataA] = a;
        const [catB, dataB] = b;
        
        switch(sortBy) {
            case 'amount-desc': return dataB.total - dataA.total;
            case 'amount-asc': return dataA.total - dataB.total;
            case 'count-desc': return dataB.count - dataA.count;
            case 'count-asc': return dataA.count - dataB.count;
            case 'name-asc': return catA.localeCompare(catB);
            default: return dataB.total - dataA.total;
        }
    });
    
    pivotBody.innerHTML = '';
    
    categories.forEach(([cat, data]) => {
        const percentage = ((data.total / grandTotal) * 100).toFixed(1);
        const avgAmount = (data.total / data.count).toFixed(2);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div>${cat}</div>
                <div class="pivot-details">${data.items.map(i => `${i.item} (₹${i.amount})`).join(', ')}</div>
            </td>
            <td style="text-align:center;">${data.count}</td>
            <td style="text-align:right;">₹${data.total.toLocaleString('en-IN')}</td>
            <td style="text-align:right;">₹${parseFloat(avgAmount).toLocaleString('en-IN')}</td>
            <td style="text-align:center;">
                <div style="display: flex; align-items: center; gap: 5px; justify-content: center;">
                    <div style="width: 50px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: #6366f1;"></div>
                    </div>
                    <span>${percentage}%</span>
                </div>
            </td>
        `;
        pivotBody.appendChild(row);
    });
    
    const totalRow = document.createElement('tr');
    totalRow.className = 'pivot-total';
    totalRow.innerHTML = `
        <td><strong>TOTAL</strong></td>
        <td style="text-align:center;"><strong>${filteredExpenses.length}</strong></td>
        <td style="text-align:right;"><strong>₹${grandTotal.toLocaleString('en-IN')}</strong></td>
        <td style="text-align:right;"><strong>₹${(grandTotal / filteredExpenses.length || 0).toFixed(2)}</strong></td>
        <td style="text-align:center;"><strong>100%</strong></td>
    `;
    pivotBody.appendChild(totalRow);
    
    if (currentPivotView === 'chart') {
        renderCharts();
    }
}

function renderUI(data) {
    const list = document.getElementById('expenseList');
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todayTotal = 0, monthTotal = 0;

    list.innerHTML = '';
    
    if (data.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:20px;">No expenses found</div>';
    }

    data.forEach(ex => {
        const exDate = new Date(ex.e_date);
        if (ex.e_date === today) todayTotal += parseFloat(ex.amount);
        if (exDate.getMonth() === currentMonth && exDate.getFullYear() === currentYear) {
            monthTotal += parseFloat(ex.amount);
        }

        const category = ex.category || '💼 Others';

        list.innerHTML += `
            <div class="exp-item-new">
                <div class="exp-info">
                    <div>
                        <span class="exp-name">${ex.item_name}</span>
                        <span class="cat-badge">${category}</span>
                    </div>
                    <span class="exp-date"><i class="ri-calendar-line"></i> ${ex.e_date}</span>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span class="exp-amt">₹${parseFloat(ex.amount).toLocaleString('en-IN')}</span>
                    <i class="ri-delete-bin-line btn-del-mini" onclick="deleteExpense(${ex.id})"></i>
                </div>
            </div>
        `;
    });

    document.getElementById('todayExp').innerText = '₹' + todayTotal.toLocaleString('en-IN');
    document.getElementById('monthExp').innerText = '₹' + monthTotal.toLocaleString('en-IN');
}

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;

    const { error } = await _supabase.from('personal_expenses')
        .delete()
        .eq('id', id);

    if (error) {
        showToast('Error: ' + error.message, 'error');
    } else {
        showToast('✅ Deleted!', 'success');
        loadExpenses();
    }
}

function downloadPivotPDF() {
    if (filteredExpenses.length === 0) {
        showToast('No data!', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Header Section ---
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("EXPENSE TRACKER PRO", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Category-wise Pivot Report", pageWidth / 2, 26, { align: "center" });

    // --- Summary Section ---
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(11);
    const periodSelect = document.getElementById('pivotPeriod');
    const periodText = periodSelect.options[periodSelect.selectedIndex].text;
    
    doc.text(`Period: ${periodText}`, 14, 45);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 51);

    let grandTotal = 0;
    const pivotTableData = [];
    
    Object.keys(pivotData).sort().forEach(cat => {
        const data = pivotData[cat];
        const cleanCat = cat.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        pivotTableData.push([
            cleanCat, 
            data.count, 
            'Rs ' + parseFloat(data.total).toLocaleString('en-IN', {minimumFractionDigits: 2})
        ]);
        grandTotal += data.total;
    });

    doc.setFont("helvetica", "bold");
    doc.text(`Total Expenses: Rs. ${grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, pageWidth - 14, 45, { align: "right" });
    doc.text(`Total Items: ${filteredExpenses.length}`, pageWidth - 14, 51, { align: "right" });

    // --- Main Summary Table ---
    doc.autoTable({
        startY: 58,
        head: [['Category', 'No. of Items', 'Total Amount']],
        body: pivotTableData,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { halign: 'left', cellWidth: 80 },
            1: { halign: 'center', cellWidth: 35 },
            2: { halign: 'right', cellWidth: 60, fontStyle: 'bold' }
        },
        didParseCell: function (data) {
            if (data.section === 'head' || data.section === 'foot') {
                if (data.column.index === 0) data.cell.styles.halign = 'left';
                if (data.column.index === 1) data.cell.styles.halign = 'center';
                if (data.column.index === 2) data.cell.styles.halign = 'right';
            }
        },
        foot: [['GRAND TOTAL', filteredExpenses.length, 'Rs ' + grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})]],
        footStyles: { fillColor: [226, 232, 240], textColor: [99, 102, 241], fontStyle: 'bold', fontSize: 11 },
        didDrawPage: function (data) {
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
    });

    // --- Detailed Breakdown Section ---
    let detailStartY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Breakdown by Category", 14, detailStartY);
    detailStartY += 8;

    Object.keys(pivotData).sort().forEach(cat => {
        const data = pivotData[cat];
        const cleanCat = cat.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        
        // Check if we need a new page to avoid cutting off
        if (detailStartY > pageHeight - 40) {
            doc.addPage();
            detailStartY = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(99, 102, 241);
        doc.setFont("helvetica", "bold");
        doc.text(`${cleanCat} - Rs. ${data.total.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 14, detailStartY);
        
        const itemsData = data.items.map(item => [
            item.date,
            item.item,
            'Rs ' + parseFloat(item.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})
        ]);
        
        doc.autoTable({
            startY: detailStartY + 4,
            head: [['Date', 'Item', 'Amount']],
            body: itemsData,
            theme: 'plain',
            headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 10, textColor: [71, 85, 105] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            columnStyles: {
                0: { cellWidth: 28, halign: 'center' },
                1: { halign: 'left', cellWidth: 95 },
                2: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
            },
            didParseCell: function (data) {
                if (data.section === 'head' || data.section === 'foot') {
                    if (data.column.index === 0) data.cell.styles.halign = 'center';
                    if (data.column.index === 1) data.cell.styles.halign = 'left';
                    if (data.column.index === 2) data.cell.styles.halign = 'right';
                }
            },
            margin: { left: 14, right: 14 },
            didDrawPage: function (data) {
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });
        
        detailStartY = doc.lastAutoTable.finalY + 12;
    });

    // Preview in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    showToast('✅ PDF preview opened!', 'success');
}

// ============ CHART VISUALIZATION ============
function togglePivotView(view) {
    currentPivotView = view;
    
    document.getElementById('btnChart').classList.toggle('active', view === 'chart');
    document.getElementById('btnTable').classList.toggle('active', view === 'table');
    
    document.getElementById('pivotChartView').style.display = view === 'chart' ? 'block' : 'none';
    document.getElementById('pivotTableView').style.display = view === 'table' ? 'block' : 'none';
    
    if (view === 'chart') {
        renderCharts();
    }
}

function renderCharts() {
    const categories = Object.keys(pivotData);
    const amounts = categories.map(cat => pivotData[cat].total);
    const counts = categories.map(cat => pivotData[cat].count);
    
    const colors = [
        '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b',
        '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'
    ];
    
    // Pie Chart
    const pieCtx = document.getElementById('pieChart');
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 10, font: { size: 10 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = amounts.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Bar Chart
    const barCtx = document.getElementById('barChart');
    if (barChart) barChart.destroy();
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Amount',
                data: amounts,
                backgroundColor: '#6366f1',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Amount: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
    
    // Line Chart - Daily Trend
    const dailyData = {};
    filteredExpenses.forEach(ex => {
        if (!dailyData[ex.e_date]) dailyData[ex.e_date] = 0;
        dailyData[ex.e_date] += parseFloat(ex.amount);
    });
    
    const dates = Object.keys(dailyData).sort();
    const dailyAmounts = dates.map(date => dailyData[date]);
    
    const lineCtx = document.getElementById('lineChart');
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Daily Expense',
                data: dailyAmounts,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Expense: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

function downloadPDF() {
    if (allExpenses.length === 0) {
        showToast('No expenses!', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Header Section ---
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("EXPENSE TRACKER PRO", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Detailed Expense Report", pageWidth / 2, 26, { align: "center" });

    // --- Summary Section ---
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 45);

    const totalAmount = allExpenses.reduce((sum, ex) => sum + parseFloat(ex.amount), 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Expenses: Rs. ${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, pageWidth - 14, 45, { align: "right" });
    doc.text(`Total Items: ${allExpenses.length}`, pageWidth - 14, 51, { align: "right" });

    // --- Table Data Preparation ---
    const tableData = allExpenses.map(ex => {
        const cleanCat = ex.category ? ex.category.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : 'N/A';
        return [
            ex.e_date,
            ex.item_name,
            cleanCat,
            'Rs ' + parseFloat(ex.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})
        ];
    });

    // --- Table Styling ---
    doc.autoTable({
        startY: 58,
        head: [['Date', 'Item Description', 'Category', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
            fillColor: [99, 102, 241], 
            textColor: 255, 
            fontStyle: 'bold',
            fontSize: 11
        },
        bodyStyles: { textColor: [50, 50, 50], fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
            0: { halign: 'center', cellWidth: 28 },
            1: { halign: 'left', cellWidth: 70 },
            2: { halign: 'center', cellWidth: 45 },
            3: { halign: 'right', cellWidth: 40, fontStyle: 'bold', textColor: [99, 102, 241] }
        },
        didParseCell: function (data) {
            if (data.section === 'head' || data.section === 'foot') {
                if (data.column.index === 0) data.cell.styles.halign = 'center';
                if (data.column.index === 1) data.cell.styles.halign = 'left';
                if (data.column.index === 2) data.cell.styles.halign = 'center';
                if (data.column.index === 3) data.cell.styles.halign = 'right';
            }
        },
        didDrawPage: function (data) {
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
    });

    // Preview in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    showToast('✅ PDF preview opened!', 'success');
}

// ============ CATEGORY MANAGER ============
function openCategoryManager() {
    document.getElementById('categoryModal').style.display = 'flex';
    renderCategoryManager();
}

function closeCategoryManager() {
    document.getElementById('categoryModal').style.display = 'none';
    editingCategoryId = null;
}

function renderCategoryManager() {
    const list = document.getElementById('categoryManagerList');
    list.innerHTML = '';
    
    userCategories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.id = `cat-${cat.id}`;
        div.innerHTML = `
            <div class="category-info">
                <span class="category-icon" onclick="openIconPicker(${cat.id})" title="Click to change icon">${cat.icon}</span>
                <span class="category-name" id="catName-${cat.id}">${cat.category_name}</span>
            </div>
            <div class="category-actions">
                <button class="btn-icon edit" onclick="editCategory(${cat.id})" title="Edit">
                    <i class="ri-edit-line"></i>
                </button>
                ${!cat.is_default ? `
                    <button class="btn-icon delete" onclick="deleteCategory(${cat.id})" title="Delete">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                ` : ''}
            </div>
        `;
        list.appendChild(div);
    });
}

function selectIconForNew() {
    currentEditingCategory = 'new';
    document.getElementById('iconPickerModal').style.display = 'flex';
    
    const icons = ['🛒', '👤', '🏪', '💳', '🏭', '🏫', '🏛️', '⚕️', '🍽️', '📱', '👗', '🎮', '💼', 
                   '🚗', '✈️', '🏠', '💡', '📚', '🎬', '⚽', '🎵', '🍕', '☕', '🍰', '🌟', '💰', '🔧', '📌',
                   '🎨', '🏋️', '🎯', '🔑', '🎁', '💊', '🌍', '📺', '🎤', '🎸', '🏖️', '🌺'];
    
    const grid = document.getElementById('iconGrid');
    grid.innerHTML = '';
    
    icons.forEach(icon => {
        const span = document.createElement('span');
        span.className = 'icon-option';
        span.textContent = icon;
        span.onclick = () => {
            if (currentEditingCategory === 'new') {
                newCategoryIcon = icon;
                document.getElementById('newCatIcon').textContent = icon;
                closeIconPicker();
            } else {
                updateCategoryIcon(currentEditingCategory, icon);
            }
        };
        grid.appendChild(span);
    });
}

async function addNewCategoryFromManager() {
    const name = document.getElementById('newCatName').value.trim();
    
    if (!name) {
        showToast('Please enter category name!', 'error');
        return;
    }
    
    // Check if category already exists
    const exists = userCategories.find(cat => 
        cat.category_name.toLowerCase() === name.toLowerCase()
    );
    
    if (exists) {
        showToast('Category already exists!', 'error');
        return;
    }
    
    const { error } = await _supabase.from('expense_categories').insert({
        user_id: currentUser.id,
        category_name: name,
        icon: newCategoryIcon,
        is_default: false
    });
    
    if (!error) {
        document.getElementById('newCatName').value = '';
        newCategoryIcon = '📌';
        document.getElementById('newCatIcon').textContent = '📌';
        await loadCategories();
        renderCategoryManager();
        showToast('✅ Category added!', 'success');
    } else {
        showToast('Error: ' + error.message, 'error');
    }
}

function editCategory(categoryId) {
    if (editingCategoryId) {
        cancelEdit(editingCategoryId);
    }
    
    editingCategoryId = categoryId;
    const category = userCategories.find(cat => cat.id === categoryId);
    const catItem = document.getElementById(`cat-${categoryId}`);
    const nameSpan = document.getElementById(`catName-${categoryId}`);
    
    catItem.classList.add('editing');
    
    const currentName = category.category_name;
    nameSpan.innerHTML = `<input type="text" class="category-name editable" id="editName-${categoryId}" value="${currentName}">`;
    
    const actions = catItem.querySelector('.category-actions');
    actions.innerHTML = `
        <button class="btn-icon save" onclick="saveCategory(${categoryId})" title="Save">
            <i class="ri-check-line"></i>
        </button>
        <button class="btn-icon cancel" onclick="cancelEdit(${categoryId})" title="Cancel">
            <i class="ri-close-line"></i>
        </button>
    `;
    
    document.getElementById(`editName-${categoryId}`).focus();
}

async function saveCategory(categoryId) {
    const newName = document.getElementById(`editName-${categoryId}`).value.trim();
    
    if (!newName) {
        showToast('Category name cannot be empty!', 'error');
        return;
    }
    
    // Check if name already exists (excluding current category)
    const exists = userCategories.find(cat => 
        cat.id !== categoryId && cat.category_name.toLowerCase() === newName.toLowerCase()
    );
    
    if (exists) {
        showToast('Category name already exists!', 'error');
        return;
    }
    
    const { error } = await _supabase
        .from('expense_categories')
        .update({ category_name: newName })
        .eq('id', categoryId);
    
    if (!error) {
        // Update all expenses with old category name
        const oldCategory = userCategories.find(cat => cat.id === categoryId);
        const oldFullName = `${oldCategory.icon} ${oldCategory.category_name}`;
        const newFullName = `${oldCategory.icon} ${newName}`;
        
        await _supabase
            .from('personal_expenses')
            .update({ category: newFullName })
            .eq('user_id', currentUser.id)
            .eq('category', oldFullName);
        
        await loadCategories();
        await loadExpenses();
        renderCategoryManager();
        editingCategoryId = null;
        showToast('✅ Category updated!', 'success');
    } else {
        showToast('Error: ' + error.message, 'error');
    }
}

function cancelEdit(categoryId) {
    editingCategoryId = null;
    renderCategoryManager();
}

function openIconPicker(categoryId) {
    currentEditingCategory = categoryId;
    document.getElementById('iconPickerModal').style.display = 'flex';
    
    const icons = ['🛒', '👤', '🏪', '💳', '🏭', '🏫', '🏛️', '⚕️', '🍽️', '📱', '👗', '🎮', '💼', 
                   '🚗', '✈️', '🏠', '💡', '📚', '🎬', '⚽', '🎵', '🍕', '☕', '🍰', '🌟', '💰', '🔧', '📌',
                   '🎨', '🏋️', '🎯', '🔑', '🎁', '💊', '🌍', '📺', '🎤', '🎸', '🏖️', '🌺'];
    
    const grid = document.getElementById('iconGrid');
    grid.innerHTML = '';
    
    icons.forEach(icon => {
        const span = document.createElement('span');
        span.className = 'icon-option';
        span.textContent = icon;
        span.onclick = () => updateCategoryIcon(categoryId, icon);
        grid.appendChild(span);
    });
}

function closeIconPicker() {
    document.getElementById('iconPickerModal').style.display = 'none';
    currentEditingCategory = null;
}

async function updateCategoryIcon(categoryId, newIcon) {
    const { error } = await _supabase
        .from('expense_categories')
        .update({ icon: newIcon })
        .eq('id', categoryId);
    
    if (!error) {
        // Update all expenses with this category
        const oldCategory = userCategories.find(cat => cat.id === categoryId);
        const oldFullName = `${oldCategory.icon} ${oldCategory.category_name}`;
        const newFullName = `${newIcon} ${oldCategory.category_name}`;
        
        await _supabase
            .from('personal_expenses')
            .update({ category: newFullName })
            .eq('user_id', currentUser.id)
            .eq('category', oldFullName);
        
        await loadCategories();
        await loadExpenses();
        renderCategoryManager();
        closeIconPicker();
        showToast('✅ Icon updated!', 'success');
    } else {
        showToast('Error: ' + error.message, 'error');
    }
}

async function deleteCategory(categoryId) {
    const category = userCategories.find(cat => cat.id === categoryId);
    
    if (!confirm(`Delete "${category.category_name}" category?\n\nNote: Existing expenses will keep their category name.`)) return;
    
    const { error } = await _supabase
        .from('expense_categories')
        .delete()
        .eq('id', categoryId);
    
    if (!error) {
        await loadCategories();
        renderCategoryManager();
        showToast('✅ Category deleted!', 'success');
    } else {
        showToast('Error: ' + error.message, 'error');
    }
}

// ============ SMART SUGGESTIONS ============
function handleItemInput(query) {
    showItemSuggestions(query);
    
    if (categoryLocked && query.length > 2) {
        autoDetectCategory(query);
    }
}

function autoDetectCategory(itemName) {
    const lowerItem = itemName.toLowerCase();
    
    // Check if any keyword matches
    for (const [keyword, category] of Object.entries(itemCategoryMap)) {
        if (lowerItem.includes(keyword)) {
            const matchedCat = userCategories.find(cat => cat.category_name === category);
            if (matchedCat) {
                document.getElementById('expCat').value = `${matchedCat.icon} ${matchedCat.category_name}`;
                return;
            }
        }
    }
    
    // Check previous expenses for this item
    const previousExpense = allExpenses.find(ex => 
        ex.item_name.toLowerCase() === lowerItem
    );
    
    if (previousExpense && previousExpense.category) {
        document.getElementById('expCat').value = previousExpense.category;
    }
}

function unlockCategory() {
    const catInput = document.getElementById('expCat');
    const lockIcon = document.getElementById('catLockIcon');
    
    if (categoryLocked) {
        categoryLocked = false;
        catInput.readOnly = false;
        catInput.style.background = 'white';
        catInput.removeAttribute('list');
        catInput.setAttribute('list', 'categoryList');
        lockIcon.className = 'ri-lock-line';
        catInput.focus();
    } else {
        categoryLocked = true;
        catInput.readOnly = true;
        catInput.style.background = '#f8fafc';
        lockIcon.className = 'ri-lock-unlock-line';
    }
}

function showItemSuggestions(query) {
    if (!query || query.length < 2) {
        document.getElementById('itemSuggestions').classList.remove('show');
        return;
    }
    
    const suggestions = allExpenses
        .filter(ex => ex.item_name.toLowerCase().includes(query.toLowerCase()))
        .reduce((acc, ex) => {
            const existing = acc.find(item => item.name === ex.item_name);
            if (existing) {
                existing.count++;
                existing.avgAmount = (existing.avgAmount + ex.amount) / 2;
            } else {
                acc.push({
                    name: ex.item_name,
                    category: ex.category,
                    avgAmount: ex.amount,
                    count: 1
                });
            }
            return acc;
        }, [])
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    const dropdown = document.getElementById('itemSuggestions');
    dropdown.innerHTML = '';
    
    if (suggestions.length > 0) {
        suggestions.forEach(sug => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <div>
                    <div class="suggestion-name">${sug.name}</div>
                    <div class="suggestion-meta">${sug.category} • Used ${sug.count}x</div>
                </div>
                <div class="suggestion-meta">₹${Math.round(sug.avgAmount)}</div>
            `;
            div.onclick = () => applySuggestion(sug);
            dropdown.appendChild(div);
        });
        dropdown.classList.add('show');
    } else {
        dropdown.classList.remove('show');
    }
}

function applySuggestion(suggestion) {
    document.getElementById('expItem').value = suggestion.name;
    document.getElementById('expCat').value = suggestion.category;
    document.getElementById('expAmount').value = Math.round(suggestion.avgAmount);
    document.getElementById('itemSuggestions').classList.remove('show');
    categoryLocked = true;
    document.getElementById('expCat').readOnly = true;
    document.getElementById('expCat').style.background = '#f8fafc';
    document.getElementById('catLockIcon').className = 'ri-lock-unlock-line';
    document.getElementById('expAmount').focus();
}

function loadFrequentItems() {
    const frequentMap = {};
    
    allExpenses.forEach(ex => {
        const key = `${ex.item_name}|${ex.category}`;
        if (!frequentMap[key]) {
            frequentMap[key] = { name: ex.item_name, category: ex.category, count: 0, avgAmount: 0 };
        }
        frequentMap[key].count++;
        frequentMap[key].avgAmount = (frequentMap[key].avgAmount + ex.amount) / frequentMap[key].count;
    });
    
    const frequent = Object.values(frequentMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    const container = document.getElementById('frequentItems');
    container.innerHTML = '';
    
    if (frequent.length > 0) {
        frequent.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'frequent-item';
            btn.innerHTML = `<span>${item.name}</span> <small>₹${Math.round(item.avgAmount)}</small>`;
            btn.onclick = () => quickAddItem(item);
            container.appendChild(btn);
        });
    }
}

function quickAddItem(item) {
    document.getElementById('expItem').value = item.name;
    document.getElementById('expCat').value = item.category;
    document.getElementById('expAmount').value = Math.round(item.avgAmount);
    categoryLocked = true;
    document.getElementById('expCat').readOnly = true;
    document.getElementById('expCat').style.background = '#f8fafc';
    document.getElementById('catLockIcon').className = 'ri-lock-unlock-line';
    document.getElementById('expAmount').focus();
}

// ============ VOICE INPUT ============
let currentRecognition = null;
let voiceLanguage = 'en-US';
let currentVoiceField = null;

function startFieldVoice(fieldId) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showToast('Voice input not supported in this browser', 'error');
        return;
    }
    
    if (currentRecognition) {
        currentRecognition.stop();
        currentRecognition = null;
        return;
    }
    
    currentVoiceField = fieldId;
    const recognition = new SpeechRecognition();
    currentRecognition = recognition;
    
    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    const micBtn = event.target.closest('.field-mic-btn');
    
    recognition.onstart = () => {
        micBtn.classList.add('recording');
        showToast('🎤 Listening...', 'info');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        
        if (fieldId === 'expAmount') {
            // Extract numbers from speech
            const numbers = transcript.match(/\d+/);
            if (numbers) {
                document.getElementById(fieldId).value = numbers[0];
                showToast('✅ Amount captured: ₹' + numbers[0], 'success');
            } else {
                showToast('No number detected. Try again.', 'error');
            }
        } else if (fieldId === 'expItem') {
            // Remove common words and extract item name
            let itemText = transcript.replace(/\d+/g, '')
                                    .replace(/rupees?|rs|₹|taka|টাকা|for|জন্য|jonno/gi, '')
                                    .trim();
            
            if (itemText.length > 0) {
                const correctedItem = autoCorrectItemName(itemText);
                document.getElementById(fieldId).value = correctedItem;
                
                // Auto-detect category
                if (categoryLocked) {
                    autoDetectCategory(correctedItem);
                }
                
                showToast('✅ Item captured: ' + correctedItem, 'success');
            } else {
                showToast('Could not understand item name', 'error');
            }
        }
    };
    
    recognition.onend = () => {
        currentRecognition = null;
        currentVoiceField = null;
        micBtn.classList.remove('recording');
    };
    
    recognition.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
            showToast('Voice error: ' + event.error, 'error');
        }
        currentRecognition = null;
        currentVoiceField = null;
        micBtn.classList.remove('recording');
    };
    
    recognition.start();
}

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showToast('Voice input not supported in this browser', 'error');
        return;
    }
    
    if (currentRecognition) {
        currentRecognition.stop();
        currentRecognition = null;
        return;
    }
    
    const recognition = new SpeechRecognition();
    currentRecognition = recognition;
    
    recognition.lang = voiceLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    
    let finalTranscript = '';
    let silenceTimer = null;
    
    recognition.onstart = () => {
        const langText = voiceLanguage === 'bn-BD' ? 'বাংলা' : 'English';
        showToast(`🎤 Listening in ${langText}... (Click again to stop)`, 'info');
        document.querySelector('.btn-voice').style.background = '#ef4444';
        document.querySelector('.btn-voice').innerHTML = '<i class="ri-stop-circle-line"></i>';
    };
    
    recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Reset silence timer
        if (silenceTimer) clearTimeout(silenceTimer);
        
        // Auto-stop after 3 seconds of silence
        silenceTimer = setTimeout(() => {
            if (currentRecognition) {
                currentRecognition.stop();
            }
        }, 3000);
    };
    
    recognition.onend = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        
        if (finalTranscript.trim()) {
            parseVoiceCommand(finalTranscript.toLowerCase().trim());
        }
        
        currentRecognition = null;
        document.querySelector('.btn-voice').style.background = '';
        document.querySelector('.btn-voice').innerHTML = '<i class="ri-mic-line"></i>';
    };
    
    recognition.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
            showToast('Voice error: ' + event.error, 'error');
        }
        currentRecognition = null;
        document.querySelector('.btn-voice').style.background = '';
        document.querySelector('.btn-voice').innerHTML = '<i class="ri-mic-line"></i>';
    };
    
    recognition.start();
}

function toggleVoiceLanguage() {
    voiceLanguage = voiceLanguage === 'en-US' ? 'bn-BD' : 'en-US';
    const langText = voiceLanguage === 'bn-BD' ? '🇧🇩 বাংলা' : '🇬🇧 English';
    document.getElementById('voiceLangBtn').innerHTML = langText;
    showToast(`Voice language: ${langText}`, 'info');
}

function parseVoiceCommand(text) {
    // English patterns
    let amountMatch = text.match(/(\d+)\s*(rupees?|rs|₹|taka|টাকা)/i);
    let forMatch = text.match(/for\s+(.+?)(?:\s+in\s+|\s+category\s+|$)/i);
    let categoryMatch = text.match(/(?:in|category)\s+(.+)$/i);
    
    // Bengali patterns
    if (!amountMatch) {
        // Match Bengali numbers or English digits with Bengali words
        amountMatch = text.match(/(\d+)\s*(?:টাকা|taka)/i);
    }
    
    // Bengali "জন্য" (jonno) = for
    if (!forMatch) {
        forMatch = text.match(/(?:জন্য|jonno)\s+(.+?)(?:\s+(?:ক্যাটাগরি|category)\s+|$)/i);
    }
    
    // Try to extract just numbers if no keyword found
    if (!amountMatch) {
        const numbers = text.match(/\d+/);
        if (numbers) {
            amountMatch = [null, numbers[0]];
        }
    }
    
    // Smart extraction: if text contains item names, extract them
    if (!forMatch && text.length > 0) {
        // Remove amount and common words
        let itemText = text.replace(/\d+/g, '')
                          .replace(/rupees?|rs|₹|taka|টাকা|add|for|জন্য|jonno/gi, '')
                          .trim();
        
        if (itemText.length > 2) {
            forMatch = [null, itemText];
        }
    }
    
    if (amountMatch) {
        document.getElementById('expAmount').value = amountMatch[1];
    }
    
    if (forMatch) {
        const itemName = autoCorrectItemName(forMatch[1].trim());
        document.getElementById('expItem').value = itemName;
        
        // Auto-detect category
        if (categoryLocked) {
            autoDetectCategory(itemName);
        }
    }
    
    if (categoryMatch) {
        document.getElementById('expCat').value = categoryMatch[1].trim();
    }
    
    if (amountMatch || forMatch) {
        showToast('✅ Voice command captured!', 'success');
        
        // Focus on next empty field
        if (!document.getElementById('expItem').value) {
            document.getElementById('expItem').focus();
        } else if (!document.getElementById('expAmount').value) {
            document.getElementById('expAmount').focus();
        } else {
            document.querySelector('.btn-save-new').focus();
        }
    } else {
        showToast('Try: "500 rupees for rice" or "৫০০ টাকা চাল জন্য"', 'error');
    }
}

// ============ RECEIPT SCANNER ============
function openReceiptScanner() {
    document.getElementById('scannerModal').style.display = 'flex';
}

function closeScannerModal() {
    document.getElementById('scannerModal').style.display = 'none';
}

function processReceipt(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('scannerPreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Receipt"><p>Processing...</p>`;
        
        Tesseract.recognize(e.target.result, 'eng')
            .then(({ data: { text } }) => {
                extractReceiptData(text);
                closeScannerModal();
            })
            .catch(err => {
                showToast('OCR Error: ' + err.message, 'error');
            });
    };
    reader.readAsDataURL(file);
}

function extractReceiptData(text) {
    const lines = text.split('\n');
    const amounts = [];
    
    lines.forEach(line => {
        const match = line.match(/₹?\s*(\d+\.?\d*)/i);
        if (match) {
            amounts.push(parseFloat(match[1]));
        }
    });
    
    if (amounts.length > 0) {
        const total = Math.max(...amounts);
        document.getElementById('expAmount').value = total;
        showToast('✅ Amount extracted: ₹' + total, 'success');
    } else {
        showToast('Could not extract amount from receipt', 'error');
    }
}

// ============ EXPORT OPTIONS ============
function exportToExcel() {
    if (allExpenses.length === 0) {
        showToast('No expenses to export!', 'error');
        return;
    }
    
    const data = allExpenses.map(ex => ({
        Date: ex.e_date,
        Item: ex.item_name,
        Category: ex.category,
        Amount: ex.amount
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, `Expenses_${new Date().toLocaleDateString()}.xlsx`);
    
    showToast('✅ Excel file downloaded!', 'success');
}

function shareViaWhatsApp() {
    if (filteredExpenses.length === 0) {
        showToast('No expenses to share!', 'error');
        return;
    }
    
    let message = `*Expense Report*\n\n`;
    
    Object.keys(pivotData).forEach(cat => {
        const data = pivotData[cat];
        message += `${cat}: ₹${data.total.toFixed(2)} (${data.count} items)\n`;
    });
    
    const total = filteredExpenses.reduce((sum, ex) => sum + parseFloat(ex.amount), 0);
    message += `\n*Total: ₹${total.toFixed(2)}*`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
