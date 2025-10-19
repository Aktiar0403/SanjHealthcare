class ExpenseController {
    constructor() {
        this.expenses = Storage.getExpenses();
        this.categories = {
            marketing: ['Conference', 'Samples', 'Doctor Meeting', 'Promotional', 'Advertising', 'Travel'],
            operating: ['Salary', 'Rent', 'Utilities', 'Office Supplies', 'Maintenance', 'Insurance', 'Professional Fees']
        };
        this.init();
    }

    init() {
        if (!this.expenses.marketing) this.expenses.marketing = [];
        if (!this.expenses.operating) this.expenses.operating = [];
    }

    // Marketing Expenses - Doctor Investments
    addMarketingExpense(expenseData) {
        const validation = this.validateMarketingExpense(expenseData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const expense = {
            id: Formatters.generateId('MEXP'),
            type: 'marketing',
            ...expenseData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.expenses.marketing.push(expense);
        const success = Storage.saveExpenses(this.expenses);
        
        if (success) {
            NotificationService.showSuccess('Marketing expense added successfully');
            return { success: true, expense };
        } else {
            return { success: false, errors: ['Failed to save expense'] };
        }
    }

    validateMarketingExpense(expenseData) {
        const errors = [];

        if (!expenseData.description) errors.push('Description is required');
        if (!expenseData.amount || expenseData.amount <= 0) errors.push('Valid amount is required');
        if (!expenseData.date) errors.push('Date is required');
        if (!expenseData.category) errors.push('Category is required');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Operating Expenses - Salary, Loans, EMI, Interest
    addOperatingExpense(expenseData) {
        const validation = this.validateOperatingExpense(expenseData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const expense = {
            id: Formatters.generateId('OEXP'),
            type: 'operating',
            ...expenseData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.expenses.operating.push(expense);
        const success = Storage.saveExpenses(this.expenses);
        
        if (success) {
            NotificationService.showSuccess('Operating expense added successfully');
            return { success: true, expense };
        } else {
            return { success: false, errors: ['Failed to save expense'] };
        }
    }

    validateOperatingExpense(expenseData) {
        const errors = [];

        if (!expenseData.description) errors.push('Description is required');
        if (!expenseData.amount || expenseData.amount <= 0) errors.push('Valid amount is required');
        if (!expenseData.date) errors.push('Date is required');
        if (!expenseData.category) errors.push('Category is required');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Add recurring expense (Salary, EMI, Rent)
    addRecurringExpense(expenseData) {
        expenseData.recurring = true;
        
        if (expenseData.category === 'Salary' || expenseData.category === 'EMI' || expenseData.category === 'Rent') {
            expenseData.frequency = 'monthly';
        }

        return this.addOperatingExpense(expenseData);
    }

    // Get expenses with advanced filtering
    getMarketingExpenses(filters = {}) {
        let expenses = this.expenses.marketing;

        if (filters.category) {
            expenses = expenses.filter(exp => exp.category === filters.category);
        }

        if (filters.doctor) {
            expenses = expenses.filter(exp => exp.doctor?.toLowerCase().includes(filters.doctor.toLowerCase()));
        }

        if (filters.dateFrom) {
            expenses = expenses.filter(exp => new Date(exp.date) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            expenses = expenses.filter(exp => new Date(exp.date) <= new Date(filters.dateTo));
        }

        if (filters.minAmount) {
            expenses = expenses.filter(exp => exp.amount >= filters.minAmount);
        }

        if (filters.maxAmount) {
            expenses = expenses.filter(exp => exp.amount <= filters.maxAmount);
        }

        return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getOperatingExpenses(filters = {}) {
        let expenses = this.expenses.operating;

        if (filters.category) {
            expenses = expenses.filter(exp => exp.category === filters.category);
        }

        if (filters.recurring !== undefined) {
            expenses = expenses.filter(exp => exp.recurring === filters.recurring);
        }

        if (filters.dateFrom) {
            expenses = expenses.filter(exp => new Date(exp.date) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            expenses = expenses.filter(exp => new Date(exp.date) <= new Date(filters.dateTo));
        }

        if (filters.minAmount) {
            expenses = expenses.filter(exp => exp.amount >= filters.minAmount);
        }

        if (filters.maxAmount) {
            expenses = expenses.filter(exp => exp.amount <= filters.maxAmount);
        }

        return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Update expense
    updateExpense(id, expenseData, type) {
        const expenses = type === 'marketing' ? this.expenses.marketing : this.expenses.operating;
        const index = expenses.findIndex(exp => exp.id === id);
        
        if (index === -1) {
            return { success: false, errors: ['Expense not found'] };
        }

        expenseData.updatedAt = new Date().toISOString();
        expenses[index] = { ...expenses[index], ...expenseData };
        
        const success = Storage.saveExpenses(this.expenses);
        if (success) {
            NotificationService.showSuccess('Expense updated successfully');
            return { success: true, expense: expenses[index] };
        } else {
            return { success: false, errors: ['Failed to update expense'] };
        }
    }

    // Delete expense
    deleteExpense(id, type) {
        const expenses = type === 'marketing' ? this.expenses.marketing : this.expenses.operating;
        const index = expenses.findIndex(exp => exp.id === id);
        
        if (index === -1) {
            return { success: false, errors: ['Expense not found'] };
        }

        expenses.splice(index, 1);
        const success = Storage.saveExpenses(this.expenses);
        
        if (success) {
            NotificationService.showSuccess('Expense deleted successfully');
            return { success: true };
        } else {
            return { success: false, errors: ['Failed to delete expense'] };
        }
    }

    // Doctor-wise expense analysis
    getDoctorWiseExpenses(period = 'month') {
        const marketingExpenses = this.getMarketingExpenses({ period });
        
        const doctorExpenses = {};
        
        marketingExpenses.forEach(expense => {
            const doctor = expense.doctor || 'General';
            if (!doctorExpenses[doctor]) {
                doctorExpenses[doctor] = {
                    total: 0,
                    count: 0,
                    expenses: []
                };
            }
            doctorExpenses[doctor].total += expense.amount;
            doctorExpenses[doctor].count++;
            doctorExpenses[doctor].expenses.push(expense);
        });

        return doctorExpenses;
    }

    // Category-wise analysis
    getCategoryWiseAnalysis(period = 'month') {
        const marketing = this.getMarketingExpenses({ period });
        const operating = this.getOperatingExpenses({ period });

        const marketingByCategory = this.groupByCategory(marketing);
        const operatingByCategory = this.groupByCategory(operating);

        return {
            marketing: marketingByCategory,
            operating: operatingByCategory
        };
    }

    // Monthly trend analysis
    getMonthlyTrend(months = 6) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const monthlyData = {};

        // Initialize months
        for (let i = 0; i < months; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            const monthKey = date.toISOString().substring(0, 7);
            monthlyData[monthKey] = {
                marketing: 0,
                operating: 0,
                total: 0
            };
        }

        // Fill data
        this.expenses.marketing.forEach(expense => {
            const monthKey = expense.date.substring(0, 7);
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].marketing += expense.amount;
                monthlyData[monthKey].total += expense.amount;
            }
        });

        this.expenses.operating.forEach(expense => {
            const monthKey = expense.date.substring(0, 7);
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].operating += expense.amount;
                monthlyData[monthKey].total += expense.amount;
            }
        });

        return monthlyData;
    }

    // Budget vs Actual
    getBudgetVsActual(month, year) {
        const targetMonth = `${year}-${month.toString().padStart(2, '0')}`;
        
        const actualMarketing = this.getMarketingExpenses({
            dateFrom: `${targetMonth}-01`,
            dateTo: `${targetMonth}-31`
        }).reduce((sum, exp) => sum + exp.amount, 0);

        const actualOperating = this.getOperatingExpenses({
            dateFrom: `${targetMonth}-01`,
            dateTo: `${targetMonth}-31`
        }).reduce((sum, exp) => sum + exp.amount, 0);

        // Get budget from settings (you would store budgets separately)
        const budget = Storage.get('budgets', {})[targetMonth] || {
            marketing: 0,
            operating: 0
        };

        return {
            marketing: {
                budget: budget.marketing,
                actual: actualMarketing,
                variance: actualMarketing - budget.marketing,
                percentage: budget.marketing > 0 ? (actualMarketing / budget.marketing) * 100 : 0
            },
            operating: {
                budget: budget.operating,
                actual: actualOperating,
                variance: actualOperating - budget.operating,
                percentage: budget.operating > 0 ? (actualOperating / budget.operating) * 100 : 0
            }
        };
    }

    // Helper methods
    groupByCategory(expenses) {
        const categories = {};
        
        expenses.forEach(expense => {
            const category = expense.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = {
                    total: 0,
                    count: 0,
                    expenses: []
                };
            }
            categories[category].total += expense.amount;
            categories[category].count++;
            categories[category].expenses.push(expense);
        });

        return categories;
    }

    filterByPeriod(expenses, period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'quarter':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                return expenses;
        }

        return expenses.filter(expense => 
            new Date(expense.date) >= startDate
        );
    }

    getExpenseSummary(period = 'month') {
        const marketing = this.getMarketingExpenses({ period });
        const operating = this.getOperatingExpenses({ period });

        const totalMarketing = marketing.reduce((sum, exp) => sum + exp.amount, 0);
        const totalOperating = operating.reduce((sum, exp) => sum + exp.amount, 0);
        const totalExpenses = totalMarketing + totalOperating;

        return {
            marketing: {
                total: totalMarketing,
                count: marketing.length,
                average: marketing.length > 0 ? totalMarketing / marketing.length : 0
            },
            operating: {
                total: totalOperating,
                count: operating.length,
                average: operating.length > 0 ? totalOperating / operating.length : 0
            },
            total: {
                expenses: totalExpenses,
                count: marketing.length + operating.length
            }
        };
    }

    // Rendering methods
    renderMarketingExpensesTable(container, filters = {}) {
        const expenses = this.getMarketingExpenses(filters);
        this.renderExpensesTable(expenses, container, 'marketing');
    }

    renderOperatingExpensesTable(container, filters = {}) {
        const expenses = this.getOperatingExpenses(filters);
        this.renderExpensesTable(expenses, container, 'operating');
    }

    renderExpensesTable(expenses, container, type) {
        container.innerHTML = '';

        if (expenses.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="highlight">
                            <i class="fas fa-info-circle"></i>
                            No ${type} expenses found for this period.
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${Formatters.formatDate(expense.date)}</td>
                <td>${expense.description}</td>
                <td>${type === 'marketing' ? (expense.doctor || expense.event || 'N/A') : expense.category}</td>
                <td>${Formatters.formatCurrency(expense.amount)}</td>
                <td>${type === 'marketing' ? expense.category : (expense.recurring ? 'Yes' : 'No')}</td>
                <td>
                    <button class="btn btn-outline btn-sm edit-expense" data-id="${expense.id}" data-type="${type}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-expense" data-id="${expense.id}" data-type="${type}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }
}