window.onload = async () => {
    const session = await checkAuth(true);
    const user = session.user;
    document.getElementById('userEmail').innerText = user.email;

    loadStats(user.id);
};

async function loadStats(userId) {
    const { count } = await _supabase.from('daily_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    document.getElementById('totalDays').innerText = count || 0;

    const { data } = await _supabase.from('daily_accounts')
        .select('petty_cash')
        .eq('user_id', userId)
        .order('report_date', { ascending: false })
        .limit(1);

    if(data && data.length > 0) {
        document.getElementById('lastBalance').innerText = data[0].petty_cash;
    }
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.href = 'index.html';
}
