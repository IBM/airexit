/*
Copyright IBM Corp. 2017 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package main

import (
	"bytes"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"strings"
	"time"
	// "crypto/rand"
	// "time"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	// "github.com/hyperledger/fabric/core/sql"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type airexitChaincode struct {
}

const (
	checkin   = "CHECKIN"
	screening = "SCREENING"
	gate      = "GATE"
	testing   = "TESTING" //used for testing as it doesn't require validation of user certificate
)

/*
Notes, remove after publishing
An event is a status update for a traveller.
This update occurs when they move through the travelling process, from check-in to screening/security, then to their gate

Objects:
Events (checkin)
Can get by


add_event
get_event
get_events_by_reservation_number
get_events_by_passport
get_all_events
get_traveller
add_traveller
-

user should be able to query info for

reservationNumber
*/

type Traveller struct {
	FaceImage        string `json:"faceImage"`        // this is a baseline,
	FingerprintImage string `json:"fingerprintImage"` // this is a baseline,
	PassportNumber   string `json:"passportNumber"`
	FirstName        string `json:"firstName"`
	LastName         string `json:"lastName"`
	Nationality      string `json:"nationality"`
	Events           []Event   `json:events`
	Reservation			 *Reservation `json:"reservation"`
	NoFly						 bool		`json:"nofly"`
	ObjectType       string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	//
}

type Reservation struct {
	Id  string `json:"id"` // ticket number
	// Timestamp         time.Time `json:"timestamp"` // time reservation was confirmed
	Timestamp      string    `json:"timestamp"` // time of flight
	PartnerID      string    `json:"partnerId"` // airline/carrier name?
	Events         []Event   `json:events`
	PassportNumber string    `json:"passportNumber"`
	// FaceImage      string    `json:"faceImage"`
	// Traveller      Traveller `json:"traveller"`
	Status				 string    `json:"status"`
	VisaNumber		 string		 `json:"visaNumber"`
	VisaExpiration int		 `json:"visaExpiration"` // timestamp
	Origin         string    `json:"origin"`
	Destination    string    `json:"destination"`
	FlightNumber    string    `json:"flightNumber"`
	// ReservationNumber string    `json:"reservationNumber"`
	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
}

type Event struct {
	UUID string `json:"uuid"`
	// Timestamp         time.Time `json:"timestamp"`
	Timestamp         string `json:"timestamp"` // time reservation was confirmed
	PartnerID         string `json:"partnerId"`
	EventType         string `json:"eventType"` // checkin, screening, gate
	Location          string `json:"location"`  // keep?
	PassportNumber    string `json:"passportNumber"`
	FaceImage         string `json:"faceImage"` // TODO, should every event have a face image? assuming so based on slides
	ReservationNumber string `json:"reservationNumber"`
	ObjectType        string `json:"docType"` //docType is used to distinguish the various types of objects in state database
}

//Init initializes the chaincode state.
func (ae *airexitChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	// stub.SQLExec(`CREATE TABLE EVENTS(
	//     UUID VARCHAR(256) NOT NULL,
	//     TS TIMESTAMP NOT NULL,
	//     PARTNER_ID VARCHAR(16) NOT NULL,
	//     EVENT_NAME VARCHAR(16) NOT NULL,
	//     EVENT_LOCATION VARCHAR(256) NOT NULL,
	//     PASSPORT_NUMBER VARCHAR(9) NOT NULL,
	//     FACE_IMAGE TEXT,
	//     RESERVATION_NO VARCHAR(16) NOT NULL)
	//   `)
	// stub.SQLExec("ALTER TABLE EVENTS ADD CONSTRAINT PK_EVENTS PRIMARY KEY (UUID)")
	// stub.SQLExec("ALTER TABLE EVENTS ADD CONSTRAINT UQ_EVENT UNIQUE(RESERVATION_NO, EVENT_NAME)")
	err := stub.PutState("airexit", []byte("1.0"))
	if err != nil {
		// return shim.Success(err.Error())
		return shim.Success([]byte("error putting state"))
	}
	fmt.Println("Ready for action") //self-test pass

	return shim.Success(nil)
}

func delete(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	fmt.Println("starting delete")

	id := args[0]

	err := stub.DelState(id)                                                 //remove the key from chaincode state
	if err != nil {
		return shim.Error("Failed to delete state")
	}

	fmt.Println("- end delete")
	return shim.Success(nil)
}

