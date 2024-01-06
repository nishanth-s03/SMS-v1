var express = require("express");
var router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const cldImage = require("./cloud");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: "dphaltxki",
  api_key: "377393196193456",
  api_secret: "IHX2RE4W8SXAc9VlHrWOt484cn0",
});


router.get("/view", (req, res) => {
  res.render("viewImages",images=[]);
});


router.get("/cldimg", (req, res) => {
  res.render("cldimg");
});

router.post("/cldimg", upload.single('image'), async (req, res) => {

  const name=req.body.name;
  const imageName = req.file.originalname;
  console.log(imageName);

  try {

    console.log(req.body);
    const result =  await cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

         // Create a new instance of the Mongoose model
         const newCldImage = new cldImage({
          unqname:name,
          name: imageName,
          imageUrl: result.secure_url,
        });

        // Save the instance to the database
        await newCldImage.save();

        res.json({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
    ).end(req.file.buffer);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/view", async (req, res) => {
  const unqname = req.body.search;

  try {
 
    if (!unqname) {
      return res.render("viewImages", { images: [], message: 'No search input provided' });
    }

    const images = await cldImage.find({ unqname: unqname });

    if (images.length === 0) {
      // Render the same page with a message
      return res.render("viewImages", { images: [], message: 'No results found for the search' });
    }

    res.render("viewImages", { images, message: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/student_dash", (req, res) => {
  res.render("student_dash");
});




module.exports = router;
