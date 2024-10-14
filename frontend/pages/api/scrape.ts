// pages/scrape.ts

import { getBackendUrl } from '@/utils/getBackendUrl';
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithAuth } from '@/utils/api';

const backendUrl = getBackendUrl();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const response = await fetchWithAuth(`${backendUrl}/startScraping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Scraping failed', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}