const mongoose = require('mongoose');

const databaseConnection = async () => {
    const params = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    try {
        await mongoose.connect(process.env.MONGO_URL, params); // Await the connection
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error('MongoDB connection error:', error); // Use console.error for error logging
    }
};

// Export the connection function
module.exports = { databaseConnection };
