# Morgan Stanley CodeToGive Team-17 Backend

This is a resilient backend service built using Node.js, Express.js, MongoDB, and a variety of other powerful technologies including bcrypt for secure password handling. It is designed to handle various tasks efficiently and flexibly, providing a reliable backbone for any web application.

## Getting Started

The following instructions will guide you through cloning the project, setting up your development environment, and running the application on your local machine for both development and testing purposes.

### Prerequisites

Ensure you have Node.js and npm (Node Package Manager) installed on your system. If you do not, you can install them from [here](https://nodejs.org/en/) and [here](https://www.npmjs.com/get-npm), respectively.

### Installation

1. **Clone the repository** - Pull the code from the master branch of the GitHub repository to your local machine.
2. **Navigate to the project directory** - Once you've cloned the repository, use the command line to navigate to the root directory of the project.
3. **Set up environment variables** - Create a `.env` file in the root directory. This file will house all your environment variables. Populate it with the following details:
   - `MONGO_URI` - This is the URL for your MongoDB database
   - `PORT` - This is the port number your application will run on
   - `SECRET_KEY` - This is your secret key for JSON Web Token (JWT) authentication
4. **Install dependencies** - Use npm to install all the project's dependencies.
5. **Start the server** - Run the server using the npm script 'dev'.
6. **Verify the setup** - Open a web browser and visit http://localhost:<Port Number> to confirm the application is running correctly. Replace `<Port Number>` with the number you assigned to the `PORT` variable in your `.env` file.

### Package.json Information

This project has a `package.json` file which holds various metadata relevant to the project. It includes the name, version, scripts, and dependencies used in the project. Below is an example of what it might look like:

```json
{
  "name": "morganstanley-hack-backend",
  "version": "0.1.0",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.20.1",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongodb": "4.1",
    "mongoose": "^6.8.1",
    "nodemon": "^2.0.22",
    "uuid": "^9.0.0",
    "web-push": "^3.6.1"
  }
}
```
