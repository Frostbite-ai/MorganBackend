//jshint esversion:6
require("dotenv").config();
const express = require("express")
const router = express.Router()
const { v4: uuidv4 } = require('uuid');
const User=require("../models/User");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const authorizeUser=require("../middleware/userAuth");
const authorizeAdmin=require("../middleware/adminAuth");

// registeration done by the userItself !! it is that route 
router.post("/register/byUser", (req, res) => {
  const {
    pwd,
    basicDetails: {
      name,
      age,
      gender,
      PhoneNumber,
      address: { address1, state, city, zip },
      Community,
      familyDetails: { numOfChild, maritalStatus, income, dependents },
      primaryLanguage
    },
    educationStatus: { currentEducationLevel, ongoingEducation, furtherStudyInterest },
    employmentStatus: { currentEmployment, workNature, workIndustry, prevEmployment, openForEmployment },
    SocioeconomicStatus: { cleanWaterAccess, electricityAccess, housingType, transportationAccess },
    medicalRecords: { hospitalizationRecords, chronicIllnesses, currentMedications, bloodGroup, allergies, vaccinationRecords, healthInsurance },
    govtSchemes: { rationCard, aadharCard, esharamCard, panCard, voterId }
  } = req.body;

  const _id = uuidv4();
  
  const saltRounds = 10;
      bcrypt.hash(pwd, saltRounds, function(err, hash){
                const currentUser =new User({
            pwd:hash,
            _id,
            basicDetails: {
              name,
              age,
              gender,
              PhoneNumber,
              address: {
                address1,
                state,
                city,
                zip
              },
              Community,
              familyDetails: {
                numOfChild,
                maritalStatus,
                income,
                dependents
              },
              primaryLanguage
            },
            educationStatus: {
              currentEducationLevel,
              ongoingEducation,
              furtherStudyInterest
            },
            employmentStatus: {
              currentEmployment,
              workNature,
              workIndustry,
              prevEmployment,
              openForEmployment
            },
            SocioeconomicStatus: {
              cleanWaterAccess,
              electricityAccess,
              housingType,
              transportationAccess
            },
            medicalRecords: {
              hospitalizationRecords,
              chronicIllnesses,
              currentMedications,
              bloodGroup,
              allergies,
              vaccinationRecords,
              healthInsurance
            },
            govtSchemes: {
              rationCard,
              aadharCard,
              esharamCard,
              panCard,
              voterId
            }
          });

          User.insertMany([currentUser], function (err) {
            if (err) {
              res.status(500).json({ message: err.message })
            } else {
              const user={_id:_id,role:"User"}; 
              const accessToken=jwt.sign(user,process.env.SECRET_KEY);
              res.status(200).json({accessToken:accessToken});
            }
          })

      });

})

// registeration done by admin !! it is that route 
router.post("/register/byAdmin",authorizeAdmin,(req, res) => {
  const {
    pwd,
    basicDetails: {
      name,
      age,
      gender,
      PhoneNumber,
      address: { address1, state, city, zip },
      Community,
      familyDetails: { numOfChild, maritalStatus, income, dependents },
      primaryLanguage
    },
    educationStatus: { currentEducationLevel, ongoingEducation, furtherStudyInterest },
    employmentStatus: { currentEmployment, workNature, workIndustry, prevEmployment, openForEmployment },
    SocioeconomicStatus: { cleanWaterAccess, electricityAccess, housingType, transportationAccess },
    medicalRecords: { hospitalizationRecords, chronicIllnesses, currentMedications, bloodGroup, allergies, vaccinationRecords, healthInsurance },
    govtSchemes: { rationCard, aadharCard, esharamCard, panCard, voterId }
  } = req.body;

  const _id = uuidv4();
  
  const saltRounds = 10;
      bcrypt.hash(pwd, saltRounds, function(err, hash){
                const currentUser =new User({
            pwd:hash,
            _id,
            basicDetails: {
              name,
              age,
              gender,
              PhoneNumber,
              address: {
                address1,
                state,
                city,
                zip
              },
              Community,
              familyDetails: {
                numOfChild,
                maritalStatus,
                income,
                dependents
              },
              primaryLanguage
            },
            educationStatus: {
              currentEducationLevel,
              ongoingEducation,
              furtherStudyInterest
            },
            employmentStatus: {
              currentEmployment,
              workNature,
              workIndustry,
              prevEmployment,
              openForEmployment
            },
            SocioeconomicStatus: {
              cleanWaterAccess,
              electricityAccess,
              housingType,
              transportationAccess
            },
            medicalRecords: {
              hospitalizationRecords,
              chronicIllnesses,
              currentMedications,
              bloodGroup,
              allergies,
              vaccinationRecords,
              healthInsurance
            },
            govtSchemes: {
              rationCard,
              aadharCard,
              esharamCard,
              panCard,
              voterId
            }
          });

          User.insertMany([currentUser], function (err) {
            if (err) {
              res.status(500).json({ message: err.message })
            } else {
              res.status(200).json({message:"Success"});
            }
          })

      });

})

