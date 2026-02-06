const SUPABASE_URL = "https://fpzduypihjkzphuofmhe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwemR1eXBpaGprenBodW9mbWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjY4NjAsImV4cCI6MjA4NTYwMjg2MH0.b9-iGceM8cByJJXWF_2V3rNpbk5d9OCT_E0o4g0xy_Y";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAuth(required = true) {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (required && !session) {
        window.location.href = 'index.html';
    }
    if (!required && session) {
        window.location.href = 'dashboard.html';
    }
    return session;
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = 'ri-checkbox-circle-fill';
    else if (type === 'error') icon = 'ri-close-circle-fill';
    else icon = 'ri-information-fill';

    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}
