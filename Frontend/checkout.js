document.addEventListener('DOMContentLoaded', () => {

    console.log("checkout.js loaded and DOM fully parsed.");

    // --- DOM Elements ---
    const cartCountSpan = document.querySelector('.cart-link .cart-count');

    // Sections
    const reviewOrderSection = document.getElementById('reviewOrderSection');
    const shippingInfoSection = document.getElementById('shippingInfoSection');
    const paymentMethodSection = document.getElementById('paymentMethodSection');
    const orderSummarySection = document.getElementById('orderSummarySection');
    const orderConfirmationSection = document.getElementById('orderConfirmationSection');

    // Buttons
    const continueToShippingButton = document.getElementById('continueToShipping');
    const backToReviewButton = document.getElementById('backToReview');
    const continueToPaymentButton = document.getElementById('continueToPayment'); // This is the submit button for shipping form
    const backToShippingButton = document.getElementById('backToShipping');
    const continueToSummaryButton = document.getElementById('continueToSummary');
    const backToPaymentButton = document.getElementById('backToPayment');
    const placeOrderButton = document.getElementById('placeOrderButton');

    // Data Display Areas
    const cartItemsSummaryDiv = document.getElementById('cartItemsSummary');
    const subtotalSpan = document.getElementById('subtotal');
    const shippingCostSpan = document.getElementById('shippingCost'); // Assuming fixed for now
    const totalAmountSpan = document.getElementById('totalAmount');
    const finalOrderSummaryDiv = document.getElementById('finalOrderSummary');
    const finalSubtotalSpan = document.getElementById('finalSubtotal');
    const finalShippingCostSpan = document.getElementById('finalShippingCost');
    const finalTotalAmountSpan = document.getElementById('finalTotalAmount');
    const orderNumberDisplay = document.getElementById('orderNumberDisplay');


    // Forms and Inputs
    const shippingForm = document.getElementById('shippingForm');
    const shippingFullNameInput = document.getElementById('shippingFullName');
    const shippingAddress1Input = document.getElementById('shippingAddress1');
    const shippingAddress2Input = document.getElementById('shippingAddress2');
    const shippingCityInput = document.getElementById('shippingCity');
    const shippingStateInput = document.getElementById('shippingState');
    const shippingPostalCodeInput = document.getElementById('shippingPostalCode');
    const shippingCountrySelect = document.getElementById('shippingCountry');
    const shippingPhoneInput = document.getElementById('shippingPhone');


    // --- State Variables ---
    let currentStep = 1; // 1: Review, 2: Shipping, 3: Payment, 4: Summary, 5: Confirmation
    let cart = []; // Array to hold cart items
    const SHIPPING_COST = 5.00; // Fixed shipping cost for now
    let shippingDetails = {}; // To store shipping information


    // --- Step Navigation Functions ---
    function showStep(step) {
        // Hide all sections first
        reviewOrderSection.style.display = 'none';
        shippingInfoSection.style.display = 'none';
        paymentMethodSection.style.display = 'none';
        orderSummarySection.style.display = 'none';
        orderConfirmationSection.style.display = 'none';

        // Show the requested step
        switch (step) {
            case 1:
                reviewOrderSection.style.display = 'block';
                break;
            case 2:
                shippingInfoSection.style.display = 'block';
                break;
            case 3:
                paymentMethodSection.style.display = 'block';
                break;
            case 4:
                orderSummarySection.style.display = 'block';
                break;
            case 5:
                orderConfirmationSection.style.display = 'block';
                break;
            default:
                console.error("Invalid checkout step:", step);
                // Optionally redirect to an error page or the cart
                // window.location.href = 'cart.html';
                break;
        }
        currentStep = step;
        console.log("Navigated to step:", currentStep);
    }

    // --- Cart Management (from localStorage) ---
    function loadCart() {
        console.log("loadCart() called (from checkout.js).");
        if (localStorage.getItem('cart')) {
            try {
                 const storedCart = JSON.parse(localStorage.getItem('cart'));
                 // Ensure storedCart is an array
                if (Array.isArray(storedCart)) {
                    cart = storedCart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity,
                        size: item.size || 'N/A',
                        color: item.color || 'N/A'
                    }));
                    console.log("Cart loaded from localStorage (on checkout.js):", cart);
                } else {
                    cart = [];
                     console.log("localStorage cart data is not an array, resetting (on checkout.js).");
                }
            } catch (e) {
                console.error("Error parsing cart data from localStorage (on checkout.js):", e);
                cart = [];
            }
        } else {
            cart = [];
             console.log("No cart data found in localStorage (on checkout.js).");
        }

        // If cart is empty, redirect to cart page
        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before checking out.");
            window.location.href = 'cart.html'; // Redirect to cart page
            return false; // Indicate empty cart
        }

        updateCartCountDisplay(); // Update header cart count
        return true; // Indicate cart is not empty
    }

    // Function to update the displayed cart count (Same as before)
    function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log("updateCartCountDisplay() called (from checkout.js). Total items:", totalItems);
        if (cartCountSpan) { // Check if the element exists
            cartCountSpan.textContent = totalItems;
            if (totalItems > 0) {
                cartCountSpan.style.display = 'inline-block';
                 console.log("Cart count > 0, showing count (on checkout.js).");
             } else {
                 cartCountSpan.style.display = 'none';
                 console.log("Cart count is 0, hiding count (on checkout.js).");
             }
            console.log("Header cart count updated (on checkout.js).");
        } else {
             console.warn("Cart count span element not found on checkout page.");
        }
    }

    // Function to clear the cart from localStorage after successful order
    function clearCart() {
        localStorage.removeItem('cart');
        cart = []; // Clear the local cart array
        updateCartCountDisplay(); // Update header count to 0
        console.log("Cart cleared from localStorage.");
    }


    // --- Render Review Order Section ---
    function renderReviewOrder() {
        if (!cartItemsSummaryDiv) return;

        if (cart.length === 0) {
            cartItemsSummaryDiv.innerHTML = '<p>Your cart is empty.</p>';
            if (subtotalSpan) subtotalSpan.textContent = '₹0.00'; // Added Rupees symbol
            if (totalAmountSpan) totalAmountSpan.textContent = '₹0.00'; // Added Rupees symbol
            // Disable continue button or redirect
            if (continueToShippingButton) continueToShippingButton.disabled = true;
            return;
        }

        let itemsHtml = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            itemsHtml += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Size: ${item.size}</p>
                        <p>Color: ${item.color}</p>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <span class="item-price">₹${itemTotal.toFixed(2)}</span> </div>
            `;
        });

        cartItemsSummaryDiv.innerHTML = itemsHtml;

        // Calculate total
        const total = subtotal + SHIPPING_COST;

        // Update summary spans
        if (subtotalSpan) subtotalSpan.textContent = `₹${subtotal.toFixed(2)}`; // Added Rupees symbol
        if (shippingCostSpan) shippingCostSpan.textContent = `Fixed ₹${SHIPPING_COST.toFixed(2)}`; // Added Rupees symbol
        if (totalAmountSpan) totalAmountSpan.textContent = `₹${total.toFixed(2)}`; // Added Rupees symbol

        console.log("Review order section rendered. Subtotal:", subtotal, "Total:", total);
    }

    // --- Populate Country Code Dropdown (Copied from account.js) ---
    const countryCodes = [
        { name: 'United States', code: '+1' },
        { name: 'Canada', code: '+1' },
        { name: 'United Kingdom', code: '+44' },
        { name: 'India', code: '+91' },
        { name: 'Australia', code: '+61' },
        { name: 'Germany', code: '+49' },
        { name: 'France', code: '+33' },
        { name: 'Japan', code: '+81' },
        { name: 'China', code: '+86' },
        { name: 'Brazil', code: '+55' },
        { name: 'Mexico', code: '+52' },
        { name: 'Russia', code: '+7' },
         { name: 'South Africa', code: '+27' },
         { name: 'Nigeria', code: '+234' },
        // Add more countries and codes here
    ];

    function populateCountryCodes() {
        if (shippingCountrySelect) {
            // Add a default or empty option
            const defaultOption = document.createElement('option');
             defaultOption.value = '';
             defaultOption.textContent = 'Select Country';
             defaultOption.disabled = true;
             defaultOption.selected = true;
             shippingCountrySelect.appendChild(defaultOption);


            countryCodes.forEach(country => {
                const option = document.createElement('option');
                option.value = country.name; // Store country name
                option.textContent = country.name;
                shippingCountrySelect.appendChild(option);
            });
             console.log("Country codes dropdown populated.");
        } else {
             console.warn("Shipping country select element not found.");
        }
    }


    // --- Render Final Order Summary Section ---
    function renderFinalOrderSummary() {
        if (!finalOrderSummaryDiv) return;

        if (cart.length === 0) {
            finalOrderSummaryDiv.innerHTML = '<p>Your cart is empty.</p>';
             if (finalSubtotalSpan) finalSubtotalSpan.textContent = '₹0.00'; // Added Rupees symbol
             if (finalTotalAmountSpan) finalTotalAmountSpan.textContent = '₹0.00'; // Added Rupees symbol
            // Disable place order button
            if (placeOrderButton) placeOrderButton.disabled = true;
            return;
        }

        let itemsHtml = '<h3>Items:</h3>';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            itemsHtml += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Size: ${item.size}</p>
                        <p>Color: ${item.color}</p>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <span class="item-price">₹${itemTotal.toFixed(2)}</span> </div>
            `;
        });

        // Add Shipping Details to the summary
        itemsHtml += `
            <h3>Shipping To:</h3>
            <p>${shippingDetails.fullName}</p>
            <p>${shippingDetails.address1}</p>
            ${shippingDetails.address2 ? `<p>${shippingDetails.address2}</p>` : ''}
            <p>${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.postalCode}</p>
            <p>${shippingDetails.country}</p>
            <p>Phone: ${shippingDetails.phone}</p>
        `;

        finalOrderSummaryDiv.innerHTML = itemsHtml;

        // Calculate total
        const total = subtotal + SHIPPING_COST;

        // Update final summary spans
        if (finalSubtotalSpan) finalSubtotalSpan.textContent = `₹${subtotal.toFixed(2)}`; // Added Rupees symbol
        if (finalShippingCostSpan) finalShippingCostSpan.textContent = `Fixed ₹${SHIPPING_COST.toFixed(2)}`; // Added Rupees symbol
        if (finalTotalAmountSpan) finalTotalAmountSpan.textContent = `₹${total.toFixed(2)}`; // Added Rupees symbol

         console.log("Final order summary rendered with shipping details.");
    }


    // --- Event Listeners ---

    // Continue to Shipping button
    if (continueToShippingButton) {
        continueToShippingButton.addEventListener('click', () => {
            if (cart.length === 0) {
                 alert("Your cart is empty.");
                 window.location.href = 'cart.html';
                 return;
            }
            showStep(2); // Go to Shipping Information
        });
    }

    // Back to Review button
    if (backToReviewButton) {
        backToReviewButton.addEventListener('click', () => {
            showStep(1); // Go back to Review Order
        });
    }

    // Shipping Form Submission (Continue to Payment)
    if (shippingForm) {
        shippingForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // Basic form validation (browser's 'required' attribute helps, but JS adds a layer)
            if (!shippingFullNameInput.value.trim() ||
                !shippingAddress1Input.value.trim() ||
                !shippingCityInput.value.trim() ||
                !shippingStateInput.value.trim() ||
                !shippingPostalCodeInput.value.trim() ||
                !shippingCountrySelect.value ||
                !shippingPhoneInput.value.trim()) {
                 alert("Please fill in all required shipping information.");
                 return;
            }

            // Store shipping details
            shippingDetails = {
                fullName: shippingFullNameInput.value.trim(),
                address1: shippingAddress1Input.value.trim(),
                address2: shippingAddress2Input.value.trim(),
                city: shippingCityInput.value.trim(),
                state: shippingStateInput.value.trim(),
                postalCode: shippingPostalCodeInput.value.trim(),
                country: shippingCountrySelect.value,
                phone: shippingPhoneInput.value.trim()
            };
            console.log("Shipping details captured:", shippingDetails);

            showStep(3); // Go to Payment Method
        });
    }


    // Back to Shipping button
    if (backToShippingButton) {
        backToShippingButton.addEventListener('click', () => {
            showStep(2); // Go back to Shipping Information
        });
    }

    // Continue to Order Summary button
    if (continueToSummaryButton) {
        continueToSummaryButton.addEventListener('click', () => {
            renderFinalOrderSummary(); // Render the summary with collected details
            showStep(4); // Go to Order Summary
        });
    }

    // Back to Payment button
    if (backToPaymentButton) {
        backToPaymentButton.addEventListener('click', () => {
            showStep(3); // Go back to Payment Method
        });
    }

    // Place Order Button (Simulated)
    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', async () => {
            console.log("Place Order button clicked.");

            // In a real application, you would send order data to your backend here
            // Data to send: cart items, shippingDetails, userId (if logged in), payment method (placeholder)

            const orderData = {
                userId: localStorage.getItem('loggedInUserId') || null, // Get user ID if available
                items: cart,
                shippingAddress: shippingDetails,
                paymentMethod: "Simulated Payment", // Placeholder
                subtotal: parseFloat(subtotalSpan.textContent.replace('₹', '')), // Get calculated subtotal, remove Rupees symbol
                shippingCost: SHIPPING_COST,
                totalAmount: parseFloat(totalAmountSpan.textContent.replace('₹', '')) // Get calculated total, remove Rupees symbol
            };

            console.log("Simulating sending order data to backend:", orderData);

            // --- Simulate Backend Call ---
            // Replace with actual fetch() call to your backend's /api/checkout endpoint
            // Example:
            // try {
            //     const response = await fetch('YOUR_BACKEND_URL/api/checkout', {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify(orderData)
            //     });
            //     const result = await response.json();
            //     if (response.ok) {
            //         console.log('Order placed successfully:', result);
            //         // Assuming backend returns an order number
            //         const orderNumber = result.orderNumber || 'N/A';
            //         if (orderNumberDisplay) orderNumberDisplay.textContent = orderNumber;
            //         clearCart(); // Clear cart on success
            //         showStep(5); // Go to Order Confirmation
            //     } else {
            //         console.error('Order placement failed:', response.status, result);
            //         alert(result.error || 'Failed to place order. Please try again.');
            //     }
            // } catch (error) {
            //     console.error('Error placing order:', error);
            //     alert('An error occurred while placing your order. Please try again.');
            // }
            // --- End Simulate Backend Call ---


            // --- Placeholder Success Simulation ---
            // If you don't have a backend endpoint yet, uncomment this block
            // Simulate a delay
             placeOrderButton.disabled = true; // Disable button
             placeOrderButton.textContent = 'Placing Order...';

            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

            console.log("Order placement simulation successful.");
            const simulatedOrderNumber = 'TRND' + Date.now(); // Simple simulated order number
            if (orderNumberDisplay) orderNumberDisplay.textContent = simulatedOrderNumber;

            clearCart(); // Clear cart after simulated success
            placeOrderButton.disabled = false; // Re-enable button
            placeOrderButton.textContent = 'Place Order'; // Reset button text
            showStep(5); // Go to Order Confirmation
            // --- End Placeholder Success Simulation ---

        });
    }


    // --- Sticky Header Functionality (Copied from other JS files) ---
    const header = document.querySelector('.sticky-header');
    const headerOffset = header ? header.offsetTop : 0;

    function handleScroll() {
        if (header) {
            if (window.pageYOffset > headerOffset) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check


    // --- Subscribe Button Functionality (Copied from other JS files) ---
    const subscribeButton = document.getElementById('subscribeBtn');
    const subscribeEmailInput = document.getElementById('subscribeEmail');

    if (subscribeButton && subscribeEmailInput) {
        subscribeButton.addEventListener('click', () => {
            const email = subscribeEmailInput.value.trim();
            if (email) {
                console.log(`Subscription requested for email: ${email} (from checkout.js)`);
                alert(`Thank you for subscribing with ${email}! (This is a demo from checkout page)`);
                subscribeEmailInput.value = '';
            } else {
                alert('Please enter a valid email address (from checkout page).');
            }
        });
    }


    // --- Initialization ---
    // Load cart and check if it's empty before proceeding
    if (loadCart()) {
        renderReviewOrder(); // Render the initial order review
        populateCountryCodes(); // Populate the country dropdown
        showStep(1); // Start at the first step (Review Order)
    } else {
        // loadCart already redirected if empty
    }

});
