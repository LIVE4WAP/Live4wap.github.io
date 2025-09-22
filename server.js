const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/raw', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing "url" query parameter');
  }

  // Prevent internal server access (basic SSRF protection)
  if (targetUrl.includes('127.0.0.1') || targetUrl.includes('localhost')) {
    return res.status(403).send('Access denied');
  }

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': req.get('User-Agent'),
        'Accept': '*/*',
      },
    });
    res.set(response.headers);
    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(500).send('Failed to fetch the requested URL');
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
