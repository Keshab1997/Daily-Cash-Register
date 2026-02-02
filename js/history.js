let currentUser = null;
let allData = [];
let filteredData = [];
let selectedNames = [];
let selectedIds = [];

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
    
    const istToday = getISTDate();
    const [year, month, day] = istToday.split('-');
    const firstDay = `${year}-${month}-01`;
    const lastDayObj = new Date(year, month, 0);
    const lastDay = lastDayObj.toISOString().split('T')[0];

    document.getElementById('startDate').value = firstDay;
    document.getElementById('endDate').value = lastDay;

    fetchHistory();

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-wrapper')) {
            document.getElementById('nameDropdown').classList.remove('show');
        }
    });
};

async function fetchHistory() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const tbody = document.getElementById('tableBody');
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Loading data...</td></tr>';

    const { data, error } = await _supabase.from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .gte('t_date', start)
        .lte('t_date', end)
        .order('t_date', { ascending: false });

    if (error) {
        alert("Error fetching data");
        return;
    }

    allData = data || [];
    populateNameFilter(allData);
    applyFilters();
}

function populateNameFilter(data) {
    const uniqueNames = [...new Set(data.map(item => item.party_name))];
    const dropdown = document.getElementById('nameDropdown');
    
    dropdown.innerHTML = '';
    uniqueNames.forEach(name => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.innerHTML = `
            <input type="checkbox" value="${name}" onchange="toggleNameFilter(this)">
            <span>${name}</span>
        `;
        dropdown.appendChild(div);
    });
}

function toggleDropdown() {
    document.getElementById('nameDropdown').classList.toggle('show');
}

function toggleNameFilter(checkbox) {
    if (checkbox.checked) {
        selectedNames.push(checkbox.value);
    } else {
        selectedNames = selectedNames.filter(n => n !== checkbox.value);
    }
    
    const textSpan = document.getElementById('selectedText');
    if (selectedNames.length === 0) textSpan.innerText = "Select Names...";
    else if (selectedNames.length === 1) textSpan.innerText = selectedNames[0];
    else textSpan.innerText = `${selectedNames.length} Names Selected`;

    applyFilters();
}

