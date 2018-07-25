const Router = require('koa-router');
const logger = require('koa-logger')
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const Koa = require('koa');
const path = require('path');


const login = require('./auth.js');
const auth = require('./login.js');

const dataDir = path.join(__dirname, '../data/');
const config = require(path.join(dataDir, 'config.json'));


const CONFIG = {
	key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
	/** (number || 'session') maxAge in ms (default is 1 days) */
	/** 'session' will result in a cookie that expires when session/browser is closed */
	/** Warning: If a session cookie is stolen, this cookie will never expire */
	maxAge: 86400000,
	overwrite: true, /** (boolean) can overwrite or not (default true) */
	httpOnly: true, /** (boolean) httpOnly or not (default true) */
	signed: true, /** (boolean) signed or not (default true) */
	rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
	renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};


//debug
process.on('unhandledRejection', console.dir);


let app = new Koa();
let router = new Router();

app.keys = ['some secret hurr'];


router.get('/login', async (ctx, next) => {
	await auth();
	const authUrl = await login(config);
	ctx.body = authUrl;
	//await next();
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(logger());
app.use(bodyParser({
	onerror: function (err, ctx) {
		ctx.throw('request invalid', 400);
	}
}));

app.use(session(CONFIG, app));

app.use(async ctx => {
	//リクエストをjsonにする
	ctx.body = ctx.request.body;
});


app.listen(3000);