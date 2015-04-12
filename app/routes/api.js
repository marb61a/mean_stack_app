var User = require('../models/user');
var config = require('../../config');
var Story = require('../models/story');
var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');


//Must be outside module 
function createtoken(user){
  var token = jsonwebtoken.sign({
    id: user._id,
    name: user.name,
    username: user.username
  }, secretKey, {
    expiresInMinutes: 1440
  }); 
  return token;
}

module.exports = function(app, express, io){
  var api = express.Router();
  api.get('/all_stories', function(req, res){
    Story.find({}, function(err, stories){
      if(err){
        res.send(err);
        return;
      }
      res.json(stories);
    });
  });
  
  api.post('/signup', function(req, res){
    var user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    });
    
    var token = createToken(user);
    
    user.save(function(err){
      if(err){
        res.send(err);
        return;
      }
      
      res.json({
        success: true,
        message: 'User has been created',
        token: token
      });      
    });   
  });
 
  api.get('users', function(req, res){
    User.find({}, function(err, users){
      if(err){
        res.send(err);
        return;
      }
      
      res.json(users);
      
    });
  });
  
  api.post('/login', function(req, res){
    User.findOne(
      {
      username: req.body.username
      }
    ).select('name username password').exec(function(err, user){
      if(err) throw err;
      if(!user){
        res.send({message: "user does not exist"});
      } else if(user){
          var validPassword = user.comparePassword(req.body.password);
            if(!validPassword){
              res.send({message: "Invalid Password"});
            }else{
              var token = createToken(user);
              res.json({
                success: true,
                message: "Successfully Logged In",
                token: token
              });
            }
      }
      
    });
    
  });
 
  api.use(function(req, res, next){
    console.log("Somebody visited our app");
    var token = req.body.token || req.param("token") || req.headers['x-access-token'];
    
    // Check for token existence
    if(token){
      jsonwebtoken.verify(token, secretKey, function(err, decoded){
        if(err){
          res.status(403).send({success: false, message: "Failed to Authenticate"});
        }else{
          req.decoded = decoded;
          next();
        }        
      });     
    }else {
      res.status(403).send({success: false, message: "No Token Provided"})
    }
    
  });
  
  // Destination when legitimate token is provided
 api.route('/')
   .post(function(req, res){
     var story = new story({
       creator : req.decoded.id,
       content: req.body.content      
     });
   
   story.save(function(err, newStory){
     if(err){
       res.send(err);
       return;
   }
     io.emit('story', newStory);
     
     res.json({
       message: "New Story Created"
     });
   
   });
 }) 
    
  .get(function(req, res){
    Story.find({ creator: req.decoded.id,}, function(err, stories){
      if(err){
       res.send(err);
       return;
       }
      res.send(stories);      
    });    
  });
  
  // fetches user login data to be used on frontend
  api.get('/me', function(req,res){
    res.send(req.decoded);
  });  
  return api;
}

