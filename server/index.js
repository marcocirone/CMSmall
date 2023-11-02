"use strict";

const express = require("express");
const morgan = require("morgan");
const cors=require("cors");
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const dao = require("./functions");

const app = express();
const PORT = 3001;

app.use(express.static('public'));

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await dao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
  
  return callback(null, user); 
}));
  
  // serialize and de-serialize the user (user object <-> session)

passport.serializeUser((user, done) => {
  done(null, user);

});
  
// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((user, done) => {
  return done(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  
  return res.status(401).json({ error: 'Not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: "shhhhh... it's a secret",   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false 
}));

app.use(morgan("dev"))
app.use(express.json())
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
  };
app.use(cors(corsOptions));

app.use(passport.authenticate('session'));


//LogIn route
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        return res.status(200).json(req.user);
      });
  })(req, res, next);
});

//LogOut route
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

//Page APIs

//get only the pages who are published
app.get('/api/pubpages', //no need to check if the user is authenticated
  (req, res) => {
    dao.getPublishedPages().then(
      (pages) => res.status(200).json(pages)
    ).catch(
      (err) => res.status(500).json({error: "Database error during the retrieving of the pages"})
    );
  }
);

//get all the pages
app.get('/api/pages',
  isLoggedIn,
  (req, res) => {
    dao.getAllPages().then(
      (pages) => res.status(200).json(pages)
    ).catch(
      (err) => res.status(500).json({error: "Database error during the retrieving of the pages"})
    )
  }
);

//get the content of a specific page
app.get('/api/pages/:id',
  (req, res) => {
    dao.getPageContent(req.params.id).then(
      (blocks) => res.status(200).json(blocks)
    ).catch(
      (err) => res.status(500).json({error: "Couldn't retrieve the blocks of the page"})
    );
  }
);

//get the list of all the users, images and also the title
app.get('/api/settings',
  (req, res) => {
    let response;
    dao.getUsers().then((users) => {
        response = Object.assign({}, {users: users});
        dao.getImages().then((images) => {
          response = Object.assign(response, {images: images});
          dao.getTitle().then((title)=>{
            response = Object.assign(response, {title: title });
            res.status(200).json(response);
          }).catch((err)=>res.status(500).json({error: "Couldn't retrieve the title of the website"}));
        }).catch(
          (err) => res.status(500).json({error:"Couldn't retrieve the list of the images"})
        );
    }).catch(
      (err) => res.status(500).json({error: "Couldn't retrieve the users"})
    );
  }
);

//save a modified page
app.put('/api/page',
  isLoggedIn,
  async (req, res) => {
    dao.getPageInfo(req.body.page.id).then(async (page) => {
      if(page){
        if(req.user.role=='Admin' || req.user.id==page.author){
            await dao.savePageInfo(req.body.page).catch((err) => {res.status(500).json({error: "Couldn't update the page"})});
            await req.body.added.length>0 && await dao.saveAddedBlocks(req.body.added).catch((err) => {res.status(500).json({error: "Couldn't update the page"})});
            await req.body.updated.length>0 && await dao.saveUpdatedBlocks(req.body.updated).catch((err) => {res.status(500).json({error: "Couldn't update the page"})});
            await req.body.deleted.length>0 && await dao.deleteBlocks(req.body.deleted).catch((err) => {res.status(500).json({error: "Couldn't update the page"})});
            res.status(200).end();
        }
      }
      else{
        res.status(403).json({error: "You are not authorized"});
      }
    }).catch((err) => res.status(500).json({error: "Page not found"}));
  }
);

//add a new page
app.post('/api/page',
  isLoggedIn,
  async (req, res) => {
    if(req.user.role=='Admin' || req.user.name==req.body.page.author){
      if(req.body.added.filter((b) => b.type=='header').length!=0 && req.body.added.filter((b) => b.type!='header').length!=0){
        await dao.addPage(req.body.page).catch((err) => {res.status(500).json({error: "Couldn't insert the page"})});
        await req.body.added.length>0 && await dao.saveAddedBlocks(req.body.added).catch((err) => {res.status(500).json({error: "Couldn't insert the page"})});
        res.status(201).end();
      }
      else{
        res.status(422).json({error: "You need at least one header and one image/paragraph"});
      }
    }
    else{
      res.status(403).json({error: "You are not authorized"});
    }
  }
);

//delete an existing page 
app.delete('/api/page/:id',
  isLoggedIn,
  async (req, res) => {
    dao.getPageInfo(req.params.id).then(async (page) => {
      if(req.user.role=='Admin' || req.user.id==page.author){
        await dao.deletePageBlocks(req.params.id).catch((err) => {res.status(500).json({error: "Couldn't delete the page"})});
        await dao.deletePage(req.params.id).catch((err) => {res.status(500).json({error: "Couldn't delete the page"})});
        res.status(200).end();
      }
      else{
        res.status(401).json({error: "You are not authorized"});
      }
    }).catch((err) => res.status(500).json({error: "Page not found"}));
  }
);

//change the title of the page
app.put('/api/title',
  isLoggedIn,
  async(req, res) => {
    if(req.user.role=="Admin"){
      await dao.changeTitle(req.body.title).catch((err) => {return res.status(500).json({error: "Couldn't change the title"})});
      res.status(200).end();
    }
    else{
      res.status(401).json({error: "You are not authorized"});
    }
  }
);

app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));