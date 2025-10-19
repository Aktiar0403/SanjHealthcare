class ProductController {
    constructor() {
        this.products = Storage.getProducts();
        this.categories = Storage.get('categories', []);
        this.init();
    }

    init() {
        this.loadDefaultCategories();
    }

    loadDefaultCategories() {
        if (this.categories.length === 0) {
            this.categories = [
                { id: 'CAT001', name: 'Syrup', description: 'Liquid medications' },
                { id: 'CAT002', name: 'Tablet', description: 'Solid oral dosage form' },
                { id: 'CAT003', name: 'Capsule', description: 'Gelatin capsules' },
                { id: 'CAT004', name: 'Injection', description: 'Injectable medications' },
                { id: 'CAT005', name: 'Ointment', description: 'Topical applications' }
            ];
            Storage.set('categories', this.categories);
        }
    }

    getAllProducts() {
        return this.products.filter(product => product.isActive);
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    getProductsByCategory(category) {
        return this.products.filter(product => 
            product.category === category && product.isActive
        );
    }

    addProduct(productData) {
        const validation = Validators.validateProduct(productData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const product = new Product(productData);
        this.products.push(product);
        
        const success = Storage.saveProducts(this.products);
        if (success) {
            NotificationService.showSuccess('Product added successfully');
            return { success: true, product };
        } else {
            return { success: false, errors: ['Failed to save product'] };
        }
    }

    updateProduct(id, productData) {
        const index = this.products.findIndex(product => product.id === id);
        if (index === -1) {
            return { success: false, errors: ['Product not found'] };
        }

        const validation = Validators.validateProduct(productData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        productData.updatedAt = new Date().toISOString();
        this.products[index] = { ...this.products[index], ...productData };
        
        const success = Storage.saveProducts(this.products);
        if (success) {
            NotificationService.showSuccess('Product updated successfully');
            return { success: true, product: this.products[index] };
        } else {
            return { success: false, errors: ['Failed to update product'] };
        }
    }

    deleteProduct(id) {
        const index = this.products.findIndex(product => product.id === id);
        if (index === -1) {
            return { success: false, errors: ['Product not found'] };
        }

        // Soft delete
        this.products[index].isActive = false;
        this.products[index].updatedAt = new Date().toISOString();
        
        const success = Storage.saveProducts(this.products);
        if (success) {
            NotificationService.showSuccess('Product deleted successfully');
            return { success: true };
        } else {
            return { success: false, errors: ['Failed to delete product'] };
        }
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.isActive && (
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.hsnCode.toLowerCase().includes(searchTerm)
            )
        );
    }

    getLowStockProducts() {
        return this.products.filter(product => 
            product.isActive && product.stockQuantity <= product.minStockLevel
        );
    }

    updateStock(productId, quantity, type = 'add') {
        const product = this.getProductById(productId);
        if (!product) {
            return { success: false, errors: ['Product not found'] };
        }

        if (type === 'add') {
            product.stockQuantity += quantity;
        } else if (type === 'remove') {
            if (product.stockQuantity < quantity) {
                return { success: false, errors: ['Insufficient stock'] };
            }
            product.stockQuantity -= quantity;
        } else if (type === 'set') {
            product.stockQuantity = quantity;
        }

        product.updatedAt = new Date().toISOString();
        
        const success = Storage.saveProducts(this.products);
        if (success) {
            NotificationService.showSuccess('Stock updated successfully');
            return { success: true, product };
        } else {
            return { success: false, errors: ['Failed to update stock'] };
        }
    }

    getProductPerformance(productId, period = 'month') {
        // This would typically fetch from sales data
        // For now, return mock data
        return {
            totalSales: 1250,
            revenue: 150000,
            growth: 12.5,
            stockTurnover: 2.5
        };
    }

    renderProductsGrid(container) {
        const products = this.getAllProducts();
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `
                <div class="highlight">
                    <i class="fas fa-info-circle"></i>
                    No products found. <a href="#" id="add-first-product">Add your first product</a>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const stockStatus = product.stockQuantity <= product.minStockLevel ? 'low' :
                              product.stockQuantity <= product.minStockLevel * 2 ? 'medium' : 'high';
            
            const stockStatusClass = `stock-${stockStatus}`;
            const stockPercentage = (product.stockQuantity / product.maxStockLevel) * 100;

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-name">${product.name}</div>
                <div class="product-details">
                    <span>Cost: ${Formatters.formatCurrency(product.costPrice)}</span>
                    <span>MRP: ${Formatters.formatCurrency(product.mrp)}</span>
                </div>
                <div class="product-details">
                    <span>GST: ${product.taxRate}%</span>
                    <span>${product.category}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${stockPercentage}%"></div>
                </div>
                <div class="product-details">
                    <span>Stock: ${product.stockQuantity}/${product.maxStockLevel}</span>
                    <span class="${stockStatusClass}">${stockStatus.toUpperCase()}</span>
                </div>
                <div class="product-details" style="margin-top: 10px;">
                    <button class="btn btn-outline btn-sm edit-product" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="btn btn-primary btn-sm update-stock" data-id="${product.id}">
                        <i class="fas fa-box"></i> Stock
                    </button>
                </div>
            `;
            container.appendChild(productCard);
        });
    }

    // Category management methods
    addCategory(categoryData) {
        const category = {
            id: Formatters.generateId('CAT'),
            ...categoryData,
            createdAt: new Date().toISOString()
        };
        
        this.categories.push(category);
        Storage.set('categories', this.categories);
        return category;
    }

    getCategories() {
        return this.categories;
    }
}