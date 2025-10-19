class Invoice {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('INV');
        this.type = data.type || 'stockist'; // 'stockist' or 'superstockist'
        this.invoiceNumber = data.invoiceNumber || '';
        this.date = data.date || new Date().toISOString().split('T')[0];
        this.fromParty = data.fromParty || ''; // Stockist/Superstockist ID
        this.toParty = data.toParty || ''; // Retailer/Stockist ID
        this.items = data.items || []; // Array of InvoiceItem
        this.subtotal = data.subtotal || 0;
        this.totalDiscount = data.totalDiscount || 0;
        this.totalTax = data.totalTax || 0;
        this.grandTotal = data.grandTotal || 0;
        this.paymentTerms = data.paymentTerms || '30 days';
        this.dueDate = data.dueDate || this.calculateDueDate();
        this.status = data.status || 'pending'; // pending, paid, overdue, cancelled
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    calculateDueDate() {
        const dueDate = new Date(this.date);
        const terms = this.paymentTerms.toLowerCase();
        
        if (terms.includes('days')) {
            const days = parseInt(terms) || 30;
            dueDate.setDate(dueDate.getDate() + days);
        } else if (terms.includes('month')) {
            const months = parseInt(terms) || 1;
            dueDate.setMonth(dueDate.getMonth() + months);
        }
        
        return dueDate.toISOString().split('T')[0];
    }

    get isOverdue() {
        if (this.status === 'paid') return false;
        const today = new Date();
        const due = new Date(this.dueDate);
        return today > due;
    }

    get daysOverdue() {
        if (!this.isOverdue) return 0;
        const today = new Date();
        const due = new Date(this.dueDate);
        return Math.floor((today - due) / (1000 * 60 * 60 * 24));
    }

    addItem(productId, quantity, rate, discount = 0, taxRate = 12, bonusScheme = '') {
        const item = new InvoiceItem({
            productId,
            quantity,
            rate,
            discount,
            taxRate,
            bonusScheme
        });
        
        this.items.push(item);
        this.calculateTotals();
        this.updatedAt = new Date().toISOString();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.calculateTotals();
        this.updatedAt = new Date().toISOString();
    }

    calculateTotals() {
        this.subtotal = 0;
        this.totalDiscount = 0;
        this.totalTax = 0;

        this.items.forEach(item => {
            item.calculateTotals();
            this.subtotal += item.finalAmount;
            this.totalDiscount += item.discountAmount;
            this.totalTax += item.taxAmount;
        });

        this.grandTotal = this.subtotal + this.totalTax;
    }

    applyBonusSchemes() {
        this.items.forEach(item => {
            if (item.bonusScheme) {
                item.applyBonus();
            }
        });
        this.calculateTotals();
    }

    markAsPaid(paymentDate = new Date().toISOString().split('T')[0]) {
        this.status = 'paid';
        this.updatedAt = new Date().toISOString();
    }

    markAsOverdue() {
        if (this.status === 'pending' && this.isOverdue) {
            this.status = 'overdue';
            this.updatedAt = new Date().toISOString();
        }
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            invoiceNumber: this.invoiceNumber,
            date: this.date,
            fromParty: this.fromParty,
            toParty: this.toParty,
            items: this.items.map(item => item.toJSON()),
            subtotal: this.subtotal,
            totalDiscount: this.totalDiscount,
            totalTax: this.totalTax,
            grandTotal: this.grandTotal,
            paymentTerms: this.paymentTerms,
            dueDate: this.dueDate,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(json) {
        const invoice = new Invoice(json);
        invoice.items = json.items ? json.items.map(item => InvoiceItem.fromJSON(item)) : [];
        return invoice;
    }
}

class InvoiceItem {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('INVITEM');
        this.productId = data.productId || '';
        this.productName = data.productName || '';
        this.hsnCode = data.hsnCode || '';
        this.quantity = data.quantity || 0;
        this.rate = data.rate || 0;
        this.discount = data.discount || 0; // Percentage
        this.taxRate = data.taxRate || 12; // Percentage
        this.bonusScheme = data.bonusScheme || ''; // e.g., "10+1", "10+2"
        this.bonusQuantity = data.bonusQuantity || 0;
        this.total = data.total || 0;
        this.discountAmount = data.discountAmount || 0;
        this.taxAmount = data.taxAmount || 0;
        this.finalAmount = data.finalAmount || 0;
    }

    calculateTotals() {
        this.total = this.quantity * this.rate;
        this.discountAmount = this.total * (this.discount / 100);
        const taxableAmount = this.total - this.discountAmount;
        this.taxAmount = taxableAmount * (this.taxRate / 100);
        this.finalAmount = taxableAmount + this.taxAmount;
    }

    applyBonus() {
        if (!this.bonusScheme) return;

        const match = this.bonusScheme.match(/(\d+)\+(\d+)/);
        if (match) {
            const base = parseInt(match[1]);
            const bonus = parseInt(match[2]);
            this.bonusQuantity = Math.floor(this.quantity / base) * bonus;
        }
    }

    get finalQuantity() {
        return this.quantity + this.bonusQuantity;
    }

    toJSON() {
        return {
            id: this.id,
            productId: this.productId,
            productName: this.productName,
            hsnCode: this.hsnCode,
            quantity: this.quantity,
            rate: this.rate,
            discount: this.discount,
            taxRate: this.taxRate,
            bonusScheme: this.bonusScheme,
            bonusQuantity: this.bonusQuantity,
            total: this.total,
            discountAmount: this.discountAmount,
            taxAmount: this.taxAmount,
            finalAmount: this.finalAmount
        };
    }

    static fromJSON(json) {
        return new InvoiceItem(json);
    }
}

class InvoiceSeries {
    constructor(prefix, startFrom = 1) {
        this.prefix = prefix;
        this.currentNumber = startFrom;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    generateNumber() {
        const now = new Date();
        const year = now.getFullYear().toString().substr(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const sequence = this.currentNumber.toString().padStart(4, '0');
        
        this.currentNumber++;
        this.updatedAt = new Date().toISOString();
        
        return `${this.prefix}${year}${month}${sequence}`;
    }

    toJSON() {
        return {
            prefix: this.prefix,
            currentNumber: this.currentNumber,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}