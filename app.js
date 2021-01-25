//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose= require('mongoose');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology:true});

  // **************** tourist_spots collection **********************// 

const spotSchema= new mongoose.Schema(
  {
      name: String,
      desc: String,
      img_url: String
  });
  const Spot= mongoose.model("Spot", spotSchema);

  // **************** hotel details collection **********************// 

 const DetailSchema = new mongoose.Schema({
    h_id: Number,
    h_details:{
    facilities : String,
    hotel_type: String,
    img1: String,
    img2: String,
    img3: String
  },
  locations: {
    loc1: String,
    loc2: String,
    loc3: String,
    loc4: String
  }
});

const Detail = mongoose.model("Detail", DetailSchema);

  // **************** contact details collection **********************// 

const ContactSchema = new mongoose.Schema({
    phno: String,
    email : String,
    website : String,
    address: String
  });


const Contact = mongoose.model("Contact", ContactSchema);


  // **************** hotel  collection **********************// 

const HotelSchema =new mongoose.Schema({
  _id : Number,
  h_name: String,
  price: Number,
  rating: Number,
  loc: String,
  img_url: String,
  contact_details: ContactSchema,
  hotel_details : DetailSchema
 });



 const Hotel = mongoose.model("Hotel", HotelSchema);
 
// **************** reservation  collection **********************//

const reservationSchema = new mongoose.Schema({
  hotel_name : String,
  firstname : String,
  lastname : String,
  phone : String,
  email : String,
  date : Date,
  nights : Number,
  rooms: Number,
  adults : Number,
  children : Number
});

const Reservation = mongoose.model("Reservation", reservationSchema);


//***********************************************************************************************//
 
Hotel.aggregate([
      { 
          "$lookup" : {
              "from" : "details", 
              "localField" : "_id", 
              "foreignField" : "h_id", 
              "as" : "_id"
          }
      },
      {
        "$lookup" : {
          "from" : "contact_details", 
          "localField" : "_id", 
          "foreignField" : "h_id", 
          "as" : "_id"
      }
    }
  ]
);

//******************************************************************************************************************//

 app.get("/", function(req,res)
 {
     res.render("home");
 });


app.get("/create", function(req, res){
  res.render("create");
});

app.post("/create", function(req, res)
{
    const spot = new Spot
    ({
        name: req.body.spotName,
        desc: req.body.spotDesc,
        img_url: req.body.spotImg
    });
            
    spot.save(function(err)
    {
        if (!err){
            res.redirect("/places");
       }
    });
});

 
app.get("/places", function(req, res){
  Spot.find({},function(err, spots)
  {
      res.render("places",
      {
          spots: spots
      });
  })
});

app.post("/delete", function(req,res){
  const deletedspotId = req.body.submit;
  Spot.findByIdAndRemove(deletedspotId, function(err){
    if(!err){
      console.log("successfully deleted spot"); 
      setTimeout(function(){res.redirect("/places");},2000);
     
    }
  });
});

//************************************ HOTELS ********************************************// 


app.get("/hotels", function(req, res){
  Hotel.find({},function(err,items){
      res.render("hotel",{newitems: items}) 
      });
    });


app.get("/contact", function(req, res){
  res.render("contact");
});

//*****************************  DETAILS  ************************************//
 
app.route('/details/:hid')

 .get(/* "/details/:hname",*/function(req,res){
  const requestedhid = req.params.hid;
  Hotel.findOne({_id: requestedhid},function(err,founditems)
  {
   res.render("detail", { items : founditems,
    cdets : founditems.contact_details,
    ldets :  founditems.hotel_details.locations,
    deets : founditems.hotel_details.h_details
   })
  });
});
 
//*****************************  UPDATE  ************************************//

app.route('/update/:hid')

.get(function(req,res){
    const requestedhid = req.params.hid;
    res.render("update",{hid:requestedhid});
})


app.post("/update/:hid", function(req,res){
  Hotel.findByIdAndUpdate({_id: req.params.hid},{"rating": req.body.update_rating,
  "price": req.body.update_price,
  "hotel_details.h_details.facilities": req.body.update_facilities, 
  "contact_details.phno":req.body.update_phno}, function(err, result){
    
      if(err){
          res.redirect("/update/:hid")
      }
      else{
       
        setTimeout(function(){res.redirect("/hotels");},3000);
      }
    }) 
  })  

//*****************************  DELETE  ************************************//

 app.post("/delete", function(req,res){
   const deletedHotelId = req.body.submit;
   Hotel.findByIdAndRemove(deletedHotelId, function(err){
     if(!err){
       console.log("successfully deleted hotel"); 
       setTimeout(function(){res.redirect("/hotels");},1500);
     }
   });
 }); 
  
//*****************************  RESERVATION  ************************************// 

app.route('/reservation/:hname')

.get(/* "/update/:hid", */ function(req,res){
  const requestedhname = req.params.hname;
  res.render("reservation",{hname:requestedhname});
})

.post(function(req, res)
{
    const reserve = new Reservation
    ({
      hotel_name : req.params.hname,
      firstname : req.body.firstname,
      lastname : req.body.lastname,
      phone : req.body.phone,
      email : req.body.email,
      date : req.body.date,
      nights : req.body.nights,
      rooms: req.body.rooms,
      adults : req.body.adults,
      children : req.body.children
    });
            
    reserve.save(function(err)
    {
        if (!err){
            console.log("Data is: "+ reserve);
            res.redirect("/allreservations");
        }
    });
  
});


app.get("/allreservations", function(req, res){
  Reservation.find({},function(err, displays)
  {
      res.render("allreservations",
      {
         displays : displays
      });
  })
});

 app.listen(3000, function() {
  console.log("Server started on port 3000");
}); 
