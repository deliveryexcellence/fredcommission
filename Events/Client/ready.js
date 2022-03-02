const mongoose = require('mongoose');
const { Database } = require('../../config.json');

module.exports = {
    name: 'ready',
    execute(client) {

        console.log('Client successfully connected to Discord!');

        if (!Database) return;
        mongoose.connect(Database, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("Client successfully connected to Database!")
        }).catch((err) => {
            console.log(err);
        });
    }
}