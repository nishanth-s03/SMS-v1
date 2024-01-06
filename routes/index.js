var express = require("express");
var router = express.Router();



const multer = require("multer");
// Configure multer with memory storage
const storage = multer.memoryStorage();
//stores data in RAM of the server not in disk..
// Create multer instance with memory storage
const upload = multer({ storage: storage }); //this upload instance of mutler is used inside the route as middleware...
//const userModel=require("./users");  //to import the schema and the model from users.js file
//const File  = require('./users');
const Students=require("./student");

const Staffs = require("./staff");
const Files = require("./files");
const Image = require("./images");
const bcrypt = require('bcrypt');
const sendEmailsController = require("../controllers/mail");


var path = require("path");
var ejs=require("ejs");
const puppeteer = require('puppeteer');
var fs = require('fs');


// const { MongooseError } = require("mongoose");
// const {print} = require('../controllers/mail');

// router.get("/certificate", function (req, res, next) {
//   res.render("certificate");
// });


//basic authentication to check wheyher the user is logged in...
const isAuthenticated = (req, res, next) => {
  // Check if the user is authenticated
  if (req.session && req.session.userId) {
    // User is authenticated, proceed to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, redirect to the login page or another appropriate action
    res.redirect('/login'); // Adjust the route based on your application's structure
  }
};

const checkUserRole = (req, res, next) => {
  const userRole = req.session.role;
  if (userRole == 'student') {
    next();
  } else {
    res.redirect('/login'); 
  }
};



router.get('/time_table', (req, res) => {
  res.render('time_table');
});

router.get('/search', (req, res) => {
  res.render('search_user', { data: [] });
});


