require("dotenv").config() // Loads environment variables from a .env file into process.env
const jwt = require("jsonwebtoken") // jsonwebtoken library used for creating and verifying JWTs
const bcrypt = require("bcryptjs") // bcryptjs library used for hashing and checking passwords

// authorizeUser is a middleware function that will be used in routes where authorization is needed
const authorizeUser = (req, res, next) => {
  try {
    // Takes the Authorization header from the incoming request
    const accessToken = req.headers["authorization"]
    // Splits the Authorization header value on ' ' (space) to extract the token value. It's assumed the Authorization header is in the format: "Bearer <token>"
    const valToBeVerified = accessToken.split(" ")[1]

    // Verifies the token using the SECRET_KEY
    jwt.verify(valToBeVerified, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        // If there is an error in verification, it sends a response with a status of 500 and the error message
        res.status(500).json({ message: err.message })
      } else {
        // If there's no error, it checks if the user's role is "User"
        if (user.role == "User") {
          // If the role is "User", it attaches the user object to the request and moves to the next middleware or route handler
          req.user = user
          next()
        } else {
          // If the role is not "User", it sends a response with a status of 500 and a message saying that admin is not authorized to do user works
          res
            .status(500)
            .json({ message: "Admin Not Authorized to do User Works" })
        }
      }
    })
  } catch (err) {
    // If there's any error in the overall process, it sends a response with a status of 500 and the error message
    res.status(500).json({ message: err.message })
  }
}

module.exports = authorizeUser // Exports the middleware function for use in other parts of the application
