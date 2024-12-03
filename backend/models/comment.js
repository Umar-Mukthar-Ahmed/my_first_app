const mongoose = require('mongoose');

const {Schema} =mongoose //extracting schema constructor from mongoose

const commentSchema = new Schema({
    content:{type:String, required:true},
    blog:{type:mongoose.SchemaTypes.ObjectId, ref:'blogs'},
    author:{type:mongoose.SchemaTypes.ObjectId, ref:'users'}
},
{timestamps:true}
);

module.exports = mongoose.model('Comment',commentSchema,'comments');