//Invoke invokes the chaincode.
func (ae *airexitChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fName, args := stub.GetFunctionAndParameters()
	fmt.Println(fName)

	if fName == "delete" {
		fmt.Println("starting delete")

		id := args[0]

		err := stub.DelState(id)                                                 //remove the key from chaincode state
		if err != nil {
			return shim.Error("Failed to delete state")
		}

		fmt.Println("- end delete")
		return shim.Success(nil)
	}

	if fName == "add_event" {
		/* TODO, bypassing cert auth for now
		cert, err := submmiterCert(stub)
		if err != nil {
			return shim.Error(err.Error())
		}
		*/

		if len(args) != 8 {
			return shim.Error(`Incorrect number of arguments. Expected arguments:
        uuid, timestamp, partnerID, eventType, location, passportNumber, faceImage, reservationNumber`)
		}

		uuid, timestamp, partnerID, eventType := args[0], args[1], args[2], args[3]
		location, passportNumber, faceImage, reservationNumber := args[4], args[5], args[6], args[7]

		/* TODO, bypassing cert auth for now
		err = validateUserForEventType(stub, cert, reservationNumber, eventType)
		if err != nil {
			return shim.Error(err.Error())
		}
		*/

		// err = stub.SQLExec(`INSERT INTO EVENTS (UUID, TS, PARTNER_ID, EVENT_NAME,
		//       EVENT_LOCATION, PASSPORT_NUMBER, FACE_IMAGE, RESERVATION_NO) VALUES(?, ?, ?, ?,?, ?, ?, ?)`,
		// 	uuid, timestamp, partnerID, eventType, location, passportNumber, faceImage, reservationNumber)
		fmt.Printf("setting event info")
		var event Event
		event.UUID = uuid
		event.Timestamp = timestamp
		event.PartnerID = partnerID
		event.EventType = eventType
		event.Location = location
		event.PassportNumber = passportNumber
		event.FaceImage = faceImage
		event.ReservationNumber = reservationNumber
		event.ObjectType = "event"
		fmt.Printf("event info set")
		eventAsBytes, _ := json.Marshal(event)
		err := stub.PutState(uuid, eventAsBytes)
		fmt.Printf("event saved")
		if err != nil {
			return shim.Error(err.Error())
		}

		travellerAsBytes, err := stub.GetState(passportNumber)
		traveller := Traveller{}
		err = json.Unmarshal(travellerAsBytes, &traveller)           //un stringify it aka JSON.parse()

		if err != nil {
			return shim.Error(err.Error())
		}

		traveller.Reservation.Events = append(traveller.Reservation.Events, event)
		traveller.Reservation.Status = eventType
		travellerAsBytes, _ = json.Marshal(traveller)
		// reservationAsBytes, err := stub.GetState(reservationNumber)
		// reservation := Reservation{}
		// err = json.Unmarshal(reservationAsBytes, &reservation)           //un stringify it aka JSON.parse()
		// if err != nil {
		// 	return shim.Error(err.Error())
		// }
		// reservation.Events = append(reservation.Events, event)
		// reservationAsBytes, _ = json.Marshal(reservation)
		err = stub.PutState(passportNumber, travellerAsBytes) // being deleted here, why?


		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success([]byte("Event successfully added!"))
	}

	if fName == "verify_traveller_status" {
		passportNumber := args[0]
		travellerAsBytes, err := stub.GetState(passportNumber)
		traveller := Traveller{}
		err = json.Unmarshal(travellerAsBytes, &traveller)           //un stringify it aka JSON.parse()
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

	// ReservationId  string `json:"id"` // ticket number
	// // Timestamp         time.Time `json:"timestamp"` // time reservation was confirmed
	// Timestamp      string    `json:"timestamp"` // time of flight
	// PartnerID      string    `json:"partnerId"` // airline/carrier name?
	// Events         []Event   `json:events`
	// PassportNumber string    `json:"passportNumber"`
	// Traveller      Traveller `json:"traveller"`
	// Origin         string    `json:"origin"`
	// Destination    string    `json:"destination"`
	// FlightNumber    string    `json:"flightNumber"`

	if fName == "init_reservation" {
		if len(args) != 6 {
			return shim.Error(`Incorrect number of arguments. Expected arguments:
        uuid, timestamp, partnerID, eventType, location, passportNumber, faceImage, reservationNumber`)
		}


		id, passportNumber, partnerID, origin, destination, flightNumber := args[0], args[1], args[2], args[3], args[4], args[5]

		travellerAsBytes, err := stub.GetState(passportNumber)
		traveller := Traveller{}
		err = json.Unmarshal(travellerAsBytes, &traveller)           //un stringify it aka JSON.parse()

		if err != nil {
			return shim.Error(err.Error())
		}

		var reservation Reservation
		reservation.Id = id // Is this needed?
		reservation.PassportNumber = passportNumber
		reservation.PartnerID = partnerID
		reservation.Origin = origin
		reservation.Destination = destination
		reservation.FlightNumber = flightNumber
		reservation.ObjectType = "reservation"
		fmt.Printf("reservation info set")
		// reservationAsBytes, _ := json.Marshal(reservation)
		// err := stub.PutState(id, reservationAsBytes)
		// if err != nil {
			// return shim.Error(err.Error())
		// }

		traveller.Reservation = &reservation
		travellerAsBytes, _ = json.Marshal(traveller)
		err = stub.PutState(passportNumber, travellerAsBytes) // being deleted here, why?
		if err != nil {
			return shim.Error(err.Error())
		}
		// TODO, perhaps reservation shouldn't be a seperate entity
		return shim.Success([]byte("Reservation successfully added!"))
	}



	// Use generic "read" method instead
	if fName == "get_event" {
		if len(args) != 1 {
			return shim.Error("Incorrect number of arguments. Expected arguments: uuid")
		}
		uuid := args[0]

		// event, err := getEventByUUID(stub, args[0])
		eventAsBytes, err := stub.GetState(uuid)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(eventAsBytes)
	}

	if fName == "get_events_by_reservation_number" {
		// here, we're getting the latest event by reservation number
		// so maybe GetState of reservation
		// each reservation has an associated list of events?
		// and also associated passportNumber
		if len(args) != 1 {
			return shim.Error("Incorrect number of arguments. Expected arguments: reservationNumber")
		}

		/* old logic
		events, err := getEventByReservationNumber(stub, args[0])

		if err == nil {
			eventsBS, err := json.Marshal(events)
			if err != nil {
				return shim.Error(err.Error())
			}
			return shim.Success(eventsBS)
		}
		*/

		reservationNumber := strings.ToLower(args[0])
		queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"event\",\"reservationNumber\":\"%s\"}}", reservationNumber)
		//getQueryResultForQueryString()
		queryResults, err := getQueryResultForQueryString(stub, queryString)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(queryResults) // probably change this to return results.Events
	}

	// if fName == "get" {
	// 	if len(args) != 1 {
	// 		return shim.Error("Incorrect number of arguments. Expected arguments: reservationNumber")
	// 	}
	// 	method := strings.ToLower(args[0])
	//
	// 	queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"event\",\"reservationNumber\":\"%s\"}}", reservationNumber)
	// 	queryResults, err := getQueryResultForQueryString(stub, queryString)
	// 	if err != nil {
	// 		return shim.Error(err.Error())
	// 	}
	// 	return shim.Success(queryResults) // probably change this to return results.Events
	// }

	if fName == "get_events_by_passport" {
		if len(args) != 1 {
			return shim.Error("Incorrect number of arguments. Expected arguments: passportNumber")
		}

		passportNumber := strings.ToLower(args[0])
		queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"event\",\"passportNumber\":\"%s\"}}", passportNumber)
		//getQueryResultForQueryString()
		queryResults, err := getQueryResultForQueryString(stub, queryString)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(queryResults) // probably change this to return results.Events

		/*
			events, err := getEventByPassportNumber(stub, args[0])

			if err == nil {
				eventsBS, err := json.Marshal(events)
				if err != nil {
					return shim.Error(err.Error())
				}
				return shim.Success(eventsBS)
			}*/

		return shim.Error(err.Error())
	}

	if fName == "get_all_events" {

		queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"event\"}}")
		queryResults, err := getQueryResultForQueryString(stub, queryString)

		// events, err := getAllEvents(stub)

		if err == nil {
			events, err := json.Marshal(queryResults)
			if err != nil {
				return shim.Error(err.Error())
			}
			// return shim.Success(eventsBS)
			return shim.Success(events)
		}

		return shim.Error(err.Error())
	}

	if fName == "get_all_travellers" {

		queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"traveller\"}}")
		queryResults, err := getQueryResultForQueryString(stub, queryString)

		// events, err := getAllEvents(stub)
		// fmt.Printf(queryResults)
		if err == nil {
			travellers, err := json.Marshal(queryResults)
			// fmt.Printf(travellers)
			if err != nil {
				return shim.Error(err.Error())
			}
			// return shim.Success(eventsBS)
			// travellersAsBytes, _ := json.Marshal(travellers)              //convert to array of bytes
			// fmt.Printf(travellersAsBytes)
			return shim.Success(travellers)
		}

		return shim.Error(err.Error())
	}

	if fName == "get_traveller" {
		passportNumber := strings.ToLower(args[0])
		queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"traveller\",\"passportNumber\":\"%s\"}}", passportNumber)
		queryResults, err := getQueryResultForQueryString(stub, queryString)

		// events, err := getAllEvents(stub)

		if err == nil {
			events, err := json.Marshal(queryResults)
			if err != nil {
				return shim.Error(err.Error())
			}
			// return shim.Success(eventsBS)
			return shim.Success(events)
		}

		return shim.Error(err.Error())
	}

	if fName == "get_everything" {
		queryString := fmt.Sprintf("{}")
		queryResults, err := getQueryResultForQueryString(stub, queryString)

		// events, err := getAllEvents(stub)

		if err == nil {
			events, err := json.Marshal(queryResults)
			if err != nil {
				return shim.Error(err.Error())
			}
			// return shim.Success(eventsBS)
			return shim.Success(events)
		}

		return shim.Error(err.Error())
	}

	// type Traveller struct {
	// 	FirstName        string `json:"firstName"`
	// 	LastName         string `json:"lastName"`
	// 	PassportNumber   string `json:"passportNumber"`
	// 	Nationality      string `json:"nationality"`
	// 	FaceImage        string `json:"faceImage"`        // this is a baseline,
	// 	FingerprintImage string `json:"fingerprintImage"` // this is a baseline,
	// 	ObjectType       string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	// 	//
	// }

	if fName == "init_traveller" {
		// cert, err := submmiterCert(stub)
		// if err != nil {
		// 	return shim.Error(err.Error())
		// }

		/*
				if len(args) != 4 {
					return shim.Error(`Incorrect number of arguments. Expected arguments:
		        firstName, lastName, passportNumber, nationality`)
					// return shim.Error(`Incorrect number of arguments. Expected arguments:
		      //   uuid, timestamp, partnerID, eventType, location, passportNumber, faceImage, reservationNumber`)
				}*/

		firstName, lastName, passportNumber, nationality := args[0], args[1], args[2], args[3]
		// location, passportNumber, faceImage, reservationNumber := args[4], args[5], args[6], args[7]

		var traveller Traveller
		// traveller.UUID = uuid
		traveller.FirstName = firstName
		traveller.LastName = lastName
		traveller.PassportNumber = passportNumber
		traveller.Nationality = nationality
		// TODO, should store just the string of the image id, full image stored in cloudant. very computationally expensive to keep all images on ledger.
		// revisit.
		// traveller.FaceImage = faceImage
		// traveller.FingerprintImage = fingerprintImage
		traveller.ObjectType = "traveller"

		travellerJSONasBytes, err := json.Marshal(traveller)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = stub.PutState(passportNumber, travellerJSONasBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

		// err = validateUserForEventType(stub, cert, passportNumber)
		// if err != nil {
		// 	return shim.Error(err.Error())
		// }

		// err = stub.SQLExec(`INSERT INTO EVENTS (UUID, TS, PARTNER_ID, EVENT_NAME,
		//       EVENT_LOCATION, PASSPORT_NUMBER, FACE_IMAGE, RESERVATION_NO) VALUES(?, ?, ?, ?,?, ?, ?, ?)`,
		// 	uuid, timestamp, partnerID, eventType, location, passportNumber, faceImage, reservationNumber)
		return shim.Success([]byte("User successfully added!"))
	}

	// TODO
	// make generic contracts
	// (do lookup by x if args length more than 3?)
	// if args.length == 2
	// lookup type by id

	// get type id query
	// get events 1234 reservation
	// get events 1234 passport
	return shim.Error("Invalid operation, use 'add_event', 'get_event', 'get_events_by_reservation_number', get_events_by_passport' or 'get_all_events'")
}

