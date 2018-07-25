'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const login = require('./login.js');

//debug
process.on('unhandledRejection', console.dir);

let app = new Koa();
let router = new Router();

router.get('/login', async (ctx, next) => {
	await login(ctx);
	await next();
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);