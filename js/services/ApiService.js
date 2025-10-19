class ApiService {
    static baseUrl = '/api'; // This would be your actual API base URL

    static async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API request failed:', error);
            return { 
                success: false, 
                error: error.message,
                data: null 
            };
        }
    }

    // Product endpoints
    static async getProducts() {
        return this.request('/products');
    }

    static async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    static async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    static async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Distributor endpoints
    static async getDistributors() {
        return this.request('/distributors');
    }

    static async createDistributor(distributorData) {
        return this.request('/distributors', {
            method: 'POST',
            body: JSON.stringify(distributorData)
        });
    }

    // Inventory endpoints
    static async getInventory() {
        return this.request('/inventory');
    }

    static async updateStock(itemId, quantity, type) {
        return this.request(`/inventory/${itemId}/stock`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity, type })
        });
    }

    // Sales endpoints
    static async getSalesData(period = 'month') {
        return this.request(`/sales?period=${period}`);
    }

    static async recordSale(saleData) {
        return this.request('/sales', {
            method: 'POST',
            body: JSON.stringify(saleData)
        });
    }

    // Expense endpoints
    static async getExpenses(period = 'month') {
        return this.request(`/expenses?period=${period}`);
    }

    static async createExpense(expenseData) {
        return this.request('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    }

    // Loan endpoints
    static async getLoans() {
        return this.request('/loans');
    }

    static async createLoan(loanData) {
        return this.request('/loans', {
            method: 'POST',
            body: JSON.stringify(loanData)
        });
    }

    static async recordPayment(paymentData) {
        return this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // Report endpoints
    static async getReports(period = 'month') {
        return this.request(`/reports?period=${period}`);
    }

    static async downloadReport(reportId, format = 'pdf') {
        return this.request(`/reports/${reportId}/download?format=${format}`);
    }

    // Backup and sync
    static async backupData() {
        return this.request('/backup', {
            method: 'POST'
        });
    }

    static async syncData() {
        return this.request('/sync', {
            method: 'POST'
        });
    }

    // Utility methods for offline support
    static queueRequest(endpoint, data) {
        const queue = Storage.get('request_queue', []);
        queue.push({ endpoint, data, timestamp: new Date().toISOString() });
        Storage.set('request_queue', queue);
    }

    static processQueuedRequests() {
        const queue = Storage.get('request_queue', []);
        const processed = [];
        const failed = [];

        queue.forEach(async (request, index) => {
            try {
                const result = await this.request(request.endpoint, {
                    method: 'POST',
                    body: JSON.stringify(request.data)
                });

                if (result.success) {
                    processed.push(request);
                } else {
                    failed.push(request);
                }
            } catch (error) {
                failed.push(request);
            }
        });

        // Update queue
        Storage.set('request_queue', failed);

        return { processed, failed };
    }
}