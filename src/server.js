// express된 것과 server의 configuration 관련된 코드 처리

import express from "express";
import morgan from "morgan";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";


const app = express();
const logger = morgan("dev")

app.use(logger);

app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');
app.use(express.urlencoded({ extended: true }));



app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000, // milisecond로 설정
  },
  store: MongoStore.create({mongoUrl: process.env.DB_URL}),
}));



app.use(localsMiddleware);

// routers
app.use('/uploads', express.static('uploads'));
app.use('/', rootRouter);
app.use('/videos', videoRouter);
app.use('/users', userRouter);

export default app;


