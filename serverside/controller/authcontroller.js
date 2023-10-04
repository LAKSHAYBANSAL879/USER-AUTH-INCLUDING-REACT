const User = require('../model/userdet.js');
const emailValidator = require("email-validator");
const jwt=require('jsonwebtoken');
const crypto=require('crypto')
const bycrupt=require('bcrypt')
exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            throw new Error("All fields are required");
        }

        const validateEmail = emailValidator.validate(email);

        if (!validateEmail) {
            throw new Error("Please enter a valid email address");
        }

        if (password !== confirmPassword) {
            throw new Error("Password and confirmed password do not match");
        }

        const user = await User.create({
            name,
            email,
            password,
            confirmPassword
        });

        // Hash the user's password here (you should use a proper password hashing library)

        res.status(201).json({
            success: true,
            message: "User signup successfully",
            data: {user}
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'User already registered with this email',
            });
        } else {
            console.log(error);
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error("All fields are required");
        }

        const user = await User.findOne({
            email
        }).select('+password');

        if (!user || !(await bycrupt.compare(password,user.password))) {
            throw new Error('Invalid credentials');
        }

        const token = user.jwtToken();
        user.password = undefined;
    
        const cookieOption = {
           maxAge:48*60*60*1000,
          httpOnly: true 
        };
    
        res.cookie("token", token, cookieOption);

      
        res.status(200).json({
            success: true,
            message: "User signin successfully",
            data: user
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'User already registered with this email',
            });
        } else {
            console.log(error);
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
};

    exports.getuser = async (req, res,next) => {
        const userId=req.user.id;
        try {
            const user = await User.findById(userId)
            
           return res.status(200).json({
                success: true,
                data:user
            })
        } catch (error) {
            console.log(error);
             return res.status(400).json({
                success: false,
                message: error.message,
            })
        }
    };
    exports.userLogout=(req,res,next) => {
try{
const cookieOption={
    expires : new Date(),
    httpOnly:true
}
res.cookie("token",null,cookieOption)
res.status(200).json({
    success:true,
    message:"user logout sucessfully"
})
}
catch(error){
    res.status(400).json({
        success: false,
        message: error.message,
    })
}
    }
    exports.forgotPassword = async (req, res, next) => {
        const email = req.body.email;
      
        // return response with error message If email is undefined
        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email is required"
          });
        }
      
        try {
          // retrieve user using given email.
          const user = await User.findOne({
            email
          });
      
          // return response with error message user not found
          if (!user) {
            return res.status(400).json({
              success: false,
              message: "User not found"
            });
          }
      
          // Generate the token with userSchema method getForgotPasswordToken().
          const forgotPasswordToken = user.getForgotPasswordToken();
      
          await user.save();
      
          return res.status(200).json({
            success: true,
            token: forgotPasswordToken
          });
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
      };
      
      exports.resetPassword = async (req, res, next) => {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
      
        // return error message if password or confirmPassword is missing
        if (!password || !confirmPassword) {
          return res.status(400).json({
            success: false,
            message: "password and confirmPassword is required"
          });
        }
      
        // return error message if password and confirmPassword  are not same
        if (password !== confirmPassword) {
          return res.status(400).json({
            success: false,
            message: "password and confirm Password does not match ❌"
          });
        }
      
        const hashToken = crypto.createHash("sha256").update(token).digest("hex");
      
        try {
          const user = await User.findOne({
            forgotPasswordToken: hashToken,
            forgotPasswordExpiryDate: {
              $gt: new Date() // forgotPasswordExpiryDate() less the current date
            }
          });
      
          // return the message if user not found
          if (!user) {
            return res.status(400).json({
              success: false,
              message: "Invalid Token or token is expired"
            });
          }
      
          user.password = password;
          await user.save();
      
          return res.status(200).json({
            success: true,
            message: "successfully reset the password"
          });
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
      };
      