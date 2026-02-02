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
    const today = getISTDate();
    
    const { data: openData } = await _supabase.from('daily_accounts')
        .select('petty_cash')
        .eq('user_id', currentUser.id)
        .lt('report_date', today)
        .order('report_date', { ascending: false })
        .limit(1);
    
    const opening = (openData && openData.length > 0) ? openData[0].petty_cash : 0;

    const { data: transData } = await _supabase.from('transactions')
        .select('amount, t_type')
        .eq('user_id', currentUser.id)
        .eq('t_date', today);

    let totalIn = 0;
    let totalOut = 0;

    if (transData) {
        totalIn = transData.filter(t => t.t_type === 'IN').reduce((sum, t) => sum + t.amount, 0);
        totalOut = transData.filter(t => t.t_type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
    }

    return (opening + totalIn) - totalOut;
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
    const physicalCash = currentSystemBalance - totalDue;
    document.getElementById('phyBal').innerText = formatCurrency(physicalCash);
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
