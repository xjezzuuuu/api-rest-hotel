const express = require('express');
const morgan = require('morgan');
const config = require('./configs/config');
const app = express();

// Settings
app.set('key', config.secretKey);
app.use(morgan('dev'));
app.set('port', process.env.PORT || 3000);

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/rooms', require('./routes/rooms'));

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
    const getDate = new Date(Date.now()).toLocaleString();

    const currentDate = `${getDate}`;
    console.log(currentDate);
    
});