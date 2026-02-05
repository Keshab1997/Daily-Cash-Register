let currentUser = null;
let allData = [];

const formatCurrency = (amount) => {
return new Intl.NumberFormat('en-IN', {
style: 'currency',
currency: 'INR'
}).format(amount);
};

const getISTDate = () => {
return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

window.onload = async () => {
const session = await checkAuth(true);
currentUser = session.user;
await fetchHistory();
};

async function fetchHistory() {
const loading = document.getElementById('loading');
loading.style.display = 'block';

const { data, error } = await _supabase.from('secret_box')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('t_date', { ascending: false })
    .order('created_at', { ascending: false });

loading.style.display = 'none';

if (!error) {
    allData = data || [];
    renderTable(allData);
} else {
    alert("Failed to load data");
}
}

function renderTable(data) {
const tbody = document.getElementById('historyBody');
tbody.innerHTML = '';

if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No records found.</td></tr>';
    return;
}

data.forEach(row => {
    const isTake = row.t_type === 'TAKE';
    const badgeClass = isTake ? 'badge-take' : 'badge-return';
    const amountColor = isTake ? '#ef4444' : '#10b981';
    
    // Quick Return Input Logic (Only for TAKE rows)
    let actionHtml = '';
    if (isTake) {
        actionHtml = `
            <div class="return-wrapper">
                <input type="number" class="return-input" id="ret_${row.id}" placeholder="Return ₹" onkeydown="checkEnter(event, ${row.id}, '${row.party_name}', '${row.description}')">
                <button class="btn-quick-return" onclick="quickReturn(${row.id}, '${row.party_name}', '${row.description}')">OK</button>
                <i class="ri-delete-bin-line btn-delete" onclick="deleteEntry(${row.id})"></i>
            </div>
        `;
    } else {
        actionHtml = `<i class="ri-delete-bin-line btn-delete" onclick="deleteEntry(${row.id})"></i>`;
    }

    const tr = `
        <tr>
            <td contenteditable="true" class="editable" onblur="updateEntry(${row.id}, 't_date', this.innerText)">${row.t_date}</td>
            <td contenteditable="true" class="editable" onblur="updateEntry(${row.id}, 'party_name', this.innerText)">${row.party_name || ''}</td>
            <td contenteditable="true" class="editable" onblur="updateEntry(${row.id}, 'description', this.innerText)">${row.description}</td>
            <td><span class="badge ${badgeClass}">${row.t_type}</span></td>
            <td contenteditable="true" class="editable amount-cell" style="color:${amountColor}" onblur="updateEntry(${row.id}, 'amount', this.innerText)">${row.amount}</td>
            <td>${actionHtml}</td>
        </tr>
    `;
    tbody.innerHTML += tr;
});
}

// --- Filters ---
function applyFilters() {
const date = document.getElementById('filterDate').value;
const name = document.getElementById('filterName').value.toLowerCase();
const purpose = document.getElementById('filterPurpose').value.toLowerCase();

const filtered = allData.filter(item => {
    const matchDate = !date || item.t_date === date;
    const matchName = !name || (item.party_name && item.party_name.toLowerCase().includes(name));
    const matchPurpose = !purpose || item.description.toLowerCase().includes(purpose);
    return matchDate && matchName && matchPurpose;
});

renderTable(filtered);
}

// --- Inline Edit & Auto Save ---
async function updateEntry(id, field, value) {
value = value.trim();

// Find original data to check if changed
const original = allData.find(d => d.id === id);
if (original[field] == value) return; // No change

// Validation
if (field === 'amount') {
    value = parseFloat(value);
    if (isNaN(value) || value <= 0) {
        alert("Invalid amount");
        return fetchHistory(); // Reset view
    }
}

const updatePayload = {};
updatePayload[field] = value;

const { error } = await _supabase.from('secret_box')
    .update(updatePayload)
    .eq('id', id);

if (error) {
    alert("Update failed: " + error.message);
} else {
    // Update local data without reload
    original[field] = value;
    console.log("Auto-saved!");
}
}

// --- Quick Return Logic ---
function checkEnter(e, id, name, desc) {
if (e.key === 'Enter') {
quickReturn(id, name, desc);
}
}

async function quickReturn(id, name, desc) {
const input = document.getElementById(`ret_${id}`);
const amount = parseFloat(input.value);

if (!amount || amount <= 0) return alert("Enter valid return amount");

const payload = {
    user_id: currentUser.id,
    t_date: getISTDate(),
    t_type: 'RETURN',
    party_name: name,
    description: desc,
    amount: amount
};

const { error } = await _supabase.from('secret_box').insert(payload);

if (!error) {
    alert(`✅ ₹${amount} Returned successfully!`);
    input.value = '';
    await fetchHistory(); // Reload to show new entry
} else {
    alert("Error: " + error.message);
}
}

async function deleteEntry(id) {
if(!confirm("Delete this record permanently?")) return;

const { error } = await _supabase.from('secret_box').delete().eq('id', id);
if (!error) {
    allData = allData.filter(d => d.id !== id);
    applyFilters();
} else {
    alert("Error deleting: " + error.message);
}
}
