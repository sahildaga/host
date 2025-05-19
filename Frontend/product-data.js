// product-data.js

const products = [
    // --- Your Existing Products with details ---
    {
        id: "cool-graphic",
        name: "Cool Graphic Tee",
        price: 999,
        originalPrice: 1500, // Optional
        discount: "33% off", // Optional
        shortDescription: "A cool graphic tee to elevate your casual look.",
        longDescription: "This comfortable graphic tee features a unique design perfect for expressing your style. Made from soft, breathable cotton.",
        rating: 4.5,
        reviews: 100,
        features: ["Soft Cotton", "Unique Print", "Durable Fabric"],
        availableSizes: ["S", "M", "L", "XL", "XXL"],
        availableColors: [
            { name: "Black", hex: "#000000", image: "index_images/t-shirt/1.png" }, // Use specific image for color
            { name: "White", hex: "#ffffff", image: "index_images/t-shirt/1(3).png" },
            { name: "Wine", hex: "#722F37", image: "index_images/t-shirt/1(1).png" },
            { name: "Purple", hex: "#CBC3E3", image: "index_images/t-shirt/1(2).png" }
            // Add more colors and their corresponding image paths
        ],
        // Add other general images for the gallery if you have them
        images: [
            "index_images/t-shirt/1.png",
            "index_images/t-shirt/1(2).png"
            // Add more general image paths
        ]
        // Note: The image in the cart will be pulled from the 'image' property of the selected color object.
    },
     {
         id: "placeholder-product-1",
         name: "Placeholder Tee 1",
         price: 750,
         shortDescription: "A comfortable everyday tee.",
         longDescription: "Detailed description for Placeholder Tee 1.",
         rating: 5.0,
         reviews: 50,
         features: ["Premium Quality", "Eco-friendly"],
         availableSizes: ["S", "M", "L", "XL", "XXL"],
         availableColors: [
              { name: "Black", hex: "#000000", image: "index_images/t-shirt/2(1).png" }, // Use specific image for color
            { name: "White", hex: "#ffffff", image: "index_images/t-shirt/2(3).png" },
            { name: "Wine", hex: "#722F37", image: "index_images/t-shirt/2.png" },
            { name: "Purple", hex: "#CBC3E3", image: "index_images/t-shirt/2(2).png" }
         ],
         images: ["index_images/t-shirt/2.png"]
     },
     {
         id: "placeholder-product-2",
         name: "Trendy Style Tee",
         price: 880,
         shortDescription: "Stay stylish with this trendy tee.",
         longDescription: "Detailed description for Trendy Style Tee.",
         rating: 4.7,
         reviews: 120,
         features: ["Modern Design", "Comfort Fit"],
         availableSizes: ["S", "M", "L"],
         availableColors: [
              { name: "Green", hex: "#4caf50", image: "image/t-shirt/placeholder-2-green.png" },
              { name: "Yellow", hex: "#ffeb3b", image: "image/t-shirt/placeholder-2-yellow.png" }
         ],
         images: ["image/t-shirt/placeholder-2-view1.png"]
     },
    // Add data for all 10+ products here.
    // Ensure each product object has a unique 'id'.
    // Make sure 'availableColors' includes an 'image' path for each color variation.
    // The 'images' array can hold additional general views.

    // --- Add the rest of your product data here, ensuring unique IDs ---
    // Example for placeholder-product-3
     {
         id: "placeholder-product-3",
         name: "Bold Graphic Tee",
         price: 1050,
         shortDescription: "Make a statement with this bold graphic tee.",
         longDescription: "Detailed description for Bold Graphic Tee.",
         rating: 4.6,
         reviews: 90,
         features: ["Vibrant Colors", "Durable Print"],
         availableSizes: ["M", "L", "XL"],
         availableColors: [
              { name: "Black", hex: "#000000", image: "image/t-shirt/placeholder-3-black.png" }
         ],
         images: ["image/t-shirt/placeholder-3-view1.png", "image/t-shirt/placeholder-3-view2.png"]
     },
     // Add data for placeholder-product-4 through placeholder-product-10+ following this structure
];

// Function to get product by ID (Used by product-details.js)
function getProductById(productId) {
    return products.find(product => product.id === productId);
}
