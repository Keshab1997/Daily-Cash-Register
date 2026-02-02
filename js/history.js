let currentUser = null;
let allData = [];
let filteredData = [];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

window.onload = async () => {
    const session = await checkAuth(true);
    currentUser = session.user;
    
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    document.getElementById('startDate').value = firstDay;
    document.getElementById('endDate').value = lastDay;
    
    fetchHistory();
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
    loadSuggestions(allData);
    applyFilters();
}

function loadSuggestions(data) {
    const uniqueNames = [...new Set(data.map(item => item.party_name))];
    const datalist = document.getElementById('nameSuggestions');
    datalist.innerHTML = uniqueNames.map(name => `<option value="${name}">`).join('');
}

function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();

    filteredData = allData.filter(item => {
        const typeMatch = (typeFilter === 'ALL') || (item.t_type === typeFilter);
        const nameMatch = item.party_name.toLowerCase().includes(searchText);
        return typeMatch && nameMatch;
    });

    renderTable(filteredData);
    updateMiniSummary(filteredData);
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
                <td data-label="Date">${row.t_date}</td>
                <td data-label="Name">${row.party_name}</td>
                <td data-label="Type"><span class="badge ${badgeClass}">${typeLabel}</span></td>
                <td data-label="Amount" class="amount-cell ${amountClass}">${formatCurrency(row.amount)}</td>
                <td data-label="Action">
                    <button onclick="deleteEntry(${row.id})" style="background:#fee2e2; color:#ef4444; padding:5px 10px; border-radius:5px;">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
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

    let msg = `*📒 Hisab Report*\n`;
    msg += `🗓 ${document.getElementById('startDate').value} to ${document.getElementById('endDate').value}\n\n`;

    filteredData.forEach(row => {
        const icon = row.t_type === 'IN' ? '🟢' : '🔴';
        msg += `${icon} ${row.t_date} | ${row.party_name} | ₹${row.amount}\n`;
    });

    msg += `\n------------------\n`;
    msg += `*Total Net: ${document.getElementById('totalAmount').innerText}*`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

async function deleteEntry(id) {
    if(!confirm("Are you sure you want to delete this record?")) return;
    
    const { error } = await _supabase.from('transactions').delete().eq('id', id);
    if(!error) {
        allData = allData.filter(item => item.id !== id);
        applyFilters();
    } else {
        alert("Failed to delete: " + error.message);
    }
}