function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;

    filteredData = allData.filter(item => {
        const typeMatch = (typeFilter === 'ALL') || (item.t_type === typeFilter);
        const nameMatch = (selectedNames.length === 0) || selectedNames.includes(item.party_name);
        return typeMatch && nameMatch;
    });

    renderTable(filteredData);
    updateMiniSummary(filteredData);

    selectedIds = [];
    updateBulkDeleteUI();
    document.getElementById('selectAll').checked = false;
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    const noData = document.getElementById('noData');
    
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        noData.style.display = 'block';
        return;
    }
    noData.style.display = 'none';

    data.forEach(row => {
        const badgeClass = row.t_type === 'IN' ? 'badge-in' : 'badge-out';
        const amountClass = row.t_type === 'IN' ? 't-green' : 't-red';
        const typeLabel = row.t_type === 'IN' ? 'Received' : 'Paid';
        
        const tr = `
            <tr>
                <td>
                    <input type="checkbox" class="row-checkbox" value="${row.id}" onchange="toggleRowSelection(this)">
                </td>
                <td data-label="Date">
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${row.t_date}
                        <i class="ri-whatsapp-line" style="color:#25D366; cursor:pointer; font-size:1.1rem;" 
                           title="Share this day's report" onclick="shareDayFromHistory('${row.t_date}')"></i>
                    </div>
                </td>
                <td data-label="Name">${row.party_name}</td>
                <td data-label="Type"><span class="badge ${badgeClass}">${typeLabel}</span></td>
                <td data-label="Amount" class="amount-cell ${amountClass}">${formatCurrency(row.amount)}</td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}

function toggleSelectAll() {
    const mainCb = document.getElementById('selectAll');
    const rowCbs = document.querySelectorAll('.row-checkbox');
    
    selectedIds = [];
    rowCbs.forEach(cb => {
        cb.checked = mainCb.checked;
        if(mainCb.checked) selectedIds.push(parseInt(cb.value));
    });

    updateBulkDeleteUI();
}

function toggleRowSelection(cb) {
    const id = parseInt(cb.value);
    if (cb.checked) {
        selectedIds.push(id);
    } else {
        selectedIds = selectedIds.filter(sid => sid !== id);
        document.getElementById('selectAll').checked = false;
    }
    updateBulkDeleteUI();
}

function updateBulkDeleteUI() {
    const btn = document.getElementById('bulkDeleteBtn');
    const countSpan = document.getElementById('selCount');
    
    countSpan.innerText = selectedIds.length;
    if (selectedIds.length > 0) {
        btn.classList.remove('hidden');
    } else {
        btn.classList.add('hidden');
    }
}

async function deleteSelected() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;

    const { error } = await _supabase.from('transactions')
        .delete()
        .in('id', selectedIds);

    if (error) {
        alert("Failed to delete: " + error.message);
    } else {
        allData = allData.filter(item => !selectedIds.includes(item.id));
        selectedIds = [];
        document.getElementById('selectAll').checked = false;
        updateBulkDeleteUI();
        applyFilters();
    }
}

function updateMiniSummary(data) {
    document.getElementById('countRow').innerText = data.length;

    let total = data.reduce((acc, curr) => {
        return curr.t_type === 'IN' ? acc + curr.amount : acc - curr.amount;
    }, 0);

    const el = document.getElementById('totalAmount');
    el.innerText = formatCurrency(total);
    el.style.color = total >= 0 ? 'var(--success)' : 'var(--danger)';
}

function downloadPDF() {
    if(filteredData.length === 0) return alert("No data to download!");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Transaction Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${document.getElementById('startDate').value} to ${document.getElementById('endDate').value}`, 14, 22);

    const tableRows = filteredData.map(row => [
        row.t_date,
        row.party_name,
        row.t_type === 'IN' ? 'Received' : 'Paid',
        row.amount.toFixed(2)
    ]);

    doc.autoTable({
        head: [['Date', 'Name', 'Type', 'Amount']],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save('Hisab_Report.pdf');
}

function shareHistory() {
    if(filteredData.length === 0) return alert("No data to share!");

    const e_book = '\uD83D\uDCD2';
    const e_cal = '\uD83D\uDDD3';
    const e_in = '\uD83D\uDFE2';
    const e_out = '\uD83D\uDD34';

    let msg = `*${e_book} Hisab Report*\n`;
    msg += `${e_cal} ${document.getElementById('startDate').value} to ${document.getElementById('endDate').value}\n\n`;

    filteredData.forEach(row => {
        const icon = row.t_type === 'IN' ? e_in : e_out;
        msg += `${icon} ${row.t_date} | ${row.party_name} | ₹${row.amount}\n`;
    });

    msg += `\n------------------\n`;
    msg += `*Total Net: ${document.getElementById('totalAmount').innerText}*`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

// --- নির্দিষ্ট দিনের হিসাব হোয়াটসঅ্যাপ করার ফাংশন ---
function shareDayFromHistory(date) {
    // ওই তারিখের সব ট্রানজেকশন ফিল্টার করা
    const dayTrans = allData.filter(t => t.t_date === date);
    
    if (dayTrans.length === 0) return;

    const e_cal = '\uD83D\uDCC5';
    const e_in = '\uD83D\uDFE2';
    const e_out = '\uD83D\uDD34';
    const e_money = '\uD83D\uDCB0';

    let msg = `*${e_cal} Daily Report (${date})*\n`;
    msg += `----------------------------\n\n`;
    
    let totalIn = 0;
    let totalOut = 0;

    const inTrans = dayTrans.filter(t => t.t_type === 'IN');
    if (inTrans.length > 0) {
        msg += `*${e_in} RECEIVED:*\n`;
        inTrans.forEach(t => {
            msg += `+ ${t.party_name}: ${formatCurrency(t.amount)}\n`;
            totalIn += t.amount;
        });
        msg += `\n`;
    }
    
    const outTrans = dayTrans.filter(t => t.t_type === 'OUT');
    if (outTrans.length > 0) {
        msg += `*${e_out} PAID:*\n`;
        outTrans.forEach(t => {
            msg += `- ${t.party_name}: ${formatCurrency(t.amount)}\n`;
            totalOut += t.amount;
        });
        msg += `\n`;
    }

    msg += `----------------------------\n`;
    msg += `*Total Received:* ${formatCurrency(totalIn)}\n`;
    msg += `*Total Paid:* ${formatCurrency(totalOut)}\n`;
    msg += `*${e_money} Net Change:* ${formatCurrency(totalIn - totalOut)}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
