const mongoose = require("mongoose");

//const uri = 'mongodb+srv://gdevadiga109:manish13572002@educluster.whqklcn.mongodb.net/?retryWrites=true&w=majority';
//mongoose.connect(uri);

mongoose.connect("mongodb://127.0.0.1:27017/school");

const imgscheema = mongoose.Schema({
    data: {
        type: Buffer,  // Use Buffer for binary data (images)
        required: true,
      },
      contentType: {
        type: String,
        required: true,
      },
      imageName: {
        type: String,
        required: true,
      },
});


const Image = mongoose.model('Image',imgscheema);

module.exports = Image;