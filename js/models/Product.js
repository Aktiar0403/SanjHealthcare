class Product {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('PROD');
        this.name = data.name || '';
        this.category = data.category || '';
        this.costPrice = data.costPrice || 0;
        this.mrp = data.mrp || 0;
        this.taxRate = data.taxRate || 12;
        this.hsnCode = data.hsnCode || '';
        this.manufacturer = data.manufacturer || 'Sanj Healthcare';
        this.batchNumber = data.batchNumber || '';
        this.expiryDate = data.expiryDate || '';
        this.packSize = data.packSize || '';
        this.stockQuantity = data.stockQuantity || 0;
        this.minStockLevel = data.minStockLevel || 10;
        this.maxStockLevel = data.maxStockLevel || 100;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    get sellingPrice() {
        return this.costPrice * 1.1; // 10% markup for stockist
    }

    get superstockistPrice() {
        return this.sellingPrice * 1.1; // 10% markup for superstockist
    }

    get retailerPrice() {
        return this.superstockistPrice * 1.15; // 15% markup for retailer
    }

    get taxAmount() {
        return (this.mrp * this.taxRate) / 100;
    }

    get profitMargin() {
        return ((this.mrp - this.costPrice) / this.costPrice) * 100;
    }

    validate() {
        return Validators.validateProduct(this);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            costPrice: this.costPrice,
            mrp: this.mrp,
            taxRate: this.taxRate,
            hsnCode: this.hsnCode,
            manufacturer: this.manufacturer,
            batchNumber: this.batchNumber,
            expiryDate: this.expiryDate,
            packSize: this.packSize,
            stockQuantity: this.stockQuantity,
            minStockLevel: this.minStockLevel,
            maxStockLevel: this.maxStockLevel,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(json) {
        return new Product(json);
    }
}

class ProductCategory {
    constructor(name, description = '') {
        this.id = Formatters.generateId('CAT');
        this.name = name;
        this.description = description;
        this.productCount = 0;
        this.isActive = true;
        this.createdAt = new Date().toISOString();
    }
}

class ProductBatch {
    constructor(productId, batchData = {}) {
        this.id = Formatters.generateId('BATCH');
        this.productId = productId;
        this.batchNumber = batchData.batchNumber || '';
        this.manufacturingDate = batchData.manufacturingDate || '';
        this.expiryDate = batchData.expiryDate || '';
        this.quantity = batchData.quantity || 0;
        this.costPrice = batchData.costPrice || 0;
        this.mrp = batchData.mrp || 0;
        this.supplier = batchData.supplier || '';
        this.isActive = true;
        this.createdAt = new Date().toISOString();
    }
}