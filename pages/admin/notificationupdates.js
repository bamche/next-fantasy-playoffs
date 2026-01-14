import React, { useState } from "react";
import { getSession } from 'next-auth/react';
import axios from "axios";
import Link from 'next/link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

export default function NotificationUpdates({ session }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session.user.email != process.env.NEXT_PUBLIC_ADMIN) {
    throw new Error("Unauthorized to view this page");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const response = await axios.post('/api/admin/add-notification', {
        title,
        message,
        type
      });

      if (response.status === 200) {
        setSuccess(true);
        setTitle('');
        setMessage('');
        setType('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add notification');
      console.error('Error adding notification:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="App">
      <Link href="/admin">
        <a style={{ display: 'inline-block', marginBottom: '1rem', color: '#007bff', textDecoration: 'none' }}>← Back to Admin</a>
      </Link>
      <h1>Notification Updates</h1>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, margin: '0 auto' }}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          multiline
          rows={4}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          margin="normal"
          placeholder="e.g., info, warning, success"
        />
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Notification added successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Adding...' : 'Add Notification'}
        </Button>
      </Box>
    </div>
  );
}

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);

  return {
    props: {
      session: sessionUser,
    },
  };
}


