class NotificationService {
    static show(message, type = 'info', duration = 5000) {
        this.createNotification(message, type, duration);
    }

    static showSuccess(message, duration = 5000) {
        this.createNotification(message, 'success', duration);
    }

    static showError(message, duration = 5000) {
        this.createNotification(message, 'error', duration);
    }

    static showWarning(message, duration = 5000) {
        this.createNotification(message, 'warning', duration);
    }

    static showInfo(message, duration = 5000) {
        this.createNotification(message, 'info', duration);
    }

    static createNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        this.clearNotifications();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${this.getIcon(type)}
                </span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            this.addStyles();
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    static getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    static removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }

    static clearNotifications() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    static addStyles() {
        const styles = `
            <style id="notification-styles">
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    padding: 16px;
                    min-width: 300px;
                    max-width: 500px;
                    z-index: 10000;
                    transform: translateX(400px);
                    opacity: 0;
                    transition: all 0.3s ease;
                    border-left: 4px solid #6c757d;
                }

                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }

                .notification-success {
                    border-left-color: #28a745;
                    background: #f8fff9;
                }

                .notification-error {
                    border-left-color: #dc3545;
                    background: #fff8f8;
                }

                .notification-warning {
                    border-left-color: #ffc107;
                    background: #fffef5;
                }

                .notification-info {
                    border-left-color: #17a2b8;
                    background: #f8fdff;
                }

                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .notification-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .notification-success .notification-icon {
                    color: #28a745;
                }

                .notification-error .notification-icon {
                    color: #dc3545;
                }

                .notification-warning .notification-icon {
                    color: #ffc107;
                }

                .notification-info .notification-icon {
                    color: #17a2b8;
                }

                .notification-message {
                    flex: 1;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .notification-close {
                    background: none;
                    border: none;
                    color: #6c757d;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }

                .notification-close:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }

                @media (max-width: 768px) {
                    .notification {
                        left: 20px;
                        right: 20px;
                        min-width: auto;
                        transform: translateY(-100px);
                    }

                    .notification.show {
                        transform: translateY(0);
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Toast notifications for quick messages
    static toast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        if (!document.getElementById('toast-styles')) {
            this.addToastStyles();
        }

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        return toast;
    }

    static removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }

    static addToastStyles() {
        const styles = `
            <style id="toast-styles">
                .toast {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    background: #333;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-size: 14px;
                    z-index: 10001;
                    opacity: 0;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .toast.show {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }

                .toast-success {
                    background: #28a745;
                }

                .toast-error {
                    background: #dc3545;
                }

                .toast-warning {
                    background: #ffc107;
                    color: #333;
                }

                .toast-info {
                    background: #17a2b8;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Confirmation dialog
    static confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirmation-modal';
            modal.innerHTML = `
                <div class="confirmation-dialog">
                    <div class="confirmation-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="confirmation-body">
                        <p>${message}</p>
                    </div>
                    <div class="confirmation-footer">
                        <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
                        <button class="btn btn-danger" id="confirm-ok">Confirm</button>
                    </div>
                </div>
            `;

            if (!document.getElementById('confirmation-styles')) {
                this.addConfirmationStyles();
            }

            document.body.appendChild(modal);

            const cancelBtn = modal.querySelector('#confirm-cancel');
            const okBtn = modal.querySelector('#confirm-ok');

            const cleanup = () => {
                modal.remove();
            };

            cancelBtn.onclick = () => {
                cleanup();
                resolve(false);
            };

            okBtn.onclick = () => {
                cleanup();
                resolve(true);
            };

            // Close on backdrop click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    cleanup();
                    resolve(false);
                }
            };
        });
    }

    static addConfirmationStyles() {
        const styles = `
            <style id="confirmation-styles">
                .confirmation-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10002;
                }

                .confirmation-dialog {
                    background: white;
                    border-radius: 8px;
                    padding: 24px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                }

                .confirmation-header h3 {
                    margin: 0 0 16px 0;
                    color: #333;
                    font-size: 18px;
                }

                .confirmation-body {
                    margin-bottom: 24px;
                }

                .confirmation-body p {
                    margin: 0;
                    color: #666;
                    line-height: 1.5;
                }

                .confirmation-footer {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}