var User = require('../models/user');
var config = require('../../config');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

//Must be outside module 
function createtoken(user){
  var token = jsonwebtoken.sign({
    _id: user.id,
    name: user.username
  }, superSecret, {
    expiresInMinutes: 1440
  });
  
  return token;
}

module.exports = function(app, express){
  var api = express.Router();
  
  api.post('/signup', function(req, res){
    var user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    });
    
    user.save(function(err){
      if(err){
        res.send(err);
        return;
      }
      
      res.json({message: 'User has been created'});
      
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
    ).select('password').exec(function(err, user){
      if(err) throw err;
      if(!user){
        res.send({message: "user does not exist"});
      } else if(user){
          var validPassword = user.comparedPassword(req.body.password);
            if(!validPassword){
              res.send({message: "Invalid Password"});
            }else{
              var token = createToken(user);
              res.json({
                success: true,
                message: "Successfully Logged In",
                token: token
              })
            }
      }
      
    });
    
  });
  
  return api;
}