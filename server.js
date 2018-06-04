// SET UP DEPENDENCIES
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// REQUIRE MODELS
var db = require("./models");
// CONNECTION ON SERVER AND FOR HEROKU
var PORT = process.env.PORT || 3000;

// INTITIALIZE EXPRESS
var app = express();



// USE MORGAN LOGGER TO VISUALIZE REQUEST ON CONSOLE
app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// CONNECT TO Mongo DB
let mongoConnect = process.env.MONGODB_URI ||"mongodb://localhost/articles"
mongoose.connect(mongoConnect);
mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://localhost/articles");

// =====ROUTES

// A GET ROUTE FOR SCRAPING website
app.get("/scrape", function(req, res) {
  // GRAB BODY OF WEBSITE HTML WITH AXIOS
  axios.get("http://www.foxnews.com/").then(function(response) {
    // LOAD BODY INTO TO CHEERIO WITH $ SELECTOR
    var $ = cheerio.load(response.data);

    // GRABBING EVERY H2 TAG WITH A CLASS TITLE
    $("h2.title").each(function(i, element) {
      // DECLARING RESULT VARIABLE
      var result = {};

      // SAVING TITLE TEXT AND LINK AND ADDING AS PROPERTIES OF THE OBJECT
  
      result.title = $(this)
        .children()
        .text();
      result.link = $(this)
        .children()
        .attr("href");

      // CLEARS PREVIOUS SCRAPE
      db.Article.remove({})
      // CREATES A NEW ARTICLE IN MONGO FROM THE RESULT VARIABLE
      db.Article.create(result)
        .then(function(dbArticle) {
          // VIEW THE ADDED RESULT IN THE CONSOLE
          console.log(dbArticle);
        })
        .catch(function(err) {
          // IF ERROR, SEND TO CLIENT
          return res.json(err);
        });
    });

    // IF SCRAPE A SUCCESS SEND TO CLIENT
    res.send("Scrape Complete");
  });
});

// ROUTE FOR GETTING ARTICLES FROM DATABASE
app.get("/articles", function(req, res) {
  // GRABS ALL IN ARTICLES COLLECTION
  db.Article.find({})
    .then(function(dbArticle) {
      // SEND ARTICLES GRABBED BACK TO CLIENT
      res.json(dbArticle);
    })
    .catch(function(err) {
      // IF ERROR, SEND TO CLIENT
      res.json(err);
    });
});

// ROUTE FOR GRABBING SPECIFIC ARTICLE AND ITS NOTE
app.get("/articles/:id", function(req, res) {
  // GRAB ARTICLE BY ID FROM PARAMETER
  db.Article.findOne({ _id: req.params.id })
    // POPULATE NOTES ASSOCIATED WITH IT
    .populate("note")
    .then(function(dbArticle) {
      // SEND DATA TO CLIENT
      res.json(dbArticle);
    })
    .catch(function(err) {
      // IF ERROR, SEND TO CLIENT
      res.json(err);
    });
});

// ROUTE FOR UPDATING AN ARTICLES NOTE
app.post("/articles/:id", function(req, res) {
  // CREATE A NEW NOTE AND PASS TO ENTRY
  db.Note.create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
  
      res.json(dbArticle);
    })
    .catch(function(err) {
  // IF ERROR, SEND TO CLIENT
      res.json(err);
    });
});

// START THE SERVER
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
