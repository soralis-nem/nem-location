'use strict';

const { OAuth2Client } = require('google-auth-library');
const { fs } = require('fs-extra');

module.exports = async function login(ctx) {

    if (ctx.req.headers['authorization'] !== "undefined") {
        const authHeader = ctx.req.headers['authorization'];
        console.log('req.headers.authorization: ', authHeader);
    }
    getIdToken();
};

async function getIdToken() {
    const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];
    const credentials = await fs.readJsonSync(__dirname + '/data/config.json');
    const clientSecret = credentials.web.client_secret;
    const clientId = credentials.web.client_id;
    const redirectUrl = "google.com";
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
}