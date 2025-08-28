const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const secretSchema = new mongoose.Schema({
    content: String,
});
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        sparse: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true,
    },
    secret: [secretSchema],


}, {
    timestamps: true
})


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);
module.exports = User;