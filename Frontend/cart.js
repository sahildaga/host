document.addEventListener('DOMContentLoaded', () => {

    console.log("cart.js loaded and DOM fully parsed."); // Debug Log C1

    // --- Cart Display and Functionality ---
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSummary = document.getElementById('cartSummary');
    // Ensure this selector matches the cart count span in your header on cart.html
    const cartCountSpan = document.querySelector('.cart-link .cart-count');

    let cart = []; // Initialize cart array

    // Function to load cart from localStorage
    function loadCart() {
        console.log("loadCart() called (from cart.js)."); // Debug Log C2
        if (localStorage.getItem('cart')) {
            try {
                 // Safely parse the JSON string
                const storedCart = JSON.parse(localStorage.getItem('cart'));
                // Ensure cart is an array and each item has the expected structure (including size/color property)
                 // *** HANDLING COLOR IN LOAD (Removed Type) ***
                if (Array.isArray(storedCart)) {
                    cart = storedCart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity,
                        size: item.size || 'N/A', // Handle size property
                        color: item.color || 'N/A' // *** Handle color property, default to 'N/A' if missing ***
                         // Removed: type: item.type || 'N/A'
                    }));
                    console.log("Cart loaded from localStorage (on cart.js):", cart); // Debug Log C3a
                } else {
                    cart = []; // Reset if not an array
                     console.log("localStorage cart data is not an array, resetting (on cart.js)."); // Debug Log C3b
                }
            } catch (e) {
                console.error("Error parsing cart data from localStorage (on cart.js):", e); // Debug Log C3c
                cart = []; // Reset cart if corrupted
            }
        } else {
            cart = []; // Initialize empty if no data in localStorage
             console.log("No cart data found in localStorage (on cart.js)."); // Debug Log C3d
        }
        renderCartItems(); // Display items
        updateCartSummary(); // Update summary
        updateCartCountDisplay(); // Update header count (on cart page header)
    }

    // Function to save cart to localStorage (primarily used after modifying items on cart page)
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
         console.log("Cart saved to localStorage (from cart.js):", cart); // Debug Log: Cart saved from cart.js
        updateCartCountDisplay(); // Update header count after saving
    }

    // Function to render cart items in the HTML
    function renderCartItems() {
        console.log("renderCartItems() called. Current cart state:", cart); // Debug Log C4
        cartItemsContainer.innerHTML = ''; // Clear current items

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
             console.log("Cart is empty, displaying empty message."); // Debug Log C5a
            cartSummary.innerHTML = ''; // Clear summary if empty
            return;
        }

        console.log("Cart has items, rendering items..."); // Debug Log C5b
        cart.forEach(item => {
             console.log("Rendering item:", item); // Debug Log C6 for each item
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            // Include product ID, size, and color in data attributes for accurate modification/removal
            itemElement.setAttribute('data-product-id', item.id);
            itemElement.setAttribute('data-product-size', item.size);
            itemElement.setAttribute('data-product-color', item.color); // *** Use color data attribute ***


            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.size}</p>
                    <p>Color: ${item.color}</p>
                </div>
                <div class="cart-item-quantity-controls">
                    <button class="decrease-item-btn" data-product-id="${item.id}" data-product-size="${item.size}" data-product-color="${item.color}">-</button>
                    <input type="number" class="item-quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}" data-product-size="${item.size}" data-product-color="${item.color}">
                    <button class="increase-item-btn" data-product-id="${item.id}" data-product-size="${item.size}" data-product-color="${item.color}">+</button>
                </div>

                <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item-btn" data-product-id="${item.id}" data-product-size="${item.size}" data-product-color="${item.color}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

            cartItemsContainer.appendChild(itemElement);
        });

         // Add event listeners to buttons using delegation on the container
         // This single listener handles remove, increase, and decrease
         cartItemsContainer.addEventListener('click', handleCartAction);

         // Add event listener for input change on the quantity input field
         cartItemsContainer.addEventListener('change', handleQuantityInputChange);

          console.log("Rendered all items and added delegation listeners."); // Debug Log C7
    }

     // Function to handle remove, increase, decrease or other cart actions (delegated listener)
     function handleCartAction(event) {
         console.log("handleCartAction called.", event.target);
         const removeButton = event.target.closest('.remove-item-btn');
         const increaseButton = event.target.closest('.increase-item-btn');
         const decreaseButton = event.target.closest('.decrease-item-btn');


         if (removeButton) {
             console.log("Remove button clicked.");
             // Get product ID, size, and color for removal
             const productIdToRemove = removeButton.dataset.productId;
             const productSizeToRemove = removeButton.dataset.productSize;
             const productColorToRemove = removeButton.dataset.productColor; // *** Get color data attribute ***
             console.log("Removing Product ID:", productIdToRemove, "Size:", productSizeToRemove, "Color:", productColorToRemove); // Log size and color
             // Call removeItemFromCart with ID, size, and color
             removeItemFromCart(productIdToRemove, productSizeToRemove, productColorToRemove); // *** Pass color ***
         } else if (increaseButton) {
              console.log("Increase button clicked.");
              // Get product ID, size, and color for increasing
              const productIdToIncrease = increaseButton.dataset.productId;
              const productSizeToIncrease = increaseButton.dataset.productSize;
              const productColorToIncrease = increaseButton.dataset.productColor; // *** Get color data attribute ***
              console.log("Increasing Product ID:", productIdToIncrease, "Size:", productSizeToIncrease, "Color:", productColorToIncrease); // Log size and color
              increaseItemQuantity(productIdToIncrease, productSizeToIncrease, productColorToIncrease); // *** Pass color ***
         }
         else if (decreaseButton) {
              console.log("Decrease button clicked.");
              // Get product ID, size, and color for decreasing
              const productIdToDecrease = decreaseButton.dataset.productId;
              const productSizeToDecrease = decreaseButton.dataset.productSize;
              const productColorToDecrease = decreaseButton.dataset.productColor; // *** Get color data attribute ***
              console.log("Decreasing Product ID:", productIdToDecrease, "Size:", productSizeToDecrease, "Color:", productColorToDecrease); // Log size and color
              decreaseItemQuantity(productIdToDecrease, productSizeToDecrease, productColorToDecrease); // *** Pass color ***
         }
     }

     // Function to handle direct input change on quantity field
     function handleQuantityInputChange(event) {
         const quantityInput = event.target.closest('.item-quantity-input');
         if (quantityInput) {
             console.log("Quantity input changed.");
             const productId = quantityInput.dataset.productId;
             const productSize = quantityInput.dataset.productSize;
             const productColor = quantityInput.dataset.productColor; // *** Get color data attribute ***
             let newQuantity = parseInt(quantityInput.value);

             console.log("Product ID:", productId, "Size:", productSize, "Color:", productColor, "New Quantity:", newQuantity); // Log size and color

             // Ensure new quantity is a valid number and at least 1
             if (isNaN(newQuantity) || newQuantity < 1) {
                 newQuantity = 1; // Default to 1 if invalid
                 quantityInput.value = 1; // Update the input field visually
             }

             updateItemQuantity(productId, productSize, productColor, newQuantity); // *** Pass color ***
         }
     }


    // Function to remove an item from the cart (now considers size and color)
    function removeItemFromCart(productId, size, color) { // *** Accept color parameter ***
        console.log(`removeItemFromCart() called for product ID: ${productId}, Size: ${size}, Color: ${color}`); // Log size and color
        // Filter the cart to exclude the item with the matching ID, size, AND color
        cart = cart.filter(item => !(item.id === productId && item.size === size && item.color === color)); // *** FILTER BY ID, SIZE, AND COLOR ***
        console.log("Cart after filter:", cart);
        saveCart(); // Save the updated cart
        renderCartItems(); // Re-render the items
        updateCartSummary(); // Update the summary
         console.log("Item removed. New cart state:", cart);
    }

     // Function to increase the quantity of an item
     function increaseItemQuantity(productId, size, color) { // *** Accept color parameter ***
         console.log(`increaseItemQuantity() called for product ID: ${productId}, Size: ${size}, Color: ${color}`); // Log size and color
         // Find the item by ID, size, and color
         const itemIndex = cart.findIndex(item => item.id === productId && item.size === size && item.color === color); // *** FIND BY ID, SIZE, AND COLOR ***

         if (itemIndex > -1) {
             cart[itemIndex].quantity++; // Increment quantity
             console.log("Item quantity increased.");
             saveCart(); // Save the updated cart
             renderCartItems(); // Re-render the items to update display
             updateCartSummary(); // Update the summary
             console.log("Item quantity increased. New cart state:", cart);
         } else {
             console.error(`Could not find item with ID ${productId}, Size ${size}, and Color ${color} to increase quantity.`); // Log size and color
         }
     }

     // Function to decrease the quantity of an item
     function decreaseItemQuantity(productId, size, color) { // *** Accept color parameter ***
         console.log(`decreaseItemQuantity() called for product ID: ${productId}, Size: ${size}, Color: ${color}`); // Log size and color
         const itemIndex = cart.findIndex(item => item.id === productId && item.size === size && item.color === color); // *** FIND BY ID, SIZE, AND COLOR ***

         if (itemIndex > -1) {
             cart[itemIndex].quantity--; // Decrement quantity
             console.log("Item quantity decreased.");
             if (cart[itemIndex].quantity <= 0) {
                  console.log("Quantity is 0 or less, removing item.");
                 removeItemFromCart(productId, size, color); // *** Pass color to removeItemFromCart ***
             } else {
                 saveCart(); // Save the updated cart
                 renderCartItems(); // Re-render the items
                 updateCartSummary(); // Update the summary
                  console.log("Item quantity decreased. New cart state:", cart);
             }
         } else {
              console.error(`Could not find item with ID ${productId}, Size ${size}, and Color ${color} to decrease quantity.`); // Log size and color
         }
     }

     // Function to update quantity directly from input field
      function updateItemQuantity(productId, size, color, newQuantity) { // *** Accept color parameter ***
          console.log(`updateItemQuantity() called for product ID: ${productId}, Size: ${size}, Color: ${color} to quantity: ${newQuantity}`); // Log size and color
          const itemIndex = cart.findIndex(item => item.id === productId && item.size === size && item.color === color); // *** FIND BY ID, SIZE, AND COLOR ***

          if (itemIndex > -1) {
              cart[itemIndex].quantity = newQuantity; // Set the quantity
              console.log("Item quantity updated from input.");
               if (cart[itemIndex].quantity <= 0) {
                   console.log("Quantity is 0 or less, removing item.");
                  removeItemFromCart(productId, size, color); // *** Pass color to removeItemFromCart ***
              } else {
                  saveCart(); // Save the updated cart
                  renderCartItems(); // Re-render the items
                  updateCartSummary(); // Update the summary
                   console.log("Item quantity updated. New cart state:", cart);
              }
          } else {
               console.error(`Could not find item with ID ${productId}, Size ${size}, and Color ${color} to update quantity.`); // Log size and color
          }
      }


    // Function to update the cart summary (like subtotal) and add checkout button
    function updateCartSummary() {
         console.log("updateCartSummary() called. Current cart state:", cart);
        if (cart.length === 0) {
            cartSummary.innerHTML = '';
             console.log("Cart is empty, clearing summary.");
            return;
        }

        // Calculate subtotal
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
         console.log("Calculated subtotal:", subtotal);

        cartSummary.innerHTML = `
            <h3>Order Summary</h3>
            <p>Subtotal: <strong>₹${subtotal.toFixed(2)}</strong></p>
            <button id="proceedToCheckoutBtn" class="checkout-btn">Proceed to Checkout</button>
        `;

         // Add event listener to the "Proceed to Checkout" button
         const proceedToCheckoutButton = cartSummary.querySelector('#proceedToCheckoutBtn');
         if (proceedToCheckoutButton) {
             proceedToCheckoutButton.addEventListener('click', () => {
                 console.log("Proceed to Checkout button clicked.");
                 // Redirect to the checkout page
                 window.location.href = 'checkout.html';
             });
              console.log("Proceed to Checkout button event listener attached.");
         } else {
              console.warn("Proceed to Checkout button not found in cart summary.");
         }
          console.log("Updated cart summary.");
    }

     // Function to update the displayed cart count in the header (on the cart page)
     function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log("updateCartCountDisplay() called (from cart.js). Total items:", totalItems);
        // Check if the cartCountSpan element actually exists on this page
        if (cartCountSpan) {
             cartCountSpan.textContent = totalItems;
             // Show or hide the count based on whether there are items
             if (totalItems > 0) {
                 cartCountSpan.style.display = 'inline-block';
                  console.log("Cart count > 0, showing count (on cart.js).");
             } else {
                 cartCountSpan.style.display = 'none';
                  console.log("Cart count is 0, hiding count (on cart.js).");
             }
              console.log("Header cart count updated (on cart.js).");
        } else {
             console.warn("Cart count span element not found on the page.");
        }
     }


    // --- Other Global Functionality (from index.js) ---
    // Include sticky header and subscribe logic if they are also present on cart.html
    // Assuming Quick View modal is present and its Add to Cart button should work and update the cart page:

    // Function to handle adding product to cart (needed if Quick View modal is used on cart.html)
     function handleAddToCart(event) {
         console.log("handleAddToCart called from cart.js (likely from modal)", event.target);
         event.preventDefault();
         event.stopPropagation();

         const button = event.target;
         const productId = button.dataset.productId;
         const productName = button.dataset.productName;
         const productPrice = parseInt(button.dataset.productPrice);
         const productImage = button.dataset.productImage;

         // Get selected size and color from modal on cart page if it's open
         const sizeSelectElement = quickViewModal ? quickViewModal.querySelector('#product-size') : null;
         const selectedSize = sizeSelectElement ? sizeSelectElement.value : '';
          const colorSelectElement = quickViewModal ? quickViewModal.querySelector('#product-color') : null; // *** Get color select ***
         const selectedColor = colorSelectElement ? colorSelectElement.value : ''; // *** Get selected color ***


         console.log("Selected Size (from cart.js modal):", selectedSize, "Selected Color (from cart.js modal):", selectedColor);

          // Validate size and color selection if adding from the modal on the cart page
          if (quickViewModal && quickViewModal.style.display === 'block') {
               if (!selectedSize && !selectedColor) {
                  console.warn("No size and no color selected!");
                  alert("Please select a size and color before adding to the cart.");
                  return;
              }
              if (!selectedSize) {
                   console.warn("No size selected!");
                   alert("Please select a size before adding to the cart.");
                   return;
              }
               if (!selectedColor) { // *** Check for color ***
                   console.warn("No color selected!");
                   alert("Please select a color before adding to the cart.");
                   return;
              }
          }


         if (!productId || !productName || isNaN(productPrice) || !productImage) {
               console.error("Missing or invalid product data for Add to Cart:", { productId, productName, productPrice, productImage });
                alert("Could not add product to cart due to missing information.");
               return;
         }

        // Check if the product is already in the cart (check by ID, Size, and Color)
        const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === selectedSize && item.color === selectedColor); // *** CHECK BY ID, SIZE, AND COLOR ***


        if (existingItemIndex > -1) {
            // If product with same size and color exists, increase quantity
            cart[existingItemIndex].quantity++;
             console.log("Item with same size and color already in cart, incremented quantity (on cart.js).");
        } else {
            // If product or size/color does not exist, add as new item with quantity 1
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1,
                size: selectedSize,
                color: selectedColor // *** Add color to item ***
            });
             console.log("Item (or size/color) not in cart, added new (on cart.js).");
        }

        saveCart(); // Save cart to localStorage
        // IMPORTANT: Refresh the display on the cart page after adding from modal
        renderCartItems();
        updateCartSummary();
        updateCartCountDisplay(); // Update header count on this page


        console.log(`Added ${productName} (Size: ${selectedSize}, Color: ${selectedColor}) to cart from modal/button on cart page. Current cart:`, cart);

         // Optional: Close the modal after adding
         // quickViewModal.style.display = 'none';
     }


     // Quick View Modal Close Functionality (Needed if modal is in cart.html)
     const quickViewModal = document.getElementById('quickViewModal'); // Re-declared if not global
     const closeButton = document.querySelector('.modal .close-button'); // Re-declared

     if(closeButton && quickViewModal){
         closeButton.addEventListener('click', () => {
             quickViewModal.style.display = 'none';
              console.log("Modal close button clicked (on cart.js).");
         });

         window.addEventListener('click', (event) => {
             if (event.target === quickViewModal) {
                 quickViewModal.style.display = 'none';
                  console.log("Clicked outside modal, closing (on cart.js).");
             }
         });
     }


     // --- Sticky Header Functionality --- (Copy from index.js if needed)
     const header = document.querySelector('.sticky-header'); // Re-declared if not global
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


     // --- Subscribe Button Functionality (Client-side only) --- (Copy from index.js if needed)
     const subscribeButton = document.getElementById('subscribeBtn'); // Re-declared if not global
     const subscribeEmailInput = document.getElementById('subscribeEmail'); // Re-declared

     if (subscribeButton && subscribeEmailInput) {
         subscribeButton.addEventListener('click', () => {
             const email = subscribeEmailInput.value.trim();
             if (email) {
                 console.log(`Subscription requested for email: ${email} (from cart.js)`);
                 alert(`Thank you for subscribing with ${email}! (This is a demo from cart page)`);
                 subscribeEmailInput.value = '';
             } else {
                 alert('Please enter a valid email address (from cart page).');
             }
         });
     }


    // --- Initial Load ---
    loadCart(); // Load and display cart items when the page loads
});
