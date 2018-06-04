var mongoose = require("mongoose");

// NEW SCHEMA CONSTRUCTOR
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  
  title: String,
  
  body: String
});

// CREATEOUR NOTE MODEL FROM SCHEMA
var Note = mongoose.model("Note", NoteSchema);

// EXPORT NOTE MODEL
module.exports = Note;
