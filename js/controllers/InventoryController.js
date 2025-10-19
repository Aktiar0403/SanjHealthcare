class InventoryController {
    constructor() {
        this.inventory = Storage.getInventory();
        this.productController = new ProductController();
        this.distributorController = new DistributorController();
    }

    getAllInventory() {
        return this.inventory.filter(item => item.isActive);
    }

    getInventoryByLocation(location) {
        return this.inventory.filter(item => 
            item.location === location && item.isActive
        );
    }

    getInventoryByProduct(productId) {
        return this.inventory.filter(item => 
            item.productId === productId && item.isActive
        );
    }

    updateStock(itemId, quantity, type = 'add') {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) {
            return { success: false, errors: ['Inventory item not found'] };
        }

        try {
            if (type === 'add') {
                item.addStock(quantity);
            } else if (type === 'remove') {
                item.removeStock(quantity);
            } else if (type === 'set') {
                item.quantity = quantity;
                item.lastStockUpdate = new Date().toISOString();
                item.updatedAt = new Date().toISOString();
            }

            const success = Storage.saveInventory(this.inventory);
            if (success) {
                NotificationService.showSuccess('Stock updated successfully');
                return { success: true, item };
            } else {
                return { success: false, errors: ['Failed to update stock'] };
            }
        } catch (error) {
            return { success: false, errors: [error.message] };
        }
    }

    transferStock(productId, fromLocation, toLocation, quantity) {
        try {
            const result = InventoryManager.transferStock(
                productId, fromLocation, toLocation, quantity
            );
            this.inventory = Storage.getInventory(); // Refresh data
            NotificationService.showSuccess('Stock transferred successfully');
            return { success: true, result };
        } catch (error) {
            return { success: false, errors: [error.message] };
        }
    }

    getLowStockItems() {
        return InventoryManager.getLowStockItems();
    }

    getExpiringItems(daysThreshold = 30) {
        return InventoryManager.getExpiringItems(daysThreshold);
    }

    getStockSummary() {
        const inventory = this.getAllInventory();
        const summary = {
            totalItems: inventory.length,
            totalValue: inventory.reduce((sum, item) => sum + item.stockValue, 0),
            lowStockCount: inventory.filter(item => item.stockStatus === 'low').length,
            nearExpiryCount: inventory.filter(item => item.isNearExpiry).length,
            locations: {}
        };

        // Group by location
        inventory.forEach(item => {
            if (!summary.locations[item.location]) {
                summary.locations[item.location] = {
                    count: 0,
                    value: 0,
                    items: []
                };
            }
            summary.locations[item.location].count++;
            summary.locations[item.location].value += item.stockValue;
            summary.locations[item.location].items.push(item);
        });

        return summary;
    }

    renderInventoryTable(container) {
        const inventory = this.getAllInventory();
        container.innerHTML = '';

        if (inventory.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="highlight">
                            <i class="fas fa-info-circle"></i>
                            No inventory items found.
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        inventory.forEach(item => {
            const product = this.productController.getProductById(item.productId);
            const distributor = item.distributorId ? 
                this.distributorController.getDistributorById(item.distributorId) : null;

            const totalStock = item.quantity;
            const statusClass = `stock-${item.stockStatus}`;
            const statusText = item.stockStatus.toUpperCase();

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product ? product.name : 'Unknown Product'}</td>
                <td>${item.location}</td>
                <td>${distributor ? distributor.name : 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>${item.minStockLevel}</td>
                <td>${totalStock}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <button class="btn btn-outline btn-sm update-stock" data-id="${item.id}">
                        <i class="fas fa-edit"></i> Update
                    </button>
                    <button class="btn btn-primary btn-sm transfer-stock" data-id="${item.id}">
                        <i class="fas fa-exchange-alt"></i> Transfer
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }

    generateStockReport(period = 'month') {
        const inventory = this.getAllInventory();
        const report = {
            period: period,
            generatedAt: new Date().toISOString(),
            summary: this.getStockSummary(),
            lowStockItems: this.getLowStockItems(),
            expiringItems: this.getExpiringItems(),
            movement: this.getStockMovement(period)
        };

        return report;
    }

    getStockMovement(period = 'month') {
        // This would typically fetch from stock movement records
        // For now, return mock data
        const movements = Storage.get('stock_movements', []);
        
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'quarter':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        return movements.filter(movement => 
            new Date(movement.movementDate) >= startDate
        );
    }
}