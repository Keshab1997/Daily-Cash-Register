let currentUser = null;
let transactions = [];
let secretDueAmount = 0;
let allSuggestions = [];
let notify = null;

const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    return istTime.toISOString().split('T')[0];
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Helper Functions
function setButtonLoading(btn, isLoading) {
    if (!btn) return;
    if (isLoading) {
        if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
        }
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 1s linear infinite;"></i>';
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
            delete btn.dataset.originalHtml;
        }
    }
}

function showToast(msg, type = 'info') {
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:${colors[type]};color:white;padding:15px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showProgress(percent) {
    let bar = document.getElementById('progressBar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'progressBar';
        bar.style.cssText = 'position:fixed;top:0;left:0;width:0%;height:3px;background:#10b981;z-index:9999;transition:width 0.3s;';
        document.body.appendChild(bar);
    }
    bar.style.width = percent + '%';
}

function hideProgress() {
    setTimeout(() => {
        const bar = document.getElementById('progressBar');
        if (bar) bar.remove();
    }, 500);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize Notification Helper
function initNotifications() {
    if (typeof PWANotification !== 'undefined') {
        notify = new PWANotification('Hisab Manager', 'https://cdn-icons-png.flaticon.com/512/18062/18062856.png');
        notify.requestPermission();
    }
}

window.onload = async () => {
    const session = await checkAuth(true);
    currentUser = session.user;
    
    initNotifications();

    const dateInput = document.getElementById('date');
    if (!dateInput.value) {
        dateInput.value = getISTDate();
    }

    dateInput.addEventListener('change', async () => {
        await fetchOpeningBalance();
        await loadTodayTransactions();
        await fetchSecretDue();
    });

    setupKeyboardShortcuts();
    loadSavedDenominations();
    setupCustomDropdown();

    await checkAutoDayEnd();
    await fetchOpeningBalance();
    await loadTodayTransactions();
    await fetchSecretDue();
    await loadSuggestions();
};

// --- Load Saved Denominations ---
function loadSavedDenominations() {
    const savedData = localStorage.getItem('cashDenoms');
    if (savedData) {
        const denoms = JSON.parse(savedData);
        const inputs = document.querySelectorAll('.denom-input');
        inputs.forEach(input => {
            const val = input.getAttribute('data-val');
            if (denoms[val] !== undefined) {
                input.value = denoms[val];
            }
        });
    }
}

// --- Fetch Secret Box Due ---
async function fetchSecretDue() {
    const { data, error } = await _supabase.from('secret_box')
        .select('remaining_amount, t_type')
        .eq('user_id', currentUser.id);

    if (!error && data) {
        let due = 0;
        data.forEach(item => {
            if (item.t_type === 'TAKE' && item.remaining_amount > 0) {
                due += item.remaining_amount;
            }
        });
        secretDueAmount = due;
        document.getElementById('secDue').innerText = formatCurrency(due);
        calcDenom();
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + I: Focus IN name input
        if (e.altKey && e.code === 'KeyI') {
            e.preventDefault();
            document.getElementById('inName').focus();
        }
        // Alt + O: Focus OUT name input
        if (e.altKey && e.code === 'KeyO') {
            e.preventDefault();
            document.getElementById('outName').focus();
        }
        // Alt + S: Save Day End
        if (e.altKey && e.code === 'KeyS') {
            e.preventDefault();
            saveDayEnd();
        }
        // Alt + H: Go to History
        if (e.altKey && e.code === 'KeyH') {
            e.preventDefault();
            window.location.href = 'history.html';
        }
        // Alt + C: Toggle Cash Counter
        if (e.altKey && e.code === 'KeyC') {
            e.preventDefault();
            toggleCashCounter();
        }
        // Escape: Close Cash Counter
        if (e.key === 'Escape') {
            const counter = document.getElementById('cashCounter');
            if (counter && counter.style.display !== 'none') {
                toggleCashCounter();
            }
        }
        // Enter key on IN inputs
        if (e.key === 'Enter') {
            if (document.activeElement.id === 'inName' || document.activeElement.id === 'inAmount') {
                e.preventDefault();
                addTransaction('IN');
            }
            // Enter key on OUT inputs
            if (document.activeElement.id === 'outName' || document.activeElement.id === 'outAmount') {
                e.preventDefault();
                addTransaction('OUT');
            }
        }
    });
}

async function checkAutoDayEnd() {
    const today = getISTDate();

    const { data: lastRecord } = await _supabase.from('daily_accounts')
        .select('report_date')
        .eq('user_id', currentUser.id)
        .order('report_date', { ascending: false })
        .limit(1);

    if (lastRecord && lastRecord.length > 0) {
        const lastDate = lastRecord[0].report_date;
        if (lastDate < today) {
            sendNotification("📅 New Day Started", `Date changed to ${today}. Opening balance updated.`);
        }
    }
}

function sendNotification(title, body) {
    if (notify) {
        notify.success(title, body);
    }
}

async function fetchOpeningBalance() {
    const selectedDate = document.getElementById('date').value;
    const openingInput = document.getElementById('opening');
    
    if (!selectedDate) {
        openingInput.value = 0;
        updateSummary();
        return;
    }
    
    // First check if there's a saved record for this date
    const { data: savedDay } = await _supabase.from('daily_accounts')
        .select('opening_balance')
        .eq('user_id', currentUser.id)
        .eq('report_date', selectedDate)
        .single();
    
    if (savedDay && savedDay.opening_balance !== null) {
        openingInput.value = savedDay.opening_balance || 0;
        openingInput.style.background = '#fef3c7';
        setTimeout(() => openingInput.style.background = '', 1000);
        updateSummary();
        return;
    }
    
    // Get last saved day's closing balance
    const { data: lastSavedDay } = await _supabase.from('daily_accounts')
        .select('report_date, petty_cash')
        .eq('user_id', currentUser.id)
        .lt('report_date', selectedDate)
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

    let finalOpening = 0;

    if (lastSavedDay && lastSavedDay.petty_cash !== null) {
        finalOpening = parseFloat(lastSavedDay.petty_cash) || 0;
    }

    openingInput.value = finalOpening;
    
    if (finalOpening > 0) {
        openingInput.style.background = '#d1fae5';
        setTimeout(() => openingInput.style.background = '', 1000);
    }
    
    updateSummary();
}

async function loadTodayTransactions() {
    const date = document.getElementById('date').value;
    const { data, error } = await _supabase.from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('t_date', date)
        .order('created_at', { ascending: true });

    if (!error) {
        transactions = data || [];
        renderList();
        updateSummary();
    }
}

async function loadSuggestions() {
    const { data } = await _supabase.from('transactions')
        .select('party_name')
        .eq('user_id', currentUser.id);
    
    if(data) {
        allSuggestions = [...new Set(data.map(item => item.party_name))];
    }
}

function setupCustomDropdown() {
    const inName = document.getElementById('inName');
    const outName = document.getElementById('outName');
    
    const inCard = inName.closest('.card');
    const outCard = outName.closest('.card');
    
    const inDropdown = document.createElement('div');
    inDropdown.className = 'suggestion-dropdown';
    inDropdown.id = 'inDropdown';
    inName.closest('.input-group').appendChild(inDropdown);
    
    const outDropdown = document.createElement('div');
    outDropdown.className = 'suggestion-dropdown';
    outDropdown.id = 'outDropdown';
    outName.closest('.input-group').appendChild(outDropdown);
    
    inName.addEventListener('input', (e) => debouncedShowSuggestions(e.target, inDropdown));
    outName.addEventListener('input', (e) => debouncedShowSuggestions(e.target, outDropdown));
    
    inName.addEventListener('focus', (e) => showSuggestions(e.target, inDropdown));
    outName.addEventListener('focus', (e) => showSuggestions(e.target, outDropdown));
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.input-group')) {
            inDropdown.classList.remove('active');
            outDropdown.classList.remove('active');
        }
    });
}

