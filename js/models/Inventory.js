class InventoryItem {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('INV');
        this.productId = data.productId || '';
        this.productName = data.productName || '';
        this.batchNumber = data.batchNumber || '';
        this.location = data.location || 'warehouse'; // warehouse, superstockist, stockist, retailer
        this.distributorId = data.distributorId || null;
        this.quantity = data.quantity || 0;
        this.minStockLevel = data.minStockLevel || 10;
        this.maxStockLevel = data.maxStockLevel || 100;
        this.reorderPoint = data.reorderPoint || 20;
        this.costPrice = data.costPrice || 0;
        this.mrp = data.mrp || 0;
        this.expiryDate = data.expiryDate || '';
        this.shelfLocation = data.shelfLocation || '';
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.lastStockUpdate = data.lastStockUpdate || new Date().toISOString();
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    get stockValue() {
        return this.quantity * this.costPrice;
    }

    get stockStatus() {
        if (this.quantity <= this.minStockLevel) return 'low';
        if (this.quantity <= this.reorderPoint) return 'medium';
        return 'good';
    }

    get stockStatusColor() {
        const status = this.stockStatus;
        switch (status) {
            case 'low': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'good': return '#28a745';
            default: return '#6c757d';
        }
    }

    get needsReorder() {
        return this.quantity <= this.reorderPoint;
    }

    get daysToExpiry() {
        if (!this.expiryDate) return null;
        const expiry = new Date(this.expiryDate);
        const today = new Date();
        const diffTime = expiry - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    get isNearExpiry() {
        const days = this.daysToExpiry;
        return days !== null && days <= 30;
    }

    get isExpired() {
        const days = this.daysToExpiry;
        return days !== null && days < 0;
    }

    addStock(quantity, costPrice = null) {
        this.quantity += quantity;
        if (costPrice !== null) {
            this.costPrice = costPrice;
        }
        this.lastStockUpdate = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    removeStock(quantity) {
        if (quantity > this.quantity) {
            throw new Error('Insufficient stock');
        }
        this.quantity -= quantity;
        this.lastStockUpdate = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    updateStockLevels(min, max, reorder) {
        this.minStockLevel = min;
        this.maxStockLevel = max;
        this.reorderPoint = reorder;
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            productId: this.productId,
            productName: this.productName,
            batchNumber: this.batchNumber,
            location: this.location,
            distributorId: this.distributorId,
            quantity: this.quantity,
            minStockLevel: this.minStockLevel,
            maxStockLevel: this.maxStockLevel,
            reorderPoint: this.reorderPoint,
            costPrice: this.costPrice,
            mrp: this.mrp,
            expiryDate: this.expiryDate,
            shelfLocation: this.shelfLocation,
            isActive: this.isActive,
            lastStockUpdate: this.lastStockUpdate,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(json) {
        return new InventoryItem(json);
    }
}

class StockMovement {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('MOV');
        this.productId = data.productId || '';
        this.batchNumber = data.batchNumber || '';
        this.movementType = data.movementType || ''; // purchase, sale, transfer, adjustment, return
        this.quantity = data.quantity || 0;
        this.fromLocation = data.fromLocation || '';
        this.toLocation = data.toLocation || '';
        this.referenceId = data.referenceId || ''; // invoice ID, purchase ID, etc.
        this.referenceType = data.referenceType || '';
        this.notes = data.notes || '';
        this.movementDate = data.movementDate || new Date().toISOString();
        this.createdBy = data.createdBy || 'system';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            productId: this.productId,
            batchNumber: this.batchNumber,
            movementType: this.movementType,
            quantity: this.quantity,
            fromLocation: this.fromLocation,
            toLocation: this.toLocation,
            referenceId: this.referenceId,
            referenceType: this.referenceType,
            notes: this.notes,
            movementDate: this.movementDate,
            createdBy: this.createdBy,
            createdAt: this.createdAt
        };
    }
}

class InventoryManager {
    static getStockLevel(productId, location = null) {
        const inventory = Storage.getInventory();
        let items = inventory.filter(item => item.productId === productId && item.isActive);
        
        if (location) {
            items = items.filter(item => item.location === location);
        }
        
        return items.reduce((total, item) => total + item.quantity, 0);
    }

    static getLowStockItems() {
        const inventory = Storage.getInventory();
        return inventory.filter(item => item.needsReorder && item.isActive);
    }

    static getExpiringItems(daysThreshold = 30) {
        const inventory = Storage.getInventory();
        return inventory.filter(item => {
            const daysToExpiry = item.daysToExpiry;
            return daysToExpiry !== null && daysToExpiry <= daysThreshold && item.isActive;
        });
    }

    static updateStock(productId, location, quantity, movementType = 'adjustment', referenceId = null) {
        const inventory = Storage.getInventory();
        let item = inventory.find(item => 
            item.productId === productId && 
            item.location === location && 
            item.isActive
        );

        if (!item) {
            // Create new inventory item
            item = new InventoryItem({
                productId: productId,
                location: location,
                quantity: 0
            });
            inventory.push(item);
        }

        if (movementType === 'sale' || movementType === 'out') {
            item.removeStock(quantity);
        } else {
            item.addStock(quantity);
        }

        // Record movement
        const movement = new StockMovement({
            productId: productId,
            movementType: movementType,
            quantity: quantity,
            fromLocation: movementType === 'sale' ? location : '',
            toLocation: movementType === 'purchase' ? location : '',
            referenceId: referenceId,
            referenceType: movementType
        });

        Storage.saveInventory(inventory);
        return item;
    }

    static transferStock(productId, fromLocation, toLocation, quantity, referenceId = null) {
        const inventory = Storage.getInventory();
        
        // Remove from source
        const fromItem = inventory.find(item => 
            item.productId === productId && 
            item.location === fromLocation && 
            item.isActive
        );

        if (!fromItem || fromItem.quantity < quantity) {
            throw new Error('Insufficient stock for transfer');
        }

        fromItem.removeStock(quantity);

        // Add to destination
        let toItem = inventory.find(item => 
            item.productId === productId && 
            item.location === toLocation && 
            item.isActive
        );

        if (!toItem) {
            toItem = new InventoryItem({
                productId: productId,
                location: toLocation,
                quantity: 0
            });
            inventory.push(toItem);
        }

        toItem.addStock(quantity);

        // Record movement
        const movement = new StockMovement({
            productId: productId,
            movementType: 'transfer',
            quantity: quantity,
            fromLocation: fromLocation,
            toLocation: toLocation,
            referenceId: referenceId,
            referenceType: 'transfer'
        });

        Storage.saveInventory(inventory);
        return { fromItem, toItem };
    }
}