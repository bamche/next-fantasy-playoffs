import db from '../../../lib/pgClient'
import { getToken } from "next-auth/jwt";

export default async function markNotificationsViewed(req, res) {
  if (req.method === 'POST') {
    try {
      const token = await getToken({ req, secret: process.env.SECRET });
      
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const email = token.email || token.sub;
      
      if (!email) {
        return res.status(401).json({ error: 'Unauthorized: No email found' });
      }

      // Mark all unviewed notifications as viewed for this user
      const queryString = `
        INSERT INTO notification_views (notification_id, email, viewed_at)
        SELECT n.notification_id, $1, CURRENT_TIMESTAMP
        FROM notifications n
        WHERE NOT EXISTS (
          SELECT 1 FROM notification_views nv 
          WHERE nv.notification_id = n.notification_id AND nv.email = $1
        )
        ON CONFLICT (notification_id, email) DO NOTHING
      `;

      await db.query(queryString, [email]);
      
      res.status(200).json({ success: true });
    } catch(e) {
      console.log(`mark-notifications-viewed api error: ${e}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

