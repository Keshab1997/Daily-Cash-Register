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

document.getElementById('sDate').value = getISTDate();

await loadAllData();
await loadSuggestions();
};

async function loadAllData() {
currentSystemBalance = await calculateSystemBalance();
document.getElementById('sysBal').innerText = formatCurrency(currentSystemBalance);
await fetchSecretData();
}

async function calculateSystemBalance() {
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
    renderSecretList(allSecretData.slice(0, 5)); // Show only top 5
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
    const name = item.party_name || 'Unknown';

    const li = `
        <li>
            <div class="li-left">
                <div class="li-desc">
                    <span class="li-name">${name}</span>
                    <span>- ${item.description}</span>
                </div>
                <span class="li-date">${item.t_date}</span>
            </div>
            <div class="li-right">
                <span class="li-amount" style="color: ${amountColor}">
                    ${isTake ? '-' : '+'} ${formatCurrency(item.amount)}
                </span>
                <span class="li-type ${typeClass}">${typeLabel}</span>
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
const phyEl = document.getElementById('phyBal');
phyEl.innerText = formatCurrency(physicalCash);
phyEl.style.color = physicalCash >= 0 ? 'white' : '#ffcfcf';
}

// --- Auto Fill Logic ---
async function loadSuggestions() {
const { data } = await _supabase.from('secret_box')
.select('description')
.eq('user_id', currentUser.id);

if(data) {
    const unique = [...new Set(data.map(item => item.description))];
    document.getElementById('purposeSuggestions').innerHTML = 
        unique.map(d => `<option value="${d}">`).join('');
}
}

function handleAutoFill() {
const purpose = document.getElementById('sPurpose').value;
const match = allSecretData.find(item => item.description === purpose);

if (match && match.party_name) {
    document.getElementById('sName').value = match.party_name;
}
}

async function addSecretTransaction(type) {
const date = document.getElementById('sDate').value;
const name = document.getElementById('sName').value.trim();
const purpose = document.getElementById('sPurpose').value.trim();
const amount = parseFloat(document.getElementById('sAmount').value);

if (!date || !name || !purpose || !amount || amount <= 0) {
    return alert("Please fill all fields correctly.");
}

const payload = {
    user_id: currentUser.id,
    t_date: date,
    t_type: type,
    party_name: name,
    description: purpose,
    amount: amount
};

const { error } = await _supabase.from('secret_box').insert(payload);
if (!error) {
    document.getElementById('sName').value = '';
    document.getElementById('sPurpose').value = '';
    document.getElementById('sAmount').value = '';
    await loadAllData();
    await loadSuggestions();
} else {
    alert("Error: " + error.message);
}
}

// --- Due Summary Logic ---
function showDueSummary() {
    const modal = document.getElementById('dueModal');
    const tbody = document.getElementById('dueListBody');
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;">Calculating...</td></tr>';
    
    modal.style.display = 'flex';
    
    // Group data by Name
    const summary = {};
    
    allSecretData.forEach(item => {
        const name = item.party_name || 'Unknown';
        if (!summary[name]) summary[name] = 0;
        
        if (item.t_type === 'TAKE') {
            summary[name] += item.amount; // Due increases
        } else {
            summary[name] -= item.amount; // Due decreases
        }
    });

    // Convert to array and sort
    const sortedList = Object.entries(summary)
        .sort((a, b) => b[1] - a[1]); // বেশি বাকি আগে দেখাবে

    tbody.innerHTML = '';
    
    if (sortedList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px; color:#9ca3af;">No records found.</td></tr>';
        return;
    }

    sortedList.forEach(([name, amount]) => {
        let colorClass = 'due-zero';
        let sign = '';
        let label = '';
        
        if (amount > 0) {
            colorClass = 'due-positive';
            sign = '+';
            label = ' (Due)';
        } else if (amount < 0) {
            colorClass = 'due-negative';
            sign = '';
            label = ' (Advance)';
        } else {
            label = ' (Settled)';
        }

        const tr = `
            <tr>
                <td>${name}</td>
                <td class="${colorClass}" style="text-align: right;">
                    ${sign}${formatCurrency(Math.abs(amount))}${label}
                </td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}

function closeDueModal() {
    document.getElementById('dueModal').style.display = 'none';
}
