let currentUser = null;
let transactions = [];

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
        
    if(data && data.length > 0) {
        document.getElementById('opening').value = data[0].petty_cash;
    } else {
        document.getElementById('opening').value = 0;
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

    if (error) {
        console.error("Error loading transactions:", error);
        return;
    }

    transactions = data || [];
    renderList();
    updateSummary();
}

async function loadSuggestions() {
    const { data } = await _supabase.from('transactions')
        .select('party_name')
        .eq('user_id', currentUser.id);

    if(data) {
        const uniqueNames = [...new Set(data.map(item => item.party_name))];
        const datalist = document.getElementById('nameSuggestions');
        datalist.innerHTML = uniqueNames.map(name => `<option value="${name}">`).join('');
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
        alert("সঠিক নাম এবং টাকার পরিমাণ দিন।");
        return;
    }

    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<i class="ri-loader-4-line"></i>';
    btn.disabled = true;

    const payload = {
        user_id: currentUser.id,
        t_date: document.getElementById('date').value,
        t_type: type,
        party_name: name,
        amount: amount
    };

    const { data, error } = await _supabase.from('transactions').insert(payload).select();

    if (error) {
        alert("সেভ করা যায়নি: " + error.message);
    } else {
        nameInput.value = '';
        amountInput.value = '';
        nameInput.focus();
        
        await loadTodayTransactions();
    }

    btn.innerHTML = originalBtnText;
    btn.disabled = false;
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
                <div style="display:flex; align-items:center">
                    <span>${t.amount}</span>
                    <i class="ri-close-circle-line del-btn" onclick="removeTransaction(${t.id})"></i>
                </div>
            </li>
        `;
        if(t.t_type === 'IN') listIn.innerHTML += li;
        else listOut.innerHTML += li;
    });
}

async function removeTransaction(id) {
    if(!confirm("আপনি কি এটি মুছে ফেলতে চান?")) return;

    const { error } = await _supabase.from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        alert("মুছে ফেলা যায়নি: " + error.message);
    } else {
        await loadTodayTransactions();
    }
}

function updateSummary() {
    const opening = parseFloat(document.getElementById('opening').value) || 0;

    let totalIn = transactions.filter(t => t.t_type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    let totalOut = transactions.filter(t => t.t_type === 'OUT').reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('sumIn').innerText = totalIn;
    document.getElementById('sumOut').innerText = totalOut;

    const final = (opening + totalIn) - totalOut;
    const el = document.getElementById('finalBalance');
    el.innerText = final;
    el.style.color = final >= 0 ? '#10b981' : '#ef4444';
}

async function saveDayEnd() {
    const date = document.getElementById('date').value;
    const opening = parseFloat(document.getElementById('opening').value) || 0;
    const totalIn = parseFloat(document.getElementById('sumIn').innerText);
    const totalOut = parseFloat(document.getElementById('sumOut').innerText);
    const final = parseFloat(document.getElementById('finalBalance').innerText);

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
    else alert('✅ আজকের হিসাব সফলভাবে সেভ হয়েছে!');
}

function shareWhatsApp() {
    const date = document.getElementById('date').value;
    const opening = document.getElementById('opening').value;
    const final = document.getElementById('finalBalance').innerText;

    let msg = `*📅 Daily Hisab Report (${date})*\n\n`;
    msg += `🔹 Opening: ${opening}\n`;

    msg += `\n*📥 Money IN:*\n`;
    transactions.filter(t => t.t_type === 'IN').forEach(t => {
        msg += `• ${t.party_name}: ${t.amount}\n`;
    });

    msg += `\n*📤 Money OUT:*\n`;
    transactions.filter(t => t.t_type === 'OUT').forEach(t => {
        msg += `• ${t.party_name}: ${t.amount}\n`;
    });

    msg += `\n------------------\n`;
    msg += `*💰 Closing Balance: ${final}*`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
