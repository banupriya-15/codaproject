const mongoose= require("mongoose");
const TeamSchema = new mongoose.Schema({
    name: {
        unique : true,
        required : true,
        type : String,
        maxlength : 220,
    },
    createdAt:{
         required : true,
         type : String,
    },
    wins:{
        default : 0,
        type : Number,
    },
    lose:{
        default : 0,
        type : Number,
    },
    tie:{
        default : 0,
        type : Number,
    },
    score:{
        default : 0,
        type : Number,
    },
});

const Team= mongoose.model('Team',TeamSchema);

module.exports= Team;