// login route !! { WE HAVE TAKEN CARE OF THE FACT THAT MULTIPLE 
// PEOPLE CAN HAVE SAME NAME BUT PWD WILL BE UNIQUE }
router.post("/login", async (req, res) => {
  const { name, pwd } = req.body;
  try {
    const results = await User.find({ 'basicDetails.name': name });

    if (results.length === 0) {
      return res.status(500).json({ message: "NO ENTRY FOUND !!!" });
    }

    let userFound = false;

    for (const result of results) {
      const storedHashedPassword = result.pwd;
      const passwordMatch = await bcrypt.compare(pwd, storedHashedPassword);

      if (passwordMatch) {
        const user = { _id: result._id, role: "User" };
        const accessToken = jwt.sign(user, process.env.SECRET_KEY);
        return res.status(200).json({ accessToken: accessToken });
      }
    }

    res.status(500).json({ message: "INVALID CREDENTIALS !!!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// get all users list !!
router.get("/",authorizeAdmin, async (req, res) => {
  try {
    const result = await User.find({})
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// filter user by Community
router.get("/filter/community",authorizeAdmin, async (req, res) => {
  try {
    const community = req.body.community;
    const result = await User.find({ "basicDetails.Community": community })
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// filter user by age
router.get("/filter/age",authorizeAdmin,async (req, res) => {
  try {
    const age = req.body.age;
    const result = await User.find({ "basicDetails.age": age })
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// filter user by name 
router.get("/filter/name",authorizeAdmin,async (req, res) => {
  try {
    const name = req.body.name;
    const result = await User.find({ "basicDetails.name": name })
      // UserDetails
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(401).json({ message: "User Not Found !!" })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// filter user by phoneNumber
router.get("/filter/phoneNumber",authorizeAdmin,async (req, res) => {
  try {
    const PhoneNumber = req.body.phoneNumber;
    const result = await User.find({ "basicDetails.PhoneNumber": PhoneNumber })
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});


// GROUPING : 

// group by education levels
router.get("/group/education",authorizeAdmin,async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData3(users)
      res.status(200).json({ result: result })
      // using the result property of the json object returned we can
      // have that object send as prop to the component of chart.js
    } else {
      res.status(200).json({ result: {} })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const processData3 = (users) => {
  const educationGroups = {}

  // Categorize users by age
  users.forEach((user) => {
    const education = user.educationStatus.currentEducationLevel

    // Check if the age group exists, if not create it
    if (!educationGroups[education]) {
      educationGroups[education] = []
    }

    // Add the user to the respective age group
    educationGroups[education].push(user)
  })

  // console.log(ageGroups);

  return (educationGroups);
}

// group by age 
router.get("/group/age",authorizeAdmin,async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData(users)
      res.status(200).json({ result: result })
      // using the result property of the json object returned we can
      // have that object send as prop to the component of chart.js
    } else {
      res.status(200).json({ result: {} })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const processData = (users) => {
  const ageGroups = {}

  // Categorize users by age
  users.forEach((user) => {
    const age = user.basicDetails.age

    // Check if the age group exists, if not create it
    if (!ageGroups[age]) {
      ageGroups[age] = []
    }

    // Add the user to the respective age group
    ageGroups[age].push(user)
  })

  // console.log(ageGroups);

  return (ageGroups);
}


// group by community 
router.get("/group/community",authorizeAdmin,async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData2(users)
      res.status(200).json({ result: result })
      // using the result property of the json object returned we can
      // have that object send as prop to the component of chart.js
    } else {
      res.status(200).json({ result: {} })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const processData2 = (users) => {
  const communityGroups = {}

  // Categorize users by age
  users.forEach((user) => {
    const community = user.basicDetails.Community

    // Check if the age group exists, if not create it
    if (!communityGroups[community]) {
      communityGroups[community] = []
    }

    // Add the user to the respective age group
    communityGroups[community].push(user)
  })

  // console.log(ageGroups);

  return (communityGroups);
}


// group by gender 
router.get("/group/gender",authorizeAdmin,async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData4(users)
      res.status(200).json({ result: result })
      // using the result property of the json object returned we can
      // have that object send as prop to the component of chart.js
    } else {
      res.status(200).json({ result: {} })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const processData4 = (users) => {
  const genderGroups = {}

  // Categorize users by age
  users.forEach((user) => {
    const gender = user.basicDetails.gender

    // Check if the age group exists, if not create it
    if (!genderGroups[gender]) {
      genderGroups[gender] = []
    }

    // Add the user to the respective age group
    genderGroups[gender].push(user)
  })

  // console.log(ageGroups);

  return (genderGroups);
}


// update user's info !! { SEE IT PROPERLY !! }
// router.put("/update/:name", async (req, res) => {
//   try {
//     const name = req.params.name
//     const updatedData = req.body

//     const updatedUser = await User.findOneAndUpdate(
//       { "basicDetails.Name": name },
//       updatedData,
//       { new: true }
//     )
//     if (!updatedUser) {
//       res.status(404).json({ error: "User not found" })
//     } else {
//       res.status(200).json(updatedUser)
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })



module.exports = router
