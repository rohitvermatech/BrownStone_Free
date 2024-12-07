const { generateBotReply } = require('./src/handleChat');
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const winston = require('winston');
const app = express();
const port = 3000;

const MemoryStore = require('memorystore')(session);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Update CORS configuration
app.use(cors({
    origin: ['https://brown-stone-free.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));



// Update session configuration
app.use(session({
    store: new MemoryStore({
        checkPeriod: 86400000 
    }),
    secret: 'yourSecretKey',
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
});

app.post('/api/chat', express.json(), async (req, res) => {
    // Destructure from req.body
    const { message, messageType } = req.body;

    if (!req.session.userId) {
        req.session.userId = Date.now();
    }

    if (!message || !messageType) {
        logger.error('Invalid request: Missing message or messageType.');
        return res.status(400).json({ error: 'Invalid request: Missing message or messageType.' });
    }

    try {
        const botReply = await generateBotReply(message, messageType, req.session);
        setTimeout(() => {
            res.json(botReply);
        }, 1000);
    } catch (error) {
        logger.error('Error processing bot reply:', error);
        res.status(500).json({ error: 'Failed to generate bot response.' });
    }
});


app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
});
