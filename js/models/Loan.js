class Loan {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('LN');
        this.type = data.type || 'bank'; // 'bank' or 'personal'
        this.amount = data.amount || 0;
        this.interestRate = data.interestRate || 0;
        this.startDate = data.startDate || new Date().toISOString().split('T')[0];
        this.balance = data.balance || this.amount;
        this.status = data.status || 'active'; // active, paid, closed, defaulted
        this.purpose = data.purpose || '';
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    get isActive() {
        return this.status === 'active';
    }

    get isFullyPaid() {
        return this.balance <= 0;
    }

    get totalInterestPaid() {
        // This would be calculated from payment history
        return 0;
    }

    makePayment(amount, paymentDate = new Date().toISOString().split('T')[0]) {
        if (amount > this.balance) {
            throw new Error('Payment amount exceeds loan balance');
        }

        this.balance -= amount;
        this.updatedAt = new Date().toISOString();

        if (this.balance <= 0) {
            this.status = 'paid';
        }

        return {
            principal: amount,
            newBalance: this.balance,
            status: this.status
        };
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            amount: this.amount,
            interestRate: this.interestRate,
            startDate: this.startDate,
            balance: this.balance,
            status: this.status,
            purpose: this.purpose,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(json) {
        return new Loan(json);
    }
}

class BankLoan extends Loan {
    constructor(data = {}) {
        super(data);
        this.type = 'bank';
        this.bank = data.bank || '';
        this.accountNumber = data.accountNumber || '';
        this.tenure = data.tenure || 0; // in months
        this.emi = data.emi || 0;
        this.emiDueDate = data.emiDueDate || this.calculateNextEMIDate();
        this.loanAccountNumber = data.loanAccountNumber || '';
        this.sanctionDate = data.sanctionDate || this.startDate;
        this.closureDate = data.closureDate || '';
        this.penaltyRate = data.penaltyRate || 0; // Late payment penalty
    }

    calculateEMI() {
        const monthlyRate = this.interestRate / 1200;
        const emi = this.amount * monthlyRate * Math.pow(1 + monthlyRate, this.tenure) / 
                   (Math.pow(1 + monthlyRate, this.tenure) - 1);
        this.emi = Math.round(emi);
        return this.emi;
    }

    calculateNextEMIDate(fromDate = this.startDate) {
        const date = new Date(fromDate);
        date.setMonth(date.getMonth() + 1);
        return date.toISOString().split('T')[0];
    }

    getPaymentSchedule() {
        const schedule = [];
        let balance = this.amount;
        let paymentDate = new Date(this.startDate);

        for (let i = 1; i <= this.tenure && balance > 0; i++) {
            const interest = (balance * this.interestRate) / 1200;
            const principal = this.emi - interest;
            const payment = Math.min(principal, balance);

            schedule.push({
                installment: i,
                date: new Date(paymentDate).toISOString().split('T')[0],
                principal: payment,
                interest: interest,
                total: this.emi,
                balance: Math.max(0, balance - payment)
            });

            balance -= payment;
            paymentDate.setMonth(paymentDate.getMonth() + 1);
        }

        return schedule;
    }

    getTotalInterest() {
        const totalPayment = this.emi * this.tenure;
        return totalPayment - this.amount;
    }

    getRemainingTenure() {
        const paidMonths = this.getPaidMonths();
        return Math.max(0, this.tenure - paidMonths);
    }

    getPaidMonths() {
        // This would be calculated from payment history
        return 0;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            bank: this.bank,
            accountNumber: this.accountNumber,
            tenure: this.tenure,
            emi: this.emi,
            emiDueDate: this.emiDueDate,
            loanAccountNumber: this.loanAccountNumber,
            sanctionDate: this.sanctionDate,
            closureDate: this.closureDate,
            penaltyRate: this.penaltyRate
        };
    }
}