func read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error
	fmt.Println("starting read")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting key of the var to query")
	}

	// input sanitation
	// err = sanitize_arguments(args)
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }

	key = args[0]
	valAsbytes, err := stub.GetState(key) //get the var from ledger
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	fmt.Println("Object keys")

	fmt.Println(string(valAsbytes))
	// fmt.Printf("%+v\n", security.Investor)

	fmt.Println("- end read")
	return shim.Success(valAsbytes) //send it onward
}

func validateUserForEventType(stub shim.ChaincodeStubInterface, userCert *x509.Certificate, reservationNumber, eventType string) error {
	if strings.ToUpper(eventType) == testing {
		return nil
	}

	if strings.ToUpper(eventType) == checkin {
		if userCert.Issuer.CommonName != "ca.org1.airexit.com" {
			return fmt.Errorf("EventType: %s is not authorized with certificates issued by %s", eventType, userCert.Issuer.CommonName)
		}

		err := checkSignature(userCert, []byte(caorg1PEM))
		if err != nil {
			return fmt.Errorf("Certificate verification failed: %v", err)
		}

		return nil
	}

	if strings.ToUpper(eventType) == screening {
		_, err := getEventByReservationNumberAndState(stub, reservationNumber, checkin)
		if err != nil {
			return err
		}

		if userCert.Issuer.CommonName != "ca.org2.airexit.com" {
			return fmt.Errorf("EventType: %s is not authorized with certificates issued by %s", eventType, userCert.Issuer.CommonName)
		}

		err = checkSignature(userCert, []byte(caorg2PEM))
		if err != nil {
			return fmt.Errorf("Certificate verification failed for user: %v", err)
		}

		return nil
	}

	if strings.ToUpper(eventType) == gate {
		_, err := getEventByReservationNumberAndState(stub, reservationNumber, screening)
		if err != nil {
			return err
		}

		if userCert.Issuer.CommonName != "ca.org3.airexit.com" {
			return fmt.Errorf("EventType: %s is not authorized with certificates issued by %s", eventType, userCert.Issuer.CommonName)
		}

		err = checkSignature(userCert, []byte(caorg3PEM))
		if err != nil {
			return fmt.Errorf("Certificate verification failed for user: %v", err)
		}

		return nil
	}

	return fmt.Errorf("Invalid eventType: %v", eventType)
}

