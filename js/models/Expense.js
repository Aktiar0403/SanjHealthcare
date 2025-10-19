class Expense {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('EXP');
        this.type = data.type || 'operating'; // 'marketing' or 'operating'
        this.date = data.date || new Date().toISOString().split('T')[0];
        this.description = data.description || '';
        this.amount = data.amount || 0;
        this.category = data.category || '';
        this.paymentMethod = data.paymentMethod || 'cash'; // cash, bank, online
        this.reference = data.reference || ''; // Cheque no, UPI ref, etc.
        this.recurring = data.recurring || false;
        this.frequency = data.frequency || 'monthly'; // daily, weekly, monthly, quarterly, yearly
        this.status = data.status || 'paid'; // paid, pending, cancelled
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    get isRecurring() {
        return this.recurring;
    }

    get nextDueDate() {
        if (!this.recurring) return null;
        
        const lastDate = new Date(this.date);
        const nextDate = new Date(lastDate);
        
        switch (this.frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }
        
        return nextDate.toISOString().split('T')[0];
    }

    markAsPaid(paymentDate = new Date().toISOString().split('T')[0]) {
        this.status = 'paid';
        this.date = paymentDate;
        this.updatedAt = new Date().toISOString();
    }

    markAsPending() {
        this.status = 'pending';
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            date: this.date,
            description: this.description,
            amount: this.amount,
            category: this.category,
            paymentMethod: this.paymentMethod,
            reference: this.reference,
            recurring: this.recurring,
            frequency: this.frequency,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(json) {
        return new Expense(json);
    }
}

class MarketingExpense extends Expense {
    constructor(data = {}) {
        super(data);
        this.type = 'marketing';
        this.doctor = data.doctor || '';
        this.event = data.event || '';
        this.purpose = data.purpose || ''; // Sampling, Conference, Promotion, etc.
        this.expectedROI = data.expectedROI || 0; // Expected return on investment
        this.followUpDate = data.followUpDate || '';
    }

    get isDoctorInvestment() {
        return this.doctor && this.doctor.trim() !== '';
    }

    get requiresFollowUp() {
        return this.followUpDate && new Date(this.followUpDate) > new Date();
    }

    scheduleFollowUp(followUpDate) {
        this.followUpDate = followUpDate;
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            ...super.toJSON(),
            doctor: this.doctor,
            event: this.event,
            purpose: this.purpose,
            expectedROI: this.expectedROI,
            followUpDate: this.followUpDate
        };
    }
}

class OperatingExpense extends Expense {
    constructor(data = {}) {
        super(data);
        this.type = 'operating';
        this.vendor = data.vendor || '';
        this.billNumber = data.billNumber || '';
        this.dueDate = data.dueDate || '';
        this.paidDate = data.paidDate || '';
        this.taxAmount = data.taxAmount || 0;
        this.isEssential = data.isEssential !== undefined ? data.isEssential : true;
    }

    get isOverdue() {
        if (this.status === 'paid') return false;
        if (!this.dueDate) return false;
        
        const today = new Date();
        const due = new Date(this.dueDate);
        return today > due;
    }

    get totalAmount() {
        return this.amount + this.taxAmount;
    }

    markAsPaid(paymentDate = new Date().toISOString().split('T')[0]) {
        super.markAsPaid(paymentDate);
        this.paidDate = paymentDate;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            vendor: this.vendor,
            billNumber: this.billNumber,
            dueDate: this.dueDate,
            paidDate: this.paidDate,
            taxAmount: this.taxAmount,
            isEssential: this.isEssential
        };
    }
}

class ExpenseCategory {
    constructor(name, type, description = '', budget = 0) {
        this.id = Formatters.generateId('EXPCAT');
        this.name = name;
        this.type = type; // 'marketing' or 'operating'
        this.description = description;
        this.budget = budget;
        this.isActive = true;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    updateBudget(newBudget) {
        this.budget = newBudget;
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            budget: this.budget,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

class ExpenseBudget {
    constructor(month, year, categories = {}) {
        this.id = Formatters.generateId('BUDGET');
        this.month = month;
        this.year = year;
        this.categories = categories; // { categoryId: amount, ... }
        this.totalBudget = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    setCategoryBudget(categoryId, amount) {
        this.categories[categoryId] = amount;
        this.totalBudget = Object.values(this.categories).reduce((sum, amount) => sum + amount, 0);
        this.updatedAt = new Date().toISOString();
    }

    getCategoryBudget(categoryId) {
        return this.categories[categoryId] || 0;
    }

    getUtilization(expenses) {
        const utilization = {};
        let totalSpent = 0;

        Object.keys(this.categories).forEach(categoryId => {
            const categoryExpenses = expenses.filter(exp => 
                exp.category === categoryId || 
                (exp.category && exp.category.id === categoryId)
            );
            const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const budget = this.categories[categoryId];
            
            utilization[categoryId] = {
                budget: budget,
                spent: spent,
                remaining: budget - spent,
                utilizationRate: budget > 0 ? (spent / budget) * 100 : 0
            };
            
            totalSpent += spent;
        });

        utilization.total = {
            budget: this.totalBudget,
            spent: totalSpent,
            remaining: this.totalBudget - totalSpent,
            utilizationRate: this.totalBudget > 0 ? (totalSpent / this.totalBudget) * 100 : 0
        };

        return utilization;
    }

    toJSON() {
        return {
            id: this.id,
            month: this.month,
            year: this.year,
            categories: this.categories,
            totalBudget: this.totalBudget,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}