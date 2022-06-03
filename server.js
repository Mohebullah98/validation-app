require("dotenv").config();
const express =require("express");
const cors=require("cors");
const mongoose =require("mongoose");
const session =require("express-session");
const passport =require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate =require("mongoose-findorcreate");
var ReactDOMServer = require('react-dom/server');
var cookieParser = require('cookie-parser');
const port=3001;
const app= express();
app.use(express.urlencoded({
  extended:true
}));
const whitelist = ['http://localhost:3000','http://localhost:3001/auth/google'];
// const corsOptions = {
//   credentials: true, // This is important.
//   origin: (origin, callback) => {
//     if(whitelist.includes(origin))
//       return callback(null, true)
//
//       callback(new Error('Not allowed by CORS'));
//   }
// }
//
// app.use(cors(corsOptions));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.header('Origin'));
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT ,DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
//app.use(cors());
// app.options("http://localhost:3000/dashboard", cors());
app.set('view engine', 'ejs');
app.use(express.json());
mongoose.connect("mongodb://localhost:27017/User2DB");
app.use(session({ //initialize express session
  secret:"It's not a chat app lol.",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
const userSchema= new mongoose.Schema({
  email:String,
  password:String,
  name:String,
  googleId:String,
  facebookId:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser((user,done)=>{
  done(null,user.id);
});
passport.deserializeUser((id,done)=>{
  User.findById(id,(err,user)=>{
    done(err,user);
  })
});
passport.use(new GoogleStrategy({
        clientID:     process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3001/auth/google/dashboard",
        passReqToCallback   : true
     },
    function(request, accessToken, refreshToken, profile, done) {//set google username to include g before email to allow creation of another account with same email
      User.findOrCreate({ googleId: profile.id, name:profile.displayName, username:"g"+profile.email }, function (err, user) {
        return done(err, user);
      });
    }
  ));
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3001/auth/facebook/dashboard",
    profileFields:['email','displayName']
  },
  function(accessToken, refreshToken, profile, cb) {//set fb username to include f before email to allow creation of another account with same email
    console.log(profile);
    User.findOrCreate({ facebookId: profile.id,name:profile.displayName,username:"f"+profile.emails[0].value }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/user/:username",(req,res)=>{
  User.findOne({username:req.params.username},(err,doc)=>{
    if(err) console.log(err);
    else{
      if(doc){
        res.json(doc);
      }
    }
  })
})
app.get("/user",(req,res)=>{
  console.log(req.user);
  res.json(req.user);
})
app.get("/dashboard",(req,res)=>{
  if(req.isAuthenticated()){
    //console.log(req.user);
    if(req.user.googleId!=="" || req.user.facebookId!==""){
      res.redirect("http://localhost:3000/dashboard");
      return;
    }
    res.send("/dashboard")
  }
  else{
    res.send("failure")
  }
});
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));
app.get( '/auth/google/dashboard',
    passport.authenticate( 'google', {
        successRedirect: '/dashboard',
        failureRedirect: '/dashboard'
}));
app.get('/auth/facebook',
  passport.authenticate('facebook',{ scope: ['email'] }));

app.get('/auth/facebook/dashboard',
  passport.authenticate('facebook', { failureRedirect: '/dashboard' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });
app.post("/register",(req,res)=>{
  User.register({username:req.body.username},req.body.password,(err,user)=>{
    if(err){
      console.log(err);
      //redirect
      res.send("/Signup");
    }
    else{
      user.name=req.body.name;
      user.save();
      passport.authenticate("local")(req,res,()=>{
        //redirect to dashboar
        res.send("/dashboard");
      });
    }
  });
})
app.post("/login",(req,res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,(err)=>{
    if(err) console.log(err);
    else{
      let info;
      User.findOne({username:req.body.username},(err,doc)=>{
        if(err) console.log(err);
        else{
          info=doc;
          console.log(info);
        }
      })
      //If login fails, will be redirected to dashboard where they will see we are not authenticated, so failure will be sent by response.
      passport.authenticate("local",{failureRedirect:"/dashboard"})(req,res,()=>{
        //redirected
        console.log("we got in");
        return res.json({path:"/dashboard",name:info.name,stat:"success"});
      })
    }
  })
})
app.post("/logout",(req,res)=>{
  req.logout();
  res.clearCookie('connect.sid');
  res.json({path:"/"});
})
app.listen(port,function(req,res){
  console.log("Server has started on port 3000");
})
