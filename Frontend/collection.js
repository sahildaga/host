document.addEventListener('DOMContentLoaded', () => {

    console.log("collection.js loaded and DOM fully parsed.");

    // --- Quick View Button Navigation ---
    const quickViewButtons = document.querySelectorAll('.collection-grid .quick-view-btn');

    quickViewButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            console.log("Quick View button clicked:", event.target);
            event.preventDefault();

            const productId = button.dataset.productId;

            if (productId) {
                console.log("Navigating to product details for ID:", productId);
                const productDetailsUrl = `product-details.html?id=${productId}`;
                window.location.href = productDetailsUrl;
            } else {
                console.error("Quick View button is missing data-product-id attribute.");
                alert("Could not open product details: Product ID is missing.");
            }
        });

        console.log("Attached click listener to Quick View button:", button);
    });
    // --- End Quick View Button Navigation ---

    // --- Cart Count Functionality ---
    const cartCountSpan = document.querySelector('.cart-link .cart-count');
    let cart = [];

    function loadCart() {
        console.log("loadCart() called (from collection.js).");
        const storedCart = localStorage.getItem('cart');

        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                if (Array.isArray(parsedCart)) {
                    cart = parsedCart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity,
                        size: item.size || 'N/A',
                        color: item.color || 'N/A'
                    }));
                    console.log("Cart loaded from localStorage (on collection.js):", cart);
                } else {
                    cart = [];
                    console.warn("localStorage cart data is not an array, resetting (on collection.js).");
                }
            } catch (e) {
                console.error("Error parsing cart data from localStorage (on collection.js):", e);
                cart = [];
            }
        } else {
            cart = [];
            console.log("No cart data found in localStorage (on collection.js).");
        }

        updateCartCountDisplay();
    }

    function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log("updateCartCountDisplay() called (from collection.js). Total items:", totalItems);

        if (cartCountSpan) {
            cartCountSpan.textContent = totalItems;

            if (totalItems > 0) {
                cartCountSpan.style.display = 'inline-block';
                console.log("Cart count > 0, showing count (on collection.js).");
            } else {
                cartCountSpan.style.display = 'none';
                console.log("Cart count is 0, hiding count (on collection.js).");
            }

            console.log("Header cart count updated (on collection.js).");
        } else {
            console.warn("Cart count span element not found on collection page.");
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log("Cart saved to localStorage (from collection.js):", cart);
    }
    // --- End Cart Count Functionality ---

    // --- Sticky Header Functionality ---
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
    handleScroll();
    // --- End Sticky Header Functionality ---

    // --- Subscribe Button Functionality ---
    const subscribeButton = document.getElementById('subscribeBtn');
    const subscribeEmailInput = document.getElementById('subscribeEmail');

    if (subscribeButton && subscribeEmailInput) {
        subscribeButton.addEventListener('click', () => {
            const email = subscribeEmailInput.value;
            if (email) {
                console.log(`Subscription requested for email: ${email} (from collection.js)`);
                alert(`Thank you for subscribing with ${email}! (This is a demo from collection page)`);
                subscribeEmailInput.value = '';
            } else {
                alert('Please enter a valid email address (from collection page).');
            }
        });
    }
    // --- End Subscribe Button Functionality ---

    // --- Initial Load ---
    loadCart(); // Load cart data and update header count on page load
});
