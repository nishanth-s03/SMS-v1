const mongoose = require("mongoose");

//const uri = 'mongodb+srv://gdevadiga109:manish13572002@educluster.whqklcn.mongodb.net/?retryWrites=true&w=majority';
//mongoose.connect(uri);

mongoose.connect("mongodb://127.0.0.1:27017/school");

const cldSchema = mongoose.Schema({
    unqname: {
        type: String,
        required: true,
      },
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String, // Store the Cloudinary URL
      required: true,
    },
  });


const cldImage = mongoose.model('cldImage', cldSchema);

module.exports = cldImage;