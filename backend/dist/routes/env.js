"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const router = (0, express_1.Router)();
const envPath = path.join(__dirname, '../../.env');
// Get environment variables
router.get('/', async (req, res) => {
    try {
        const envContent = await fs.readFile(envPath, 'utf-8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        res.json({
            BOT_TOKEN: envVars.BOT_TOKEN || '',
            WEBAPP_URL: envVars.WEBAPP_URL || ''
        });
    }
    catch (error) {
        console.error('Error reading env file:', error);
        res.status(500).json({ error: 'Failed to read environment variables' });
    }
});
// Update environment variables
router.post('/', async (req, res) => {
    try {
        const { BOT_TOKEN, WEBAPP_URL } = req.body;
        const envContent = `BOT_TOKEN=${BOT_TOKEN}\nWEBAPP_URL=${WEBAPP_URL}`;
        await fs.writeFile(envPath, envContent);
        res.json({ BOT_TOKEN, WEBAPP_URL });
    }
    catch (error) {
        console.error('Error updating env file:', error);
        res.status(500).json({ error: 'Failed to update environment variables' });
    }
});
exports.default = router;
