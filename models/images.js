var mongoose    = require("mongoose");

var imagesSchema = mongoose.Schema({
    text: String,
});

module.exports = mongoose.model("Image", imagesSchema);
