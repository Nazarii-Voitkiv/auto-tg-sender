"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const groupsPath = path_1.default.join(__dirname, '../models/groups.json');
// Get all groups
router.get('/', async (req, res) => {
    try {
        const data = await promises_1.default.readFile(groupsPath, 'utf8');
        const groups = JSON.parse(data);
        res.json(groups);
    }
    catch (error) {
        console.error('Error reading groups:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add new group
router.post('/', async (req, res) => {
    try {
        const { text } = req.body;
        const data = await promises_1.default.readFile(groupsPath, 'utf8');
        const groups = JSON.parse(data);
        const newGroup = {
            id: Date.now().toString(),
            text,
            created: new Date().toISOString()
        };
        groups.push(newGroup);
        await promises_1.default.writeFile(groupsPath, JSON.stringify(groups, null, 2));
        res.status(201).json(newGroup);
    }
    catch (error) {
        console.error('Error adding group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete group
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await promises_1.default.readFile(groupsPath, 'utf8');
        const groups = JSON.parse(data);
        const filteredGroups = groups.filter((group) => group.id !== id);
        if (groups.length === filteredGroups.length) {
            return res.status(404).json({ error: 'Group not found' });
        }
        await promises_1.default.writeFile(groupsPath, JSON.stringify(filteredGroups, null, 2));
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