// func getEventByUUID(stub shim.ChaincodeStubInterface, uuid string) (*event, error) {
// 	result, err := stub.SQLQuery(`SELECT UUID, TS, PARTNER_ID, EVENT_NAME,
//     EVENT_LOCATION, PASSPORT_NUMBER, FACE_IMAGE, RESERVATION_NO FROM EVENTS WHERE UUID = ?`, uuid)
// 	if err != nil {
// 		return nil, fmt.Errorf("Error retrieving events: %v", err)
// 	}
//
// 	for result.HasNext() {
// 		row, err := result.Next()
// 		if err != nil {
// 			return nil, err
// 		}
//
// 		return scanEvent(row), nil
// 	}
//
// 	return nil, errors.New("Event not found")
// }

func getEventByReservationNumberAndState(stub shim.ChaincodeStubInterface, reservationNumber string, state string) (string, error) {
	// result, err := stub.SQLQuery(`SELECT UUID, TS, PARTNER_ID, EVENT_NAME,
	// EVENT_LOCATION, PASSPORT_NUMBER, FACE_IMAGE, RESERVATION_NO FROM EVENTS WHERE
	// RESERVATION_NO = ? AND EVENT_NAME = ?`, reservationNumber, state)
	// if err != nil {
	// 	return nil, fmt.Errorf("Error retrieving events: %v", err)
	// }
	//
	// for result.HasNext() {
	// 	row, err := result.Next()
	// 	if err != nil {
	// 		return nil, err
	// 	}
	//
	// 	return scanEvent(row), nil
	// }
	// reservationNumber := strings.ToLower(args[0])
	// state := strings.ToLower(args[1])
	queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"event\",\"reservationNumber\":\"%s\",\"state\":\"%s\"}}", reservationNumber, state)
	//getQueryResultForQueryString()
	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return "{}", err
	}
	return string(queryResults), nil

	// return nil, errors.New("Event not found")
}

