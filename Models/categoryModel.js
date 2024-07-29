const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    photo:{
        type:String,
        required:true,
        unique:true
    }

})

const Category = mongoose.model("category",categorySchema);

module.exports = {Category};