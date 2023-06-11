// Import the mongoose library, which is used for connecting to MongoDB and defining schemas
const mongoose = require("mongoose")

// Define a new schema for the user collection
const UserSchema = new mongoose.Schema(
  {
    // Define a pwd field as a unique String, representing the user's password
    pwd: { type: String, unique: true },
    // Define a role field as a String, representing the user's role
    role: String,
    // Define an isFakeUser field as a Boolean, indicating whether the user is fake or not
    isFakeUser: {
      type: Boolean,
      default: false,
    },
    // Define an _id field as a String, generated using uuidv4
    _id: String,
    // Define a nested object for basic user details
    basicDetails: {
      name: String,
      age: Number,
      gender: String,
      // Define a PhoneNumber field as a unique Number
      PhoneNumber: { type: Number, unique: true },
      // Define a nested object for the user's address
      address: {
        address1: String,
        state: String,
        city: String,
        zip: String,
      },
      Community: String,
      // Define a nested object for family details
      familyDetails: {
        numOfChild: Number,
        maritalStatus: String,
        income: Number,
        dependents: Number,
      },
      primaryLanguage: String,
    },
    // Define a nested object for education status
    educationStatus: {
      currentEducationLevel: String,
      ongoingEducation: String,
      furtherStudyInterest: String,
    },
    // Define a nested object for employment status
    employmentStatus: {
      currentEmployment: String,
      workNature: String,
      workIndustry: String,
      prevEmployment: String,
      openForEmployment: String,
    },
    // Define a nested object for socioeconomic status
    SocioeconomicStatus: {
      cleanWaterAccess: String,
      electricityAccess: String,
      housingType: String,
      transportationAccess: String,
    },
    // Define a nested object for medical records
    medicalRecords: {
      hospitalizationRecords: String,
      chronicIllnesses: String,
      currentMedications: String,
      bloodGroup: String,
      allergies: String,
      vaccinationRecords: String,
      healthInsurance: String,
    },
    // Define a nested object for government schemes
    govtSchemes: {
      rationCard: String,
      aadharCard: String,
      esharamCard: String,
      panCard: String,
      voterId: String,
    },
    // Define a location field as a GeoJSON Point
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    // Define an insertedAt field as a Date, representing when the user was added
    insertedAt: Date,
    // Define a subs field as an array of objects, representing user subscriptions
    subs: [
      {
        endpoint: { type: String },
        keys: {
          p256dh: String,
          auth: String,
        },
      },
    ],
  },
  // Enable timestamps to automatically track createdAt and updatedAt fields
  { timestamps: true }
)

// Create a new model called 'User' using the UserSchema
const User = mongoose.model("user", UserSchema)

// Export the User model so it can be used in other parts of the application
module.exports = User
