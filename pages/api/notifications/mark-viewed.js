import db from '../../../lib/pgClient'
import { authOptions } from "../auth/[...nextauth]"
import { getServerSession } from "next-auth"

export default async function markNotificationsViewed(req, res) {
  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions)
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const email = session.user?.email;
      
      if (!email) {
        return res.status(401).json({ error: 'Unauthorized: No email found' });
      }

      // Mark all unviewed notifications as viewed for this user
      const queryString = `
        INSERT INTO notification_views (notification_id, email, viewed_at)
        SELECT n.notification_id, $1::varchar, CURRENT_TIMESTAMP
        FROM notifications n
        WHERE NOT EXISTS (
          SELECT 1 FROM notification_views nv 
          WHERE nv.notification_id = n.notification_id AND nv.email = $1::varchar
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

