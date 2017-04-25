
#  Air Exit

A POC for Air Exit

## Usage
### Requirements
* [NodeJS](http://nodejs.org/) (with [NPM](https://www.npmjs.org/))
```sh
Ubuntu:
$ curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```
* [Bower](http://bower.io) `sudo npm install -g bower`
* [Gulp](http://gulpjs.com) `sudo npm install -g gulp-cli`

### Installation
1. [Create SSH key](https://help.github.com/enterprise/2.4/user/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)
2. Clone the repository
3. Install the NodeJS dependencies: `sudo npm install`.
4. Install the Bower dependencies: `bower install`.
5. Run the gulp build task: `gulp build`.
6. Run the server: run `node server/server.js`.
7. Run the gulp default task: `gulp`. This will build any changes made automatically, and also run a live reload server on [http://localhost:8888](http://localhost:8888).

The api is running in [http://localhost:8889](http://localhost:8889)

## Development

### Requirements
1. Install nodemon: `sudo npm install -g nodemon`.
2. Install node-debug: `sudo npm install -g node-debug`.
3. Install node-inspector: `sudo npm install -g node-inspector`.

#### Server livereload
1. Open a tab terminal and run: `nodemon server/server.js`. This will restart the server after any change. Type 'rs' and hit Enter to force restart.
2. Open a tab terminal and run: `gulp`. With the `gulp` command, any file changes made will automatically be compiled into the specific location within the `dist` directory and also force the server restart. To know more take a look at gulpfile.js.

### Adding new bower components
1. Run `bower install AWESOMECOMPONENT --save`.
2. Add this component in gulpfile.js in the array that returns orderedBowerComponents function
    `'bower_components/AWESOMECOMPONENT/*.min.js'`
3. Restart `gulp` so it reloads the bower components

### Debugging Server
  Run: `node-debug server/server.js`.

### Connecting to test database
  Get the credentials from Bluemix and set the environment variable DB_TEST_CREDENTIALS.

### Deployment

- Is safer to logout `cf logout` and conenct to the right account before executing the command

Login to bluemix and cf is required.
`bluemix api https://api.ng.bluemix.net`
`bluemix login`

TEST: 
   - Remember to set "active_database": "CLOUDANT_TEST" in server/config.json
   - Run `gulp deploy` (It will check that you are logged in to test before deploying to avoid overriding production. Sets the config property to test and deploys.)

PROD: 
   - `git pull`
   - `gulp build`
   - Remember to set "active_database": "CLOUDANT" in server/config.json
   - Run `gulp deploy --prod`  (This command sets the config property to production and deploys)

#### More info
The monitor was started from RDash rdash-angular as a base project (https://github.com/rdash/rdash-angular)
