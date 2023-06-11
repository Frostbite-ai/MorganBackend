// Import the mongoose library, which is used for connecting to MongoDB and defining schemas
const mongoose = require("mongoose")

// Define a new schema for the event collection
const eventSchema = new mongoose.Schema({
  // Define an _id field as a String, generated using uuidv4
  _id: String,
  // Define a category field as a String, representing the type of event (e.g., legal camp)
  category: String,
  // Define an eventName field as a String, representing the name of the event
  eventName: String,
  // Define an eventLocation field as a String, representing the location of the event
  eventLocation: String,
  // Define a feedback field as an array of objects, each containing a uid and content
  feedback: {
    type: [
      {
        uid: String,
        content: String,
      },
    ],
    default: [],
  },
  // Define an attended field as an array of Strings, representing user IDs of attendees
  attended: {
    type: [{ type: String }],
    default: [],
  },
  // Define a registered field as an array of Strings, representing user IDs of registered users
  registered: {
    type: [{ type: String }],
    default: [],
  },
  // Define a followedUp field as an array of Strings, representing user IDs of users who were followed up with
  followedUp: {
    type: [{ type: String }],
    default: [],
  },
  // Define an eventStartTime field as a Date, representing the start time of the event
  eventStartTime: Date,
  // Define an eventDuration field as a Number, representing the duration of the event in minutes
  eventDuration: Number,
  // Define an eventDetails field as a String, containing additional information about the event
  eventDetails: String,
  // Define an imageUrl field as a String, containing the URL of the event's image
  imageUrl: {
    type: String,
    default:
      "https://tinymiracles.com/wp-content/uploads/2019/07/logos_tm1-black-tag.png",
  },
})

// Create a new model called 'Event' using the eventSchema
const Event = mongoose.model("event", eventSchema)

// Export the Event model so it can be used in other parts of the application
module.exports = Event