router.post('/search', async (req, res) => {
  const searchTerm = req.body.searchTerm;

  try {
    // Perform the search based on your model and criteria
    const searchData = await Students.find({ fname: { $regex: searchTerm, $options: 'i' } });
    console.log(searchData);

    res.render('search_user', { data: searchData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get("/stu_dashboard", function (req, res, next) {
  res.render("stu_dashboard");
});



router.get("/imgupload", function (req, res, next) {
  res.render("image");
});

router.post("/imgupload", upload.single("attachment"),async function (req, res, next) {
  try {
    // Check if a file was provided in the request
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Create a new Image document in MongoDB
    const image = new Image({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      imageName: req.file.originalname,
    });

    // Save the image to the database
    await image.save();

    // Log the uploaded file details
    console.log('File uploaded:', req.file.originalname);

    // Redirect or send a response as needed
    res.send("file uploaded");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to retrieve image data by name
router.get('/image/:name', async function (req, res, next) {
  try {
    const image = await Image.findOne({ imageName: req.params.name });

    if (!image) {
      return res.status(404).send('Image not found');
    }

    // Set the content type based on the image's contentType
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});




router.get("/home", function (req, res, next) {
  console.log(req.session.id);
  res.render("home");
});

router.get("/dummy_dashboard", function (req, res) {
  res.render("dummy_dashboard");
});




router.get("/add_form", function (req, res, next) {
  console.log(req.session.id);
  res.render("addmission_form");
});


router.post("/add_form", async function (req, res, next) {
  console.log(req.session.id);
  let formData = req.body;

 const {firstname,lastname,fathername,mothername,birthday,email,gender,phonenumber,religion,nationality,presentaddress,permanentaddress,usn,branch,feesState,feespaid,feesdue,selecteddate}=req.body;

console.log(firstname,lastname,fathername,mothername,birthday,email,gender,phonenumber,religion,nationality,presentaddress,permanentaddress,usn,branch,feesState,feespaid,feesdue,selecteddate);

  try {

    const newStd = new Students({
      fname:firstname,
      lname:lastname,
      fatherName:fathername,
      motherName:mothername,
      dob:birthday,
      email:email,
      gender:gender,
      phone:phonenumber,
      religion:religion,
      nationality:nationality,
      presentAddress:presentaddress,
      permanentAddress:permanentaddress,
      usn:usn,
      branch:branch,
      feesState:feesState,
      feespaid:feespaid,
      feesdue:feesdue,
      selecteddate:selecteddate,
    });

    // Save the newStd instance to the database
    const createdUser = await newStd.save();

    res.send("New Student Added successfully... ");
  } catch (err) {
    console.log(err);
    res.render("addmission_form");
  }

});






router.get('/certificate_generate', function (req, res, next) {
  res.render("demo");
});

router.get('/loadContent', (req, res) => {
  const category = req.query.category;
  res.render(`partials/${category}`, {}, (err, html) => {
      if (err) {
          res.status(500).send('Error loading content');
      } else {
          res.send(html);
      }
  });
});


router.post('/certificate_generate', async (req, res) => {

  console.log(req.body);

  const {additionalData} = req.body;

  if(additionalData=="sports")
  {
    var {name ,date ,signature, event}=req.body;
    var templatePath = path.join(__dirname, '../views/certificates/sports_crtf.ejs');
  }
  else if(additionalData=="general")
  {
    var {name ,date , event}=req.body;
    var templatePath = path.join(__dirname, '../views/certificates/general_crtf.ejs');
  }
  else{
    var {name ,date ,USN,signature, event}=req.body;
    var templatePath = path.join(__dirname, '../views/certificates/edu_crtf.ejs');
  }

  try {
    
      // Read the EJS template
      const template = fs.readFileSync(templatePath, 'utf8');

      // User-submitted data (this could come from a form submission)
      const userData = {
          name: name,
          date: date,
          signature: signature,
          event:event,
          USN:USN
      };

      // Render EJS template with user data
      const html = ejs.render(template, userData);

      // Use Puppeteer to generate PDF
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.emulateMediaType('screen');
      await page.setContent(html,{ waitUntil: 'networkidle0' });
      // await page.waitForSelector('#some-styled-element');
      // await page.screenshot({ path: 'screenshot.png', fullPage: true });
      // await page.setViewport({ width: 1000, height: 1200 });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground:true , landscape: true});
      // await page.pdf({ width: '1000px', height: '1200px' });

      await browser.close();

      // Send the PDF as a response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename = certificate.pdf');
      res.send(pdfBuffer);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});


router.get("/register", function (req, res, next) {
  console.log(req.session.id);
  res.render("register", {
    errorMessage: 0,
  });
});

router.post("/register", async function (req, res, next) {
  console.log(req.body);
  const { name, email, password } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(password, 10);
    // Use the new keyword to create a new Student instance
    const newStaff = new Staffs({
      name: name,
      email: email,
      password: hashedPassword,
    });

    // Save the newStudent instance to the database
    const createdUser = await newStaff.save();

    res.redirect("/staff_login");
  } catch (err) {
    console.log(err);
    res.render("register", {
      errorMessage:
      "User creation encountered an issue. <br> Please verify credentials.",
    });
  }
});

router.get("/card", function (req, res) {
  console.log(req.session.id);
  res.render("card");
});





router.get("/stu_login", function (req, res) {
  console.log(req.session.id);
  res.render("stu_login", {
    errorMessage: 0,
  });
});


router.post("/stu_login", async function (req, res) {
  const { usn,dob} = req.body;
  console.log(usn,dob);

  if (!usn || !dob) {
    res.render("stu_login", {
      errorMessage: "Please enter both USN and DOB.",
    });
    return;
  }

  try {

    const user = await Students.findOne({ usn,dob });  //.findOne({ $or: [ { usn }, { dob } ] })
    if (!user) {
      res.render("stu_login", {
        errorMessage: "Invalid USN or DOB. Please try again.",
      });
      }
  else{
    req.session.userId = user._id;
    req.session.role = user.role;
    console.log(req.session.role);
    res.redirect('/dummy/student_dash'); // Redirect to the dashboard or any other authenticated route
    } 
  } catch (err) {
    
    console.log(err);
    res.render("stu_login", {
      errorMessage:
      "User creation encountered an issue. <br> Please verify credentials.",
    }); 
  }
});




router.get("/staff_login", function (req, res) {
  console.log(req.session.id);
  res.render("staff_login", {
    errorMessage: 0,
  });
});



router.post("/staff_login", async function (req, res) {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await Staffs.findOne({ email });

    if (user) {
      // Compare the entered password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Passwords match, authentication successful
        req.session.userId = user._id;
        req.session.role = user.role;
        console.log(req.session.role);
        res.redirect('/dashboard'); // Redirect to the dashboard or any other authenticated route
      } else {
        // Passwords do not match
        res.render("staff_login", {
          errorMessage: "Invalid email or password. Please try again.",
        });
      }
    } else {
      // User not found
      res.render("staff_login", {
        errorMessage: "User not found. Please check your email or register.",
      });
    }
  } catch (error) {
    // Handle other errors
    console.error(error);
    res.render("login", {
      errorMessage: "An error occurred. Please try again later.",
    });
  }
});



router.get("/read", async function (req, res, next) {
  console.log(req.session.userId);
  console.log(req.session.id);
  const allusers = await Student.find();
  console.log(req.session.userId);
  res.send(allusers);
});


router.get("/std_data", async function (req, res, next) {
  try{
    const students = await Students.find();
    console.log(students);
    res.render('read_std', {students}); 
  }catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get("/api/std_data", async function (req, res, next) {
  try{
    const students = await Students.find();
    console.log(students);
    res.send(students); 
  }catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get("/get_data", async function (req, res, next) {
  try{
    const allusers = await Staffs.find();
    console.log(allusers);
    res.render('read_data', {allusers}); 
  }catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get("/logout", function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("session destroyed");
    }
  });
  res.render("register", {
    errorMessage: 0,
  });
});

router.get("/readone", async function (req, res, next) {
  const oneuser = await Student.findOne({ name: "Manish" });
  res.send(oneuser);
});


router.post("/delete", async function (req, res, next) {
  // const name = req.query.name;
  const name = req.body.name;
  console.log(name);
  
  const dltusers = await Staffs.findOneAndDelete({ name: name });
  res.send(dltusers);
});



router.post("/update", async function (req, res, next) {
  // const name = req.query.name;
  const name = req.body.name;
  const email = req.body.email;
  const role = req.body.role;
  console.log(name);
  console.log(email);
  console.log(role);

  const updatedStudent = await Staffs.updateOne({ name: name }, {  $set: {
    skills: "Express.js",
    name: name,
    email: email,
    role: role,
  } });

  res.send(updatedStudent);
});




router.get("/sendEmail", function (req, res) {
  res.render("Emform");
});

router.post("/sendEmail", upload.single("attachment"), sendEmailsController);

//this route should be mentioned at last or else even if we write specific route which is after this route /:username  will not run...
router.get("/:username", function (req, res) {
  const username = req.params.username;
  res.send("Hello this is profile page of  " + username);
});

module.exports = router; 
