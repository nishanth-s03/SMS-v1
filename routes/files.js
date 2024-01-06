const mongoose=require("mongoose");

//const uri = 'mongodb+srv://gdevadiga109:manish13572002@educluster.whqklcn.mongodb.net/?retryWrites=true&w=majority';
//mongoose.connect(uri);


mongoose.connect("mongodb://127.0.0.1:27017/school");

//File Schema
   const fileSchema = mongoose.Schema({
      filename: String,
      contentType: String,
      size: Number,
      uploadDate: { type: Date, default: Date.now },
      data: Buffer,
    });
    
    const File = mongoose.model('File', fileSchema);

    module.exports=File;