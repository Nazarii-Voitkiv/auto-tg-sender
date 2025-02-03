import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { Group } from '../interfaces/group.interface';

const router = express.Router();
const groupsPath = path.join(__dirname, '../models/groups.json');

// Get all groups
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(groupsPath, 'utf8');
    const groups: Group[] = JSON.parse(data);
    res.json(groups);
  } catch (error) {
    console.error('Error reading groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new group
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    const data = await fs.readFile(groupsPath, 'utf8');
    const groups: Group[] = JSON.parse(data);
    
    const newGroup: Group = {
      id: Date.now().toString(),
      text,
      created: new Date().toISOString()
    };
    
    groups.push(newGroup);
    await fs.writeFile(groupsPath, JSON.stringify(groups, null, 2));
    
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error adding group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete group
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(groupsPath, 'utf8');
    const groups: Group[] = JSON.parse(data);
    
    const filteredGroups = groups.filter((group: Group) => group.id !== id);
    
    if (groups.length === filteredGroups.length) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    await fs.writeFile(groupsPath, JSON.stringify(filteredGroups, null, 2));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
