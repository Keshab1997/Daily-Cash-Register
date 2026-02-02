let currentUser = null;
let transactions = []; 

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

window.onload = async () => {
    const session = await checkAuth(true);
    currentUser = session.user;
    
    const dateInput = document.getElementById('date');
    if (!dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    dateInput.addEventListener('change', () => {
        fetchOpeningBalance();
        loadTodayTransactions();
    });
    
    await fetchOpeningBalance();
    await loadTodayTransactions();
    await loadSuggestions();
};

async function fetchOpeningBalance() {
    const { data } = await _supabase.from('daily_accounts')
        .select('petty_cash')
        .eq('user_id', currentUser.id)
        .lt('report_date', document.getElementById('date').value)
        .order('report_date', { ascending: false })
        .limit(1);
        
    document.getElementById('opening').value = (data && data.length > 0) ? data[0].petty_cash : 0;
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

    if (!name || !amount || amount <= 0) {
        alert("Please enter valid Name and Amount");
        return;
    }

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
    else alert('✅ Day End Saved Successfully!');
}

function shareWhatsApp() {
    const date = document.getElementById('date').value;
    const opening = formatCurrency(document.getElementById('opening').value);
    const final = document.getElementById('finalBalance').innerText;
    
    let msg = `*📅 Daily Report (${date})*\n`;
    msg += `----------------------------\n`;
    msg += `🔹 Opening: ${opening}\n\n`;
    
    msg += `*📥 RECEIVED:*\n`;
    transactions.filter(t => t.t_type === 'IN').forEach(t => {
        msg += `• ${t.party_name}: ${formatCurrency(t.amount)}\n`;
    });
    
    msg += `\n*📤 PAID:*\n`;
    transactions.filter(t => t.t_type === 'OUT').forEach(t => {
        msg += `• ${t.party_name}: ${formatCurrency(t.amount)}\n`;
    });

    msg += `\n----------------------------\n`;
    msg += `*💰 Closing: ${final}*`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
