function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        setTimeout(() => document.getElementById('email').focus(), 100);
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        setTimeout(() => document.getElementById('regEmail').focus(), 100);
    }
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Enter key on login form
    if (e.key === 'Enter' && !document.getElementById('loginForm').classList.contains('hidden')) {
        if (document.activeElement.id === 'email' || document.activeElement.id === 'password') {
            e.preventDefault();
            login();
        }
    }
    
    // Enter key on signup form
    if (e.key === 'Enter' && !document.getElementById('signupForm').classList.contains('hidden')) {
        if (document.activeElement.id === 'regEmail' || document.activeElement.id === 'regPassword') {
            e.preventDefault();
            signup();
        }
    }
});

async function login() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const btn = document.querySelector('#loginForm button');

    if(!email || !pass) {
        showToast("Please enter email and password", 'error');
        return;
    }

    setButtonLoading(btn, true);
    showProgress(50);

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email, password: pass
    });

    if (error) {
        showToast("Login failed: " + error.message, 'error');
        setButtonLoading(btn, false);
        hideProgress();
    } else {
        showProgress(100);
        window.location.href = 'dashboard.html';
    }
}

async function signup() {
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const btn = document.querySelector('#signupForm button');

    if(!email || !pass) {
        showToast("Please fill all fields", 'error');
        return;
    }
    if(pass.length < 6) {
        showToast("Password must be at least 6 characters", 'error');
        return;
    }

    setButtonLoading(btn, true);
    showProgress(50);

    const { data, error } = await _supabase.auth.signUp({
        email: email, password: pass
    });

    if (error) {
        showToast("Error: " + error.message, 'error');
        setButtonLoading(btn, false);
        hideProgress();
    } else {
        showProgress(100);
        hideProgress();
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('verifyMsg').classList.remove('hidden');
        document.getElementById('sentEmail').innerText = email;
        showToast("Account created! Check your email.", 'success');
    }
}

checkAuth(false);
