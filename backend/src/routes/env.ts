import { Router } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

const router = Router();
const envPath = path.join(__dirname, '../../.env');

// Get environment variables
router.get('/', async (req, res) => {
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const envVars: { [key: string]: string } = {};
    
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
  } catch (error) {
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
  } catch (error) {
    console.error('Error updating env file:', error);
    res.status(500).json({ error: 'Failed to update environment variables' });
  }
});

export default router;
