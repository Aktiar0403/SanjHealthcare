class SanjHealthcareApp {
    constructor() {
        this.controllers = {};
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Initialize service worker for PWA
            await this.initializeServiceWorker();

            // Initialize sample data if first run
            this.initializeFirstRun();

            // Initialize controllers
            this.initializeControllers();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize dashboard
            this.initializeDashboard();

            // Check for app updates
            this.checkForUpdates();

            NotificationService.showSuccess('Sanj Healthcare App initialized successfully');

        } catch (error) {
            console.error('App initialization failed:', error);
            NotificationService.showError('Failed to initialize application');
        }
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registered:', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            NotificationService.showInfo('New version available. Refresh to update.', 'info', 10000);
                        }
                    });
                });

            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        }
    }

    initializeFirstRun() {
        const firstRun = Storage.get('first_run', true);
        if (firstRun) {
            SampleData.initializeSampleData();
            Storage.set('first_run', false);
        }
    }

    initializeControllers() {
        this.controllers = {
            product: new ProductController(),
            distributor: new DistributorController(),
            inventory: new InventoryController(),
            expense: new ExpenseController(),
            loan: new LoanController(),
            dashboard: new DashboardController()
        };

        console.log('All controllers initialized');
    }

    setupEventListeners() {
        // Tab navigation
        this.setupTabNavigation();

        // Menu item clicks
        this.setupMenuNavigation();

        // Inner tab navigation
        this.setupInnerTabs();

        // Install button
        this.setupInstallPrompt();

        // Logout button
        this.setupLogout();

        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Online/offline detection
        this.setupConnectivityDetection();

        console.log('All event listeners setup');
    }

    setupTabNavigation() {
        document.querySelectorAll('.nav-tabs li').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    setupMenuNavigation() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = item.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    setupInnerTabs() {
        document.querySelectorAll('.tabs').forEach(tabsContainer => {
            tabsContainer.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = tab.getAttribute('data-tab');
                    const parent = tab.closest('.tab-content');
                    this.switchInnerTab(parent, tabId);
                });
            });
        });
    }

    setupInstallPrompt() {
        let deferredPrompt;
        const installButton = document.getElementById('installButton');
        const installPrompt = document.getElementById('installPrompt');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installButton.style.display = 'block';
            installPrompt.style.display = 'block';
        });

        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installButton.style.display = 'none';
                    installPrompt.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });

        document.getElementById('installAppBtn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installPrompt.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });

        document.getElementById('dismissInstallBtn').addEventListener('click', () => {
            installPrompt.style.display = 'none';
        });
    }

    setupLogout() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S for save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                NotificationService.showInfo('Save functionality would be triggered here');
            }

            // Ctrl/Cmd + / for search
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.focusSearch();
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    setupConnectivityDetection() {
        window.addEventListener('online', () => {
            NotificationService.showSuccess('Connection restored', 'success', 3000);
            this.syncData();
        });

        window.addEventListener('offline', () => {
            NotificationService.showWarning('You are currently offline', 'warning', 5000);
        });
    }

    switchTab(tabId) {
        // Update active tab in navigation
        document.querySelectorAll('.nav-tabs li').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            }
        });

        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
                this.loadTabContent(tabId);
            }
        });

        // Update browser history
        history.pushState(null, null, `#${tabId}`);
    }

    switchInnerTab(parent, tabId) {
        // Update active inner tab
        parent.querySelectorAll('.tabs .tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            }
        });

        // Show active inner tab content
        parent.querySelectorAll('.tab-content-inner').forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId + '-content') {
                content.classList.add('active');
            }
        });
    }

    loadTabContent(tabId) {
        switch (tabId) {
            case 'dashboard':
                this.controllers.dashboard.refresh();
                break;
            case 'products':
                this.controllers.product.renderProductsGrid(document.getElementById('products-grid'));
                break;
            case 'distributors':
                this.controllers.distributor.renderStockistsTable(document.getElementById('stockists-table'));
                this.controllers.distributor.renderSuperstockistsTable(document.getElementById('superstockists-table'));
                break;
            case 'inventory':
                this.controllers.inventory.renderInventoryTable(document.getElementById('inventory-table'));
                break;
            case 'expenses':
                this.controllers.expense.renderMarketingExpensesTable(document.getElementById('marketing-expenses-table'));
                this.controllers.expense.renderOperatingExpensesTable(document.getElementById('operating-expenses-table'));
                break;
            case 'debts':
                this.controllers.loan.renderBankLoansTable(document.getElementById('bank-loans-table'));
                this.controllers.loan.renderPersonalLoansTable(document.getElementById('personal-loans-table'));
                this.controllers.loan.renderPaymentsTable(document.getElementById('payments-table'));
                break;
        }
    }

    initializeDashboard() {
        this.controllers.dashboard.init();
    }

    focusSearch() {
        // Implementation for focusing search input
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    async syncData() {
        try {
            NotificationService.showInfo('Syncing data...');
            const result = await ApiService.processQueuedRequests();
            
            if (result.processed.length > 0) {
                NotificationService.showSuccess(`Synced ${result.processed.length} pending changes`);
            }
            
            if (result.failed.length > 0) {
                NotificationService.showWarning(`${result.failed.length} changes failed to sync`);
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    checkForUpdates() {
        // Check for app updates periodically
        setInterval(() => {
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
            }
        }, 60 * 60 * 1000); // Check every hour
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            Storage.clear();
            window.location.reload();
        }
    }

    // Utility methods
    exportData() {
        const data = Storage.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sanj-healthcare-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                Object.keys(data).forEach(key => {
                    Storage.set(key, data[key]);
                });
                NotificationService.showSuccess('Data imported successfully');
                window.location.reload();
            } catch (error) {
                NotificationService.showError('Failed to import data: Invalid file format');
            }
        };
        reader.readAsText(file);
    }

    // Error handling
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            NotificationService.showError('An unexpected error occurred');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            NotificationService.showError('An unexpected error occurred');
            e.preventDefault();
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SanjHealthcareApp();
});

// Export for global access
window.SanjHealthcareApp = SanjHealthcareApp;
window.Storage = Storage;
window.Formatters = Formatters;
window.Validators = Validators;
window.NotificationService = NotificationService;