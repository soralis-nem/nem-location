const Router = require(`koa-router`);
const logger = require(`koa-logger`)
const session = require(`koa-session`);
const bodyParser = require(`koa-bodyparser`);
const render = require('koa-ejs');
const Koa = require(`koa`);
const { OAuth2Client } = require(`google-auth-library`);
const path = require(`path`);


const dataDir = path.join(__dirname, `../data/`);
const config = require(path.join(dataDir, `config.json`));

const apiVersion = `v1`;

const CONFIG = {
	key: `koa:sess`, /** (string) cookie key (default is koa:sess) */
	/** (number || `session`) maxAge in ms (default is 1 days) */
	/** `session` will result in a cookie that expires when session/browser is closed */
	/** Warning: If a session cookie is stolen, this cookie will never expire */
	maxAge: 86400000,
	overwrite: true, /** (boolean) can overwrite or not (default true) */
	httpOnly: true, /** (boolean) httpOnly or not (default true) */
	signed: true, /** (boolean) signed or not (default true) */
	rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
	renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

//debug
process.on(`unhandledRejection`, console.dir);


let app = new Koa();
let router = new Router();
app.use(logger());
app.keys = [`eahsrswysrh`];
app.use(session(CONFIG, app));
app.use(bodyParser({
	onerror: function (err, ctx) {
		ctx.throw(`request invalid`, 400);
	}
}));

render(app, {
	root: path.join(dataDir, 'html'),
	layout: 'template',
	viewExt: 'html',
	cache: false,
	debug: false
});


router.get(`/api/${apiVersion}/login/google`, async (ctx) => {

	const SCOPES = [
		`https://www.googleapis.com/auth/userinfo.profile`
	];
	const clientSecret = config.credential.client_secret;
	const clientId = config.credential.client_id;
	const redirectUrl = `http://localhost:3000/api/${apiVersion}/login/google/redirect`;
	const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: `offline`,
		scope: SCOPES
	});
	ctx.body = { "status": "sucess", "authUrl": authUrl };
});

router.get(`/api/${apiVersion}/login/google/redirect`, async (ctx) => {
	const clientSecret = config.credential.client_secret;
	const clientId = config.credential.client_id;
	const redirectUrl = `http://localhost:3000/api/${apiVersion}/login/google/redirect`;

	const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
	const r = await oauth2Client.getToken(ctx.query[`code`])
	ctx.session.id_token = r.res.data.id_token;
	ctx.session.login = true;
	console.log(r.res.data);
	ctx.redirect(`/return`);
});
router.get(`/return`, async (ctx) => {
	const users = [{ name: 'Dead Horse' }, { name: 'Jack' }, { name: 'Tom' }];
	await ctx.render('content', {
		users
	});
});

app.use(async (ctx, next) => {
	if (!ctx.path.startsWith(`/api/${apiVersion}/login`) &&
		!ctx.session.login) {
		ctx.throw(403, `{"status":"access_denied"}`);
	}
	
	ctx.state = ctx.state || {};
	ctx.state.now = new Date();
	ctx.state.ip = ctx.ip;
	ctx.state.version = '2.0.0';
	await next();
});


app.use(router.routes());
app.use(router.allowedMethods());



app.listen(3000);