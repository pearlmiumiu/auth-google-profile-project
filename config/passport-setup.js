const passport=require('passport')
const GoogleStrategy=require('passport-google-oauth20').Strategy
const keys=require('./keys')
const User=require('../models/user-model')

passport.serializeUser((user, done)=>{
	//user id is the thing we sent to next stage
	//cram it into cookie and send it to brower
	//when brower know who it is, send back cook, so we know who that is. we authenticate them using that info
	done(null, user.id) //null is error. pass done method with id, and store id into cookie
})


//when the cookie come from brower, take the id and find the user
passport.deserializeUser((id, done)=>{ //id is the mongdb id, come from the cookie with done method on serialize func
	//when we have the id, we go to db to find who that user is by the id we get from broswer
	User.findById(id).then((user)=>{
		done(null, user)  //after we find the user, we pass the user to next stage
	})

})
passport.use(

	new GoogleStrategy({
       // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
  },(accessToken, refreshToken, profile, done)=>{ //profile is the passport authen to get code from google and bring back profile info
  	                                          //done : we need to know when the callback is done
  	//passport callback function
  	//check if user already exist in our database
  	User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });

  			}
  	})

  	
  	//console.log(profile)


 })
)