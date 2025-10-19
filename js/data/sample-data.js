// Sample data for initial setup
const SampleData = {
    initializeSampleData() {
        // Only initialize if no data exists
        if (Storage.getProducts().length === 0) {
            this.createSampleProducts();
        }

        if (Storage.getDistributors().stockists.length === 0) {
            this.createSampleDistributors();
        }

        if (Storage.getExpenses().marketing.length === 0) {
            this.createSampleExpenses();
        }

        if (Storage.getLoans().bank.length === 0) {
            this.createSampleLoans();
        }

        NotificationService.showSuccess('Sample data initialized successfully');
    },

    createSampleProducts() {
        const products = [
            {
                id: 'PROD001',
                name: 'SAZ LQ10',
                category: 'Syrup',
                costPrice: 120,
                mrp: 180,
                taxRate: 12,
                hsnCode: '30049099',
                manufacturer: 'Sanj Healthcare',
                packSize: '100ml',
                stockQuantity: 45,
                minStockLevel: 50,
                maxStockLevel: 200,
                isActive: true,
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: '2023-06-20T00:00:00.000Z'
            },
            {
                id: 'PROD002',
                name: 'CALSANZ FEM',
                category: 'Tablet',
                costPrice: 85,
                mrp: 130,
                taxRate: 12,
                hsnCode: '30049099',
                manufacturer: 'Sanj Healthcare',
                packSize: '10x10 Tablets',
                stockQuantity: 80,
                minStockLevel: 50,
                maxStockLevel: 200,
                isActive: true,
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: '2023-06-20T00:00:00.000Z'
            },
            {
                id: 'PROD003',
                name: 'CALSANZ STRONG',
                category: 'Tablet',
                costPrice: 95,
                mrp: 150,
                taxRate: 12,
                hsnCode: '30049099',
                manufacturer: 'Sanj Healthcare',
                packSize: '10x10 Tablets',
                stockQuantity: 75,
                minStockLevel: 50,
                maxStockLevel: 200,
                isActive: true,
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: '2023-06-20T00:00:00.000Z'
            },
            {
                id: 'PROD004',
                name: 'NEURON PLUS INJECTION',
                category: 'Injection',
                costPrice: 45,
                mrp: 70,
                taxRate: 12,
                hsnCode: '30049099',
                manufacturer: 'Sanj Healthcare',
                packSize: '1ml x 10',
                stockQuantity: 32,
                minStockLevel: 40,
                maxStockLevel: 150,
                isActive: true,
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: '2023-06-20T00:00:00.000Z'
            },
            {
                id: 'PROD005',
                name: 'RABSANZ DSR',
                category: 'Capsule',
                costPrice: 110,
                mrp: 165,
                taxRate: 12,
                hsnCode: '30049099',
                manufacturer: 'Sanj Healthcare',
                packSize: '10x10 Capsules',
                stockQuantity: 90,
                minStockLevel: 50,
                maxStockLevel: 200,
                isActive: true,
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: '2023-06-20T00:00:00.000Z'
            },
            {
                id: 'PROD006',
                name: 'SINOPLEX SYRUP',
                category: 'Syrup',
                costPrice: 75,
                mrp: 115,
                taxRate: 12,
                hsnCode: '30049099',
                manufacturer: 'Sanj Healthcare',
                packSize: '100ml',
                stockQuantity: 70,
                minStockLevel: 50,
                maxStockLevel: 200,
                isActive: true,
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: '2023-06-20T00:00:00.000Z'
            }
        ];

        Storage.saveProducts(products);
    },

    createSampleDistributors() {
        const distributors = {
            stockists: [
                {
                    id: 'DIST001',
                    name: 'Silchar Stockist',
                    type: 'stockist',
                    contactPerson: 'Rajesh Sharma',
                    email: 'rajesh@silcharstockist.com',
                    phone: '9876543210',
                    address: {
                        street: 'Hospital Road',
                        city: 'Silchar',
                        state: 'Assam',
                        pincode: '788001',
                        country: 'India'
                    },
                    gstin: '18AABCU9603R1ZM',
                    creditLimit: 500000,
                    currentBalance: 125000,
                    region: 'Silchar',
                    territory: 'Cachar',
                    superstockistId: 'DIST003',
                    paymentTerms: '30 days',
                    isActive: true,
                    registrationDate: '2023-01-10T00:00:00.000Z',
                    createdAt: '2023-01-10T00:00:00.000Z',
                    updatedAt: '2023-06-20T00:00:00.000Z'
                },
                {
                    id: 'DIST002',
                    name: 'Guwahati Stockist',
                    type: 'stockist',
                    contactPerson: 'Priya Singh',
                    email: 'priya@guwahatistockist.com',
                    phone: '9876543211',
                    address: {
                        street: 'GS Road',
                        city: 'Guwahati',
                        state: 'Assam',
                        pincode: '781001',
                        country: 'India'
                    },
                    gstin: '18AABCU9603R1ZN',
                    creditLimit: 750000,
                    currentBalance: 285000,
                    region: 'Guwahati',
                    territory: 'Kamrup',
                    superstockistId: 'DIST003',
                    paymentTerms: '45 days',
                    isActive: true,
                    registrationDate: '2023-02-15T00:00:00.000Z',
                    createdAt: '2023-02-15T00:00:00.000Z',
                    updatedAt: '2023-06-20T00:00:00.000Z'
                }
            ],
            superstockists: [
                {
                    id: 'DIST003',
                    name: 'North East Superstockist',
                    type: 'superstockist',
                    contactPerson: 'Amit Kumar',
                    email: 'amit@nesuperstockist.com',
                    phone: '9876543212',
                    address: {
                        street: 'Beltola Road',
                        city: 'Guwahati',
                        state: 'Assam',
                        pincode: '781028',
                        country: 'India'
                    },
                    gstin: '18AABCU9603R1ZO',
                    creditLimit: 2000000,
                    currentBalance: 650000,
                    region: 'North East',
                    territory: 'Assam',
                    stockists: ['DIST001', 'DIST002'],
                    warehouseCapacity: 5000,
                    currentStockValue: 1250000,
                    paymentTerms: '60 days',
                    isActive: true,
                    registrationDate: '2023-01-01T00:00:00.000Z',
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-06-20T00:00:00.000Z'
                }
            ]
        };

        Storage.saveDistributors(distributors);
    },

    createSampleExpenses() {
        const expenses = {
            marketing: [
                {
                    id: 'MEXP001',
                    date: '2023-06-15',
                    description: 'Doctor Conference Participation',
                    doctor: 'Multiple Doctors',
                    amount: 25000,
                    category: 'Conference',
                    createdAt: '2023-06-15T00:00:00.000Z',
                    updatedAt: '2023-06-15T00:00:00.000Z'
                },
                {
                    id: 'MEXP002',
                    date: '2023-06-20',
                    description: 'Product Samples Distribution',
                    doctor: 'Dr. Sharma, Dr. Patel',
                    amount: 15000,
                    category: 'Samples',
                    createdAt: '2023-06-20T00:00:00.000Z',
                    updatedAt: '2023-06-20T00:00:00.000Z'
                }
            ],
            operating: [
                {
                    id: 'OEXP001',
                    date: '2023-06-01',
                    description: 'Staff Salaries - June',
                    category: 'Salary',
                    amount: 85000,
                    recurring: true,
                    createdAt: '2023-06-01T00:00:00.000Z',
                    updatedAt: '2023-06-01T00:00:00.000Z'
                },
                {
                    id: 'OEXP002',
                    date: '2023-06-05',
                    description: 'Office Rent',
                    category: 'Rent',
                    amount: 25000,
                    recurring: true,
                    createdAt: '2023-06-05T00:00:00.000Z',
                    updatedAt: '2023-06-05T00:00:00.000Z'
                },
                {
                    id: 'OEXP003',
                    date: '2023-06-10',
                    description: 'Electricity Bill',
                    category: 'Utilities',
                    amount: 8500,
                    recurring: true,
                    createdAt: '2023-06-10T00:00:00.000Z',
                    updatedAt: '2023-06-10T00:00:00.000Z'
                }
            ]
        };

        Storage.saveExpenses(expenses);
    },

    createSampleLoans() {
        const loans = {
            bank: [
                {
                    id: 'BLN001',
                    type: 'bank',
                    bank: 'State Bank of India',
                    amount: 500000,
                    interestRate: 9.5,
                    tenure: 48,
                    emi: 12560,
                    balance: 450000,
                    startDate: '2023-01-01',
                    emiDueDate: '2023-07-05',
                    status: 'Active',
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-06-20T00:00:00.000Z'
                }
            ],
            personal: [
                {
                    id: 'PLN001',
                    type: 'personal',
                    lender: 'Mr. Agarwal',
                    amount: 200000,
                    interestRate: 12,
                    monthlyInterest: 2000,
                    balance: 200000,
                    startDate: '2023-03-15',
                    lastPaymentDate: '2023-06-15',
                    status: 'Active',
                    createdAt: '2023-03-15T00:00:00.000Z',
                    updatedAt: '2023-06-20T00:00:00.000Z'
                }
            ]
        };

        const payments = [
            {
                id: 'PMT001',
                loanId: 'BLN001',
                date: '2023-06-05',
                amount: 12560,
                principal: 8560,
                interest: 4000,
                balance: 450000,
                createdAt: '2023-06-05T00:00:00.000Z'
            },
            {
                id: 'PMT002',
                loanId: 'PLN001',
                date: '2023-06-15',
                amount: 2000,
                principal: 0,
                interest: 2000,
                balance: 200000,
                createdAt: '2023-06-15T00:00:00.000Z'
            }
        ];

        Storage.saveLoans(loans);
        Storage.savePayments(payments);
    }
};