function showSuggestions(input, dropdown) {
    const value = input.value.toLowerCase();
    const filtered = allSuggestions.filter(s => s.toLowerCase().includes(value));
    
    if (filtered.length === 0) {
        dropdown.classList.remove('active');
        return;
    }
    
    dropdown.innerHTML = filtered.map(name => 
        `<div class="suggestion-item" onclick="selectSuggestion('${input.id}', '${name}')">${name}</div>`
    ).join('');
    
    dropdown.classList.add('active');
}

const debouncedShowSuggestions = debounce(showSuggestions, 200);

function selectSuggestion(inputId, value) {
    document.getElementById(inputId).value = value;
    document.getElementById(inputId === 'inName' ? 'inDropdown' : 'outDropdown').classList.remove('active');
}

async function addTransaction(type) {
    const nameId = type === 'IN' ? 'inName' : 'outName';
    const amountId = type === 'IN' ? 'inAmount' : 'outAmount';
    const btnClass = type === 'IN' ? '.btn-add-in' : '.btn-add-out';
    
    const nameInput = document.getElementById(nameId);
    const amountInput = document.getElementById(amountId);
    const btn = document.querySelector(btnClass);

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!name || !amount || amount <= 0) return;

    setButtonLoading(btn, true);

    const payload = {
        user_id: currentUser.id,
        t_date: document.getElementById('date').value,
        t_type: type,
        party_name: name,
        amount: amount
    };

    const { error } = await _supabase.from('transactions').insert(payload);

    if (error) {
        showToast("Error: " + error.message, 'error');
    } else {
        nameInput.value = '';
        amountInput.value = '';
        nameInput.focus();
        await loadTodayTransactions();
        await autoSaveDayEnd();
    }
    setButtonLoading(btn, false);
}

