// Update for renderUI function - replace the data.forEach section

function renderUI(data) {
    const list = document.getElementById('expenseList');
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todayTotal = 0, monthTotal = 0;

    list.innerHTML = '';
    
    if (data.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:20px;">No expenses found</div>';
    }

    data.forEach(ex => {
        const exDate = new Date(ex.e_date);
        if (ex.e_date === today) todayTotal += parseFloat(ex.amount);
        if (exDate.getMonth() === currentMonth && exDate.getFullYear() === currentYear) {
            monthTotal += parseFloat(ex.amount);
        }

        const category = ex.category || '💼 Others';
        const categoryIcon = category.charAt(0);
        const categoryName = category.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

        list.innerHTML += `
            <div class="exp-item-new">
                <div class="cat-icon-circle">${categoryIcon}</div>
                <div class="exp-info">
                    <div>
                        <span class="exp-name">${ex.item_name}</span>
                        <span class="cat-badge">${categoryName}</span>
                    </div>
                    <span class="exp-date"><i class="ri-calendar-line"></i> ${ex.e_date}</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    <span class="exp-amt">₹${parseFloat(ex.amount).toLocaleString('en-IN')}</span>
                    <i class="ri-delete-bin-line btn-del-mini" onclick="deleteExpense(${ex.id})"></i>
                </div>
            </div>
        `;
    });

    document.getElementById('todayExp').innerText = '₹' + todayTotal.toLocaleString('en-IN');
    document.getElementById('monthExp').innerText = '₹' + monthTotal.toLocaleString('en-IN');
}
