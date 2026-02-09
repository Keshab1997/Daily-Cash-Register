let currentUser = null;
let allSecretData = [];
let currentSystemBalance = 0;
let allPurposeSuggestions = [];
let allNameSuggestions = [];

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
setupCustomDropdown();
setupKeyboardNavigation();
};

function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDueModal();
            document.getElementById('purposeDropdown')?.classList.remove('active');
            document.getElementById('nameDropdown')?.classList.remove('active');
        }
        if (e.key === 'Enter' && (document.activeElement.id === 'sDate' || 
            document.activeElement.id === 'sPurpose' || 
            document.activeElement.id === 'sName' || 
            document.activeElement.id === 'sAmount')) {
            e.preventDefault();
            const inputs = ['sDate', 'sPurpose', 'sName', 'sAmount'];
            const currentIndex = inputs.indexOf(document.activeElement.id);
            if (currentIndex < inputs.length - 1) {
                document.getElementById(inputs[currentIndex + 1]).focus();
            } else {
                document.querySelector('.btn-take').focus();
            }
        }
    });
}

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
const list = document.getElementById('secretList');
const loader = document.getElementById('secretLoader');
const noData = document.getElementById('noSecretData');

list.style.display = 'none';
loader.style.display = 'block';
noData.style.display = 'none';

const { data, error } = await _supabase.from('secret_box')
.select('*')
.eq('user_id', currentUser.id)
.order('created_at', { ascending: false });

loader.style.display = 'none';

if (!error) {
    allSecretData = data || [];
    renderSecretList(allSecretData.slice(0, 5));
    calculateCards();
    list.style.display = 'block';
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

const personBalance = {};
const personLastDate = {};
const personPurpose = {};

data.forEach(item => {
    const name = item.party_name || 'Unknown';
    if (!personBalance[name]) {
        personBalance[name] = 0;
        personLastDate[name] = item.t_date;
        personPurpose[name] = item.description;
    }
    
    if (item.t_type === 'TAKE') {
        const rem = parseFloat(item.remaining_amount);
        if (!isNaN(rem)) {
            personBalance[name] += rem;
        }
    }
    
    if (item.t_date > personLastDate[name]) {
        personLastDate[name] = item.t_date;
    }
});

const personList = Object.entries(personBalance)
    .filter(([_, balance]) => balance > 0.01)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

if (personList.length === 0) {
    noData.style.display = 'block';
    return;
}

personList.forEach(([name, balance]) => {
    const li = `
        <li>
            <div class="li-left">
                <div class="li-desc">
                    <span class="li-name">${name}</span>
                    <span>- ${personPurpose[name]}</span>
                </div>
                <span class="li-date">${personLastDate[name]}</span>
            </div>
            <div class="li-right">
                <span class="li-amount" style="color: #ef4444">
                    ${formatCurrency(balance)}
                </span>
                <span class="li-type type-take">DUE</span>
            </div>
        </li>
    `;
    list.innerHTML += li;
});
}

function calculateCards() {
let totalDue = 0;
allSecretData.forEach(item => {
if (item.t_type === 'TAKE') {
    const rem = parseFloat(item.remaining_amount);
    if (!isNaN(rem)) {
        totalDue += rem;
    }
}
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
.select('description, party_name')
.eq('user_id', currentUser.id);

if(data) {
    allPurposeSuggestions = [...new Set(data.map(item => item.description))];
    allNameSuggestions = [...new Set(data.map(item => item.party_name).filter(Boolean))];
}
}

function setupCustomDropdown() {
    const purposeInput = document.getElementById('sPurpose');
    const nameInput = document.getElementById('sName');
    
    const purposeDropdown = document.createElement('div');
    purposeDropdown.className = 'suggestion-dropdown';
    purposeDropdown.id = 'purposeDropdown';
    purposeInput.parentElement.appendChild(purposeDropdown);
    
    const nameDropdown = document.createElement('div');
    nameDropdown.className = 'suggestion-dropdown';
    nameDropdown.id = 'nameDropdown';
    nameInput.parentElement.appendChild(nameDropdown);
    
    purposeInput.addEventListener('input', (e) => {
        debouncedShowSuggestions(e.target, purposeDropdown, allPurposeSuggestions);
        handleAutoFill();
    });
    nameInput.addEventListener('input', (e) => debouncedShowSuggestions(e.target, nameDropdown, allNameSuggestions));
    
    purposeInput.addEventListener('focus', (e) => showSuggestions(e.target, purposeDropdown, allPurposeSuggestions));
    nameInput.addEventListener('focus', (e) => showSuggestions(e.target, nameDropdown, allNameSuggestions));
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.inp-grp')) {
            purposeDropdown.classList.remove('active');
            nameDropdown.classList.remove('active');
        }
    });
}

