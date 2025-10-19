class ChartManager {
    static charts = new Map();

    /** 
     * Safely get canvas context
     */
    static getContextSafe(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`ChartManager: Canvas with ID "${canvasId}" not found.`);
            return null;
        }
        return canvas.getContext('2d');
    }

    /** 
     * Safely destroy existing chart
     */
    static destroyIfExists(canvasId) {
        if (this.charts.has(canvasId)) {
            try {
                this.charts.get(canvasId).destroy();
            } catch (e) {
                console.warn(`ChartManager: Error destroying chart for "${canvasId}" →`, e);
            }
            this.charts.delete(canvasId);
        }
    }

    /** 
     * Create Financial Overview Chart
     */
    static createFinancialOverviewChart(canvasId, data = {}) {
        const ctx = this.getContextSafe(canvasId);
        if (!ctx) return;

        this.destroyIfExists(canvasId);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Sales',
                        data: data.sales || [],
                        backgroundColor: '#1a73e8',
                        borderColor: '#1a73e8',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: data.expenses || [],
                        backgroundColor: '#dc3545',
                        borderColor: '#dc3545',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (ctx) =>
                                `${ctx.dataset.label}: ₹${(ctx.raw || 0).toLocaleString('en-IN')}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (v) => '₹' + v.toLocaleString('en-IN')
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    /** 
     * Sales Trend Chart
     */
    static createSalesTrendChart(canvasId, data = {}) {
        const ctx = this.getContextSafe(canvasId);
        if (!ctx) return;

        this.destroyIfExists(canvasId);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Primary Sales',
                        data: data.primary || [],
                        borderColor: '#1a73e8',
                        backgroundColor: 'rgba(26,115,232,0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Secondary Sales',
                        data: data.secondary || [],
                        borderColor: '#2e7d32',
                        backgroundColor: 'rgba(46,125,50,0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (ctx) =>
                                `${ctx.dataset.label}: ₹${(ctx.raw || 0).toLocaleString('en-IN')}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (v) => '₹' + v.toLocaleString('en-IN')
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    /** 
     * Product Performance Chart
     */
    static createProductPerformanceChart(canvasId, data = {}) {
        const ctx = this.getContextSafe(canvasId);
        if (!ctx) return;

        this.destroyIfExists(canvasId);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: [
                    {
                        label: 'Quantity Sold',
                        data: data.quantities || [],
                        backgroundColor: '#1a73e8',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Revenue (₹)',
                        data: data.revenues || [],
                        backgroundColor: '#2e7d32',
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Quantity' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Revenue (₹)' },
                        grid: { drawOnChartArea: false },
                        ticks: {
                            callback: (v) => '₹' + v.toLocaleString('en-IN')
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    /** 
     * Expense Breakdown Chart
     */
    static createExpenseBreakdownChart(canvasId, data = {}) {
        const ctx = this.getContextSafe(canvasId);
        if (!ctx) return;

        this.destroyIfExists(canvasId);

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels || [],
                datasets: [
                    {
                        data: data.values || [],
                        backgroundColor: [
                            '#1a73e8', '#2e7d32', '#ffc107', '#dc3545',
                            '#6f42c1', '#20c997', '#fd7e14', '#e83e8c'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const label = ctx.label || '';
                                const value = ctx.raw || 0;
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = total ? Math.round((value / total) * 100) : 0;
                                return `${label}: ₹${value.toLocaleString('en-IN')} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    /** 
     * Inventory Status Chart
     */
    static createInventoryStatusChart(canvasId, data = [0, 0, 0]) {
        const ctx = this.getContextSafe(canvasId);
        if (!ctx) return;

        this.destroyIfExists(canvasId);

        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Low Stock', 'Medium Stock', 'Good Stock'],
                datasets: [
                    {
                        data: data,
                        backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const label = ctx.label || '';
                                const value = ctx.raw || 0;
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = total ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} products (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    /** 
     * Chart Update & Cleanup
     */
    static updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }

    static destroyChart(canvasId) {
        this.destroyIfExists(canvasId);
    }

    static destroyAllCharts() {
        this.charts.forEach((chart, id) => chart.destroy());
        this.charts.clear();
    }
}
