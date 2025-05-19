// Load environment variables from .env file
// In production on Railway, environment variables are automatically injected,
// so dotenv might not be strictly necessary but is harmless.
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise'); // Promise-based MySQL client
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// **Enhanced CORS Configuration**
const allowedOrigins = [
    'http://127.0.0.1:5500', // Example: Live Server
    'http://localhost:5173', // Example: Vite/React
    'null', // 'null' origin can occur for local files or sandboxed environments - be cautious with this in production
    // 'http://your-production-domain.com', // Replace with your actual frontend domain when deployed
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or if the origin is in the allowedOrigins list.
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));

// --- Database Connection Pool ---
// Update the connection to use the DATABASE_URL provided by Railway
const pool = mysql.createPool({
    uri: process.env.DATABASE_URL, // Use the DATABASE_URL environment variable
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database.');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
        // Consider exiting the process if database connection is critical
        // process.exit(1); // Uncomment this line if your app cannot function without the database
    });

// --- Nodemailer Email Transporter Setup ---
// Ensure these environment variables are set in Railway as well if you need email functionality
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true', // Use 'true' or 'false' strings in .env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter verification failed:', error.message);
    } else {
        console.log('Email transporter is ready.');
    }
});

// --- Authentication Middleware (Insecure Placeholder!) ---
// IMPORTANT: Replace this with a proper JWT-based authentication system in production.
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // **INSECURE! REPLACE WITH JWT VERIFICATION!**
        // This is a placeholder. A proper JWT implementation is strongly recommended.
        if (typeof token !== 'string' || token.trim().length === 0) {
             return res.status(401).json({ error: 'Invalid token format' });
           }

        // INSECURE: User ID directly from token - DO NOT USE IN PRODUCTION
        const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [token]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.userId = token; // Attach user ID to request object
        next(); // Proceed to the next middleware/route handler

    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(500).json({ error: 'Authentication error' });
    }
};

// --- API Endpoint: Create Account ---
app.post('/api/create-account', async (req, res) => {
    const { fullName, email, password } = req.body;

    // Input validation
    if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new user into database
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            [fullName, email, passwordHash]
        );

        // --- Send Welcome Email ---
        // Ensure EMAIL_FROM and CONTACT_RECEIVING_EMAIL are set in Railway Variables
        const mailOptions = {
            from: process.env.EMAIL_FROM, // Sender address
            to: email, // Recipient address
            subject: 'Welcome to trendbaaz!', // Subject line
            text: `Hello ${fullName},\n\nWelcome to trendbaaz! Your account has been successfully created.`, // Plain text body
            html: `<p>Hello ${fullName},</p><p>Welcome to trendbaaz! Your account has been successfully created.</p>` // HTML body
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Welcome email sent:', info.response);
        } catch (emailError) {
            console.error('Error sending welcome email:', emailError.message);
            // Decide if account creation should fail if email fails
            // For now, we'll log the error but still confirm account creation
        }

        // Respond with success message and new user ID
        res.status(201).json({ message: 'Account created successfully', userId: result.insertId });

    } catch (error) {
        console.error('Error creating account:', error.message);
        res.status(500).json({ error: 'Server error during account creation' });
    }
});


// --- API Endpoint: Login ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        // Fetch user by email
        const [users] = await pool.query('SELECT id, full_name, email, password_hash FROM users WHERE email = ?', [email]);

        // Check if user exists
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' }); // Generic error for security
        }

        const user = users[0]; // Get the first user found (email should be unique)

        // Compare provided password with stored hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' }); // Generic error
        }

        // --- Authentication Successful ---
        // **INSECURE! REPLACE WITH JWT!**
        // This is a placeholder for a proper authentication token.
        // In a real application, you would generate a JWT here.
        const token = user.id; // Using user ID as the "token" - **DO NOT USE IN PRODUCTION**


        // Respond with success, token, and necessary user info
        res.status(200).json({
            message: 'Login successful',
            token: token, // Send the "token" (insecure user ID)
            user: { // Include user details in the response
                id: user.id,
                fullName: user.full_name, // Mapping database snake_case to frontend camelCase
                email: user.email,
            }
        });

    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Server error during login' });
    }
});


// --- API Endpoint: Get User Info (Requires Authentication) ---
// This endpoint is called by the frontend to get user details after authentication (login or page load)
app.get('/api/user-info', authenticateUser, async (req, res) => {
    try {
        // Use the authenticated user ID (req.userId) to fetch user details
        const [users] = await pool.query('SELECT id, full_name, email FROM users WHERE id = ?', [req.userId]);

        if (users.length === 0) {
            // This case should ideally not happen if authentication succeeded,
            // but it's a safeguard.
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0]; // Get the user details

        // Send user data to the frontend with camelCase keys
        res.json({
            id: user.id,
            fullName: user.full_name, // Mapping database snake_case to frontend camelCase
            email: user.email,
        });

    } catch (error) {
        console.error('Error fetching user info:', error.message);
        res.status(500).json({ error: 'Server error while fetching user info' });
    }
});

// --- API Endpoint: Contact Form Submission ---
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation (you can add more comprehensive validation)
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    console.log('Received contact form submission:');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);

    // In a real application, you would process the form data here.
    // For example, send an email using Nodemailer or save to a database.

    try {
        // Example: Sending an email (requires Nodemailer setup in server.js)
        // Make sure you have CONTACT_RECEIVING_EMAIL set in your .env file
        const mailOptions = {
            from: process.env.EMAIL_FROM, // Your sender email from .env
            to: process.env.CONTACT_RECEIVING_EMAIL, // The email address to receive messages
            subject: `New Contact Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Contact message email sent:', info.response);

        res.status(200).json({ message: 'Your message has been sent successfully!' });

    } catch (error) {
        console.error('Error sending contact form email:', error.message);
        // Send a server error response if email sending fails
        res.status(500).json({ error: 'Failed to send message.' });
    }
});


// --- Basic Root Route ---
app.get('/', (req, res) => {
    res.send('Trendbaaz Backend Running');
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});