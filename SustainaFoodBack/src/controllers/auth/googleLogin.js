var express = require('express'); 
var router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const { OAuth2Client } = require('google-auth-library');

router.post('/', async function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Referrer-Policy', 'no-referrer-when-downgrade');

    const redirectUrl = 'http://localhost:8082/oauth';
    const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUrl
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
        prompt: 'consent'
    });

    res.json({ url: authorizeUrl });
});

module.exports = router;