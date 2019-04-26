
# Deploy An Automated Passport Control System
In this code pattern, we'll demonstrate how to leverage blockchain technology and biometrics to automate a passport control system.

This is achieved here by tracking the status of a traveller, and storing all related updates on a blockchain ledger. As users go through each flight checkpoint, such as retrieving their ticket, checking in to security, etc, the application will receive some biometric data, such as an image of their face, iris, or fingerprint. The biometric data is then validated, and the check-in event is then stored on a blockchain.

<img src="https://i.imgur.com/JV9qO6A.png">

# Steps

1. [Provision Cloud Services](#1-provision-cloud-services)
2. [Clone Git Repository](#2-clone-git-repository)
3. [Deploy Blockchain Ledger](#3-deploy-blockchain-ledger)
4. [Deploy Node.js application](#4-deploy-cloud-services)
5. [Populate Ledger and Simulate Transactions](#5-populate-ledger-and-simulate-transactions)

## Install Prerequisites:

### Node.js + NPM
If expecting to run this application locally, please continue by installing [Node.js](https://nodejs.org/en/) runtime and NPM. We'd suggest using [nvm](https://github.com/creationix/nvm) to easily switch between node versions, which can be done with the following commands.
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
# Place next three lines in ~/.bash_profile
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install v8.9.0
nvm use 8.9.0
```

<!-- ### GoLang
Golang is a programming language we'll use to write "smart contracts". Smart contracts are essentially functions that can be used to query and update the ledger.

Golang can be installed by visiting the following [link](https://golang.org/dl/), and downloading the package for your operating system.

On OS X, we can install go by downloading and selecting the `.pkg` file, and click through the prompt. If using Linux, we can install go by downloading the `.tar.gz` file and extracting it to `/usr/local`

```
tar -C /usr/local -xzf go*tar.gz
```

By default, the "GOPATH" environment variable should be set to `$HOME/go`. Set this `GOPATH` variable in your `~/.bash_profile`.
```
GOPATH=$HOME/go
``` -->

## 1. Provision Cloud Services
Navigate to the following links to provision each service. The free "Lite" plan will suffice for this demonstration.

- [Cloudant](https://cloud.ibm.com/catalog/services/cloudant)
- [Kubernetes](https://cloud.ibm.com/kubernetes/catalog/cluster)


## 2. Clone Git Repository
```
git clone https://github.com/IBM/airexit/
```


## 2. Package Smart Contract

We'll interact with VSCode via a graphic interface. If you're running on Linux or a headless operating system, or would prefer to manage the network manually via shell scripts, please skip ahead to the section labelled "Local Scripts".

These smart contracts are written in Golang, so the source code for the smart contracts will need to be copied to the src folder in your `GOPATH`. This can be done like so.
```
mkdir $GOPATH/src/github.com/airexit
cp chaincode/*go $GOPATH/src/github.com/airexit/
```

After this step, there should be several `.go` files in the directory, we can confirm with a `ls` command like so
```
Kalonjis-MacBook-Pro:~ kkbankol@us.ibm.com$ ls $GOPATH/src/github.com/airexit
airexit_chaincode.go airexit_chaincode_certs.go
```

- Open VS Code

- In the menu, Click "File" and then "Open" (Or press CMD + O). Navigate to the directory where your `GOPATH` directory is set (this should default to `~/go`), and select the directory at `$GOPATH/src/github.com/airexit`

<img src="https://i.imgur.com/53AnGMV.png">

- Press "F1", and choose the option "IBM Blockchain Platform: Package a Smart Contract Project"

<img src="https://i.imgur.com/wk7fQX5.png">

- Enter a name and version. Here we'll use "food" and "1.0".

- Select the "IBM Blockchain Platform" button on the left hand menu

- In the "Smart Contract Packages" section, right click on the newly generated smart contract, and then click "export" to save the generate chaincode as a `.cds` file. Keep note of the directory, as we'll need to reference it later.

<img src="https://i.imgur.com/mysot6o.png">

## 3. Deploy a Blockchain Network

We'll then need to deploy an Hyperledger network. This is done by provisioning each component in a docker container, and running configuration scripts to create and join a peer and channel. There are two methods to do so, and we'll need to only do one or the other.

 The first recommended method is using the "VSCode" application.

*VSCode*
- Select the menu in the "Local Fabric Ops" section, and click "Start Fabric Runtime". This downloads and starts the Hyperledger docker images.

<img src="https://i.imgur.com/N8r1QLm.png">

- If the network is started successfully, we should see options to "Instantiate" and "Install" the smart contracts.

<img src="https://i.imgur.com/MIxQNE0.png">

- First, click "Install", select the default peer (`peer0.org1.example.com`), and then select the name of the contract we've just built, which will be "food@1.0" in our case. If this is successful, our chaincode should show up in the "Installed" section.
<img src="https://i.imgur.com/vLaW1pi.png">

- Next, click "Instantiate", select the default channel (`mychannel`), and then select the name of the contract we've just built, which will be "food@1.0" in our case. Enter `Init` for the function, and enter an integer "101" as the argument. This Init function is called whenever chaincode is being instantiated or upgraded, and initializes the application state. More information can be found on the Init method and other Chaincode inferface methods [here](https://hyperledger-fabric.readthedocs.io/en/release-1.4/chaincode4ade.html#chaincode-api)

<img src="https://i.imgur.com/2fQXQU4.png">

- After the chaincode is installed and instantiated, we should see the following output in the Local Fabric Ops section
<img src="https://i.imgur.com/mOb6JFw.png">

<!--
A local Hyperledger Fabric network can be deployed by running the following commands.
```
cd local
./startFabric.sh
```

After the network is up and running, we'll need to install the "Smart Contracts" / "Chaincode", which are a series of functions that have the ability to modify the ledger. This is done by copying the source code into the cli container, and then running `peer chaincode install` and `peer chaincode instantiate` to activate the chaincode. These commands can be executed by running the included script below.

```
./installChaincode.sh
``` -->


*Local Scripts*

As an alternative to VSCode, we can also use the Hyperledger fabric scripts to provision a network like so.
```
cd local
./startFabric.sh

# confirm hyperledger containers are up and running
docker ps
```

Next, we'll need to install the "Smart Contracts" / "Chaincode", which are a series of functions that have the ability to modify the ledger. This is done by copying the source code into the cli container, and then running `peer chaincode install` and `peer chaincode instantiate` to activate the chaincode.

```
./installChaincode.sh
```

The install script should result in the following output. Confirm that all status codes have the value of "200" and "OK"
<!-- <img src="https://i.imgur.com/z3vV9A9.png"> -->

<!-- After the chaincode has been installed, we can run a sample chaincode invocation to confirm things are configured properly. This can be done by using the `docker exec` command, and providing arguments to target our hyperledger network and invoke the `read_everything` function. This should return a 200 status code and a JSON object with `products`, `retailer`, and `regulator` keys.

```
docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n food -c '{"Args":["read_everything"]}'
``` -->



## 4. Deploy Node.js application
Install frontend dependencies
```
cd ..
npm install -g gulp-cli bower
npm install
bower install
# run bower install --force if no output from last command
```

Start frontend server
```
gulp build
gulp
```

Install backend dependencies
```
cd server
npm install fabric-client fabric-ca-client
npm install
```

Start backend server
```
export DB_TEST_CREDENTIALS=https://{CLOUDANT_DB_ENDPOINT}
export DEPLOY_TYPE=local
node server.js
```

The application UI should then be accessible at http://localhost:8997/
<img src="https://i.imgur.com/p6ww24z.png">

## 5. Populate Ledger and Simulate Transactions
Now that we can access the application, the next step is to register passengers with the Airexit service. This can be done by navigating to the home page, and then clicking "Registration".

<img src="https://i.imgur.com/qSUnE0S.png">

Next, fill out the form with information specific to the traveller, such as their Passport number/nationality, Visa, etc. After this information has been filled out, then click "continue". This will trigger the "init_traveller" smart contract, which saves this information to the blockchain ledger.

<img src="https://i.imgur.com/G0vWH15.png">


After registering a user, we can then associate a purchased flight ticket with that user. This can be done by navigating to the "Ticket" view. Fill out the form with flight information, such as Carrier, Destination, etc and click "Continue". Be sure to enter the same passport number as the user that was created in the previous step to ensure they are properly associated.

<img src="https://i.imgur.com/B0y1LzY.png">


Now, we can begin simulating the following stages of a passenger checking in to their flight.

- Check in, retrieve flight ticket
- Security
- Board plane at Gate

Each of these steps will be saved as an "event" on the blockchain ledger, which will reference the Traveller information and their picture at each checkpoint.

We can begin the simulation by navigating to the "Check In" section. This view renders a WebCam with facial tracking. Once the traveller's face is centered, they can select the "Capture" button. This will take a photograph, trim the background, and store that check in information on the blockchain.
<!-- Upon "Check In", the traveller should then receive their Gate and Concourse. -->

<img src="https://i.imgur.com/vlH508L.png">

This same process can be repeated for both the security check-in and the boarding gate.

<!-- TODO, actually should be storing a hash of the passengers picture -->
Authorized airport employees can also see a high level overview of passenger checkins in the "Monitor" view.

We can find this by navigating back to the home page, then "Monitor", and then selecting the user we'd like to inspect. This will show a high level overview of all information pertaining to that traveller.

<img src="https://i.imgur.com/23Y7c7d.png">

Behind the scenes, these events can be validated by smart contracts on the ledger. For example, we have a smart contract defined here titled `verify_traveller_status`. This should be triggered once a user is checking in to the airport.

```
if fName == "verify_traveller_status" {
  passportNumber := args[0]
  travellerAsBytes, err := stub.GetState(passportNumber)
  traveller := Traveller{}
  err = json.Unmarshal(travellerAsBytes, &traveller)    //un stringify it aka JSON.parse()
  if err != nil {
    return shim.Error(err.Error())
  }

  if (traveller.NoFly) {
    return shim.Error("Traveller is on No Fly list, alerting agent for assistance")
  }

  if (traveller.Reservation.VisaNumber != "") {
    if ( traveller.Reservation.VisaExpiration < int(time.Now().Unix())  ) {
      return shim.Error("Traveller has expired Visa, alerting agent for assistance")
    }
  }
  return shim.Success([]byte("Traveller cleared to fly"))
}
```

This works like so

*Load all information associated with the traveller from the blockchain*
```
passportNumber := args[0]
travellerAsBytes, err := stub.GetState(passportNumber)
traveller := Traveller{}
err = json.Unmarshal(travellerAsBytes, &traveller)
```

*Each traveller should have a boolean value which determines if they're on a no fly list. The value should default to "False", but if it is set to true, than the traveller will be denied further access to the check-in process.*
```
if (traveller.NoFly) {
  return shim.Error("Traveller is on No Fly list, alerting agent for assistance")
}
```

*Some Travellers may have a Visa. This method checks to see if a Visa is associated with the traveller's reservation. If there is a valid Visa number, we'll check the expiration date, which should be stored as a Unix timestamp. If the Visa is expired, an exception will be triggered.*

```
if (traveller.Reservation.VisaNumber != "") {
  if ( traveller.Reservation.VisaExpiration < int(time.Now().Unix())  ) {
    return shim.Error("Traveller has expired Visa, alerting agent for assistance")
  }
}
```

## License
This code pattern is licensed under the Apache Software License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)

<!-- ### Requirements
* [NodeJS](http://nodejs.org/)
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
The monitor was started from RDash rdash-angular as a base project (https://github.com/rdash/rdash-angular) -->
