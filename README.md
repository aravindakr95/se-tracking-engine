## :copyright: Smart Electricity Tracking Engine
 > _Act as the middleware for the PGSB, PVSB devices and serve the content to the users by consuming and listening to RESTful APIs_ 
 
## :sparkles: Usage
 
 Proceed with next steps if your platform meet following prerequisites. 
 
 - Install [Node.js](https://nodejs.org/en/) 14.16.0 on your device. 
 
## :sparkles: Getting Started
Run the following commands under `se-tracking-engine` directory to install dependencies.
 ```
 npm install
 ```
OR 
 ```
 docker pull aravindakr95/se-tracking-engine:<VERSION>
 ```
Please note `se-tracking-engine` was currently on private mode in [DockerHub](https://hub.docker.com/)
## :sparkles: Technologies
 
 Usage          	            | Technology
 --------------------------	    | --------------------------
 Language                       | JavaScript
 Framework     	                | Express
 Transpiler           	        | Babel
 HTTP Client        	        | Axios
 Encryption        	            | BCrypt
 Code Quality Tools         	| ES Lint
 Logger                         | Winston
 Database                       | MongoDB Atlas
 Dependency Registries      	| NPM
 
## :sparkles: How to Use
 
 Here is the list of tasks available out of the box and run these via `npm run <task>`
 ```
   build             Perform npm and build
   clean             Cleans dist directory
   pretest           Runs the pretest
   lint              Run Code quality operations 
   watch             Watches file changes in Development mode
   start             Run the build task and mount index file in dist directory
 ```
OR
 ```
docker run -p <MAP_PORT>:3000 --env PORT=<PORT> --rm -d aravindakr95/se-tracking-engine:<VERSION>
 ```

## :sparkles: License
 
Smart Electricity Tracking Engine is MIT licensed. Please refer LICENSE for more information.
