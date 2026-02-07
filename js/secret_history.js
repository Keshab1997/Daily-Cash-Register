let currentUser = null;
let allData = [];
let filteredData = [];
let currentView = 'summary';

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

    const istToday = getISTDate();
    const today = new Date(istToday);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    document.getElementById('endDate').value = istToday;
    document.getElementById('startDate').value = thirtyDaysAgo.toLocaleDateString('en-CA');

    await fetchHistory();
};

async function fetchHistory() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;

    if (!start || !end) {
        loading.style.display = 'none';
        return showToast("Please select both dates", 'error');
    }

    allData = [];
    filteredData = [];

    const { data, error } = await _supabase.from('secret_box')
        .select('*')
        .eq('user_id', currentUser.id)
        .gte('t_date', start)
        .lte('t_date', end)
        .order('t_date', { ascending: false })
        .order('created_at', { ascending: false });

    loading.style.display = 'none';

    if (!error) {
        allData = data || [];
        applyFilters();
    } else {
        showToast("Failed to load data", 'error');
    }
}

function renderTable(data) {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No records found.</td></tr>';
        return;
    }
    
    if (currentView === 'summary') {
        renderSummaryView(data);
    } else {
        renderDetailedView(data);
    }
}

function renderSummaryView(data) {
    const tbody = document.getElementById('historyBody');
    
    const personBalance = {};
    const personPurpose = {};
    const personLastDate = {};
    
    data.forEach(item => {
        const name = item.party_name || 'Unknown';
        if (!personBalance[name]) {
            personBalance[name] = 0;
            personPurpose[name] = item.description;
            personLastDate[name] = item.t_date;
        }
        
        if (item.t_type === 'TAKE') {
            const remaining = parseFloat(item.remaining_amount);
            if (!isNaN(remaining)) {
                personBalance[name] += remaining;
            }
        }
        
        if (item.t_date > personLastDate[name]) {
            personLastDate[name] = item.t_date;
        }
    });
    
    const personList = Object.entries(personBalance)
        .filter(([_, balance]) => balance > 0.01)
        .sort((a, b) => b[1] - a[1]);
    
    if (personList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px 20px; color:#10b981; font-size:1.2rem; font-weight:700;">✅ All Settled!</td></tr>';
        return;
    }
    
    personList.forEach(([name, balance]) => {
        const tr = `
            <tr>
                <td data-label="Date">${personLastDate[name]}</td>
                <td data-label="Name"><strong>${name}</strong></td>
                <td data-label="Purpose">${personPurpose[name]}</td>
                <td data-label="Type"><span class="badge badge-take">DUE</span></td>
                <td data-label="Amount" class="amount-cell" style="color:#ef4444; font-weight:700;">
                    ${formatCurrency(balance)}
                </td>
                <td data-label="Action" style="text-align:center; color:#9ca3af;">—</td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}

function renderDetailedView(data) {
    const tbody = document.getElementById('historyBody');
    
    data.forEach(row => {
        const isTake = row.t_type === 'TAKE';
        const badgeClass = isTake ? 'badge-take' : 'badge-return';
        const amountColor = isTake ? '#ef4444' : '#10b981';
        const remaining = parseFloat(row.remaining_amount || 0);
        
        let actionHtml = '';
        
        if (isTake && remaining > 0) {
            actionHtml = `
                <div class="return-wrapper">
                    <input type="number" class="return-input" id="ret_${row.id}" placeholder="Max ₹${remaining.toFixed(0)}" max="${remaining}" onkeydown="checkEnter(event, ${row.id})">
                    <button class="btn-quick-return" onclick="quickReturnFromEntry(${row.id})">OK</button>
                    <i class="ri-delete-bin-line btn-delete" onclick="deleteEntry(${row.id})"></i>
                </div>
            `;
        } else if (isTake && remaining <= 0) {
            actionHtml = `<span style="color:#10b981; font-weight:600;">✅ Settled</span> <i class="ri-delete-bin-line btn-delete" onclick="deleteEntry(${row.id})"></i>`;
        } else {
            actionHtml = `<span style="color:#9ca3af; font-size:0.85rem;">Return entry</span>`;
        }
        
        const displayAmount = isTake ? `₹${row.amount} (₹${remaining} left)` : `₹${row.amount}`;
        
        const tr = `
            <tr>
                <td data-label="Date" contenteditable="true" class="editable" onblur="updateEntry(${row.id}, 't_date', this.innerText)">${row.t_date}</td>
                <td data-label="Name" contenteditable="true" class="editable" onblur="updateEntry(${row.id}, 'party_name', this.innerText)">${row.party_name || ''}</td>
                <td data-label="Purpose" contenteditable="true" class="editable" onblur="updateEntry(${row.id}, 'description', this.innerText)">${row.description}</td>
                <td data-label="Type"><span class="badge ${badgeClass}">${row.t_type}</span></td>
                <td data-label="Amount" class="amount-cell" style="color:${amountColor}">${displayAmount}</td>
                <td data-label="Action">${actionHtml}</td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}

function switchView(view) {
    currentView = view;
    
    document.getElementById('btnDetailed').classList.toggle('active', view === 'detailed');
    document.getElementById('btnSummary').classList.toggle('active', view === 'summary');
    
    renderTable(filteredData);
}

function applyFilters() {
    const name = document.getElementById('filterName').value.toLowerCase();
    const purpose = document.getElementById('filterPurpose').value.toLowerCase();
    
    filteredData = allData.filter(item => {
        const matchName = !name || (item.party_name && item.party_name.toLowerCase().includes(name));
        const matchPurpose = !purpose || item.description.toLowerCase().includes(purpose);
        return matchName && matchPurpose;
    });
    
    renderTable(filteredData);
}

async function updateEntry(id, field, value) {
    value = value.trim();
    
    const original = allData.find(d => d.id === id);
    if (original[field] == value) return;
    
    if (field === 'amount') {
        value = parseFloat(value);
        if (isNaN(value) || value <= 0) {
            showToast("Invalid amount", 'error');
            return fetchHistory();
        }
    }
    
    const updatePayload = {};
    updatePayload[field] = value;
    
    const { error } = await _supabase.from('secret_box')
        .update(updatePayload)
        .eq('id', id);
    
    if (error) {
        showToast("Update failed: " + error.message, 'error');
    } else {
        original[field] = value;
        console.log("Auto-saved!");
    }
}

function checkEnter(e, id) {
    if (e.key === 'Enter') {
        quickReturnFromEntry(id);
    }
}

async function quickReturnFromEntry(id) {
    const entry = allData.find(d => d.id === id);
    if (!entry) {
        await fetchHistory();
        const freshEntry = allData.find(d => d.id === id);
        if (!freshEntry) return;
        await quickReturn(id, freshEntry.party_name, freshEntry.description);
    } else {
        await quickReturn(id, entry.party_name, entry.description);
    }
}

async function quickReturn(id, name, desc) {
    const input = document.getElementById(`ret_${id}`);
    const amount = parseFloat(input.value);
    
    if (!amount || amount <= 0) {
        return alert("Enter valid return amount");
    }
    
    // Get the specific entry that user clicked on
    const { data: clickedEntry, error: fetchError } = await _supabase
        .from('secret_box')
        .select('*')
        .eq('id', id)
        .single();
    
    if (fetchError || !clickedEntry) {
        return alert("Error fetching entry");
    }
    
    const currentRemaining = parseFloat(clickedEntry.remaining_amount || clickedEntry.amount);
    
    if (amount > currentRemaining) {
        return alert(`❌ Cannot return ₹${amount}!\n\nThis entry has: ₹${currentRemaining.toFixed(2)}\nYou can only return up to ₹${currentRemaining.toFixed(2)}`);
    }
    
    // Update only this specific entry
    const newRemaining = currentRemaining - amount;
    
    const { error: updateError } = await _supabase
        .from('secret_box')
        .update({ remaining_amount: newRemaining })
        .eq('id', id);
    
    if (updateError) {
        return alert('Update failed: ' + updateError.message);
    }
    
    alert(`✅ ₹${amount} returned successfully!`);
    input.value = '';
    await fetchHistory();
}

async function deleteEntry(id) {
    if(!confirm("Delete this record permanently?")) return;
    
    const { error } = await _supabase.from('secret_box').delete().eq('id', id);
    if (!error) {
        allData = allData.filter(d => d.id !== id);
        applyFilters();
    } else {
        showToast("Error deleting: " + error.message, 'error');
    }
}

function downloadSecretPDF() {
    if (filteredData.length === 0) {
        return showToast("No data to download!", 'info');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 15;
    
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    doc.setFontSize(18);
    doc.text("Secret Box Report", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, y);
    y += 10;

    // Calculate net balance using remaining_amount
    const summary = {};
    filteredData.forEach(item => {
        const name = item.party_name || 'Unknown';
        if (!summary[name]) summary[name] = { net: 0, taken: 0, returned: 0 };
        
        const amt = parseFloat(item.amount) || 0;
        
        if (item.t_type === 'TAKE') {
            const remaining = parseFloat(item.remaining_amount) || 0;
            summary[name].net += remaining;
            summary[name].taken += amt;
        } else {
            summary[name].returned += amt;
        }
    });

    // Filter only entries with remaining balance
    const summaryRows = Object.entries(summary)
        .filter(([_, data]) => data.net > 0.01)
        .sort((a, b) => b[1].net - a[1].net)
        .map(([name, data]) => [
            name, 
            `Rs.${data.taken.toFixed(2)}`, 
            `Rs.${data.returned.toFixed(2)}`, 
            `Rs.${data.net.toFixed(2)}`,
            'Owner will pay'
        ]);

    if (summaryRows.length === 0) {
        doc.setFontSize(16);
        doc.setTextColor(16, 185, 129);
        const pageWidth = doc.internal.pageSize.getWidth();
        const text = "✅ All Settled! No pending dues.";
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y + 30);
    } else {
        doc.setFontSize(12);
        doc.text("Net Balance Summary (Pending Dues Only)", 14, y);
        y += 5;

        doc.autoTable({
            startY: y,
            head: [['Name', 'Total Taken', 'Total Returned', 'Net Balance', 'Status']],
            body: summaryRows,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right', fontStyle: 'bold', textColor: [239, 68, 68] }
            }
        });
    }

    doc.save('Secret_Balance_Report.pdf');
    showToast("PDF downloaded successfully!", 'success');
}