func getEventByReservationNumber(stub shim.ChaincodeStubInterface, reservationNumber string) (string, error) {
	/*
		result, err := stub.SQLQuery(`SELECT UUID, TS, PARTNER_ID, EVENT_NAME,
		EVENT_LOCATION, PASSPORT_NUMBER, FACE_IMAGE, RESERVATION_NO FROM EVENTS WHERE
		RESERVATION_NO = ?`, reservationNumber)
		if err != nil {
			return nil, fmt.Errorf("Error retrieving events: %v", err)
		}

		var events []*event

		for result.HasNext() {
			row, err := result.Next()
			if err != nil {
				return nil, err
			}

			events = append(events, scanEvent(row))
		}

		return events, nil
	*/
	// reservationNumber := strings.ToLower(args[0])
	queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"event\",\"reservationNumber\":\"%s\"}}", reservationNumber)
	//getQueryResultForQueryString()
	queryResults, err := getQueryResultForQueryString(stub, queryString)
	// return nil, errors.New("Event not found")
	if err != nil {
		return "{}", err //err.Error()
	}
	return string(queryResults), nil
}

/*
func getEventByPassportNumber(stub shim.ChaincodeStubInterface, passportNumber string) ([]*event, error) {
	result, err := stub.SQLQuery(`SELECT UUID, TS, PARTNER_ID, EVENT_NAME,
    EVENT_LOCATION, PASSPORT_NUMBER, FACE_IMAGE, RESERVATION_NO FROM EVENTS WHERE PASSPORT_NUMBER = ?`, passportNumber)
	if err != nil {
		return nil, fmt.Errorf("Error retrieving events: %v", err)
	}

	var events []*event

	for result.HasNext() {
		row, err := result.Next()
		if err != nil {
			return nil, err
		}

		events = append(events, scanEvent(row))
	}

	return events, nil
}
*/

