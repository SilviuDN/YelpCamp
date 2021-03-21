const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

UserSchema.plugin(passportLocalMongoose); // adds on to the schema name, password
                                        // ensures username uniqueness, gives additional methods

module.exports = mongoose.model('User', UserSchema);
