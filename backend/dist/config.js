"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBAPP_URL = exports.BOT_TOKEN = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.BOT_TOKEN = process.env.BOT_TOKEN || '';
exports.WEBAPP_URL = process.env.WEBAPP_URL || '';
