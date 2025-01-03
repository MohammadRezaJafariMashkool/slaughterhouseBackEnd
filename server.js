const app = require('./app');
const connectDatabase = require('./config/database');

const dotenv = require('dotenv');

// Handle Uncaught Exceptions
process.on('uncaughtException', err => {
    console.log('Error: '+ err.stack);
    console.log('Shutting down the server due to uncaught exception.');
        process.exit(1);
})

// Setting up the config file
dotenv.config({path: 'config/config.env'})
// Connecting to database
connectDatabase();
const server = app.listen(process.env.PORT, ()=>{
    console.log('Server starten on PORT: '+ process.env.PORT+' in ' + process.env.NODE_ENV+' mode.' )
})

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log('Error: '+ err.stack);
    console.log('Shutting down the server due to unhandled promise rejections.');
    server.close(()=> {
    process.exit(1);
    })
})