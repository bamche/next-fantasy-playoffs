import db from '../../../lib/pgClient'
import { authOptions } from "../auth/[...nextauth]"
import { getServerSession } from "next-auth"

export default async function unreadNotificationCount(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions)
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const email = session.user?.email;
      
      if (!email) {
        return res.status(401).json({ error: 'Unauthorized: No email found' });
      }

      // Count notifications that haven't been viewed by this user
      const queryString = `
        SELECT COUNT(*) as unread_count
        FROM notifications n
        LEFT JOIN notification_views nv ON n.notification_id = nv.notification_id AND nv.email = $1
        WHERE nv.email IS NULL
      `;

      const result = await db.query(queryString, [email]);
      const unreadCount = parseInt(result.rows[0].unread_count, 10);
      
      res.status(200).json({ unreadCount });
    } catch(e) {
      console.log(`unread-notification-count api error: ${e}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

