class DashboardController {
    constructor() {
        this.productController = new ProductController();
        this.distributorController = new DistributorController();
        this.inventoryController = new InventoryController();
        this.expenseController = new ExpenseController();
        this.loanController = new LoanController();
        this.charts = new Map();
    }

    init() {
        this.updateDashboardStats();
        this.renderAlerts();
        this.initializeCharts();
    }

    updateDashboardStats() {
        const products = this.productController.getAllProducts();
        const stockists = this.distributorController.getAllStockists();
        const superstockists = this.distributorController.getAllSuperstockists();
        const expenseSummary = this.expenseController.getExpenseSummary('month');
        const loanSummary = this.loanController.getLoanSummary();

        // Update DOM elements
        document.getElementById('total-products').textContent = products.length;
        document.getElementById('total-distributors').textContent = stockists.length + superstockists.length;
        document.getElementById('month-sales').textContent = this.getMonthlySales();
        document.getElementById('total-expenses').textContent = Formatters.formatCurrency(expenseSummary.total.expenses);
        document.getElementById('active-loans').textContent = loanSummary.total.loans;
        document.getElementById('pending-payments').textContent = Formatters.formatCurrency(loanSummary.total.monthlyPayment);
    }

    getMonthlySales() {
        // Mock sales data - in real app, this would come from sales records
        const monthlySales = 656300;
        return Formatters.formatCurrency(monthlySales);
    }

    renderAlerts() {
        const container = document.getElementById('alerts-container');
        container.innerHTML = '';

        const alerts = this.getAlerts();
        
        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="highlight" style="background-color: #e8f5e8; border-left-color: #28a745;">
                    <i class="fas fa-check-circle"></i>
                    All systems operational. No critical alerts.
                </div>
            `;
            return;
        }

        alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'highlight';
            alertDiv.style.backgroundColor = alert.type === 'warning' ? '#fff3cd' : 
                                           alert.type === 'danger' ? '#f8d7da' : '#e8f5e8';
            alertDiv.style.borderLeftColor = alert.type === 'warning' ? '#ffc107' : 
                                           alert.type === 'danger' ? '#dc3545' : '#28a745';
            
            alertDiv.innerHTML = `
                <i class="fas fa-${alert.icon}"></i>
                ${alert.message}
                ${alert.action ? `<button class="btn btn-sm btn-primary" style="margin-left: 10px;" data-action="${alert.action}">${alert.actionText}</button>` : ''}
            `;
            container.appendChild(alertDiv);
        });
    }

    getAlerts() {
        const alerts = [];

        // Low stock alerts
        const lowStockProducts = this.productController.getLowStockProducts();
        if (lowStockProducts.length > 0) {
            alerts.push({
                type: 'warning',
                icon: 'exclamation-triangle',
                message: `${lowStockProducts.length} products have low stock levels`,
                action: 'view-products',
                actionText: 'View Products'
            });
        }

        // Upcoming payments
        const upcomingPayments = this.loanController.getUpcomingPayments(7);
        if (upcomingPayments.length > 0) {
            alerts.push({
                type: 'danger',
                icon: 'clock',
                message: `${upcomingPayments.length} loan payments due in next 7 days`,
                action: 'view-loans',
                actionText: 'View Loans'
            });
        }

        // Expiring products
        const expiringItems = this.inventoryController.getExpiringItems(30);
        if (expiringItems.length > 0) {
            alerts.push({
                type: 'warning',
                icon: 'calendar-times',
                message: `${expiringItems.length} inventory items expiring in next 30 days`,
                action: 'view-inventory',
                actionText: 'View Inventory'
            });
        }

        // Credit limit alerts
        const distributors = [
            ...this.distributorController.getAllStockists(),
            ...this.distributorController.getAllSuperstockists()
        ];
        const criticalCredit = distributors.filter(d => d.creditStatus === 'critical');
        if (criticalCredit.length > 0) {
            alerts.push({
                type: 'danger',
                icon: 'credit-card',
                message: `${criticalCredit.length} distributors have critical credit utilization`,
                action: 'view-distributors',
                actionText: 'View Distributors'
            });
        }

        return alerts;
    }

    initializeCharts() {
        this.createFinancialOverviewChart();
        this.createSalesTrendChart();
        this.createInventoryStatusChart();
    }

    createFinancialOverviewChart() {
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            sales: [520000, 580000, 610000, 590000, 630000, 656300],
            expenses: [120000, 110000, 125000, 130000, 115000, 125000]
        };

        ChartManager.createFinancialOverviewChart('financialOverviewChart', data);
    }

    createSalesTrendChart() {
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            primary: [450000, 500000, 520000, 480000, 550000, 580000],
            secondary: [400000, 450000, 480000, 440000, 500000, 520000]
        };

        ChartManager.createSalesTrendChart('salesTrendChart', data);
    }

    createInventoryStatusChart() {
        const inventory = this.inventoryController.getAllInventory();
        const lowStock = inventory.filter(item => item.stockStatus === 'low').length;
        const mediumStock = inventory.filter(item => item.stockStatus === 'medium').length;
        const goodStock = inventory.filter(item => item.stockStatus === 'good').length;

        const data = [lowStock, mediumStock, goodStock];
        ChartManager.createInventoryStatusChart('inventoryStatusChart', data);
    }

    getQuickStats() {
        const products = this.productController.getAllProducts();
        const stockists = this.distributorController.getAllStockists();
        const superstockists = this.distributorController.getAllSuperstockists();
        const inventorySummary = this.inventoryController.getStockSummary();
        const expenseSummary = this.expenseController.getExpenseSummary('month');
        const loanSummary = this.loanController.getLoanSummary();

        return {
            products: {
                total: products.length,
                lowStock: this.productController.getLowStockProducts().length
            },
            distributors: {
                total: stockists.length + superstockists.length,
                stockists: stockists.length,
                superstockists: superstockists.length
            },
            inventory: {
                totalValue: inventorySummary.totalValue,
                lowStockItems: inventorySummary.lowStockCount
            },
            financial: {
                monthlySales: 656300, // Mock data
                monthlyExpenses: expenseSummary.total.expenses,
                profit: 656300 - expenseSummary.total.expenses
            },
            loans: {
                active: loanSummary.total.loans,
                monthlyPayments: loanSummary.total.monthlyPayment
            }
        };
    }

    refresh() {
        this.updateDashboardStats();
        this.renderAlerts();
        
        // Refresh charts if they exist
        if (this.charts.size > 0) {
            this.charts.forEach((chart, id) => {
                if (chart && typeof chart.update === 'function') {
                    chart.update();
                }
            });
        }
    }
}