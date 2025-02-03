"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const messages_1 = __importDefault(require("./routes/messages"));
const groups_1 = __importDefault(require("./routes/groups"));
const env_1 = __importDefault(require("./routes/env"));
const bot_1 = require("./bot");
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Middleware
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
});
// Routes
app.use('/api/messages', messages_1.default);
app.use('/api/groups', groups_1.default);
app.use('/api/env', env_1.default);
const PORT = process.env.PORT || 3000;
// Initialize bot
const bot = new bot_1.Bot();
bot.launch();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
