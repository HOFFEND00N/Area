const {Schema, model, Types} = require('mongoose');

const schema = new Schema({
    id: {type: Types.ObjectId, unique: true, required: true},
    photo: { type: String, required: true},
    first_name: { type: String, required: true},
    last_name: { type: String, required: true},
    email: { type: String, required: true},
    gender: { type: String }
});

module.exports = model('Card',schema);