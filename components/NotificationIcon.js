import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';

export default function NotificationIcon() {
  const router = useRouter();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get('/api/notifications/unread-count');
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching unread notification count:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Refresh when window regains focus (e.g., user returns from notifications page)
    const handleFocus = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session]);

  const handleClick = () => {
    router.push('/notifications');
  };

  if (!session?.user?.email) {
    return null;
  }

  return (
    <IconButton
      color="inherit"
      onClick={handleClick}
      aria-label="notifications"
    >
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
}

