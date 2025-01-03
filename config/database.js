const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'torshizi_dbs',
        });
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    }
};

module.exports = connectDatabase;

