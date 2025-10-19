class Validators {
    static required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    static email(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static phone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    static numeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    static min(value, min) {
        return parseFloat(value) >= min;
    }

    static max(value, max) {
        return parseFloat(value) <= max;
    }

    static between(value, min, max) {
        const numValue = parseFloat(value);
        return numValue >= min && numValue <= max;
    }

    static minLength(value, minLength) {
        return value.toString().length >= minLength;
    }

    static maxLength(value, maxLength) {
        return value.toString().length <= maxLength;
    }

    static password(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    static date(date) {
        return !isNaN(Date.parse(date));
    }

    static futureDate(date) {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate >= today;
    }

    static pastDate(date) {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate <= today;
    }

    static gstin(gstin) {
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstinRegex.test(gstin);
    }

    static pan(pan) {
        const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
        return panRegex.test(pan);
    }

    static aadhaar(aadhaar) {
        const aadhaarRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
        return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
    }

    static percentage(value) {
        return this.between(value, 0, 100);
    }

    static validateProduct(product) {
        const errors = [];
        
        if (!this.required(product.name)) errors.push('Product name is required');
        if (!this.required(product.category)) errors.push('Category is required');
        if (!this.numeric(product.costPrice)) errors.push('Cost price must be a number');
        if (!this.numeric(product.mrp)) errors.push('MRP must be a number');
        if (!this.percentage(product.taxRate)) errors.push('Tax rate must be between 0 and 100');
        
        if (parseFloat(product.costPrice) >= parseFloat(product.mrp)) {
            errors.push('Cost price must be less than MRP');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateDistributor(distributor) {
        const errors = [];
        
        if (!this.required(distributor.name)) errors.push('Name is required');
        if (!this.required(distributor.contact)) errors.push('Contact is required');
        if (!this.phone(distributor.contact)) errors.push('Valid phone number is required');
        if (!this.required(distributor.region)) errors.push('Region is required');
        if (!this.numeric(distributor.creditLimit)) errors.push('Credit limit must be a number');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static showValidationErrors(errors, container) {
        container.innerHTML = '';
        
        if (errors.length === 0) return;
        
        const errorList = document.createElement('div');
        errorList.className = 'highlight';
        errorList.style.backgroundColor = '#ffebee';
        errorList.style.borderLeftColor = '#f44336';
        
        errors.forEach(error => {
            const errorItem = document.createElement('div');
            errorItem.textContent = `• ${error}`;
            errorItem.style.color = '#d32f2f';
            errorItem.style.marginBottom = '5px';
            errorList.appendChild(errorItem);
        });
        
        container.appendChild(errorList);
    }
}