const mongoose=require('mongoose')
const JWT=require('jsonwebtoken')
const bycrupt=require('bcrypt')
const crypto=require('crypto')
const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:[true,'Name is req']
    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique :true,
        lowercase:true,
        unique:[true,'user is already registred']
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minLength:[6,"Min length should be 5"],
        maxLength:[40,"Max length should be 40"],
        select:false

    },
    confirmpassword:String,
    forgotpasstoken:{
        type:String
    },
    forgotPasswordExpiryDate:{
        type:Date
    }
},{
    timestamps:true
});
userSchema.pre('save',async function(next){
if(!this.isModified('password')){
return next();
}
this.password=await bycrupt.hash(this.password,10);
return next();
})
userSchema.methods={
    jwtToken(){
        return JWT.sign(
            {
                id:this._id,email:this.email
            },
            process.env.SECRET,
            {expiresIn:'48h'}
        );
    },
    getForgotPasswordToken() {
        const forgotToken = crypto.randomBytes(20).toString('hex');
        //step 1 - save to DB
        this.forgotPasswordToken = crypto
          .createHash('sha256')
          .update(forgotToken)
          .digest('hex');
    
        /// forgot password expiry date
        this.forgotPasswordExpiryDate = Date.now() + 60 * 60 * 1000; // 60min
    
        //step 2 - return values to user
        return forgotToken;
      }
    };


module.exports=mongoose.model("User",userSchema)