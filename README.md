## Morgan Stanley CodeToGive Team-17 Backend

This is a resilient backend service built using Node.js, Express.js, MongoDB, and a variety of other powerful technologies including bcrypt for secure password handling. It is designed to handle various tasks efficiently and flexibly, providing a reliable backbone for any web application.

## Getting Started

The following instructions will guide you through cloning the project, setting up your development environment, and running the application on your local machine for both development and testing purposes.

### Prerequisites

Ensure you have Node.js and npm (Node Package Manager) installed on your system. If you do not, you can install them from [here](https://nodejs.org/en/) and [here](https://www.npmjs.com/get-npm), respectively.

### Installation

1. **Clone the repository** - Pull the code from the master branch of the GitHub repository to your local machine.
2. **Navigate to the project directory** - Once you've cloned the repository, use the command line to navigate to the root directory of the project.
3. **Set up environment variables** - Create a `.env` and `.env.local` file in the root directory. These files will house all your environment variables. Populate them with the following details:

   **.env**



   ```
   DB_URL="mongodb://localhost:27017/morganstanley23"
   MONGODB_ATLAS_URI="mongodb://localhost:27017/morganstanley23"
   PORT=3000
   SECRET_KEY="<your_secret_key>"
   VAPID_SUBJECT="mailto:<your_email>"
   VAPID_PUBLIC_KEY="<your_vapid_public_key>"
   VAPID_PRIVATE_KEY="<your_vapid_private_key>"
   export NODE_ENV=development
   ```

   
**.env.local**



   ```
   VITE_SERVER_ADDRESS="http://localhost:3000"
   VITE_VAPID_PUBLIC_KEY="<your_vapid_public_key>"
   export NODE_ENV=development
   ```

 
Replace `<your_secret_key>`, `<your_email>`, `<your_vapid_public_key>`, and `<your_vapid_private_key>` with your own values.

4. **Install dependencies** - Use npm to install all the project's dependencies.
5. **Start the server** - Run the server using the npm script 'dev'.
6. **Verify the setup** - Open a web browser and visit http://localhost:3000 to confirm the application is running correctly.

## API Documentation

For more information on the available API endpoints, please visit the [API documentation](https://frostbite-ai.github.io/MorganBackend/).
