let currentUser = null;
let allSecretData = [];
let currentSystemBalance = 0;

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
    
    await loadAllData();
    await loadSecretSuggestions();
};

async function loadAllData() {
    currentSystemBalance = await calculateSystemBalance();
    document.getElementById('sysBal').innerText = formatCurrency(currentSystemBalance);
    await fetchSecretData();
}

async function calculateSystemBalance() {
    // ১. শেষ কবে "Save Day End" করা হয়েছিল সেই ডাটা নিচ্ছি
    const { data: lastSavedDay } = await _supabase.from('daily_accounts')
        .select('report_date, petty_cash')
        .eq('user_id', currentUser.id)
        .order('report_date', { ascending: false })
        .limit(1);

    let baseBalance = 0;
    let lastSavedDate = '1900-01-01';

    if (lastSavedDay && lastSavedDay.length > 0) {
        baseBalance = lastSavedDay[0].petty_cash;
        lastSavedDate = lastSavedDay[0].report_date;
    }

    // ২. শেষ সেভ করা দিন থেকে আজ পর্যন্ত যত ট্রানজেকশন হয়েছে সবগুলোর যোগ-বিয়োগ
    const { data: pendingTrans } = await _supabase.from('transactions')
        .select('amount, t_type')
        .eq('user_id', currentUser.id)
        .gt('t_date', lastSavedDate);

    let adjustment = 0;
    if (pendingTrans) {
        pendingTrans.forEach(t => {
            if (t.t_type === 'IN') adjustment += t.amount;
            else adjustment -= t.amount;
        });
    }

    return baseBalance + adjustment;
}

async function fetchSecretData() {
    const { data, error } = await _supabase.from('secret_box')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (!error) {
        allSecretData = data || [];
        renderSecretList(allSecretData);
        calculateCards();
    }
}

function renderSecretList(data) {
    const list = document.getElementById('secretList');
    const noData = document.getElementById('noSecretData');
    list.innerHTML = '';

    if (data.length === 0) {
        noData.style.display = 'block';
        return;
    }
    noData.style.display = 'none';

    data.forEach(item => {
        const isTake = item.t_type === 'TAKE';
        const typeLabel = isTake ? 'TAKEN' : 'RETURNED';
        const typeClass = isTake ? 'type-take' : 'type-return';
        const amountColor = isTake ? '#ef4444' : '#10b981';

        const li = `
            <li>
                <div class="li-left">
                    <span class="li-desc">${item.description}</span>
                    <span class="li-date">${item.t_date}</span>
                </div>
                <div class="li-right">
                    <span class="li-amount" style="color: ${amountColor}">
                        ${isTake ? '-' : '+'} ${formatCurrency(item.amount)}
                    </span>
                    <span class="li-type ${typeClass}">${typeLabel}</span>
                    <i class="ri-delete-bin-line del-btn" onclick="deleteSecret(${item.id})"></i>
                </div>
            </li>
        `;
        list.innerHTML += li;
    });
}

function calculateCards() {
    let totalDue = 0;
    allSecretData.forEach(item => {
        if (item.t_type === 'TAKE') totalDue += item.amount;
        else totalDue -= item.amount;
    });

    document.getElementById('dueBal').innerText = formatCurrency(totalDue);
    
    // ফিজিক্যাল ক্যাশ = স্মার্ট সিস্টেম ব্যালেন্স - সিক্রেট ডিউ
    const physicalCash = currentSystemBalance - totalDue;
    const phyEl = document.getElementById('phyBal');
    phyEl.innerText = formatCurrency(physicalCash);
    
    // যদি ক্যাশ নেগেটিভ হয় তবে লাল রঙ দেখাবে
    phyEl.style.color = physicalCash >= 0 ? 'white' : '#ffcfcf';
}

function filterActivity() {
    const searchTerm = document.getElementById('searchActivity').value.toLowerCase();
    const filtered = allSecretData.filter(item => 
        item.description.toLowerCase().includes(searchTerm)
    );
    renderSecretList(filtered);
}

async function loadSecretSuggestions() {
    const { data } = await _supabase.from('secret_box')
        .select('description')
        .eq('user_id', currentUser.id);
    
    if(data) {
        const uniqueNames = [...new Set(data.map(item => item.description))];
        document.getElementById('secretSuggestions').innerHTML = 
            uniqueNames.map(name => `<option value="${name}">`).join('');
    }
}

async function addSecretTransaction(type) {
    const descInput = document.getElementById('desc');
    const amountInput = document.getElementById('amount');
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!desc || !amount || amount <= 0) return alert("Enter valid details");

    const payload = {
        user_id: currentUser.id,
        t_date: getISTDate(),
        t_type: type,
        description: desc,
        amount: amount
    };

    const { error } = await _supabase.from('secret_box').insert(payload);
    if (!error) {
        descInput.value = '';
        amountInput.value = '';
        await loadAllData();
        await loadSecretSuggestions();
    }
}

async function deleteSecret(id) {
    if(!confirm("Delete this entry?")) return;
    const { error } = await _supabase.from('secret_box').delete().eq('id', id);
    if (!error) await loadAllData();
}
