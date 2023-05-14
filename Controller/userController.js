const ErrorHander = require("../utils/errorHander");
const User = require("../models/userModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const bcrypt = require("bcryptjs");

const jwt = require('jsonwebtoken');
var emailRegex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return next(new ErrorHander("All Fields are required", 400));
  var valid = emailRegex.test(email);
  if (!valid)
    return next(new ErrorHander("Please give the valid email address", 400));
    const alreadyUser = await User.findOne({email:email});
    if(alreadyUser) return next(new ErrorHander("User already exits with this email",400))
  const trimmedPassword = password.trim();
  if (trimmedPassword.length < 6)
    return next(
      new ErrorHander(
        "Password Length Should be Greater than or Equal to 6. Spaces not be considered",
        400
      )
    );
    const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      req.body.password = hashPassword;
  const user = await User.create(req.body)
  res.status(201).json({
    success: true,
    message: "User Register Successfuly",
   
  });
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(
      new ErrorHander("Email and Password is mandatory for login", 400)
    );
   
  const user = await User.findOne({ email: email }).select("+password");
  if (!user)
    return next(new ErrorHander("Email or Password is not valid", 400));
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return next(new ErrorHander("Email or Password is not valid",400))
    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",})
    
  res.status(200).json({
    success: true,
    message: "User login Successfully",

    token:token,
    user:user
  });
});





//get the user
exports.getUser = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
   const user = await User.findById(id);
   if(!user){
    return next(new ErrorHander("user doesn't exists with this id"));
   }
   res.status(200).json({
    success:true,
    user:user
    
   })
})