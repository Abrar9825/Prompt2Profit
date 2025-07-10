const mongoose=require('mongoose');
const AutoIncrement=require('mongoose-sequence')(mongoose);

const UserSchema=new mongoose.Schema({
    provider:{type:String,default:"local"},
    providerId:String,
    name:String,
    email:{type:String,unique:true},
    role:{type:String,default:"user"},
    password:String,
    avatar:String,
    createdAt:{type:Date,default:Date.now}
});

UserSchema.plugin(AutoIncrement,{inc_field:'id',id:'uid'});
const userModel=mongoose.model('user',UserSchema);
module.exports=userModel;