func getAllEvents(stub shim.ChaincodeStubInterface) (string, error) {
	/*
			result, err := stub.SQLQuery(`SELECT UUID, TS, PARTNER_ID, EVENT_NAME,
		    EVENT_LOCATION, PASSPORT_NUMBER, FACE_IMAGE, RESERVATION_NO FROM EVENTS`)
			if err != nil {
				return nil, fmt.Errorf("Error retrieving events: %v", err)
			}

			var events []*event

			for result.HasNext() {
				row, err := result.Next()
				if err != nil {
					return nil, err
				}

				events = append(events, scanEvent(row))
			}
	*/
	queryString := "{}" //fmt.Sprintf("{\"selector\":{\"docType\":\"event\",\"reservationNumber\":\"%s\"}}", reservationNumber)
	//getQueryResultForQueryString()
	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return "", errors.New("Event not found")
	}
	return string(queryResults), nil
}

// func scanEvent(row sql.Row) *event {
// 	var uuid string
// 	var timestamp time.Time
// 	var partnerID, eventType, location, passportNumber, faceImage, reservationNumber string
//
// 	row.Scan(&uuid, &timestamp, &partnerID, &eventType, &location, &passportNumber, &faceImage, &reservationNumber)
//
// 	event := &event{
// 		UUID:              uuid,
// 		Timestamp:         timestamp,
// 		PartnerID:         partnerID,
// 		EventType:         eventType,
// 		Location:          location,
// 		PassportNumber:    passportNumber,
// 		FaceImage:         faceImage,
// 		ReservationNumber: reservationNumber,
// 	}
// 	return event
// }

func checkSignature(userCert *x509.Certificate, rootCertText []byte) error {
	rootCert, err := parseCert(rootCertText)
	if err != nil {
		return fmt.Errorf("Certificate error: %v", err)
	}

	err = userCert.CheckSignatureFrom(rootCert)
	if err != nil {
		return fmt.Errorf("Certificate verification failed: %v", err)
	}
	return nil
}

func parseCert(certText []byte) (*x509.Certificate, error) {
	block, _ := pem.Decode(certText)
	if block == nil {
		return nil, fmt.Errorf("Error decoding certificate: %v", certText)
	}
	ucert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("Error parsing certificate: %v", err)
	}
	return ucert, nil
}

func submmiterCert(stub shim.ChaincodeStubInterface) (*x509.Certificate, error) {
	creator, err := stub.GetCreator()
	if err != nil {
		return nil, err
	}
	certStart := bytes.IndexAny(creator, "----BEGIN CERTIFICATE-----")
	if certStart == -1 {
		return nil, errors.New("No certificate found")
	}
	certText := creator[certStart:]
	return parseCert(certText)
}

func main() {
	err := shim.Start(new(airexitChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}
