let currentUser = null;

window.onload = async () => {
    const session = await checkAuth(true);
    currentUser = session.user;

    document.getElementById('monthPicker').value = new Date().toISOString().slice(0, 7);
    loadHistory();
};

async function loadHistory() {
    const month = document.getElementById('monthPicker').value;
    const container = document.getElementById('historyList');
    container.innerHTML = '<div class="loading">Loading...</div>';

    const { data: summaries } = await _supabase.from('daily_accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .ilike('report_date', `${month}%`)
        .order('report_date', { ascending: false });

    container.innerHTML = '';

    if(!summaries || summaries.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#888">No records found for this month.</div>';
        return;
    }

    summaries.forEach(row => {
        const badgeClass = row.petty_cash >= 0 ? 'badge-pos' : 'badge-neg';
        const html = `
            <div class="history-card" onclick="showDetails('${row.report_date}')">
                <div class="h-header">
                    <span class="h-date">${formatDate(row.report_date)}</span>
                    <span class="h-badge ${badgeClass}">Bal: ${row.petty_cash}</span>
                </div>
                <div class="h-body">
                    <div>In: <span class="text-green">${row.cash_received}</span></div>
                    <div>Out: <span class="text-red">${row.handover_client}</span></div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

async function showDetails(date) {
    const modal = document.getElementById('detailModal');
    document.getElementById('modalDate').innerText = `Details: ${formatDate(date)}`;

    const inList = document.getElementById('modalInList');
    const outList = document.getElementById('modalOutList');

    inList.innerHTML = 'Loading...';
    outList.innerHTML = '';
    modal.style.display = 'flex';

    const { data } = await _supabase.from('transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('t_date', date);

    inList.innerHTML = '<h4>Money IN (+)</h4>';
    outList.innerHTML = '<h4>Money OUT (-)</h4>';

    if(data) {
        data.forEach(t => {
            const row = `
                <div class="detail-row">
                    <span class="detail-party">${t.party_name}</span>
                    <span>${t.amount}</span>
                </div>
            `;
            if(t.t_type === 'IN') inList.innerHTML += row;
            else outList.innerHTML += row;
        });
    }

    if(data.filter(t => t.t_type === 'IN').length === 0) inList.innerHTML += '<small>No entries</small>';
    if(data.filter(t => t.t_type === 'OUT').length === 0) outList.innerHTML += '<small>No entries</small>';
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

function formatDate(dateStr) {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
