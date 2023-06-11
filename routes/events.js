const express = require("express")
const Event = require("../models/events")
const router = express.Router()
const authorizeUser = require("../middleware/userAuth")
const authorizeAdmin = require("../middleware/adminAuth")
const { v4: uuidv4 } = require("uuid")
const User = require("../models/User")

// create new Event !!
router.post("/createEvent", authorizeAdmin, async (req, res) => {
  const details = req.body

  const _id = uuidv4() // auto generate !!
  const currentEvent = new Event({
    _id,
    category: details.category,
    eventLocation: details.location,
    eventName: details.eventName,
    eventStartTime: new Date(details.eventStartTime),
    eventDuration: details.eventDuration,
    eventDetails: details.eventDetails,
  })

  Event.insertMany([currentEvent], function (err) {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json({ message: "Success" })
    }
  })
})

// mark Attendance from admin Side !!
router.post("/markAttendance", authorizeAdmin, async (req, res) => {
  try {
    let eventId = req.body.eventId
    const userId = req.body.userId
    console.log(eventId)
    const event = await Event.findById(eventId)
    if (!event.attended.includes(userId)) {
      event.attended.push(userId)
    } else {
      return res
        .status(500)
        .json({ message: "User is already registered for this event." })
    }
    await event.save()
    res.status(200).json({ message: "Marked attendance successfully" })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message })
  }
})

router.put("/editEvent", authorizeAdmin, async (req, res) => {
  try {
    console.log("Reached")
    const details = req.body
    const _id = details.eventId
    console.log("Hello ", _id)
    const updatedEventData = new Event({
      _id,
      category: details.category,
      eventLocation: details.location,
      eventName: details.eventName,
      eventStartTime: new Date(),
      eventDuration: details.eventDuration,
      eventDetails: details.eventDetails,
      attended: details.attended,
      registered: details.registered,
      followedUp: details.followUp,
      feedback: details.feedback,
      imageUrl: details.imageUrl,
    })

    const updatedEvent = await Event.findByIdAndUpdate(_id, updatedEventData, {
      new: true,
    })

    if (updatedEvent) {
      res.status(200).json({ message: "Success" })
    } else {
      res.status(404).json({ error: "Event not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create a separate async function to retrieve all events
async function getAllEvents() {
  try {
    return await Event.find()
  } catch (err) {
    throw new Error(err.message)
  }
}

// Route handler for getting all events with the "result" key in the response object
router.get("/", async (req, res) => {
  try {
    const result = await getAllEvents()
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Route handler for getting all events as an array in the response
router.get("/list", async (req, res) => {
  try {
    const result = await getAllEvents()
    if (result.length > 0) {
      res.status(200).json(result)
    } else {
      res.status(200).json([])
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// get a specific event by its id
router.get("/list/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (event) {
      console.log(event)
      res.status(200).json(event)
    } else {
      res.status(404).json({ message: "Event not found" })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// getting attendance based on sessionId !!
router.get("/attendance", authorizeAdmin, async (req, res) => {
  try {
    let eventId = req.query.eventId // accessing the request parameters !!

    Event.findById(eventId) // Replace `eventId` with the actual event ID
      .exec(async (err, result) => {
        if (err) {
          res.status(500).json({ message: err.message })
        } else {
          const idList = result.attended
          // Fetch user details for each ID in `idList`
          try {
            const attendanceList = await User.find({ _id: { $in: idList } })

            res.status(200).json({ result: attendanceList })
          } catch (error) {
            res.status(500).json({ message: error.message })
          }
        }
      })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// getting registerList based on sessionId
router.get("/registeredList", authorizeAdmin, async (req, res) => {
  try {
    let eventId = req.query.eventId // accessing the request parameters !!

    Event.findById(eventId) // Replace `eventId` with the actual event ID
      .exec(async (err, result) => {
        if (err) {
          res.status(500).json({ message: err.message })
        } else {
          const idList = result.registered

          // Fetch user details for each ID in `idList`
          try {
            const registerList = await User.find({ _id: { $in: idList } })

            res.status(200).json({ result: registerList })
          } catch (error) {
            res.status(500).json({ message: error.message })
          }
        }
      })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/group/attendance", authorizeAdmin, async (req, res) => {
  try {
    const events = await Event.find()
    const result = events.length > 0 ? groupSessionsByAttendance(events) : {}
    res.status(200).json({ result: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

function groupSessionsByAttendance(events) {
  const sessionAttendance = {}

  events.forEach((event) => {
    const eventId = event._id
    const eventName = event.eventName
    const attendedCount = event.attended.length
    const registeredCount = event.registered.length
    const followedUpCount = event.followedUp.length

    const eventSummary = {
      eventName,
      attendedCount,
      registeredCount,
      followedUpCount,
    }

    sessionAttendance[eventId] = eventSummary
  })

  return sessionAttendance
}

module.exports = router
