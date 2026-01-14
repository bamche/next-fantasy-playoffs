import db from '../../../lib/pgClient';
import { getToken } from "next-auth/jwt";
import { insertNotificationQuery } from '../../../constants/game/sqlQueries';

export default async function addNotification(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await getToken({ req, secret: process.env.SECRET });
    
    if (!token || !token.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (token.email !== process.env.NEXT_PUBLIC_ADMIN) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { title, message, type } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ error: 'Missing required fields: title, message, and type are required' });
    }

    const result = await db.query(insertNotificationQuery, [title, message, type]);
    
    res.status(200).json({ 
      success: true, 
      notification: result.rows[0] 
    });
  } catch(e) {
    console.log(`add-notification api error: ${e}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}


