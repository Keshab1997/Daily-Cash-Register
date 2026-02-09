const SUPABASE_URL = "https://fpzduypihjkzphuofmhe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwemR1eXBpaGprenBodW9mbWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjY4NjAsImV4cCI6MjA4NTYwMjg2MH0.b9-iGceM8cByJJXWF_2V3rNpbk5d9OCT_E0o4g0xy_Y";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Progress Bar
let progressBar = null;
let progressFill = null;

function initProgressBar() {
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressFill = document.createElement('div');
        progressFill.className = 'progress-bar-fill';
        progressBar.appendChild(progressFill);
        document.body.appendChild(progressBar);
    }
}

function showProgress(percent = 0) {
    initProgressBar();
    progressBar.classList.add('active');
    progressFill.style.width = percent + '%';
}

function hideProgress() {
    if (progressBar) {
        progressFill.style.width = '100%';
        setTimeout(() => {
            progressBar.classList.remove('active');
            progressFill.style.width = '0%';
        }, 300);
    }
}

// Button Loading State
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.classList.add('btn-loading');
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '';
    } else {
        button.disabled = false;
        button.classList.remove('btn-loading');
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }
}

// Debounce utility
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Prevent pull-to-refresh
let lastTouchY = 0;
let preventPullToRefresh = false;

document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    lastTouchY = e.touches[0].clientY;
    preventPullToRefresh = window.pageYOffset === 0;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchYDelta = touchY - lastTouchY;
    lastTouchY = touchY;

    if (preventPullToRefresh) {
        if (touchYDelta > 0) {
            e.preventDefault();
            return;
        }
        preventPullToRefresh = false;
    }
}, { passive: false });

async function checkAuth(required = true) {
    showProgress(30);
    const { data: { session } } = await _supabase.auth.getSession();
    showProgress(70);
    
    if (required && !session) {
        hideProgress();
        window.location.href = 'index.html';
    }
    if (!required && session) {
        hideProgress();
        window.location.href = 'dashboard.html';
    }
    hideProgress();
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
