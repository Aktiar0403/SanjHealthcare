class Distributor {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('DIST');
        this.name = data.name || '';
        this.type = data.type || 'stockist'; // 'stockist' or 'superstockist'
        this.contactPerson = data.contactPerson || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.alternatePhone = data.alternatePhone || '';
        this.address = data.address || {
            street: '',
            city: '',
            state: 'Assam',
            pincode: '',
            country: 'India'
        };
        this.gstin = data.gstin || '';
        this.pan = data.pan || '';
        this.creditLimit = data.creditLimit || 0;
        this.currentBalance = data.currentBalance || 0;
        this.region = data.region || '';
        this.territory = data.territory || '';
        this.superstockistId = data.superstockistId || null; // For stockists only
        this.assignedProducts = data.assignedProducts || [];
        this.paymentTerms = data.paymentTerms || '30 days';
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.registrationDate = data.registrationDate || new Date().toISOString();
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    get creditAvailable() {
        return this.creditLimit - this.currentBalance;
    }

    get creditUtilization() {
        return this.creditLimit > 0 ? (this.currentBalance / this.creditLimit) * 100 : 0;
    }

    get creditStatus() {
        const utilization = this.creditUtilization;
        if (utilization >= 90) return 'critical';
        if (utilization >= 75) return 'warning';
        return 'good';
    }

    validate() {
        return Validators.validateDistributor(this);
    }

    addBalance(amount) {
        this.currentBalance += amount;
        this.updatedAt = new Date().toISOString();
    }

    deductBalance(amount) {
        this.currentBalance -= amount;
        this.updatedAt = new Date().toISOString();
    }

    assignProduct(productId) {
        if (!this.assignedProducts.includes(productId)) {
            this.assignedProducts.push(productId);
            this.updatedAt = new Date().toISOString();
        }
    }

    unassignProduct(productId) {
        this.assignedProducts = this.assignedProducts.filter(id => id !== productId);
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            contactPerson: this.contactPerson,
            email: this.email,
            phone: this.phone,
            alternatePhone: this.alternatePhone,
            address: this.address,
            gstin: this.gstin,
            pan: this.pan,
            creditLimit: this.creditLimit,
            currentBalance: this.currentBalance,
            region: this.region,
            territory: this.territory,
            superstockistId: this.superstockistId,
            assignedProducts: this.assignedProducts,
            paymentTerms: this.paymentTerms,
            isActive: this.isActive,
            registrationDate: this.registrationDate,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(json) {
        return new Distributor(json);
    }
}

class Stockist extends Distributor {
    constructor(data = {}) {
        super(data);
        this.type = 'stockist';
        this.retailers = data.retailers || [];
        this.monthlyTarget = data.monthlyTarget || 0;
        this.achievement = data.achievement || 0;
    }

    get achievementPercentage() {
        return this.monthlyTarget > 0 ? (this.achievement / this.monthlyTarget) * 100 : 0;
    }

    addRetailer(retailerId) {
        if (!this.retailers.includes(retailerId)) {
            this.retailers.push(retailerId);
            this.updatedAt = new Date().toISOString();
        }
    }

    removeRetailer(retailerId) {
        this.retailers = this.retailers.filter(id => id !== retailerId);
        this.updatedAt = new Date().toISOString();
    }
}

class Superstockist extends Distributor {
    constructor(data = {}) {
        super(data);
        this.type = 'superstockist';
        this.stockists = data.stockists || [];
        this.warehouseCapacity = data.warehouseCapacity || 0;
        this.currentStockValue = data.currentStockValue || 0;
    }

    get stockUtilization() {
        return this.warehouseCapacity > 0 ? (this.currentStockValue / this.warehouseCapacity) * 100 : 0;
    }

    addStockist(stockistId) {
        if (!this.stockists.includes(stockistId)) {
            this.stockists.push(stockistId);
            this.updatedAt = new Date().toISOString();
        }
    }

    removeStockist(stockistId) {
        this.stockists = this.stockists.filter(id => id !== stockistId);
        this.updatedAt = new Date().toISOString();
    }
}