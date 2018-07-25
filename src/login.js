const { OAuth2Client } = require('google-auth-library');
const fs = require('fs-extra');

module.exports = async function login(config) {

    return getAuthUrl(config);


}

async function getAuthUrl(credentials) {
    const SCOPES = [
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    const clientSecret = credentials.web.client_secret;
    const clientId = credentials.web.client_id;
    const redirectUrl = "https://google.com";
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    return authUrl;
}

