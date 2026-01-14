import React, { useState, useEffect } from 'react';
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import axios from 'axios';

export default function Notifications({ session }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchNotifications = async () => {
      try {
        // Fetch notifications
        const notificationsResponse = await axios.get('/api/notifications');
        setNotifications(notificationsResponse.data.notifications || []);
        
        // Mark all notifications as viewed
        await axios.post('/api/notifications/mark-viewed');
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!session?.user?.email) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Typography variant="h5">Please sign in to view notifications</Typography>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: 3 }}>
        Notifications
      </Typography>
      
      {loading ? (
        <Typography>Loading notifications...</Typography>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              No notifications available.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map((notification) => (
            <Card
              key={notification.notification_id}
              sx={{
                width: '100%',
                borderLeft: notification.viewed 
                  ? '4px solid transparent' 
                  : '4px solid #1976d2',
                opacity: notification.viewed ? 0.9 : 1,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flex: 1 }}>
                    {notification.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {notification.type && (
                      <Chip 
                        label={notification.type} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    {!notification.viewed && (
                      <Chip 
                        label="New" 
                        size="small" 
                        color="error" 
                      />
                    )}
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 1, whiteSpace: 'pre-wrap' }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(notification.created_at)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
}

