document.addEventListener('DOMContentLoaded', () => {
    console.log("product-details.js loaded and DOM fully parsed.");

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
            } else {
                cart = [];
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
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // --- Product Details Rendering ---
    const productDetailsContainer = document.getElementById('productDetailsContainer');
    let selectedSize = null;
    let selectedColor = null;
    let currentProduct = null;

    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    function renderProductDetails(product) {
        if (!product) {
            productDetailsContainer.innerHTML = '<p>Product not found.</p>';
            return;
        }

        currentProduct = product;

        productDetailsContainer.innerHTML = `
            <div class="product-image-gallery">
                <div class="main-image-container">
                    <img id="mainProductImage" src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="thumbnail-gallery">
                    ${product.images.map((image, index) => `
                        <div class="thumbnail ${index === 0 ? 'selected' : ''}" data-image-url="${image}">
                            <img src="${image}" alt="${product.name} - View ${index + 1}">
                        </div>
                    `).join('')}
                    ${product.availableColors.map(color => `
                        <div class="thumbnail color-thumbnail" data-image-url="${color.image}" data-color-name="${color.name}">
                            <img src="${color.image}" alt="${product.name} - ${color.name}">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="product-info">
                <h1>${product.name}</h1>
                ${product.rating ? `
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                    <span class="rating-text">${product.rating.toFixed(1)} | ${product.reviews} Reviews</span>
                </div>` : ''}
                
                <div class="price-container">
                    <span class="current-price">₹${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price-text">₹${product.originalPrice}</span>` : ''}
                    ${product.discount ? `<span class="discount">${product.discount}</span>` : ''}
                </div>

                <p class="short-description">${product.shortDescription}</p>

                <div class="product-options">
                    ${product.availableSizes?.length ? `
                        <div class="option-group">
                            <label>Size:</label>
                            <div class="size-selector">
                                ${product.availableSizes.map(size => `
                                    <div class="size-option" data-size="${size}">${size}</div>
                                `).join('')}
                            </div>
                        </div>` : ''}
                    ${product.availableColors?.length ? `
                        <div class="option-group">
                            <label>Color:</label>
                            <div class="color-selector">
                                ${product.availableColors.map(color => `
                                    <div class="color-option" data-color="${color.name}" style="background-color: ${color.hex};" title="${color.name}"></div>
                                `).join('')}
                            </div>
                        </div>` : ''}
                </div>

                <button id="addToCartBtn" class="add-to-cart-btn">Add to Cart</button>

                <div class="additional-info">
                    <div class="info-accordion-item">
                        <div class="accordion-header">The Signature Difference <i class="fas fa-chevron-down"></i></div>
                        <div class="accordion-content">
                            <p>${product.longDescription}</p>
                            ${product.features?.length ? `<ul>${product.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
                        </div>
                    </div>
                    <div class="info-accordion-item">
                        <div class="accordion-header">Product Details <i class="fas fa-chevron-down"></i></div>
                        <div class="accordion-content">
                            <p>Material: 100% Premium Cotton</p>
                            <p>Fit: Regular Fit</p>
                            <p>Neck: Crew Neck</p>
                            <p>Care Instructions: Machine wash cold, tumble dry low, do not bleach, iron on low heat.</p>
                        </div>
                    </div>
                    <div class="info-accordion-item">
                        <div class="accordion-header">Return Information <i class="fas fa-chevron-down"></i></div>
                        <div class="accordion-content">
                            <p>We offer a 7-day hassle-free return policy. Items must be unused and in original packaging.</p>
                            <p>Refunds are processed within 5-7 business days.</p>
                        </div>
                    </div>
                    <div class="info-accordion-item">
                        <div class="accordion-header">Shipping Information <i class="fas fa-chevron-down"></i></div>
                        <div class="accordion-content">
                            <p>Free express delivery on all orders.</p>
                            <p>COD (Cash on Delivery) is available.</p>
                            <p>Estimated delivery time: 3-5 business days.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachEventListeners();
    }

    function attachEventListeners() {
        document.querySelectorAll('.thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                const imageUrl = thumbnail.dataset.imageUrl;
                document.getElementById('mainProductImage').src = imageUrl;
                document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('selected'));
                thumbnail.classList.add('selected');
            });
        });

        document.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', () => {
                selectedSize = option.dataset.size;
                document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                selectedColor = option.dataset.color;
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                const colorImage = currentProduct.availableColors.find(color => color.name === selectedColor)?.image;
                if (colorImage) {
                    document.getElementById('mainProductImage').src = colorImage;
                    const matchingThumb = document.querySelector(`.thumbnail[data-image-url="${colorImage}"]`);
                    if (matchingThumb) matchingThumb.classList.add('selected');
                }
            });
        });

        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', handleAddToCart);
        }

        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
                header.classList.toggle('active');
            });
        });
    }

    function handleAddToCart() {
        if (!currentProduct) return;

        if (!selectedSize && currentProduct.availableSizes?.length)
            return alert("Please select a size.");
        if (!selectedColor && currentProduct.availableColors?.length)
            return alert("Please select a color.");

        const imageToAdd = currentProduct.availableColors.find(c => c.name === selectedColor)?.image || currentProduct.images[0];

        const itemToAdd = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: imageToAdd,
            quantity: 1,
            size: selectedSize || 'N/A',
            color: selectedColor || 'N/A'
        };

        const existingItem = cart.find(item =>
            item.id === itemToAdd.id &&
            item.size === itemToAdd.size &&
            item.color === itemToAdd.color
        );

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push(itemToAdd);
        }

        saveCart();
        updateCartCountDisplay();
        alert(`${itemToAdd.name} (Size: ${itemToAdd.size}, Color: ${itemToAdd.color}) added to cart!`);
    }

    // --- Sticky Header ---
    const header = document.querySelector('.sticky-header');
    const headerOffset = header?.offsetTop || 0;

    function handleScroll() {
        if (!header) return;
        if (window.pageYOffset > headerOffset) header.classList.add('sticky');
        else header.classList.remove('sticky');
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

    // --- Load Product ---
    loadCart();
    const productId = getProductIdFromUrl();
    if (productId && typeof getProductById === 'function') {
        const product = getProductById(productId);
        if (product) renderProductDetails(product);
        else productDetailsContainer.innerHTML = '<p>Product not found.</p>';
    } else {
        productDetailsContainer.innerHTML = '<p>Product ID missing or function not available.</p>';
    }
});
