var mongoose = require("mongoose");

// VARIABLE FOR SCHEMA CONSTRUCTOR
var Schema = mongoose.Schema;

// NEW SCHEMA OBJECT
var ArticleSchema = new Schema({
  
  title: {
    type: String,
    required: true
  },
  
  link: {
    type: String,
    required: true
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// CREATE OUR MODEL FROM THE SCHEMA WITH MONGOOSE MODEL METHOD
var Article = mongoose.model("Article", ArticleSchema);

// EXPORT THE ARTICLE MODEL
module.exports = Article;
