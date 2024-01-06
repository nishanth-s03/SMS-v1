const mongoose = require("mongoose");



//const uri = 'mongodb+srv://gdevadiga109:manish13572002@educluster.whqklcn.mongodb.net/?retryWrites=true&w=majority';
//mongoose.connect(uri);

mongoose.connect("mongodb://127.0.0.1:27017/school");

const staffscheema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    // Add a custom validation for email format using a regular expression
    match: [/\S+@gmail\.com$/, "Please enter a valid Gmail address"],
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
  },
  role: {
    type: String,
    default: "Staff",
  },
  skills:{
    type:String,
    default:"abcdef"
  }
});

const Staffs = mongoose.model("Staffs", staffscheema);

// Export each schema and model individually
module.exports = Staffs;
