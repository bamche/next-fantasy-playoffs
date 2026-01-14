import React from "react";
import Link from "next/link";
import { Typography } from "@mui/material";

/**
 * A clickable component that routes to a user's team view
 * @param {string} email - The email address to link to
 * @param {object} sx - Optional Material-UI sx prop for custom styling
 * @param {string} variant - Optional Typography variant (default: 'body1')
 * @param {React.ReactNode} children - Optional children to render instead of email
 */
export default function EmailLink({ email, sx = {}, variant = 'body4', children }) {
  // Encode the email for the URL (handles @ and other special characters)
  const encodedEmail = encodeURIComponent(email);
  const displayText = children || email;

  return (
    <Link 
      href={`/team-view/${encodedEmail}`}
      style={{ textDecoration: 'none', color: 'inherit'}}
    >
      <Typography
        variant={variant}
        component="span"
        sx={{
          color: 'black.main',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
            color: 'black.dark',
          },
          ...sx,
        }}
      >
        {displayText}
      </Typography>
    </Link>
  );
}

