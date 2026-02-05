let currentUser = null;
let transactions = [];
let secretDueAmount = 0;

const getISTDate = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

window.onload = async () => {
    const session = await checkAuth(true);
    currentUser = session.user;
    
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

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
        .select('amount, t_type')
        .eq('user_id', currentUser.id);

    if (!error && data) {
        let due = 0;
        data.forEach(item => {
            if (item.t_type === 'TAKE') due += item.amount;
            else due -= item.amount;
        });
        secretDueAmount = due;
        document.getElementById('secDue').innerText = formatCurrency(due);
        calcDenom();
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.code === 'KeyI') {
            e.preventDefault();
            document.getElementById('inName').focus();
        }
        if (e.altKey && e.code === 'KeyO') {
            e.preventDefault();
            document.getElementById('outName').focus();
        }
        if (e.altKey && e.code === 'KeyS') {
            e.preventDefault();
            saveDayEnd();
        }
        if (e.altKey && e.code === 'KeyH') {
            e.preventDefault();
            window.location.href = 'history.html';
        }
        if (e.key === 'Enter') {
            if (document.activeElement.id === 'inName' || document.activeElement.id === 'inAmount') {
                addTransaction('IN');
            }
            if (document.activeElement.id === 'outName' || document.activeElement.id === 'outAmount') {
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
    if (Notification.permission === "granted") {
        new Notification(title, { body: body });
    }
}

async function fetchOpeningBalance() {
    const selectedDate = document.getElementById('date').value;
    
    // ১. শেষ কবে "Save Day End" করা হয়েছিল সেই ডাটা নিচ্ছি
    const { data: lastSavedDay } = await _supabase.from('daily_accounts')
        .select('report_date, petty_cash')
        .eq('user_id', currentUser.id)
        .lt('report_date', selectedDate)
        .order('report_date', { ascending: false })
        .limit(1);

    let baseBalance = 0;
    let lastSavedDate = '1900-01-01'; // যদি কোনোদিন সেভ না করা হয়

    if (lastSavedDay && lastSavedDay.length > 0) {
        baseBalance = lastSavedDay[0].petty_cash;
        lastSavedDate = lastSavedDay[0].report_date;
    }

    // ২. শেষ সেভ করা দিন থেকে আজ পর্যন্ত যত ট্রানজেকশন হয়েছে (যা সেভ করা হয়নি) সেগুলো ক্যালকুলেট করা
    const { data: pendingTrans } = await _supabase.from('transactions')
        .select('amount, t_type')
        .eq('user_id', currentUser.id)
        .gt('t_date', lastSavedDate)
        .lt('t_date', selectedDate);

    let adjustment = 0;
    if (pendingTrans) {
        pendingTrans.forEach(t => {
            if (t.t_type === 'IN') adjustment += t.amount;
            else adjustment -= t.amount;
        });
    }

    const finalOpening = baseBalance + adjustment;
    document.getElementById('opening').value = finalOpening;
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
        const uniqueNames = [...new Set(data.map(item => item.party_name))];
        document.getElementById('nameSuggestions').innerHTML = uniqueNames.map(name => `<option value="${name}">`).join('');
    }
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

    btn.disabled = true;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="ri-loader-4-line"></i>';

    const payload = {
        user_id: currentUser.id,
        t_date: document.getElementById('date').value,
        t_type: type,
        party_name: name,
        amount: amount
    };

    const { error } = await _supabase.from('transactions').insert(payload);

    if (error) {
        alert("Error: " + error.message);
    } else {
        nameInput.value = '';
        amountInput.value = '';
        nameInput.focus();
        await loadTodayTransactions();
    }
    btn.disabled = false;
    btn.innerHTML = originalHtml;
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
    if (!error) await loadTodayTransactions();
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

async function saveDayEnd() {
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

    const { error } = await _supabase.from('daily_accounts')
        .upsert(summaryPayload, { onConflict: 'user_id, report_date' });

    if(error) alert('Error: ' + error.message);
    else {
        sendNotification("✅ Saved", "Day End report saved successfully!");
        alert('✅ Day End Saved Successfully!');
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
    if (box.style.display === 'block') fetchSecretDue();
}

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

    localStorage.setItem('cashDenoms', JSON.stringify(denomData));

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
