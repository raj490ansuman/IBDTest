require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const router = express.Router();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

// Instagram authentication endpoint
router.get('/auth/instagram', (req, res) => {
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
  res.redirect(authUrl);
});

// Instagram callback URL
router.get('/auth/instagram/callback', async (req, res) => {
  try {
    const code = req.query.code;
    console.log('Received authorization code:', code);

    const response = await axios.post('https://api.instagram.com/oauth/access_token', qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Instagram API response:', response.data);

    const accessToken = response.data.access_token;
    const userId = response.data.user_id;

    res.send(`Access Token: ${accessToken} <br> User ID: ${userId}`);
  } catch (error) {
    console.error('Error exchanging code for access token:', error.response ? error.response.data : error.message);
    res.status(500).send('Error exchanging code for access token');
  }
});

// Endpoint to get profile info
router.get('/profile', async (req, res) => {
  const accessToken = req.query.access_token; // Pass the access token as a query parameter
  try {
    const response = await axios.get(`https://graph.instagram.com/me?fields=id,username,name,profile_picture_url&access_token=${accessToken}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching profile information:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to fetch profile information');
  }
});

// Endpoint to get user media
router.get('/media', async (req, res) => {
  const accessToken = req.query.access_token; // Pass the access token as a query parameter
  try {
    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption&access_token=${accessToken}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user media:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.code === 190) {
      res.status(401).send('Access token has expired. Please re-authenticate.');
    } else {
      res.status(500).send('Failed to fetch user media');
    }
  }
});

// Endpoint to refresh the access token
router.get('/refresh-token', async (req, res) => {
  const accessToken = req.query.access_token; // The expired or soon-to-expire access token
  try {
    const response = await axios.get(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to refresh access token');
  }
});

module.exports = router;
