// PWA Features
let deferredPrompt;
let updateAvailable = false;

// Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.id = 'installBanner';
    installBanner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <i class="ri-download-cloud-line" style="font-size: 1.5rem;"></i>
            <div style="flex: 1;">
                <strong>Install App</strong>
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Install for better experience</p>
            </div>
            <button onclick="installApp()" style="background: white; color: #2563eb; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer;" aria-label="Install application">Install</button>
            <button onclick="dismissInstall()" style="background: transparent; color: white; border: none; font-size: 1.2rem; cursor: pointer;" aria-label="Dismiss install prompt"><i class="ri-close-line"></i></button>
        </div>
    `;
    installBanner.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; right: 20px; 
        background: linear-gradient(135deg, #2563eb, #3b82f6); 
        color: white; padding: 15px 20px; border-radius: 12px; 
        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3); 
        z-index: 10000; animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(installBanner);
}

async function installApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        showToast('App installed successfully!', 'success');
    }
    deferredPrompt = null;
    dismissInstall();
}

function dismissInstall() {
    const banner = document.getElementById('installBanner');
    if (banner) banner.remove();
}

// Update Available Prompt
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (updateAvailable) return;
        updateAvailable = true;
        showUpdatePrompt();
    });
}

function showUpdatePrompt() {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'updateBanner';
    updateBanner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <i class="ri-refresh-line" style="font-size: 1.5rem;"></i>
            <div style="flex: 1;">
                <strong>Update Available</strong>
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">New version ready</p>
            </div>
            <button onclick="updateApp()" style="background: white; color: #059669; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer;" aria-label="Update application">Update</button>
            <button onclick="dismissUpdate()" style="background: transparent; color: white; border: none; font-size: 1.2rem; cursor: pointer;" aria-label="Dismiss update notification"><i class="ri-close-line"></i></button>
        </div>
    `;
    updateBanner.style.cssText = `
        position: fixed; top: 20px; left: 20px; right: 20px; 
        background: linear-gradient(135deg, #059669, #10b981); 
        color: white; padding: 15px 20px; border-radius: 12px; 
        box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3); 
        z-index: 10000; animation: slideDown 0.3s ease;
    `;
    document.body.appendChild(updateBanner);
}

function updateApp() {
    window.location.reload();
}

function dismissUpdate() {
    const banner = document.getElementById('updateBanner');
    if (banner) banner.remove();
}

// Offline/Online Detection
window.addEventListener('online', () => {
    showToast('Back online!', 'success');
});

window.addEventListener('offline', () => {
    showToast('You are offline', 'error');
});

// Check initial state
if (!navigator.onLine) {
    setTimeout(() => showToast('You are offline', 'error'), 1000);
}

// Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
