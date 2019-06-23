const mongoose = require('mongoose');
// Set up mongoose connection
var dev_db_url = 'mongodb+srv://nikhil_nayyar:dnaagent6@cluster0-x0pfo.mongodb.net/test_crud?retryWrites=true&w=majority'

mongoose.connect(dev_db_url, (err) => {
    if (!err) { console.log('MongoDB connection succeeded.'); }
    else { console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2)); }
});

require('./user.model');