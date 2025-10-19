class DashboardController {
    constructor() {
        this.financialOverviewData = null;
        this.salesTrendData = null;
        this.productPerformanceData = null;
        this.expenseBreakdownData = null;
        this.inventoryStatusData = null;
    }

    init() {
        console.log('DashboardController initialized');

        // Load sample or API data
        this.loadData();

        // Initialize charts safely
        this.initializeCharts();
    }

    loadData() {
        // Here you can replace with API calls if needed
        this.financialOverviewData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            sales: [120000, 150000, 170000, 140000, 180000, 200000],
            expenses: [80000, 90000, 100000, 95000, 110000, 120000]
        };

        this.salesTrendData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            primary: [60000, 80000, 90000, 70000, 100000, 120000],
            secondary: [50000, 70000, 80000, 60000, 90000, 110000]
        };

        this.productPerformanceData = {
            labels: ['Product A', 'Product B', 'Product C'],
            quantities: [120, 90, 150],
            revenues: [300000, 220000, 400000]
        };

        this.expenseBreakdownData = {
            labels: ['Marketing', 'Salaries', 'Utilities', 'Rent'],
            values: [50000, 80000, 20000, 15000]
        };

        this.inventoryStatusData = [5, 15, 80]; // Low, Medium, Good stock counts
    }

    initializeCharts() {
        console.log('Initializing dashboard charts...');

        // Financial Overview
        if (document.getElementById('financialOverviewChart')) {
            ChartManager.createFinancialOverviewChart('financialOverviewChart', this.financialOverviewData);
        }

        // Sales Trend
        if (document.getElementById('salesTrendChart')) {
            ChartManager.createSalesTrendChart('salesTrendChart', this.salesTrendData);
        }

        // Product Performance
        if (document.getElementById('productPerformanceChart')) {
            ChartManager.createProductPerformanceChart('productPerformanceChart', this.productPerformanceData);
        }

        // Expense Breakdown
        if (document.getElementById('expenseBreakdownChart')) {
            ChartManager.createExpenseBreakdownChart('expenseBreakdownChart', this.expenseBreakdownData);
        }

        // Inventory Status
        if (document.getElementById('inventoryStatusChart')) {
            ChartManager.createInventoryStatusChart('inventoryStatusChart', this.inventoryStatusData);
        }

        console.log('Dashboard charts initialized.');
    }
}

// Example of initializing the dashboard
document.addEventListener('DOMContentLoaded', () => {
    const dashboardController = new DashboardController();
    dashboardController.init();
});
