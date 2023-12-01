import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json({ limit: '20kb' }));
app.use(
    cors({
        origin: '*',
        credentials: true,
    })
);

export default app;
