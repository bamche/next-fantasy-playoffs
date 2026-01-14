import db from '../../lib/pgClient'
import { authOptions } from "./auth/[...nextauth]"
import { getServerSession } from "next-auth"

export default async function notifications(req, res) {
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

      // Get all notifications with view status for this user, ordered by most recent first
      const queryString = `
        SELECT 
          n.notification_id,
          n.title,
          n.message,
          n.type,
          n.created_at,
          CASE WHEN nv.email IS NOT NULL THEN true ELSE false END as viewed
        FROM notifications n
        LEFT JOIN notification_views nv ON n.notification_id = nv.notification_id AND nv.email = $1
        ORDER BY n.created_at DESC
      `;

      const result = await db.query(queryString, [email]);
      
      res.status(200).json({ notifications: result.rows });
    } catch(e) {
      console.log(`notifications api error (fetching notifications): ${e}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

