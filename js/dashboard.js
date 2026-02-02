let currentUser = null;

window.onload = async () => {
    const session = await checkAuth(true);
    currentUser = session.user;
    
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    fetchOpeningBalance();
};

async function fetchOpeningBalance() {
    const { data } = await _supabase.from('daily_accounts')
        .select('petty_cash')
        .eq('user_id', currentUser.id)
        .order('report_date', { ascending: false })
        .limit(1);
        
    if(data && data.length > 0) {
        document.getElementById('opening').value = data[0].petty_cash;
        calculate();
    }
}

function calculate() {
    let open = parseFloat(document.getElementById('opening').value) || 0;
    let recv = parseFloat(document.getElementById('received').value) || 0;
    let client = parseFloat(document.getElementById('client').value) || 0;
    let bill = parseFloat(document.getElementById('bill').value) || 0;

    let total = (open + recv) - (client + bill);
    let el = document.getElementById('total');
    el.innerText = total;
    el.style.color = total >= 0 ? '#10b981' : '#ef4444';
}

async function save() {
    const date = document.getElementById('date').value;
    const total = document.getElementById('total').innerText;
    
    const payload = {
        user_id: currentUser.id,
        report_date: date,
        opening_balance: document.getElementById('opening').value || 0,
        cash_received: document.getElementById('received').value || 0,
        handover_client: document.getElementById('client').value || 0,
        handover_bill: document.getElementById('bill').value || 0,
        petty_cash: total
    };

    const { error } = await _supabase.from('daily_accounts')
        .upsert(payload, { onConflict: 'user_id, report_date' });

    if(error) alert('Error: ' + error.message);
    else alert('✅ হিসাব সেভ হয়েছে!');
}

function share() {
    let date = document.getElementById('date').value;
    let total = document.getElementById('total').innerText;
    let msg = `📅 Date: ${date}\n💰 Day End: ${total}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
