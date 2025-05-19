document.addEventListener('DOMContentLoaded', () => {

    console.log("account.js loaded and DOM fully parsed.");

    // --- DOM Elements ---
    const cartCountSpan = document.querySelector('.cart-link .cart-count');
    const loginSection = document.getElementById('loginSection');
    const userInfoSection = document.getElementById('userInfoSection');
    const loginForm = document.getElementById('loginForm');
    // Removed: const updatePhoneForm = document.getElementById('updatePhoneForm');
    const logoutButton = document.getElementById('logoutButton');
    const displayFullNameSpan = document.getElementById('displayFullName');
    const displayEmailSpan = document.getElementById('displayEmail');
    // Removed: const phoneNumberInput = document.getElementById('phoneNumber');
    const userAccountLink = document.getElementById('user-account-link'); // Keep for potential future use or styling
    // Removed: const displayPhoneNumberParagraph = document.getElementById('displayPhoneNumber'); // Element for phone number display

    let cart = []; // Initialize cart array

    // --- Session Management (Basic using localStorage) ---
    // In a real app, use cookies or more secure token handling
    function setLoggedInUser(userId) {
        localStorage.setItem('loggedInUserId', userId);
        console.log("User ID stored in localStorage:", userId);
    }

    function getLoggedInUserId() {
        return localStorage.getItem('loggedInUserId');
    }

    function removeLoggedInUser() {
        localStorage.removeItem('loggedInUserId');
        console.log("User ID removed from localStorage (logged out).");
    }

    function isLoggedIn() {
        return getLoggedInUserId() !== null;
    }

    // --- UI Toggling ---
    function showLoginSection() {
        if (loginSection) loginSection.style.display = 'flex'; // Use flex for the layout
        if (userInfoSection) userInfoSection.style.display = 'none';
         console.log("Showing login section.");
    }

    function showUserInfoSection() {
        if (loginSection) loginSection.style.display = 'none';
        if (userInfoSection) userInfoSection.style.display = 'flex'; // Use flex for the layout
         console.log("Showing user info section.");
    }

    // --- Fetch User Information ---
    async function fetchUserInfo() {
        const userId = getLoggedInUserId();
        if (!userId) {
            console.log("No logged in user ID found, cannot fetch user info.");
            showLoginSection(); // Redirect to login if no user ID
            return;
        }

        // This endpoint should return user details including full_name and email
        // *** Your Backend Endpoint needs to provide 'fullName' and 'email' ***
        const backendEndpoint = `http://localhost:3000/api/user-info`;

        try {
            const response = await fetch(backendEndpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Make sure your backend expects the user ID or token like this
                    'Authorization': `Bearer ${userId}`
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('User info fetched successfully:', responseData);
                // Populate the user info fields
                // Ensure your backend provides 'fullName' and 'email'
                if (displayFullNameSpan) displayFullNameSpan.textContent = responseData.fullName || 'N/A';
                if (displayEmailSpan) displayEmailSpan.textContent = responseData.email || 'N/A';

                // Phone number logic was removed as per your previous request

                showUserInfoSection(); // Show the user info section

            } else {
                console.error('Failed to fetch user info:', response.status, responseData);
                // If fetching user info fails (e.g., invalid user ID), log out and show login
                removeLoggedInUser();
                showLoginSection();
                alert(responseData.error || 'Could not fetch user information. Please log in again.');
            }

        } catch (error) {
            console.error('Error during fetch user info:', error);
            // Handle network errors
            removeLoggedInUser();
            showLoginSection();
            alert('An error occurred while fetching user information. Please try again.');
        }
    }

    // Removed: --- Handle Phone Number Update --- logic

    // --- Handle Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Logout button clicked.");
            removeLoggedInUser(); // Remove user ID from storage
            alert("You have been logged out.");
            showLoginSection(); // Show the login form
            // Optional: Redirect to home page or login page explicitly
            // window.location.href = 'index.html';
        });
         console.log("Logout button event listener attached.");
    } else {
        console.warn("Logout button element not found.");
    }


    // --- Handle Login Form Submission (Sends data to backend) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => { // Use async function for fetch
            event.preventDefault(); // Prevent default form submission

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // --- Client-side Validation (Basic) ---
            if (email === '' || password === '') {
                alert('Please enter both email and password.');
                return; // Stop the function if validation fails
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('Please enter a valid email address.');
                return; // Stop if email format is invalid
            }

            // --- Send data to backend API for Login ---
            // Make sure this URL matches your backend server's address and port
            const backendEndpoint = 'http://localhost:3000/api/login'; // *** Your Backend Endpoint ***

            try {
                const response = await fetch(backendEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                        // Add any other headers your backend expects (e.g., API key)
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const responseData = await response.json(); // Parse the JSON response

                if (response.ok) {
                    // Login successful (backend returned 2xx status)
                    console.log('Login successful:', responseData);
                    alert(responseData.message || 'Login successful!');

                    // Store the logged-in user's ID (or a token)
                    // Ensure your backend provides user.id in the login response
                    if (responseData.user && responseData.user.id) {
                        setLoggedInUser(responseData.user.id);
                        // Fetch and display user info after successful login
                         fetchUserInfo(); // This will fetch full_name and show user info section
                    } else {
                         console.error("Login response did not contain user ID.");
                         alert("Login successful, but could not get user details.");
                         showLoginSection(); // Stay on login page if user ID is missing
                    }

                    // Clear the form fields
                    emailInput.value = '';
                    passwordInput.value = '';

                    // In a real application, you might redirect to a dashboard or homepage here
                    // window.location.href = 'index.html'; // Optional redirect

                } else {
                    // Handle errors from the backend (backend returned non-2xx status, e.g., 401)
                    console.error('Login failed:', response.status, responseData);
                    alert(responseData.error || 'Login failed. Invalid credentials.');
                    showLoginSection(); // Stay on login page
                }

            } catch (error) {
                // Handle network errors or errors during the fetch process
                console.error('Error during login fetch:', error);
                alert('An error occurred during login. Please check your connection and try again.');
                 showLoginSection(); // Stay on login page
            }
        });
        console.log("Login form event listener attached (with backend API call).");
    } else {
        console.warn("Login form element not found.");
    }


    // --- Cart Count Functionality (Copied from other JS files) ---
    // Function to load cart from localStorage on page load
    function loadCart() {
        console.log("loadCart() called (from account.js).");
        if (localStorage.getItem('cart')) {
            try {
                 const storedCart = JSON.parse(localStorage.getItem('cart'));
                 // Handle size and color properties for compatibility
                if (Array.isArray(storedCart)) {
                    cart = storedCart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image, // Image will now be the specific color image from product-details
                        quantity: item.quantity,
                        size: item.size || 'N/A',
                        color: item.color || 'N/A'
                    }));
                    console.log("Cart loaded from localStorage (on account.js):", cart);
                } else {
                    cart = [];
                     console.log("localStorage cart data is not an array, resetting (on account.js).");
                }
            } catch (e) {
                console.error("Error parsing cart data from localStorage (on account.js):", e);
                cart = [];
            }
        } else {
            cart = [];
             console.log("No cart data found in localStorage (on account.js).");
        }
        updateCartCountDisplay(); // Update display based on loaded cart
    }

    // Function to update the displayed cart count
    function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log("updateCartCountDisplay() called (from account.js). Total items:", totalItems);
        if (cartCountSpan) { // Check if the element exists
            cartCountSpan.textContent = totalItems;
            if (totalItems > 0) {
                cartCountSpan.style.display = 'inline-block';
                 console.log("Cart count > 0, showing count (on account.js).");
             } else {
                 cartCountSpan.style.display = 'none';
                 console.log("Cart count is 0, hiding count (on account.js).");
             }
            console.log("Header cart count updated (on account.js).");
        } else {
             console.warn("Cart count span element not found on account page.");
        }
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
            const email = subscribeEmailInput.value;
            if (email) {
                console.log(`Subscription requested for email: ${email} (from account.js)`);
                alert(`Thank you for subscribing with ${email}! (This is a demo from account page)`);
                subscribeEmailInput.value = '';
            } else {
                alert('Please enter a valid email address (from account page).');
            }
        });
         console.log("Subscribe button event listener attached.");
    } else {
        console.warn("Subscribe button or email input not found.");
    }


    // --- Initial Load ---
    loadCart(); // Load cart data and update header count on page load

    // Check login status and fetch user info on page load
    if (isLoggedIn()) {
        console.log("User is logged in on account page load. Fetching user info...");
        fetchUserInfo(); // This will fetch full_name and show user info section
    } else {
        console.log("User is not logged in on account page load. Showing login section.");
        showLoginSection(); // Show the login form
    }

});