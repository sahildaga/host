document.addEventListener('DOMContentLoaded', () => {

    console.log("index.js loaded and DOM fully parsed.");

    // --- Quick View Modal Functionality ---
    const quickViewModal = document.getElementById('quickViewModal');
    const quickViewContainer = document.getElementById('quickViewContainer');
    const closeButton = document.querySelector('.modal .close-button');

    // Select ALL elements with the class .quick-view-btn
    const quickViewButtons = document.querySelectorAll('.quick-view-btn');
     console.log(`Found ${quickViewButtons.length} Quick View buttons (targeting all).`);

    // Select the product cards that should open quick view on card click (the Sale Is Live section cards)
    const quickViewCards = document.querySelectorAll('.featured-products-section .featured-product-card.quick-view-card');
     console.log(`Found ${quickViewCards.length} Quick View cards (in Sale section - card click enabled).`);

    // Select ALL Add to Cart buttons initially present on the page
    const pageAddToCartButtons = document.querySelectorAll('.add-to-cart-btn');
     console.log(`Found ${pageAddToCartButtons.length} Add to Cart buttons on page.`);


    // Function to open and populate the modal - reusable
    function openQuickViewModal(productId, productName, productPrice, productImage, shortDescription) {
         console.log("Attempting to open Quick View modal for:", productName);
         quickViewContainer.innerHTML = `
             <img src="${productImage}" alt="${productName}" style="max-width: 100%; height: auto; margin-bottom: 15px;">
             <h3>${productName}</h3>
             <p class="price">₹${productPrice}</p>
             <p>${shortDescription}</p>

             <div class="size-selection" style="margin-bottom: 15px;">
                 <label for="product-size">Select Size:</label>
                 <select id="product-size" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                     <option value="">-- Choose Size --</option>
                     <option value="S">S</option>
                     <option value="M">M</option>
                     <option value="L">L</option>
                     <option value="XL">XL</option>
                     <option value="XXL">XXL</option>
                 </select>
             </div>
             <div class="color-selection" style="margin-bottom: 20px;">
                 <label for="product-color">Select Color:</label>
                 <select id="product-color" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                     <option value="">-- Choose Color --</option>
                     <option value="Black">Black</option>
                     <option value="White">White</option>
                     <option value="Purple">Purple</option>
                     <option value="Wine Color">Wine Color</option>
                     </select>
             </div>
             <button class="add-to-cart-btn" data-product-id="${productId}" data-product-name="${productName}" data-product-price="${productPrice}" data-product-image="${productImage}">Add to Cart</button>
         `;

         // Re-attach event listener to the "Add to Cart" button inside the modal
         const modalAddToCartBtn = quickViewContainer.querySelector('.add-to-cart-btn');
         if (modalAddToCartBtn) {
             modalAddToCartBtn.addEventListener('click', handleAddToCart);
              console.log("Attached click listener to Add to Cart button inside modal.");
         }

         quickViewModal.style.display = 'block';
          console.log("Quick View modal displayed.");

          // Optional: Automatically focus on the first select when modal opens
          const firstSelect = quickViewModal.querySelector('select');
          if(firstSelect) {
              firstSelect.focus();
          }
    }


    // Event listener for ALL Quick View buttons (Opens Quick View modal)
    quickViewButtons.forEach(button => {
        button.addEventListener('click', (event) => {
             console.log("Quick View button clicked:", event.target);
             event.preventDefault();
             event.stopPropagation();

            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = button.dataset.productPrice;
            const productImage = button.dataset.productImage;
             const shortDescription = button.dataset.shortDescription ||
                                     button.closest('a')?.dataset.shortDescription ||
                                     button.closest('.featured-product-card, .product-card, .category-card')?.dataset.shortDescription ||
                                     'Comfortable and stylish tee.';

            openQuickViewModal(productId, productName, productPrice, productImage, shortDescription);
        });
         console.log("Attached click listener to Quick View button:", button);
    });

     // Event listener for Quick View Cards (in Sale Is Live section - Opens Quick View modal on card click)
     quickViewCards.forEach(card => {
         card.addEventListener('click', (event) => {
             console.log("Quick View Card clicked (in Sale section):", event.target);
             if (!event.target.closest('button')) {
                 console.log("Click was not on a button inside the card, opening modal.");

                const productId = card.dataset.productId;
                const productName = card.dataset.productName;
                const productPrice = card.dataset.productPrice;
                const productImage = card.dataset.productImage;
                const shortDescription = card.dataset.shortDescription || 'Comfortable and stylish tee.';

                openQuickViewModal(productId, productName, productPrice, productImage, shortDescription);
             } else {
                  console.log("Click was on a button inside the card, preventing modal open by card listener.");
             }
         });
         console.log("Attached click listener to Quick View card:", card);
     });

    // Event listener for PAGE Add to Cart buttons (Now Opens Quick View modal)
     pageAddToCartButtons.forEach(button => {
         button.addEventListener('click', (event) => {
             console.log("Page Add to Cart button clicked (will open modal):", event.target);
             event.preventDefault();
             event.stopPropagation();

            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = button.dataset.productPrice;
            const productImage = button.dataset.productImage;

             const parentCard = button.closest('.featured-product-card, .product-card, .category-card');
             let shortDescription = 'Comfortable and stylish tee.';

             if (parentCard) {
                 if (parentCard.dataset.shortDescription) {
                     shortDescription = parentCard.dataset.shortDescription;
                 } else {
                     const productLink = parentCard.querySelector('a');
                     if (productLink && productLink.dataset.shortDescription) {
                         shortDescription = productLink.dataset.shortDescription;
                     }
                 }
             }

             openQuickViewModal(productId, productName, productPrice, productImage, shortDescription);
         });
          console.log("Attached click listener to Page Add to Cart button:", button);
     });


    // Close modal when clicking on the close button
    closeButton.addEventListener('click', () => {
        quickViewModal.style.display = 'none';
         console.log("Modal close button clicked.");
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === quickViewModal) {
            quickViewModal.style.display = 'none';
             console.log("Clicked outside modal, closing.");
        }
    });

    // --- Cart Functionality ---
    const cartCountSpan = document.querySelector('.cart-link .cart-count');
    let cart = []; // Initialize cart array

    // Load cart from localStorage on page load
    function loadCart() {
        console.log("loadCart() called.");
        if (localStorage.getItem('cart')) {
            try {
                 const storedCart = JSON.parse(localStorage.getItem('cart'));
                 // Ensure cart is an array and each item has the expected structure (including size/color property)
                 // *** HANDLING COLOR IN LOAD ***
                if (Array.isArray(storedCart)) {
                    cart = storedCart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity,
                        size: item.size || 'N/A', // Keep size property
                        color: item.color || 'N/A' // *** ADD color property, default to 'N/A' if missing ***
                         // Removed: type: item.type || 'N/A'
                    }));
                    console.log("Cart loaded from localStorage:", cart);
                } else {
                    cart = [];
                     console.log("localStorage cart data is not an array, resetting.");
                }
            } catch (e) {
                console.error("Error parsing cart data from localStorage:", e);
                cart = [];
            }
        } else {
            cart = [];
             console.log("No cart data found in localStorage.");
        }
        updateCartCountDisplay();
    }


    // Function to update the displayed cart count
    function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log("updateCartCountDisplay() called. Total items:", totalItems);
        cartCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            cartCountSpan.style.display = 'inline-block';
             console.log("Cart count > 0, showing count.");
        } else {
            cartCountSpan.style.display = 'none';
             console.log("Cart count is 0, hiding count.");
        }
         console.log("Header cart count updated.");
    }

    // Function to save the cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
         console.log("Cart saved to localStorage:", cart);
    }

    // Function to handle adding product to cart (Only called from Modal's Add to Cart button)
    function handleAddToCart(event) {
        console.log("Add to Cart (from modal) button clicked!", event.target);

        event.preventDefault();
        event.stopPropagation();

        const button = event.target;
        const productId = button.dataset.productId;
        const productName = button.dataset.productName;
        const productPrice = parseInt(button.dataset.productPrice);
        const productImage = button.dataset.productImage;

        // *** GET SELECTED SIZE AND COLOR FROM MODAL (Replacing Type) ***
        const sizeSelectElement = quickViewModal.querySelector('#product-size');
        const selectedSize = sizeSelectElement ? sizeSelectElement.value : '';
        const colorSelectElement = quickViewModal.querySelector('#product-color'); // *** Get the color select ***
        const selectedColor = colorSelectElement ? colorSelectElement.value : ''; // *** Get the selected color ***

        console.log("Selected Size:", selectedSize, "Selected Color:", selectedColor); // Log size and color
        // *** END GET SELECTED SIZE AND COLOR ***


         // *** VALIDATION: Check if BOTH size AND color are selected (Replacing Type) ***
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
         // *** END VALIDATION ***


        console.log("Product Data read (from modal):", { productId, productName, productPrice, productImage, selectedSize, selectedColor }); // Log size and color


         // Validate essential data (including size and color now)
         if (!productId || !productName || isNaN(productPrice) || !productImage || !selectedSize || !selectedColor) { // *** Include selectedColor ***
              console.error("Missing or invalid product data (including size/color):", { productId, productName, productPrice, productImage, selectedSize, selectedColor }); // Include selectedColor
              alert("Could not add product to cart due to missing information.");
              return;
         }

        // Check if the product (with the same size AND color) is already in the cart
        const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === selectedSize && item.color === selectedColor); // *** CHECK ID, SIZE, AND COLOR ***


        if (existingItemIndex > -1) {
            // If product with same size and color exists, increase quantity
            cart[existingItemIndex].quantity++;
            console.log("Item with same size and color already in cart, incremented quantity.");
        } else {
            // If product or size/color does not exist, add as new item with quantity 1
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1,
                size: selectedSize,
                color: selectedColor // *** ADD COLOR TO ITEM (Replacing Type) ***
            });
             console.log("Item (or size/color) not in cart, added new.");
        }

        saveCart();
        updateCartCountDisplay();

        console.log(`Added ${productName} (Size: ${selectedSize}, Color: ${selectedColor}) to cart. Current cart:`, cart); // Log size and color

        quickViewModal.style.display = 'none';
         console.log("Modal closed after adding to cart.");
    }


    // --- Subscribe Button Functionality (Client-side only) ---
    const subscribeButton = document.getElementById('subscribeBtn');
    const subscribeEmailInput = document.getElementById('subscribeEmail');

    if (subscribeButton && subscribeEmailInput) {
        subscribeButton.addEventListener('click', () => {
            const email = subscribeEmailInput.value;
            if (email) {
                console.log(`Subscription requested for email: ${email} (from index.js)`);
                alert(`Thank you for subscribing with ${email}! (This is a demo from index page)`);
                subscribeEmailInput.value = '';
            } else {
                alert('Please enter a valid email address (from index page).');
            }
        });
    }

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

    // --- Initial Load ---
    loadCart();
});