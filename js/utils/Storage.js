class Storage {
    static prefix = 'sanj_healthcare_';

    static set(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serializedValue);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    static clear() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    static getAll() {
        const data = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    const cleanKey = key.replace(this.prefix, '');
                    data[cleanKey] = this.get(cleanKey);
                }
            }
            return data;
        } catch (error) {
            console.error('Storage getAll error:', error);
            return {};
        }
    }

    // Specific storage methods for our data models
    static saveProducts(products) {
        return this.set('products', products);
    }

    static getProducts() {
        return this.get('products', []);
    }

    static saveDistributors(distributors) {
        return this.set('distributors', distributors);
    }

    static getDistributors() {
        return this.get('distributors', { stockists: [], superstockists: [] });
    }

    static saveInventory(inventory) {
        return this.set('inventory', inventory);
    }

    static getInventory() {
        return this.get('inventory', []);
    }

    static saveInvoices(invoices) {
        return this.set('invoices', invoices);
    }

    static getInvoices() {
        return this.get('invoices', { stockist: [], superstockist: [] });
    }

    static saveExpenses(expenses) {
        return this.set('expenses', expenses);
    }

    static getExpenses() {
        return this.get('expenses', { marketing: [], operating: [] });
    }

    static saveLoans(loans) {
        return this.set('loans', loans);
    }

    static getLoans() {
        return this.get('loans', { bank: [], personal: [] });
    }

    static savePayments(payments) {
        return this.set('payments', payments);
    }

    static getPayments() {
        return this.get('payments', []);
    }

    static saveSettings(settings) {
        return this.set('settings', settings);
    }

    static getSettings() {
        return this.get('settings', {
            companyName: 'Sanj Healthcare',
            address: 'Silchar, Assam',
            taxRate: 12,
            currency: '₹'
        });
    }
}