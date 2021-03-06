var express = require("express");
var router = express.Router(); //a new instance of express router and adding routes to this router.
var Campground = require("../models/campground");
var Image = require("../models/images");
var middleware = require("../middleware");

//INDEX ROUTE - show all campgrounds
router.get("/", function(req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if (err) {
            console.log(err);
        } else {
             res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user}); //data + name passing in
        }
    });
});


//CREATE - add new campgrounds to database
router.post("/", middleware.isLoggedIn, function (req, res){
    // get data from form and add to campgrounds array
    var name= req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, image: image, description: desc, author:author};
   //create a new campground and save to db
   Campground.create(newCampground, function(err, newlyCreated){
      if (err) {
          console.log(err);
      } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
          res.redirect("/campgrounds"); //
      }
   });
});


//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});


//SHOW - shows more info about campground selected - to be declared after NEW to not overwrite
router.get("/:id", function(req, res){
    //find the campground with the provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if (err) {
           console.log(err);
       } else {
            //render show template with that campground
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res){
       Campground.findById(req.params.id, function(err, foundCampground){
          res.render("campgrounds/edit", {campground: foundCampground});
    });
});


//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   //find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds/" + req.params.id);
      }
   });
   //redirect to show page
});


//DESTROY CAMPGROUND ROUTE

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
             }
    });
});

//ADD IMAGE ROUTE
router.get("/:id/add_img", middleware.checkCampgroundOwnership, function (req, res){
       Campground.findById(req.params.id, function(err, foundCampground){
          res.render("campgrounds/add_img", {campground: foundCampground});
    });
});

//ADD IMAGE POST
router.post("/:id/add_img", middleware.checkCampgroundOwnership, function (req, res){
        Campground.findById(req.params.id, function(err, foundCampground){
          if(err) console.log(err);

          foundCampground.images.push(req.body.campground.image);
          foundCampground.save(function(err,img){
              if(err)   console.log(err);

              console.log(foundCampground);
            });
        });
        res.redirect("/campgrounds/" + req.params.id);
});



module.exports = router; //returning/exporting router at the end
