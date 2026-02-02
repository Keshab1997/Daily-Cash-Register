window.onload = async () => {
    const session = await checkAuth(true);
    document.getElementById('userEmail').innerText = session.user.email;
};

async function logout() {
    await _supabase.auth.signOut();
    window.location.href = 'index.html';
}