function renderList() {
    const listIn = document.getElementById('listIn');
    const listOut = document.getElementById('listOut');
    
    listIn.innerHTML = '';
    listOut.innerHTML = '';

    transactions.forEach((t) => {
        const li = `
            <li>
                <span>${t.party_name}</span>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="amount-display">${formatCurrency(t.amount)}</span>
                    <i class="ri-delete-bin-line del-btn" style="cursor:pointer; color:#ef4444;" onclick="removeTransaction(${t.id})"></i>
                </div>
            </li>
        `;
        if(t.t_type === 'IN') listIn.innerHTML += li;
        else listOut.innerHTML += li;
    });
}

async function removeTransaction(id) {
    if(!confirm("Delete this transaction?")) return;
    const { error } = await _supabase.from('transactions').delete().eq('id', id);
    if (!error) {
        await loadTodayTransactions();
        await autoSaveDayEnd();
    }
}

function updateSummary() {
    const opening = parseFloat(document.getElementById('opening').value) || 0;
    
    let totalIn = transactions.filter(t => t.t_type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    let totalOut = transactions.filter(t => t.t_type === 'OUT').reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('sumIn').innerText = formatCurrency(totalIn);
    document.getElementById('sumOut').innerText = formatCurrency(totalOut);

    const final = (opening + totalIn) - totalOut;
    const el = document.getElementById('finalBalance');
    el.innerText = formatCurrency(final);
    el.style.color = final >= 0 ? '#10b981' : '#ef4444';
    
    document.getElementById('offBal').innerText = formatCurrency(final);
    calcDenom();
}

// Auto-save function (silent save without alert)
async function autoSaveDayEnd() {
    const date = document.getElementById('date').value;
    const opening = parseFloat(document.getElementById('opening').value) || 0;
    
    let totalIn = transactions.filter(t => t.t_type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    let totalOut = transactions.filter(t => t.t_type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
    const final = (opening + totalIn) - totalOut;

    const summaryPayload = {
        user_id: currentUser.id,
        report_date: date,
        opening_balance: opening,
        cash_received: totalIn,
        handover_client: totalOut,
        petty_cash: final
    };

    await _supabase.from('daily_accounts')
        .upsert(summaryPayload, { onConflict: 'user_id, report_date' });
}

// Add event listener for manual opening balance change
const debouncedUpdateSummary = debounce(updateSummary, 300);

window.addEventListener('DOMContentLoaded', () => {
    const openingInput = document.getElementById('opening');
    if (openingInput) {
        openingInput.addEventListener('input', debouncedUpdateSummary);
    }
});

async function saveDayEnd() {
    const date = document.getElementById('date').value;
    const opening = parseFloat(document.getElementById('opening').value) || 0;
    
    if (!currentUser || !currentUser.id) {
        showToast('User not logged in. Please refresh.', 'error');
        return;
    }
    
    let totalIn = transactions.filter(t => t.t_type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    let totalOut = transactions.filter(t => t.t_type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
    const final = (opening + totalIn) - totalOut;

    const summaryPayload = {
        user_id: currentUser.id,
        report_date: date,
        opening_balance: opening,
        cash_received: totalIn,
        handover_client: totalOut,
        petty_cash: final
    };

    const btn = document.querySelector('.btn-save');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 1s linear infinite;"></i> Saving...';
    }
    showProgress(50);

    try {
        const { data, error } = await _supabase.from('daily_accounts')
            .upsert(summaryPayload, { onConflict: 'user_id, report_date' });

        if(error) {
            console.error('Save error:', error);
            showToast('Error: ' + error.message, 'error');
        } else {
            console.log('Saved successfully:', data);
            sendNotification("✅ Saved", "Day End report saved successfully!");
            showToast('✅ Day End Saved Successfully!', 'success');
        }
    } catch (err) {
        console.error('Catch error:', err);
        showToast('Network error: ' + err.message, 'error');
    } finally {
        showProgress(100);
        setTimeout(() => hideProgress(), 300);
        
        if (btn) {
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="ri-save-3-line"></i> <span class="btn-label">Save Day End <small class="shortcut-text">[Alt+S]</small></span>';
            }, 500);
        }
    }
}

// --- মালিকের জন্য বিস্তারিত হোয়াটসঅ্যাপ রিপোর্ট ---
function shareWhatsApp() {
    const date = document.getElementById('date').value;
    const opening = parseFloat(document.getElementById('opening').value) || 0;
    
    const inTrans = transactions.filter(t => t.t_type === 'IN');
    const outTrans = transactions.filter(t => t.t_type === 'OUT');
    
    const totalIn = inTrans.reduce((sum, t) => sum + t.amount, 0);
    const totalOut = outTrans.reduce((sum, t) => sum + t.amount, 0);
    const final = (opening + totalIn) - totalOut;

    const e_cal = '📅';
    const e_bag = '💰';
    const e_in = '📥';
    const e_out = '📤';
    const e_money = '💵';
    const e_check = '✅';
    const e_cross = '❌';

    let msg = `*${e_cal} DAILY CASH REPORT*\n`;
    msg += `🗓️ Date: ${date}\n`;
    msg += `----------------------------\n`;
    msg += `*${e_bag} Opening Balance:* ${formatCurrency(opening)}\n`;
    msg += `----------------------------\n\n`;
    
    if (inTrans.length > 0) {
        msg += `*${e_in} CASH RECEIVED (IN):*\n`;
        inTrans.forEach((t, index) => {
            msg += `${index + 1}. ${t.party_name}: ${formatCurrency(t.amount)}\n`;
        });
        msg += `----------------------------\n`;
        msg += `*${e_check} Total Received:* ${formatCurrency(totalIn)}\n\n`;
    } else {
        msg += `*${e_in} No Cash Received Today*\n\n`;
    }
    
    if (outTrans.length > 0) {
        msg += `*${e_out} CASH PAID (OUT):*\n`;
        outTrans.forEach((t, index) => {
            msg += `${index + 1}. ${t.party_name}: ${formatCurrency(t.amount)}\n`;
        });
        msg += `----------------------------\n`;
        msg += `*${e_cross} Total Paid:* ${formatCurrency(totalOut)}\n\n`;
    } else {
        msg += `*${e_out} No Cash Paid Today*\n\n`;
    }

    msg += `============================\n`;
    msg += `*${e_money} CLOSING BALANCE: ${formatCurrency(final)}*\n`;
    msg += `============================\n`;
    msg += `_Report generated by Keshab Sarkar_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

// --- Cash Denomination Calculator ---
function toggleCashCounter() {
    const box = document.getElementById('cashCounter');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    if (box.style.display === 'block') {
        fetchSecretDue();
        loadLastCounterData();
    }
}

async function loadLastCounterData() {
    const date = document.getElementById('date').value;
    const { data } = await _supabase.from('cash_counter_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('count_date', date)
        .limit(1);
    
    if (data && data.length > 0) {
        const saved = data[0].denomination_data;
        const inputs = document.querySelectorAll('.denom-input');
        inputs.forEach(input => {
            const val = input.getAttribute('data-val');
            if (saved[val] !== undefined) {
                input.value = saved[val];
            }
        });
        calcDenom();
        showToast('Previous count loaded', 'info');
    }
}

const throttledCalcDenom = throttle(calcDenom, 100);

function calcDenom() {
    const inputs = document.querySelectorAll('.denom-input');
    let total = 0;
    const denomData = {};
    
    inputs.forEach(input => {
        const multiplier = parseInt(input.getAttribute('data-val'));
        const count = parseInt(input.value) || 0;
        total += (multiplier * count);
        denomData[multiplier] = input.value;
    });

    document.getElementById('totalCounted').innerText = formatCurrency(total);

    const officialBal = parseFloat(document.getElementById('finalBalance').innerText.replace(/[^0-9.-]+/g,"")) || 0;
    const expectedPhysicalCash = officialBal - secretDueAmount;

    document.getElementById('targetCash').innerText = formatCurrency(expectedPhysicalCash);

    const diff = total - expectedPhysicalCash;
    const diffEl = document.getElementById('diffStatus');
    
    if (Math.abs(diff) < 1) {
        diffEl.innerText = "✅ Matched!";
        diffEl.style.color = "#059669";
    } else if (diff > 0) {
        diffEl.innerText = `Excess: +${formatCurrency(diff)}`;
        diffEl.style.color = "#2563eb";
    } else {
        diffEl.innerText = `Short: ${formatCurrency(diff)}`;
        diffEl.style.color = "#dc2626";
    }
}

async function saveCounterHistory() {
    const date = document.getElementById('date').value;
    const inputs = document.querySelectorAll('.denom-input');
    const denomData = {};
    let total = 0;
    
    inputs.forEach(input => {
        const multiplier = parseInt(input.getAttribute('data-val'));
        const count = parseInt(input.value) || 0;
        total += (multiplier * count);
        denomData[multiplier] = count;
    });
    
    const officialBal = parseFloat(document.getElementById('finalBalance').innerText.replace(/[^0-9.-]+/g,"")) || 0;
    const expectedCash = officialBal - secretDueAmount;
    const diff = total - expectedCash;
    
    const payload = {
        user_id: currentUser.id,
        count_date: date,
        denomination_data: denomData,
        total_counted: total,
        expected_cash: expectedCash,
        difference: diff
    };
    
    const btn = document.querySelector('.btn-save-counter');
    setButtonLoading(btn, true);
    
    const { error } = await _supabase.from('cash_counter_history')
        .upsert(payload, { onConflict: 'user_id, count_date' });
    
    if (error) {
        showToast('Error saving: ' + error.message, 'error');
    } else {
        showToast('Counter history saved!', 'success');
    }
    
    setButtonLoading(btn, false);
}

function viewCounterHistory() {
    window.location.href = 'counter_history.html';
}
