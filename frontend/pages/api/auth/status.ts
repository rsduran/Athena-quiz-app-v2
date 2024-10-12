// pages/api/auth/status.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if the user has a valid session or token
  const token = req.cookies.token;

  if (token) {
    // TODO: Validate token and get user data from your database
    res.json({ isLoggedIn: true, avatar: 'https://github.com/user-avatar-url.jpg' });
  } else {
    res.json({ isLoggedIn: false });
  }
}