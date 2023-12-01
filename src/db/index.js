import mongoose from 'mongoose';

const connectDb = async () => {
    try {
        const mongoConnectionInstanse = await mongoose.connect(
            `${process.env.MONGODB_URL}/${process.env.MONGODB_NAME}`
        );
        console.log(
            `⚙️  DB connected on host: ${mongoConnectionInstanse.connection.host}`
        );
        console.log('✅ database connected!');
    } catch (error) {
        console.log('🚫 FAIL to connect db: ', error);
        process.exit(1);
    }
};

export default connectDb;
