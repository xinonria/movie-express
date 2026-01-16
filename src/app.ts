import './utils/bigint-json';

import express from 'express';
import cors from 'cors';
import path from 'path';

import routes from './routes';
import { errorHandler } from './middlewares/error-handler';

const app = express();
const publicDir = path.resolve(process.cwd(), 'public');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);
app.use(express.static(publicDir));
app.use('/videos', express.static(path.join(publicDir, 'videos')));

app.use(errorHandler);

export default app;
