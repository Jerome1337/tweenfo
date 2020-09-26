import bodyParser from 'body-parser';
import compression from 'compression';
import polka from 'polka';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import sirv from 'sirv';
import * as sapper from '@sapper/server';
import { i18nMiddleware } from './i18n';

const FileStore = sessionFileStore(session);

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

polka()
  .use(bodyParser.json())
  .use(
    session({
      secret: 'conduit',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 31536000,
      },
      store: new FileStore({
        path: process.env.NOW ? `/tmp/sessions` : `.sessions`,
      }),
    })
  )
  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    i18nMiddleware(),
    sapper.middleware({
      session: (req) => ({
        user: req.session && req.session.user,
      }),
    })
  )
  .listen(PORT, (err) => {
    // eslint-disable-next-line no-console
    if (err) console.log('error', err);
  });