class PersonalLoan extends Loan {
    constructor(data = {}) {
        super(data);
        this.type = 'personal';
        this.lender = data.lender || '';
        this.lenderContact = data.lenderContact || '';
        this.monthlyInterest = data.monthlyInterest || this.calculateMonthlyInterest();
        this.interestPaymentDate = data.interestPaymentDate || this.calculateNextInterestDate();
        lastPaymentDate: data.lastPaymentDate || '';
        this.interestFrequency = data.interestFrequency || 'monthly'; // monthly, quarterly, yearly
        this.principalRepayment = data.principalRepayment || 'bullet'; // bullet, monthly, custom
    }

    calculateMonthlyInterest() {
        return (this.amount * this.interestRate) / 1200;
    }

    calculateNextInterestDate(fromDate = this.startDate) {
        const date = new Date(fromDate);
        
        switch (this.interestFrequency) {
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        
        return date.toISOString().split('T')[0];
    }

    getInterestForPeriod(fromDate, toDate) {
        const days = (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24);
        const interest = (this.balance * this.interestRate * days) / (100 * 365);
        return Math.round(interest);
    }

    makeInterestPayment(amount, paymentDate = new Date().toISOString().split('T')[0]) {
        const expectedInterest = this.calculateMonthlyInterest();
        
        if (amount < expectedInterest) {
            throw new Error('Payment amount is less than expected interest');
        }

        this.lastPaymentDate = paymentDate;
        this.interestPaymentDate = this.calculateNextInterestDate(paymentDate);
        this.updatedAt = new Date().toISOString();

        return {
            interest: amount,
            nextPaymentDate: this.interestPaymentDate
        };
    }

    makePrincipalPayment(amount, paymentDate = new Date().toISOString().split('T')[0]) {
        const result = super.makePayment(amount, paymentDate);
        this.lastPaymentDate = paymentDate;
        return result;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            lender: this.lender,
            lenderContact: this.lenderContact,
            monthlyInterest: this.monthlyInterest,
            interestPaymentDate: this.interestPaymentDate,
            lastPaymentDate: this.lastPaymentDate,
            interestFrequency: this.interestFrequency,
            principalRepayment: this.principalRepayment
        };
    }
}

class LoanPayment {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('LNPMT');
        this.loanId = data.loanId || '';
        this.date = data.date || new Date().toISOString().split('T')[0];
        this.amount = data.amount || 0;
        this.principal = data.principal || 0;
        this.interest = data.interest || 0;
        this.penalty = data.penalty || 0;
        this.balance = data.balance || 0;
        this.paymentMethod = data.paymentMethod || 'bank';
        this.reference = data.reference || '';
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    get totalAmount() {
        return this.principal + this.interest + this.penalty;
    }

    validate() {
        if (this.totalAmount !== this.amount) {
            throw new Error('Payment amount mismatch: principal + interest + penalty must equal total amount');
        }
    }

    toJSON() {
        return {
            id: this.id,
            loanId: this.loanId,
            date: this.date,
            amount: this.amount,
            principal: this.principal,
            interest: this.interest,
            penalty: this.penalty,
            balance: this.balance,
            paymentMethod: this.paymentMethod,
            reference: this.reference,
            notes: this.notes,
            createdAt: this.createdAt
        };
    }

    static fromJSON(json) {
        return new LoanPayment(json);
    }
}

class LoanDocument {
    constructor(data = {}) {
        this.id = data.id || Formatters.generateId('LNDOC');
        this.loanId = data.loanId || '';
        this.name = data.name || '';
        this.type = data.type || ''; // sanction letter, agreement, etc.
        this.fileUrl = data.fileUrl || '';
        this.uploadDate = data.uploadDate || new Date().toISOString().split('T')[0];
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            loanId: this.loanId,
            name: this.name,
            type: this.type,
            fileUrl: this.fileUrl,
            uploadDate: this.uploadDate,
            notes: this.notes,
            createdAt: this.createdAt
        };
    }
}