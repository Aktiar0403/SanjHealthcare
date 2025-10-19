class InvoiceController {
    constructor() {
        this.invoices = Storage.getInvoices();
        this.productController = new ProductController();
        this.distributorController = new DistributorController();
        this.init();
    }

    init() {
        if (!this.invoices.stockist) this.invoices.stockist = [];
        if (!this.invoices.superstockist) this.invoices.superstockist = [];
    }

    // Stockist Invoices (Stockist to Retailer)
    createStockistInvoice(invoiceData) {
        const validation = this.validateInvoice(invoiceData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const invoice = {
            id: Formatters.generateId('INV-ST'),
            type: 'stockist',
            invoiceNumber: this.generateInvoiceNumber('ST'),
            ...invoiceData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Calculate totals
        this.calculateInvoiceTotals(invoice);

        this.invoices.stockist.push(invoice);
        const success = Storage.saveInvoices(this.invoices);
        
        if (success) {
            // Update stock levels
            this.updateStockFromInvoice(invoice);
            NotificationService.showSuccess('Stockist invoice created successfully');
            return { success: true, invoice };
        } else {
            return { success: false, errors: ['Failed to save invoice'] };
        }
    }

    // Superstockist Invoices (Superstockist to Stockist)
    createSuperstockistInvoice(invoiceData) {
        const validation = this.validateInvoice(invoiceData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const invoice = {
            id: Formatters.generateId('INV-SS'),
            type: 'superstockist',
            invoiceNumber: this.generateInvoiceNumber('SS'),
            ...invoiceData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Calculate totals
        this.calculateInvoiceTotals(invoice);

        this.invoices.superstockist.push(invoice);
        const success = Storage.saveInvoices(this.invoices);
        
        if (success) {
            // Update stock levels
            this.updateStockFromInvoice(invoice);
            NotificationService.showSuccess('Superstockist invoice created successfully');
            return { success: true, invoice };
        } else {
            return { success: false, errors: ['Failed to save invoice'] };
        }
    }

    validateInvoice(invoiceData) {
        const errors = [];

        if (!invoiceData.fromParty) errors.push('From party is required');
        if (!invoiceData.toParty) errors.push('To party is required');
        if (!invoiceData.items || invoiceData.items.length === 0) {
            errors.push('At least one product item is required');
        }

        // Validate items
        if (invoiceData.items) {
            invoiceData.items.forEach((item, index) => {
                if (!item.productId) errors.push(`Product is required for item ${index + 1}`);
                if (!item.quantity || item.quantity <= 0) errors.push(`Valid quantity is required for item ${index + 1}`);
                if (!item.rate || item.rate <= 0) errors.push(`Valid rate is required for item ${index + 1}`);
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    calculateInvoiceTotals(invoice) {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        invoice.items.forEach(item => {
            const itemTotal = item.quantity * item.rate;
            const itemDiscount = itemTotal * (item.discount / 100);
            const itemSubtotal = itemTotal - itemDiscount;
            const itemTax = itemSubtotal * (item.taxRate / 100);

            subtotal += itemSubtotal;
            totalDiscount += itemDiscount;
            totalTax += itemTax;

            // Update item totals
            item.total = itemTotal;
            item.discountAmount = itemDiscount;
            item.taxAmount = itemTax;
            item.finalAmount = itemSubtotal + itemTax;
        });

        invoice.subtotal = subtotal;
        invoice.totalDiscount = totalDiscount;
        invoice.totalTax = totalTax;
        invoice.grandTotal = subtotal + totalTax;

        // Apply bonus schemes
        this.applyBonusSchemes(invoice);
    }

    applyBonusSchemes(invoice) {
        invoice.items.forEach(item => {
            if (item.bonusScheme) {
                const bonus = this.calculateBonus(item.quantity, item.bonusScheme);
                item.bonusQuantity = bonus;
                item.finalQuantity = item.quantity + bonus;
            }
        });
    }

    calculateBonus(quantity, scheme) {
        // Parse schemes like "10+1", "10+2", "12+1"
        const match = scheme.match(/(\d+)\+(\d+)/);
        if (match) {
            const base = parseInt(match[1]);
            const bonus = parseInt(match[2]);
            return Math.floor(quantity / base) * bonus;
        }
        return 0;
    }

    generateInvoiceNumber(prefix) {
        const now = new Date();
        const year = now.getFullYear().toString().substr(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const sequence = (this.getInvoiceCount(prefix) + 1).toString().padStart(4, '0');
        return `${prefix}${year}${month}${sequence}`;
    }

    getInvoiceCount(prefix) {
        const allInvoices = [...this.invoices.stockist, ...this.invoices.superstockist];
        return allInvoices.filter(inv => inv.invoiceNumber.startsWith(prefix)).length;
    }

    updateStockFromInvoice(invoice) {
        const inventoryController = new InventoryController();
        
        invoice.items.forEach(item => {
            // Remove stock from source location
            const fromLocation = invoice.type === 'stockist' ? 'stockist' : 'superstockist';
            inventoryController.updateStock(
                item.productId,
                fromLocation,
                item.quantity,
                'sale',
                invoice.id
            );

            // Add stock to destination location
            const toLocation = invoice.type === 'stockist' ? 'retailer' : 'stockist';
            inventoryController.updateStock(
                item.productId,
                toLocation,
                item.quantity + (item.bonusQuantity || 0),
                'purchase',
                invoice.id
            );
        });
    }

    // Get invoices with filtering
    getStockistInvoices(filters = {}) {
        let invoices = this.invoices.stockist;

        if (filters.status) {
            invoices = invoices.filter(inv => inv.status === filters.status);
        }

        if (filters.dateFrom) {
            invoices = invoices.filter(inv => new Date(inv.date) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            invoices = invoices.filter(inv => new Date(inv.date) <= new Date(filters.dateTo));
        }

        if (filters.stockistId) {
            invoices = invoices.filter(inv => inv.fromParty === filters.stockistId);
        }

        return invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getSuperstockistInvoices(filters = {}) {
        let invoices = this.invoices.superstockist;

        if (filters.status) {
            invoices = invoices.filter(inv => inv.status === filters.status);
        }

        if (filters.dateFrom) {
            invoices = invoices.filter(inv => new Date(inv.date) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            invoices = invoices.filter(inv => new Date(inv.date) <= new Date(filters.dateTo));
        }

        if (filters.superstockistId) {
            invoices = invoices.filter(inv => inv.fromParty === filters.superstockistId);
        }

        return invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    updateInvoiceStatus(invoiceId, status, type) {
        const invoices = type === 'stockist' ? this.invoices.stockist : this.invoices.superstockist;
        const invoice = invoices.find(inv => inv.id === invoiceId);

        if (!invoice) {
            return { success: false, errors: ['Invoice not found'] };
        }

        invoice.status = status;
        invoice.updatedAt = new Date().toISOString();

        const success = Storage.saveInvoices(this.invoices);
        if (success) {
            NotificationService.showSuccess(`Invoice status updated to ${status}`);
            return { success: true, invoice };
        } else {
            return { success: false, errors: ['Failed to update invoice'] };
        }
    }

    deleteInvoice(invoiceId, type) {
        const invoices = type === 'stockist' ? this.invoices.stockist : this.invoices.superstockist;
        const index = invoices.findIndex(inv => inv.id === invoiceId);

        if (index === -1) {
            return { success: false, errors: ['Invoice not found'] };
        }

        invoices.splice(index, 1);
        const success = Storage.saveInvoices(this.invoices);
        
        if (success) {
            NotificationService.showSuccess('Invoice deleted successfully');
            return { success: true };
        } else {
            return { success: false, errors: ['Failed to delete invoice'] };
        }
    }

    getInvoiceSummary(period = 'month') {
        const stockistInvoices = this.getStockistInvoices();
        const superstockistInvoices = this.getSuperstockistInvoices();

        const stockistTotal = stockistInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
        const superstockistTotal = superstockistInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

        return {
            stockist: {
                count: stockistInvoices.length,
                total: stockistTotal,
                pending: stockistInvoices.filter(inv => inv.status === 'pending').length,
                paid: stockistInvoices.filter(inv => inv.status === 'paid').length
            },
            superstockist: {
                count: superstockistInvoices.length,
                total: superstockistTotal,
                pending: superstockistInvoices.filter(inv => inv.status === 'pending').length,
                paid: superstockistInvoices.filter(inv => inv.status === 'paid').length
            },
            overall: {
                totalInvoices: stockistInvoices.length + superstockistInvoices.length,
                totalAmount: stockistTotal + superstockistTotal
            }
        };
    }

    renderStockistInvoicesTable(container, filters = {}) {
        const invoices = this.getStockistInvoices(filters);
        this.renderInvoicesTable(invoices, container, 'stockist');
    }

    renderSuperstockistInvoicesTable(container, filters = {}) {
        const invoices = this.getSuperstockistInvoices(filters);
        this.renderInvoicesTable(invoices, container, 'superstockist');
    }

    renderInvoicesTable(invoices, container, type) {
        container.innerHTML = '';

        if (invoices.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="highlight">
                            <i class="fas fa-info-circle"></i>
                            No ${type} invoices found.
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        invoices.forEach(invoice => {
            const fromParty = this.distributorController.getDistributorById(invoice.fromParty);
            const toParty = this.distributorController.getDistributorById(invoice.toParty);

            const statusClass = invoice.status === 'paid' ? 'stock-high' : 
                              invoice.status === 'pending' ? 'stock-medium' : 'stock-low';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.invoiceNumber}</td>
                <td>${Formatters.formatDate(invoice.date)}</td>
                <td>${fromParty ? fromParty.name : 'Unknown'}</td>
                <td>${toParty ? toParty.name : 'Unknown'}</td>
                <td>${Formatters.formatCurrency(invoice.grandTotal)}</td>
                <td class="${statusClass}">${invoice.status.toUpperCase()}</td>
                <td>
                    <button class="btn btn-outline btn-sm view-invoice" data-id="${invoice.id}" data-type="${type}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-sm edit-invoice" data-id="${invoice.id}" data-type="${type}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-invoice" data-id="${invoice.id}" data-type="${type}">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${invoice.status !== 'paid' ? `
                        <button class="btn btn-success btn-sm mark-paid" data-id="${invoice.id}" data-type="${type}">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </td>
            `;
            container.appendChild(row);
        });
    }

    // Print invoice
    printInvoice(invoiceId, type) {
        const invoices = type === 'stockist' ? this.invoices.stockist : this.invoices.superstockist;
        const invoice = invoices.find(inv => inv.id === invoiceId);

        if (!invoice) {
            NotificationService.showError('Invoice not found');
            return;
        }

        const printWindow = window.open('', '_blank');
        const fromParty = this.distributorController.getDistributorById(invoice.fromParty);
        const toParty = this.distributorController.getDistributorById(invoice.toParty);

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .company-info { margin-bottom: 20px; }
                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .table th { background-color: #f5f5f5; }
                    .totals { float: right; width: 300px; }
                    .footer { margin-top: 50px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>TAX INVOICE</h1>
                    <h2>Sanj Healthcare Pvt Ltd</h2>
                    <p>Silchar, Assam</p>
                </div>
                
                <div class="invoice-details">
                    <div>
                        <p><strong>From:</strong><br>
                        ${fromParty ? fromParty.name : ''}<br>
                        ${fromParty ? fromParty.address.street : ''}<br>
                        ${fromParty ? `${fromParty.address.city}, ${fromParty.address.state}` : ''}
                        </p>
                    </div>
                    <div>
                        <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
                        <p><strong>Date:</strong> ${Formatters.formatDate(invoice.date)}</p>
                    </div>
                </div>

                <div>
                    <p><strong>To:</strong><br>
                    ${toParty ? toParty.name : ''}<br>
                    ${toParty ? toParty.address.street : ''}<br>
                    ${toParty ? `${toParty.address.city}, ${toParty.address.state}` : ''}<br>
                    GSTIN: ${toParty ? toParty.gstin : ''}
                    </p>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>HSN</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Discount</th>
                            <th>Taxable Value</th>
                            <th>Tax</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => {
                            const product = this.productController.getProductById(item.productId);
                            return `
                                <tr>
                                    <td>${product ? product.name : ''}</td>
                                    <td>${product ? product.hsnCode : ''}</td>
                                    <td>${item.quantity} ${item.bonusQuantity ? `+ ${item.bonusQuantity} bonus` : ''}</td>
                                    <td>${Formatters.formatCurrency(item.rate)}</td>
                                    <td>${Formatters.formatCurrency(item.discountAmount)}</td>
                                    <td>${Formatters.formatCurrency(item.total - item.discountAmount)}</td>
                                    <td>${Formatters.formatCurrency(item.taxAmount)}</td>
                                    <td>${Formatters.formatCurrency(item.finalAmount)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <table>
                        <tr>
                            <td>Subtotal:</td>
                            <td>${Formatters.formatCurrency(invoice.subtotal)}</td>
                        </tr>
                        <tr>
                            <td>Discount:</td>
                            <td>${Formatters.formatCurrency(invoice.totalDiscount)}</td>
                        </tr>
                        <tr>
                            <td>Tax (GST):</td>
                            <td>${Formatters.formatCurrency(invoice.totalTax)}</td>
                        </tr>
                        <tr>
                            <td><strong>Grand Total:</strong></td>
                            <td><strong>${Formatters.formatCurrency(invoice.grandTotal)}</strong></td>
                        </tr>
                    </table>
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Sanj Healthcare Pvt Ltd<br>
                    Silchar, Assam | GSTIN: 18AABCU9603R1ZM</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }
}