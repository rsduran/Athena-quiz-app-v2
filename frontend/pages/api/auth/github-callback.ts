// pages/api/auth/github/callback.ts

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user data
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const userData = userResponse.data;

    // TODO: Store user data in your database

    // Set session or JWT token
    // For simplicity, we'll use a cookie here. In production, use a more secure method.
    res.setHeader('Set-Cookie', `token=${accessToken}; Path=/; HttpOnly`);

    res.redirect('/Dashboard');
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    res.redirect('/signin?error=oauth_failed');
  }
}