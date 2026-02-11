// ========================================
// PWA Push Notification Helper
// ========================================
// এটা যেকোনো PWA তে use করতে পারবেন

class PWANotification {
    constructor(appName = 'My App', icon = '/icon.png') {
        this.appName = appName;
        this.icon = icon;
        this.permission = Notification.permission;
    }

    // Permission চাওয়ার জন্য
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    // Notification পাঠানোর জন্য (Service Worker দিয়ে)
    async send(title, options = {}) {
        if (this.permission !== 'granted') {
            console.log('Notification permission not granted');
            return false;
        }

        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported');
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            const notificationOptions = {
                body: options.body || '',
                icon: options.icon || this.icon,
                badge: options.badge || this.icon,
                vibrate: options.vibrate || [200, 100, 200],
                tag: options.tag || 'default',
                requireInteraction: options.requireInteraction || false,
                silent: options.silent || false,
                data: options.data || {},
                actions: options.actions || []
            };

            await registration.showNotification(title, notificationOptions);
            return true;
        } catch (error) {
            console.error('Notification error:', error);
            return false;
        }
    }

    // Quick notification (শুধু title আর body)
    async quick(title, body) {
        return await this.send(title, { body });
    }

    // Success notification (সবুজ icon সহ)
    async success(title, body) {
        return await this.send(title, {
            body,
            icon: this.icon,
            vibrate: [200, 100, 200],
            tag: 'success'
        });
    }

    // Error notification (লাল icon সহ)
    async error(title, body) {
        return await this.send(title, {
            body,
            vibrate: [300, 100, 300, 100, 300],
            tag: 'error'
        });
    }

    // Warning notification
    async warning(title, body) {
        return await this.send(title, {
            body,
            vibrate: [200, 100, 200],
            tag: 'warning'
        });
    }

    // Action buttons সহ notification
    async withActions(title, body, actions = []) {
        return await this.send(title, {
            body,
            actions: actions.map(action => ({
                action: action.id,
                title: action.title,
                icon: action.icon || ''
            })),
            requireInteraction: true
        });
    }
}

// ========================================
// কিভাবে ব্যবহার করবেন
// ========================================

/*

// 1. Initialize করুন
const notify = new PWANotification('Hisab Manager', '/icon.png');

// 2. Permission চান (প্রথমবার)
await notify.requestPermission();

// 3. Notification পাঠান

// Simple notification
await notify.quick('Hello', 'This is a test notification');

// Success notification
await notify.success('✅ Saved', 'Data saved successfully!');

// Error notification
await notify.error('❌ Error', 'Something went wrong');

// Warning notification
await notify.warning('⚠️ Warning', 'Please check your input');

// Action buttons সহ
await notify.withActions(
    'New Message',
    'You have a new message from John',
    [
        { id: 'view', title: 'View' },
        { id: 'dismiss', title: 'Dismiss' }
    ]
);

// Custom notification
await notify.send('Custom Title', {
    body: 'Custom message',
    icon: '/custom-icon.png',
    vibrate: [100, 50, 100],
    tag: 'custom-tag',
    requireInteraction: true,
    data: { userId: 123, action: 'open' }
});

*/

// ========================================
// Service Worker এ Action Handle করা
// ========================================

/*
// sw.js তে এটা add করুন:

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    if (action === 'view') {
        // View button click হলে
        event.waitUntil(
            clients.openWindow('/dashboard.html')
        );
    } else if (action === 'dismiss') {
        // Dismiss button click হলে
        console.log('Notification dismissed');
    } else {
        // Notification body click হলে
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

*/

// Export করুন (যদি module use করেন)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWANotification;
}
