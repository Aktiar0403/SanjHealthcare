// js/utils/Charts.js
// Handles all chart rendering safely across the app

class ChartManager {
    static charts = {};

    // ✅ Safe context getter (prevents getContext null errors)
    static getCanvasContext(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`ChartManager: Canvas with id "${canvasId}" not found.`);
            return null;
        }
        return canvas.getContext('2d');
    }

    // ✅ Destroy previous chart safely before creating a new one
    static destroyChart(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
        }
    }

    // -------------------------------
    // 📊 1. Sales Trend Chart
    // -------------------------------
    static createSalesTrendChart(canvasId, data) {
        const ctx = this.getCanvasContext(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Sales',
                    data: data.values,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: this.defaultOptions('Monthly Sales Trend')
        });
    }

    // -------------------------------
    // 💰 2. Financial Overview Chart
    // -------------------------------
    static createFinancialOverviewChart(canvasId, data) {
        const ctx = this.getCanvasContext(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Revenue',
                    data: data.values,
                    backgroundColor: '#2196F3'
                }]
            },
            options: this.defaultOptions('Financial Overview')
        });
    }

    // -------------------------------
    // 🏢 3. Distributor Performance Chart
    // -------------------------------
    static createDistributorPerformanceChart(canvasId, data) {
        const ctx = this.getCanvasContext(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Performance',
                    data: data.values,
                    backgroundColor: ['#FF9800', '#4CAF50', '#F44336', '#9C27B0']
                }]
            },
            options: this.defaultOptions('Distributor Performance')
        });
    }

    // -------------------------------
    // 📦 4. Inventory Chart
    // -------------------------------
    static createInventoryChart(canvasId, data) {
        const ctx = this.getCanvasContext(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Inventory Status',
                    data: data.values,
                    backgroundColor: ['#03A9F4', '#8BC34A', '#FFEB3B', '#E91E63']
                }]
            },
            options: this.defaultOptions('Inventory Overview')
        });
    }

    // -------------------------------
    // 👨‍⚕️ 5. Doctor Visit Trend Chart
    // -------------------------------
    static createDoctorVisitChart(canvasId, data) {
        const ctx = this.getCanvasContext(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Visits',
                    data: data.values,
                    borderColor: '#9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.2)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: this.defaultOptions('Doctor Visits Trend')
        });
    }

    // -------------------------------
    // ⚙️ Common Chart Options
    // -------------------------------
    static defaultOptions(titleText) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: titleText,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        };
    }
}


