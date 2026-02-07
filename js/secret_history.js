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
            personBalance[name] += parseFloat(item.amount);
        } else {
            personBalance[name] -= parseFloat(item.amount);
        }
        
        if (item.t_date > personLastDate[name]) {
            personLastDate[name] = item.t_date;
        }
    });
    
    const personList = Object.entries(personBalance)
        .filter(([_, balance]) => Math.abs(balance) > 0.01)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    
    if (personList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#10b981;">✅ All Settled!</td></tr>';
        return;
    }
    
    personList.forEach(([name, balance]) => {
        const isDue = balance > 0;
        const badgeClass = isDue ? 'badge-take' : 'badge-return';
        const amountColor = isDue ? '#ef4444' : '#10b981';
        const sign = isDue ? '' : '+';
        const label = isDue ? 'DUE' : 'ADVANCE';
        
        const tr = `
            <tr>
                <td>${personLastDate[name]}</td>
                <td><strong>${name}</strong></td>
                <td>${personPurpose[name]}</td>
                <td><span class="badge ${badgeClass}">${label}</span></td>
                <td class="amount-cell" style="color:${amountColor}; font-weight:700;">
                    ${sign}${formatCurrency(Math.abs(balance))}
                </td>
                <td style="text-align:center; color:#9ca3af;">—</td>
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

function checkEnter(e, id, name, desc) {
    if (e.key === 'Enter') {
        quickReturn(id, name, desc);
    }
}

async function quickReturn(id, name, desc) {
    const input = document.getElementById(`ret_${id}`);
    const amount = parseFloat(input.value);
    
    if (!amount || amount <= 0) return showToast("Enter valid return amount", 'error');
    
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
        showToast(`✅ ₹${amount} Returned successfully!`, 'success');
        input.value = '';
        await fetchHistory();
    } else {
        showToast("Error: " + error.message, 'error');
    }
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

    const summary = {};
    filteredData.forEach(item => {
        const name = item.party_name || 'Unknown';
        const amt = parseFloat(item.amount) || 0;
        if (!summary[name]) summary[name] = { net: 0, taken: 0, returned: 0 };
        
        if (item.t_type === 'TAKE') {
            summary[name].net += amt;
            summary[name].taken += amt;
        } else {
            summary[name].net -= amt;
            summary[name].returned += amt;
        }
    });

    const summaryRows = Object.entries(summary)
        .sort((a, b) => b[1].net - a[1].net)
        .map(([name, data]) => {
            let status = '';
            let displayAmount = Math.abs(data.net).toFixed(2);
            
            if (data.net > 0) {
                status = 'Owner will pay';
                displayAmount = `+ Rs.${displayAmount}`;
            } else if (data.net < 0) {
                status = 'Party will pay';
                displayAmount = `- Rs.${displayAmount}`;
            } else {
                status = 'Settled';
                displayAmount = `Rs.0.00`;
            }
            
            return [
                name, 
                `Rs.${data.taken.toFixed(2)}`, 
                `Rs.${data.returned.toFixed(2)}`, 
                displayAmount, 
                status
            ];
        });

    doc.setFontSize(12);
    doc.text("A. Person-wise Net Balance Summary", 14, y);
    y += 5;

    doc.autoTable({
        startY: y,
        head: [['Name', 'Total Taken', 'Total Returned', 'Net Amount', 'Who Will Pay']],
        body: summaryRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right', fontStyle: 'bold' }
        }
    });

    y = doc.autoTable.previous.finalY + 10;

    doc.setFontSize(12);
    doc.text("B. Detailed Transaction History", 14, y);
    y += 5;

    const detailRows = filteredData.map(row => [
        row.t_date,
        row.party_name,
        row.description,
        row.t_type === 'TAKE' ? 'TAKEN (Loan)' : 'RETURNED (Deposit)',
        (row.t_type === 'TAKE' ? '-' : '+') + ' Rs.' + parseFloat(row.amount).toFixed(2)
    ]);

    doc.autoTable({
        startY: y,
        head: [['Date', 'Name', 'Purpose', 'Transaction Type', 'Amount']],
        body: detailRows,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            4: { halign: 'right' }
        }
    });

    doc.save('Secret_History_Report.pdf');
    showToast("PDF downloaded successfully!", 'success');
}
