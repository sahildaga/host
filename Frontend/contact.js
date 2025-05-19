document.addEventListener('DOMContentLoaded', () => {

    console.log("contact.js loaded and DOM fully parsed.");

    // --- Cart Count Functionality ---
    // Ensure this selects the span element correctly
    const cartCountSpan = document.querySelector('.cart-link .cart-count');
    let cart = []; // Initialize cart array

    // Function to load cart from localStorage on page load
    function loadCart() {
        console.log("loadCart() called (from contact.js).");
        if (localStorage.getItem('cart')) {
            try {
                 const storedCart = JSON.parse(localStorage.getItem('cart'));
                 // Ensure loaded cart data is an array
                if (Array.isArray(storedCart)) {
                    cart = storedCart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity,
                        size: item.size || 'N/A', // Handle potential missing properties
                        color: item.color || 'N/A' // Handle potential missing properties
                    }));
                    console.log("Cart loaded from localStorage (on contact.js):", cart);
                } else {
                    cart = []; // Reset if stored data is not an array
                     console.log("localStorage cart data is not an array, resetting (on contact.js).");
                }
            } catch (e) {
                console.error("Error parsing cart data from localStorage (on contact.js):", e);
                cart = []; // Reset cart on parsing error
            }
        } else {
            cart = []; // No cart data found
             console.log("No cart data found in localStorage (on contact.js).");
        }
        updateCartCountDisplay(); // Update display based on loaded cart
    }

    // Function to update the displayed cart count
    function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log("updateCartCountDisplay() called (from contact.js). Total items:", totalItems);
        // Add a check to ensure cartCountSpan is not null before using it
        if (cartCountSpan) {
            cartCountSpan.textContent = totalItems; // This line should now be safe
            if (totalItems > 0) {
                cartCountSpan.style.display = 'inline-block';
                 console.log("Cart count > 0, showing count (on contact.js).");
             } else {
                 cartCountSpan.style.display = 'none';
                 console.log("Cart count is 0, hiding count (on contact.js).");
             }
            console.log("Header cart count updated (on contact.js).");
        } else {
             console.warn("Cart count span element not found on contact page."); // This message should help debug if the element is missing
        }
    }


    // --- Contact Form Submission (Example - replace with actual backend logic) ---
    const contactForm = document.getElementById('contactForm');
    const submitButton = contactForm ? contactForm.querySelector('.submit-button') : null;

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            if (submitButton) {
                 submitButton.textContent = 'Sending...'; // Provide feedback to the user
                 submitButton.disabled = true; // Disable button while sending
             }


            // In a real application, you would send the form data to your backend here
            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData.entries());

            console.log('Form data:', formObject); // Log form data

            // *** Replace with actual fetch request to your backend API ***
            const backendEndpoint = 'http://localhost:3000/api/contact'; // Example backend endpoint

            try {
                 const response = await fetch(backendEndpoint, {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json'
                     },
                     body: JSON.stringify(formObject)
                 });

                 const responseData = await response.json(); // Assuming backend sends JSON response

                 if (response.ok) {
                     console.log('Message sent successfully:', responseData);
                     alert('Your message has been sent!'); // User feedback
                     contactForm.reset(); // Clear the form
                 } else {
                     console.error('Failed to send message:', response.status, responseData);
                     alert(responseData.error || 'Failed to send message. Please try again.'); // User feedback
                 }

            } catch (error) {
                 console.error('Error during contact form submission:', error);
                 alert('An error occurred. Please try again later.'); // User feedback
            } finally {
                 // Re-enable button and reset text regardless of success or failure
                 if (submitButton) {
                      submitButton.textContent = 'SEND MESSAGE';
                      submitButton.disabled = false;
                 }
            }
            // --- End Send data to the backend ---
        });
        console.log("Contact form event listener attached.");
    } else {
        console.warn("Contact form element not found.");
    }


    // --- Sticky Header Functionality ---\
    // Ensure these elements exist in your HTML
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

    // --- Subscribe Button Functionality ---\
    // Ensure these elements exist in your HTML
    const subscribeButton = document.getElementById('subscribeBtn');
    const subscribeEmailInput = document.getElementById('subscribeEmail');

    if (subscribeButton && subscribeEmailInput) {
        subscribeButton.addEventListener('click', () => {
            const email = subscribeEmailInput.value.trim();
            if (email) {
                console.log(`Subscription requested for email: ${email} (from contact.js)`);
                alert(`Thank you for subscribing with ${email}! (This is a demo from contact page)`);
                subscribeEmailInput.value = '';
            } else {
                alert('Please enter a valid email address (from contact page).');
            }
        });
        console.log("Subscribe button event listener attached.");
    } else {
        console.warn("Subscribe button or email input not found.");
    }


    // --- Initial Load ---
    loadCart(); // Load cart data and update header count on page load
});