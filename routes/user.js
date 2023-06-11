//jshint esversion:6
require("dotenv").config()
const express = require("express")
const router = express.Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const authorizeUser = require("../middleware/userAuth")
const authorizeAdmin = require("../middleware/adminAuth")
const Event = require("../models/events")
const { v4: uuidv4 } = require("uuid")
const webPush = require("web-push")

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)
const saltRounds = 10

// Shared function to handle user registration
async function registerUser(reqBody, isAdmin = false) {
  const { pwd, basicDetails, ...rest } = reqBody

  if (!basicDetails) {
    throw new Error("Basic details are required.")
  }

  const { PhoneNumber, name, gender, Community } = basicDetails

  if (!pwd || !PhoneNumber || !name || !gender || !Community) {
    throw new Error(
      "Password, phone number, name, gender, and community are required."
    )
  }

  const _id = uuidv4()
  const hash = await bcrypt.hash(pwd, saltRounds)

  const tempCom = Community.toUpperCase()

  const currentUser = new User({
    role: isAdmin ? "Admin" : "User",
    pwd: hash,
    _id,
    basicDetails: {
      PhoneNumber,
      name,
      gender,
      Community: tempCom,
      ...basicDetails,
    },
    ...rest,
  })

  await User.insertMany([currentUser])

  return currentUser
}

