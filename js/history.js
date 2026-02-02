window.onload = async () => {
    const session = await checkAuth(true);
    loadData(session.user.id);
};

async function loadData(userId) {
    const { data } = await _supabase.from('daily_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('report_date', { ascending: false });

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(row => {
        let color = row.petty_cash >= 0 ? '#d1fae5; color:#065f46' : '#fee2e2; color:#991b1b';
        tbody.innerHTML += `
            <tr>
                <td>${row.report_date}</td>
                <td>${row.cash_received}</td>
                <td>${row.handover_client + row.handover_bill}</td>
                <td><span class="badge" style="background:${color}">${row.petty_cash}</span></td>
            </tr>
        `;
    });
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Daily Cash Report", 14, 15);
    doc.autoTable({ html: '#historyTable', startY: 20 });
    doc.save('report.pdf');
}
