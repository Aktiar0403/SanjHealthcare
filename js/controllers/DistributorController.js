class DistributorController {
    constructor() {
        this.distributors = Storage.getDistributors();
        this.init();
    }

    init() {
        if (!this.distributors.stockists) this.distributors.stockists = [];
        if (!this.distributors.superstockists) this.distributors.superstockists = [];
    }

    getAllStockists() {
        return this.distributors.stockists.filter(d => d.isActive);
    }

    getAllSuperstockists() {
        return this.distributors.superstockists.filter(d => d.isActive);
    }

    getDistributorById(id) {
        const stockist = this.distributors.stockists.find(d => d.id === id);
        if (stockist) return stockist;
        
        const superstockist = this.distributors.superstockists.find(d => d.id === id);
        return superstockist || null;
    }

    addStockist(stockistData) {
        const validation = Validators.validateDistributor(stockistData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const stockist = new Stockist(stockistData);
        this.distributors.stockists.push(stockist);
        
        const success = Storage.saveDistributors(this.distributors);
        if (success) {
            NotificationService.showSuccess('Stockist added successfully');
            return { success: true, stockist };
        } else {
            return { success: false, errors: ['Failed to save stockist'] };
        }
    }

    addSuperstockist(superstockistData) {
        const validation = Validators.validateDistributor(superstockistData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const superstockist = new Superstockist(superstockistData);
        this.distributors.superstockists.push(superstockist);
        
        const success = Storage.saveDistributors(this.distributors);
        if (success) {
            NotificationService.showSuccess('Superstockist added successfully');
            return { success: true, superstockist };
        } else {
            return { success: false, errors: ['Failed to save superstockist'] };
        }
    }

    updateDistributor(id, distributorData) {
        let distributor = this.getDistributorById(id);
        if (!distributor) {
            return { success: false, errors: ['Distributor not found'] };
        }

        distributorData.updatedAt = new Date().toISOString();
        Object.assign(distributor, distributorData);
        
        const success = Storage.saveDistributors(this.distributors);
        if (success) {
            NotificationService.showSuccess('Distributor updated successfully');
            return { success: true, distributor };
        } else {
            return { success: false, errors: ['Failed to update distributor'] };
        }
    }

    deleteDistributor(id) {
        let distributor = this.getDistributorById(id);
        if (!distributor) {
            return { success: false, errors: ['Distributor not found'] };
        }

        // Soft delete
        distributor.isActive = false;
        distributor.updatedAt = new Date().toISOString();
        
        const success = Storage.saveDistributors(this.distributors);
        if (success) {
            NotificationService.showSuccess('Distributor deleted successfully');
            return { success: true };
        } else {
            return { success: false, errors: ['Failed to delete distributor'] };
        }
    }

    assignStockistToSuperstockist(stockistId, superstockistId) {
        const stockist = this.distributors.stockists.find(s => s.id === stockistId);
        const superstockist = this.distributors.superstockists.find(s => s.id === superstockistId);

        if (!stockist || !superstockist) {
            return { success: false, errors: ['Distributor not found'] };
        }

        stockist.superstockistId = superstockistId;
        superstockist.addStockist(stockistId);
        
        const success = Storage.saveDistributors(this.distributors);
        if (success) {
            NotificationService.showSuccess('Stockist assigned successfully');
            return { success: true };
        } else {
            return { success: false, errors: ['Failed to assign stockist'] };
        }
    }

    updateCreditLimit(id, newLimit) {
        const distributor = this.getDistributorById(id);
        if (!distributor) {
            return { success: false, errors: ['Distributor not found'] };
        }

        distributor.creditLimit = newLimit;
        distributor.updatedAt = new Date().toISOString();
        
        const success = Storage.saveDistributors(this.distributors);
        if (success) {
            NotificationService.showSuccess('Credit limit updated successfully');
            return { success: true, distributor };
        } else {
            return { success: false, errors: ['Failed to update credit limit'] };
        }
    }

    getDistributorPerformance(id) {
        const distributor = this.getDistributorById(id);
        if (!distributor) return null;

        // Mock performance data - in real app, this would come from sales data
        return {
            monthlySales: distributor.type === 'stockist' ? 250000 : 800000,
            targetAchievement: 85,
            paymentCollection: 92,
            outstandingBalance: distributor.currentBalance,
            creditUtilization: distributor.creditUtilization
        };
    }

    renderStockistsTable(container) {
        const stockists = this.getAllStockists();
        container.innerHTML = '';

        if (stockists.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="highlight">
                            <i class="fas fa-info-circle"></i>
                            No stockists found. <a href="#" id="add-first-stockist">Add your first stockist</a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        stockists.forEach(stockist => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>ST${stockist.id.substr(-3)}</td>
                <td>${stockist.name}</td>
                <td>${Formatters.formatPhoneNumber(stockist.phone)}</td>
                <td>${stockist.region}</td>
                <td>${Formatters.formatCurrency(stockist.creditLimit)}</td>
                <td class="stock-${stockist.creditStatus}">${stockist.creditStatus.toUpperCase()}</td>
                <td>
                    <button class="btn btn-outline btn-sm edit-stockist" data-id="${stockist.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-stockist" data-id="${stockist.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-primary btn-sm view-performance" data-id="${stockist.id}">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }

    renderSuperstockistsTable(container) {
        const superstockists = this.getAllSuperstockists();
        container.innerHTML = '';

        if (superstockists.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="highlight">
                            <i class="fas fa-info-circle"></i>
                            No superstockists found. <a href="#" id="add-first-superstockist">Add your first superstockist</a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        superstockists.forEach(superstockist => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>SST${superstockist.id.substr(-3)}</td>
                <td>${superstockist.name}</td>
                <td>${Formatters.formatPhoneNumber(superstockist.phone)}</td>
                <td>${superstockist.region}</td>
                <td>${Formatters.formatCurrency(superstockist.creditLimit)}</td>
                <td>${superstockist.stockists.length}</td>
                <td class="stock-${superstockist.creditStatus}">${superstockist.creditStatus.toUpperCase()}</td>
                <td>
                    <button class="btn btn-outline btn-sm edit-superstockist" data-id="${superstockist.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-superstockist" data-id="${superstockist.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-primary btn-sm view-performance" data-id="${superstockist.id}">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }
}