function showSuggestions(input, dropdown, suggestions) {
    const value = input.value.toLowerCase();
    const filtered = suggestions.filter(s => s.toLowerCase().includes(value));
    
    if (filtered.length === 0) {
        dropdown.classList.remove('active');
        return;
    }
    
    dropdown.innerHTML = filtered.map(item => 
        `<div class="suggestion-item" onclick="selectSuggestion('${input.id}', '${item.replace(/'/g, "\\'")}')">${item}</div>`
    ).join('');
    
    dropdown.classList.add('active');
}

const debouncedShowSuggestions = debounce(showSuggestions, 200);

function selectSuggestion(inputId, value) {
    document.getElementById(inputId).value = value;
    document.getElementById(inputId === 'sPurpose' ? 'purposeDropdown' : 'nameDropdown').classList.remove('active');
    if (inputId === 'sPurpose') handleAutoFill();
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
    return showToast("Please fill all fields correctly.", 'error');
}

const btn = type === 'TAKE' ? document.querySelector('.btn-take') : document.querySelector('.btn-return');
setButtonLoading(btn, true);
showProgress(30);

if (type === 'RETURN') {
    const { data: personData } = await _supabase.from('secret_box')
        .select('id, amount, t_type, remaining_amount, created_at')
        .eq('user_id', currentUser.id)
        .eq('party_name', name)
        .order('created_at', { ascending: true });
    
    let currentBalance = 0;
    if (personData) {
        personData.forEach(item => {
            if (item.t_type === 'TAKE') {
                currentBalance += parseFloat(item.remaining_amount || item.amount);
            }
        });
    }
    
    if (amount > currentBalance) {
        setButtonLoading(btn, false);
        hideProgress();
        return showToast(`❌ Cannot return ₹${amount}!\n\nCurrent due: ₹${currentBalance.toFixed(2)}`, 'error');
    }
    
    let remainingReturn = amount;
    const takeEntries = personData.filter(item => item.t_type === 'TAKE' && parseFloat(item.remaining_amount || item.amount) > 0)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    for (const entry of takeEntries) {
        if (remainingReturn <= 0) break;
        
        const entryRemaining = parseFloat(entry.remaining_amount || entry.amount);
        const deduction = Math.min(remainingReturn, entryRemaining);
        const newRemaining = entryRemaining - deduction;
        
        const { error } = await _supabase.from('secret_box')
            .update({ remaining_amount: newRemaining })
            .eq('id', entry.id);
        
        if (error) {
            setButtonLoading(btn, false);
            hideProgress();
            return showToast("Error: " + error.message, 'error');
        }
        
        remainingReturn -= deduction;
    }
    
    showToast(`✅ ₹${amount} returned successfully!`, 'success');
} else {
    const payload = {
        user_id: currentUser.id,
        t_date: date,
        t_type: type,
        party_name: name,
        description: purpose,
        amount: amount,
        remaining_amount: amount
    };
    
    const { error } = await _supabase.from('secret_box').insert(payload);
    if (error) {
        setButtonLoading(btn, false);
        hideProgress();
        return showToast("Error: " + error.message, 'error');
    }
}

showProgress(70);
document.getElementById('sName').value = '';
document.getElementById('sPurpose').value = '';
document.getElementById('sAmount').value = '';
await loadAllData();
await loadSuggestions();
showProgress(100);
hideProgress();
setButtonLoading(btn, false);
}

// --- Due Summary Logic ---
function showDueSummary() {
    const modal = document.getElementById('dueModal');
    const tbody = document.getElementById('dueListBody');
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;">Calculating...</td></tr>';
    
    modal.style.display = 'flex';
    
    const summary = {};
    
    allSecretData.forEach(item => {
        const name = item.party_name || 'Unknown';
        if (!summary[name]) summary[name] = 0;
        
        if (item.t_type === 'TAKE') {
            const rem = parseFloat(item.remaining_amount);
            if (!isNaN(rem)) {
                summary[name] += rem;
            }
        }
    });

    const sortedList = Object.entries(summary)
        .filter(([_, amount]) => amount > 0.01)
        .sort((a, b) => b[1] - a[1]);

    tbody.innerHTML = '';
    
    if (sortedList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px; color:#10b981;">✅ All Settled!</td></tr>';
        return;
    }

    sortedList.forEach(([name, amount]) => {
        const tr = `
            <tr>
                <td>${name}</td>
                <td class="due-positive" style="text-align: right;">
                    ${formatCurrency(amount)} (Due)
                </td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}

function closeDueModal() {
    document.getElementById('dueModal').style.display = 'none';
}
