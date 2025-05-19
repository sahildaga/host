document.addEventListener('DOMContentLoaded', () => {
    console.log("account-create.js loaded and DOM fully parsed.");

    // --- Cart Count Functionality ---
    const cartCountSpan = document.querySelector('.cart-link .cart-count');
    let cart = [];

    function loadCart() {
        console.log("loadCart() called.");
        try {
            const storedCart = JSON.parse(localStorage.getItem('cart'));
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
                console.log("Cart loaded:", cart);
            } else {
                cart = [];
                console.log("Cart data is not an array. Resetting cart.");
            }
        } catch (e) {
            console.error("Error parsing cart data:", e);
            cart = [];
        }
        updateCartCountDisplay();
    }

    function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountSpan) {
            cartCountSpan.textContent = totalItems;
            cartCountSpan.style.display = totalItems > 0 ? 'inline-block' : 'none';
        } else {
            console.warn("Cart count span not found.");
        }
    }

    // --- Account Link ---
    const userAccountLink = document.getElementById('user-account-link');
    if (userAccountLink) {
        userAccountLink.addEventListener('click', (event) => {
            window.location.href = userAccountLink.getAttribute('href');
        });
    }

    // --- Create Account Form ---
    const createAccountForm = document.getElementById('createAccountForm');
    if (createAccountForm) {
        createAccountForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            if (!fullName || !email || !password || !confirmPassword) {
                alert('Please fill in all fields.');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            if (password.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/create-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message || 'Account created successfully!');
                    createAccountForm.reset();
                    setTimeout(() => {
                        window.location.href = 'account.html';
                    }, 2000);
                } else {
                    alert(data.error || 'Account creation failed.');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    } else {
        console.warn("Create account form not found.");
    }

    // --- Sticky Header ---
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

    // --- Subscribe Button ---
    const subscribeButton = document.getElementById('subscribeBtn');
    const subscribeEmailInput = document.getElementById('subscribeEmail');

    if (subscribeButton && subscribeEmailInput) {
        subscribeButton.addEventListener('click', () => {
            const email = subscribeEmailInput.value.trim();
            if (email) {
                alert(`Thank you for subscribing with ${email}!`);
                subscribeEmailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // --- Initial Load ---
    loadCart();
});
