class LoanController {
    constructor() {
        this.loans = Storage.getLoans();
        this.payments = Storage.getPayments();
        this.init();
    }

    init() {
        if (!this.loans.bank) this.loans.bank = [];
        if (!this.loans.personal) this.loans.personal = [];
        if (!this.payments) this.payments = [];
    }

    // Bank Loans (EMI based)
    addBankLoan(loanData) {
        const validation = this.validateBankLoan(loanData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const loan = {
            id: Formatters.generateId('BLN'),
            type: 'bank',
            ...loanData,
            status: 'Active',
            balance: loanData.amount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Calculate EMI if not provided
        if (!loan.emi && loan.amount && loan.interestRate && loan.tenure) {
            loan.emi = this.calculateEMI(loan.amount, loan.interestRate, loan.tenure);
        }

        // Set first EMI due date
        if (!loan.emiDueDate) {
            loan.emiDueDate = this.getNextEMIDate();
        }

        this.loans.bank.push(loan);
        const success = Storage.saveLoans(this.loans);
        
        if (success) {
            NotificationService.showSuccess('Bank loan added successfully');
            return { success: true, loan };
        } else {
            return { success: false, errors: ['Failed to save loan'] };
        }
    }

    validateBankLoan(loanData) {
        const errors = [];

        if (!loanData.bank) errors.push('Bank name is required');
        if (!loanData.amount || loanData.amount <= 0) errors.push('Valid loan amount is required');
        if (!loanData.interestRate || loanData.interestRate <= 0) errors.push('Valid interest rate is required');
        if (!loanData.tenure || loanData.tenure <= 0) errors.push('Valid tenure is required');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Personal Loans (Interest only)
    addPersonalLoan(loanData) {
        const validation = this.validatePersonalLoan(loanData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const loan = {
            id: Formatters.generateId('PLN'),
            type: 'personal',
            ...loanData,
            status: 'Active',
            balance: loanData.amount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Calculate monthly interest if not provided
        if (!loan.monthlyInterest && loan.amount && loan.interestRate) {
            loan.monthlyInterest = (loan.amount * loan.interestRate) / 1200; // Monthly interest
        }

        this.loans.personal.push(loan);
        const success = Storage.saveLoans(this.loans);
        
        if (success) {
            NotificationService.showSuccess('Personal loan added successfully');
            return { success: true, loan };
        } else {
            return { success: false, errors: ['Failed to save loan'] };
        }
    }

    validatePersonalLoan(loanData) {
        const errors = [];

        if (!loanData.lender) errors.push('Lender name is required');
        if (!loanData.amount || loanData.amount <= 0) errors.push('Valid loan amount is required');
        if (!loanData.interestRate || loanData.interestRate <= 0) errors.push('Valid interest rate is required');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Update loan
    updateLoan(id, loanData, type) {
        const loans = type === 'bank' ? this.loans.bank : this.loans.personal;
        const index = loans.findIndex(loan => loan.id === id);
        
        if (index === -1) {
            return { success: false, errors: ['Loan not found'] };
        }

        loanData.updatedAt = new Date().toISOString();
        loans[index] = { ...loans[index], ...loanData };
        
        const success = Storage.saveLoans(this.loans);
        if (success) {
            NotificationService.showSuccess('Loan updated successfully');
            return { success: true, loan: loans[index] };
        } else {
            return { success: false, errors: ['Failed to update loan'] };
        }
    }

    // Delete loan
    deleteLoan(id, type) {
        const loans = type === 'bank' ? this.loans.bank : this.loans.personal;
        const index = loans.findIndex(loan => loan.id === id);
        
        if (index === -1) {
            return { success: false, errors: ['Loan not found'] };
        }

        loans.splice(index, 1);
        const success = Storage.saveLoans(this.loans);
        
        if (success) {
            NotificationService.showSuccess('Loan deleted successfully');
            return { success: true };
        } else {
            return { success: false, errors: ['Failed to delete loan'] };
        }
    }

    // Record payment
    addPayment(paymentData) {
        const validation = this.validatePayment(paymentData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const loan = this.getLoanById(paymentData.loanId);
        if (!loan) {
            return { success: false, errors: ['Loan not found'] };
        }

        const payment = {
            id: Formatters.generateId('PMT'),
            ...paymentData,
            createdAt: new Date().toISOString()
        };

        // Calculate principal and interest for bank loans
        if (loan.type === 'bank') {
            const interest = (loan.balance * loan.interestRate) / 1200;
            payment.interest = Math.min(interest, paymentData.amount);
            payment.principal = paymentData.amount - payment.interest;
            
            // Update loan balance
            loan.balance -= payment.principal;
        } else {
            // Personal loan - interest only payment
            payment.interest = paymentData.amount;
            payment.principal = 0;
            
            // Only reduce balance if principal payment is specified
            if (paymentData.principal) {
                loan.balance -= paymentData.principal;
                payment.principal = paymentData.principal;
            }
        }

        payment.balance = loan.balance;

        // Update loan status if fully paid
        if (loan.balance <= 0) {
            loan.status = 'Paid';
        }

        loan.updatedAt = new Date().toISOString();
        
        // For bank loans, set next EMI due date
        if (loan.type === 'bank' && loan.status === 'Active') {
            loan.emiDueDate = this.getNextEMIDate(paymentData.date);
        }

        this.payments.push(payment);
        const success = Storage.savePayments(this.payments) && Storage.saveLoans(this.loans);
        
        if (success) {
            NotificationService.showSuccess('Payment recorded successfully');
            return { success: true, payment };
        } else {
            return { success: false, errors: ['Failed to record payment'] };
        }
    }

    validatePayment(paymentData) {
        const errors = [];

        if (!paymentData.loanId) errors.push('Loan ID is required');
        if (!paymentData.amount || paymentData.amount <= 0) errors.push('Valid payment amount is required');
        if (!paymentData.date) errors.push('Payment date is required');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Utility methods
    calculateEMI(principal, annualRate, tenureMonths) {
        const monthlyRate = annualRate / 1200;
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                   (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return Math.round(emi);
    }

    getNextEMIDate(fromDate = new Date()) {
        const date = new Date(fromDate);
        date.setMonth(date.getMonth() + 1);
        return date.toISOString().split('T')[0];
    }

    getLoanById(id) {
        const bankLoan = this.loans.bank.find(loan => loan.id === id);
        if (bankLoan) return bankLoan;
        
        const personalLoan = this.loans.personal.find(loan => loan.id === id);
        return personalLoan || null;
    }

    getPaymentsByLoan(loanId) {
        return this.payments.filter(payment => payment.loanId === loanId)
                           .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Loan analysis and reporting
    getLoanSummary() {
        const activeBankLoans = this.loans.bank.filter(loan => loan.status === 'Active');
        const activePersonalLoans = this.loans.personal.filter(loan => loan.status === 'Active');

        const totalBankBalance = activeBankLoans.reduce((sum, loan) => sum + loan.balance, 0);
        const totalPersonalBalance = activePersonalLoans.reduce((sum, loan) => sum + loan.balance, 0);
        
        const totalMonthlyEMI = activeBankLoans.reduce((sum, loan) => sum + (loan.emi || 0), 0);
        const totalMonthlyInterest = activePersonalLoans.reduce((sum, loan) => sum + (loan.monthlyInterest || 0), 0);

        return {
            bank: {
                count: activeBankLoans.length,
                totalBalance: totalBankBalance,
                totalMonthly: totalMonthlyEMI,
                averageEMI: activeBankLoans.length > 0 ? totalMonthlyEMI / activeBankLoans.length : 0
            },
            personal: {
                count: activePersonalLoans.length,
                totalBalance: totalPersonalBalance,
                totalMonthly: totalMonthlyInterest,
                averageInterest: activePersonalLoans.length > 0 ? totalMonthlyInterest / activePersonalLoans.length : 0
            },
            total: {
                loans: activeBankLoans.length + activePersonalLoans.length,
                balance: totalBankBalance + totalPersonalBalance,
                monthlyPayment: totalMonthlyEMI + totalMonthlyInterest
            }
        };
    }

    getUpcomingPayments(days = 7) {
        const today = new Date();
        const upcomingDate = new Date(today);
        upcomingDate.setDate(today.getDate() + days);

        const upcomingPayments = [];

        // Bank loan EMIs
        this.loans.bank.forEach(loan => {
            if (loan.status === 'Active' && loan.emiDueDate) {
                const dueDate = new Date(loan.emiDueDate);
                if (dueDate >= today && dueDate <= upcomingDate) {
                    upcomingPayments.push({
                        loanId: loan.id,
                        type: 'bank',
                        description: `EMI - ${loan.bank}`,
                        amount: loan.emi,
                        dueDate: loan.emiDueDate,
                        loan: loan
                    });
                }
            }
        });

        // Personal loan interest
        this.loans.personal.forEach(loan => {
            if (loan.status === 'Active') {
                const dueDate = new Date(loan.lastPaymentDate || loan.startDate);
                dueDate.setMonth(dueDate.getMonth() + 1);
                
                if (dueDate >= today && dueDate <= upcomingDate) {
                    upcomingPayments.push({
                        loanId: loan.id,
                        type: 'personal',
                        description: `Interest - ${loan.lender}`,
                        amount: loan.monthlyInterest,
                        dueDate: dueDate.toISOString().split('T')[0],
                        loan: loan
                    });
                }
            }
        });

        return upcomingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    // Payment schedule for bank loans
    getPaymentSchedule(loanId) {
        const loan = this.getLoanById(loanId);
        if (!loan || loan.type !== 'bank') return [];

        const schedule = [];
        let balance = loan.amount;
        let paymentDate = new Date(loan.startDate || loan.createdAt);

        for (let i = 1; i <= loan.tenure && balance > 0; i++) {
            const interest = (balance * loan.interestRate) / 1200;
            const principal = loan.emi - interest;
            
            schedule.push({
                installment: i,
                date: new Date(paymentDate).toISOString().split('T')[0],
                principal: Math.min(principal, balance),
                interest: interest,
                total: loan.emi,
                balance: Math.max(0, balance - principal)
            });

            balance -= principal;
            paymentDate.setMonth(paymentDate.getMonth() + 1);
        }

        return schedule;
    }

    // Interest calculation for personal loans
    calculateInterest(loanId, fromDate, toDate) {
        const loan = this.getLoanById(loanId);
        if (!loan || loan.type !== 'personal') return 0;

        const days = (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24);
        const interest = (loan.balance * loan.interestRate * days) / (100 * 365);
        
        return Math.round(interest);
    }

    // Rendering methods
    renderBankLoansTable(container) {
        const loans = this.loans.bank;
        this.renderLoansTable(loans, container, 'bank');
    }

    renderPersonalLoansTable(container) {
        const loans = this.loans.personal;
        this.renderLoansTable(loans, container, 'personal');
    }

    renderLoansTable(loans, container, type) {
        container.innerHTML = '';

        if (loans.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="highlight">
                            <i class="fas fa-info-circle"></i>
                            No ${type} loans found.
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        loans.forEach(loan => {
            const statusClass = loan.status === 'Active' ? 'stock-high' : 
                              loan.status === 'Paid' ? 'stock-medium' : 'stock-low';

            const row = document.createElement('tr');
            
            if (type === 'bank') {
                row.innerHTML = `
                    <td>BL${loan.id.substr(-3)}</td>
                    <td>${loan.bank}</td>
                    <td>${Formatters.formatCurrency(loan.amount)}</td>
                    <td>${loan.interestRate}%</td>
                    <td>${loan.tenure} months</td>
                    <td>${Formatters.formatCurrency(loan.emi)}</td>
                    <td>${Formatters.formatCurrency(loan.balance)}</td>
                    <td class="${statusClass}">${loan.status}</td>
                    <td>
                        <button class="btn btn-outline btn-sm edit-loan" data-id="${loan.id}" data-type="${type}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-loan" data-id="${loan.id}" data-type="${type}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-primary btn-sm add-payment" data-id="${loan.id}" data-type="${type}">
                            <i class="fas fa-money-bill"></i>
                        </button>
                        <button class="btn btn-info btn-sm view-schedule" data-id="${loan.id}" data-type="${type}">
                            <i class="fas fa-calendar"></i>
                        </button>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>PL${loan.id.substr(-3)}</td>
                    <td>${loan.lender}</td>
                    <td>${Formatters.formatCurrency(loan.amount)}</td>
                    <td>${loan.interestRate}%</td>
                    <td>-</td>
                    <td>${Formatters.formatCurrency(loan.monthlyInterest)}</td>
                    <td>${Formatters.formatCurrency(loan.balance)}</td>
                    <td class="${statusClass}">${loan.status}</td>
                    <td>
                        <button class="btn btn-outline btn-sm edit-loan" data-id="${loan.id}" data-type="${type}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-loan" data-id="${loan.id}" data-type="${type}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-primary btn-sm add-payment" data-id="${loan.id}" data-type="${type}">
                            <i class="fas fa-money-bill"></i>
                        </button>
                    </td>
                `;
            }
            
            container.appendChild(row);
        });
    }

    renderPaymentsTable(container, loanId = null) {
        let payments = this.payments;
        
        if (loanId) {
            payments = payments.filter(payment => payment.loanId === loanId);
        }

        payments = payments.sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = '';

        if (payments.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="highlight">
                            <i class="fas fa-info-circle"></i>
                            No payments found.
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        payments.forEach(payment => {
            const loan = this.getLoanById(payment.loanId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${Formatters.formatDate(payment.date)}</td>
                <td>${loan ? (loan.type === 'bank' ? loan.bank : loan.lender) : 'Unknown'}</td>
                <td>${loan ? loan.type : 'Unknown'}</td>
                <td>${Formatters.formatCurrency(payment.amount)}</td>
                <td>${Formatters.formatCurrency(payment.principal || 0)}</td>
                <td>${Formatters.formatCurrency(payment.interest || 0)}</td>
                <td>${Formatters.formatCurrency(payment.balance || 0)}</td>
            `;
            container.appendChild(row);
        });
    }
}