// Route handler for user registration by user
router.post("/register/byUser", async (req, res) => {
  try {
    const currentUser = await registerUser(req.body)
    const user = {
      _id: currentUser._id,
      role: "User",
      name: currentUser.basicDetails.name,
    }
    const accessToken = jwt.sign(user, process.env.SECRET_KEY)
    res.status(200).json({ ...user, accessToken })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Route handler for user registration by admin
router.post("/register/byAdmin", authorizeAdmin, async (req, res) => {
  try {
    await registerUser(req.body, true)
    res.status(200).json({ message: "Success" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// login route !!
// Sign in by Phone Number and Password
router.post("/login", async (req, res) => {
  const { PhoneNumber, pwd } = req.body
  console.log(PhoneNumber, pwd)
  try {
    const results = await User.find({ "basicDetails.PhoneNumber": PhoneNumber })

    if (results.length === 0) {
      return res.status(500).json({ message: "NO ENTRY FOUND !!!" })
    }

    let userFound = false

    for (const result of results) {
      const storedHashedPassword = result.pwd
      const passwordMatch = await bcrypt.compare(pwd, storedHashedPassword)

      if (passwordMatch) {
        const user = {
          _id: result._id,
          role: result.role,
          name: result.basicDetails.name,
        }
        const accessToken = jwt.sign(user, process.env.SECRET_KEY)
        return res.status(200).json({ accessToken, ...user })
      }
    }

    res.status(500).json({ message: "INVALID CREDENTIALS !!!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/addCommunity", async (req, res) => {
  const { Community } = req.body

  try {
    // Check if community already exists
    const existingCommunity = await User.findOne({
      "basicDetails.Community": Community.toUpperCase(),
    })

    if (existingCommunity) {
      return res.status(409).json({ message: "Community already exists" })
    }

    const pwd = "DoesNotExist" + uuidv4()
    const isFakeUser = true
    const tempCom = Community.toUpperCase()
    const currUser = new User({
      // Other user properties
      pwd,
      isFakeUser,
      basicDetails: {
        // Other basic details properties
        Community: tempCom,
      },
    })

    User.insertMany([currUser], function (err) {
      if (err) {
        return res.status(500).json({ message: err.message })
      } else {
        return res.status(200).json({ message: "Success" })
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Shared function to handle user filtering
async function filterUsers(filter) {
  try {
    const result = await User.find(filter).where({ role: { $ne: "Admin" } })
    return result
  } catch (err) {
    throw new Error(err.message)
  }
}

// Route handler for getting all users
router.get("/", authorizeAdmin, async (req, res) => {
  try {
    const result = await filterUsers({})
    res.status(200).json({ result: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Route handlers for filtering users by various criteria
const filterRoutes = [
  { path: "/filter/community", field: "basicDetails.Community" },
  { path: "/filter/age", field: "basicDetails.age" },
  { path: "/filter/name", field: "basicDetails.name", isRegex: true },
  { path: "/filter/phoneNumber", field: "basicDetails.PhoneNumber" },
]

filterRoutes.forEach((route) => {
  router.get(route.path, authorizeAdmin, async (req, res) => {
    try {
      const value = route.isRegex
        ? new RegExp(`^${req.query[route.field.split(".")[1]]}`, "i")
        : req.body[route.field.split(".")[1]]
      const filter = { [route.field]: value }
      const result = await filterUsers(filter)

      if (result.length > 0) {
        res.status(200).json({ result: result })
      } else {
        res.status(200).json({ result: [] })
      }
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
})

//grouping
const groupUsersBy = (users, key) => {
  const groups = {}

  users.forEach((user) => {
    const groupKey = user[key]

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }

    groups[groupKey].push(user)
  })

  return groups
}

router.get("/group/education", authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find()
    const result =
      users.length > 0
        ? groupUsersBy(users, "educationStatus.currentEducationLevel")
        : {}
    res.status(200).json({ result: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/group/age", authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find()
    const result =
      users.length > 0 ? groupUsersBy(users, "basicDetails.age") : {}
    res.status(200).json({ result: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/group/community", async (req, res) => {
  try {
    const users = await User.find()
    const result =
      users.length > 0 ? groupUsersBy(users, "basicDetails.Community") : {}
    res.status(200).json({ result: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/group/gender", authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find()
    const result =
      users.length > 0 ? groupUsersBy(users, "basicDetails.gender") : {}
    res.status(200).json({ result: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// user Side updating the info !! { he should be only updating it !!  as it's put not post }
//added partial update support
router.put("/userUpdates/:id", async (req, res) => {
  try {
    const _id = req.params.id // Extracting userId from the route parameter

    const result = await User.findOne({ _id: _id })

    if (result) {
      let update = {}
      for (let key in req.body) {
        if (req.body[key] instanceof Object && !Array.isArray(req.body[key])) {
          for (let subKey in req.body[key]) {
            update[`${key}.${subKey}`] = req.body[key][subKey]
          }
        } else {
          update[key] = req.body[key]
        }
      }

      User.findByIdAndUpdate(
        { _id: _id },
        { $set: update },
        { new: true },
        (err, updatedUser) => {
          if (err) {
            res.status(500).json({ message: err.message })
          } else {
            res
              .status(200)
              .json({ message: "User updated successfully", user: updatedUser })
          }
        }
      )
    } else {
      res.status(500).json({ message: "No Such User Exist" })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//get user details by id  ,
router.get("/user/:id", async (req, res) => {
  try {
    const _id = req.params.id // Extracting userId from request params

    // Find user based on the id
    const user = await User.findById(_id)

    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// get all the events in which he/she has Registred !! without authorization
router.get("/getUsersRegisteredEvents/:id", (req, res) => {
  const userId = req.params.id

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  // getAllEvents where registered.includes(userId) is false
  Event.find({
    registered: { $in: [userId] },
    attended: { $nin: [userId] },
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json(events)
    }
  })
})

router.post("/registerForEvent/byAdmin", authorizeAdmin, async (req, res) => {
  try {
    let eventId = req.body.eventId
    const userId = req.body.userId
    const event = await Event.findById(eventId)
    if (!event.registered.includes(userId)) {
      event.registered.push(userId)
    } else {
      res
        .status(500)
        .json({ message: "User is already registered for this event." })
    }
    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//register for an event (user side)
router.post("/registerForAnEvent", async (req, res) => {
  try {
    const { eventId, userId } = req.body

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found." })
    }

    if (!event.registered.includes(userId)) {
      event.registered.push(userId)
      await sendNotif(userId, {
        title: "New Event Registration",
        body: `You have successfully registered for the event ${event.eventName}`,
      })
    } else {
      return res.status(500).json({ message: "repeat" })
    }

    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//for user side attend an event
router.post("/attendAnEvent", async (req, res) => {
  try {
    const { eventId, userId } = req.body

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found." })
    }

    if (!event.attended.includes(userId)) {
      event.attended.push(userId)
    } else {
      return res
        .status(500)
        .json({ message: "User is already registered for this event." })
    }

    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//list of all the events in which user has attended
router.get("/getUsersAttendedEvents/:id", (req, res) => {
  const userId = req.params.id

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  // getAllEvents where registered.includes(userId) and attended.includes(userId)
  Event.find({
    registered: { $in: [userId] },
    attended: { $in: [userId] },
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json(events)
    }
  })
})

// Mark user as followed up for an event
router.post("/markUserFollowedUp", async (req, res) => {
  try {
    const { eventId, userId } = req.body

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found." })
    }

    if (!event.followedUp.includes(userId)) {
      event.followedUp.push(userId)
    } else {
      return res.status(500).json({
        message: "User is already marked as followed up for this event.",
      })
    }

    await event.save()
    res.status(200).json({ message: "Success, user marked as followed up !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/getFollowUpPending/:id", (req, res) => {
  const userId = req.params.id

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  // Find all events where registered.includes(userId) and attended.includes(userId) but not followedUp.includes(userId)
  Event.find({
    registered: { $in: [userId] },
    attended: { $in: [userId] },
    followedUp: { $nin: [userId] }, // $nin (not in) is used here
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json(events)
    }
  })
})

// List of all events in which user has registered, attended and followed up
router.get("/getFollowUpDone/:id", (req, res) => {
  const userId = req.params.id

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  // Find all events where registered.includes(userId), attended.includes(userId) and followedUp.includes(userId)
  Event.find({
    registered: { $in: [userId] },
    attended: { $in: [userId] },
    followedUp: { $in: [userId] }, // $in (in) is used here
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json(events)
    }
  })
})

router.post("/feedbackForEvent", authorizeUser, async (req, res) => {
  try {
    let eventId = req.body.eventId
    let content = req.body.content
    const userId = req.user._id
    const event = await Event.findById(eventId)

    // now create a feedback
    const currentFeedback = {
      uid: userId,
      content: content,
    }
    event.feedback.push(currentFeedback)
    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/addSub", async (req, res) => {
  const { userId, sub } = req.body
  const subExists = await User.exists({
    _id: userId,
    subs: { $elemMatch: { endpoint: sub.endpoint } },
  })

  if (subExists) return res.json({ message: "Subscription already exists" })
  User.findByIdAndUpdate(userId, { $push: { subs: sub } })
    .then(() => {
      return res.json({ success: true })
    })
    .catch((e) => {
      console.log(e)
      res.json({ success: false })
    })
})

const sendNotif = async (userId, payload) => {
  const user = await User.findOne({ _id: userId })
  console.log(user.subs)
  user.subs.map(async (sub) => {
    try {
      await webPush.sendNotification(sub, JSON.stringify(payload))
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        await User.findByIdAndUpdate(userId, {
          $pull: { subs: { _id: sub._id } },
        })
      }
    }
  })
}

module.exports = router
