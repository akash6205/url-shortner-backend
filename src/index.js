import dotenv from 'dotenv';
import connectDb from './db/index.js';
import app from './app.js';
dotenv.config({
    path: './.env',
});

connectDb()
    .then(() => {
        app.on('error', (error) => {
            console.log('🚫 Fail to start the server', error);
        });
        app.listen(process.env.PORT || 5001, () => {
            console.log(
                `🚀 Server is running on port: ${process.env.PORT || 5000}`
            );
        });
    })
    .catch((error) => {
        console.log('⚠️ Fail to start the surver', error);
    });
