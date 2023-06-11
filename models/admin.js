// Import the mongoose library, which is used for connecting to MongoDB and defining schemas
const mongoose = require("mongoose")

// Define a new schema for the admin collection
const adminSchema = new mongoose.Schema({
  // Define a username field as a String
  username: String,
  // Define a password field as a String
  password: String,
  // Define an _id field as a String
  _id: String, // This field should be generated using the uuidv4() function only!
})

// The admin schema is different from the user schema because it only contains
// the necessary fields for an admin, and not all the details that a user schema might have.

// Create a new model called 'Admin' using the adminSchema
const Admin = mongoose.model("admin", adminSchema)

// Export the Admin model so it can be used in other parts of the application
module.exports = Admin
