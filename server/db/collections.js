var Collections = {
  'travellers': {
    created_by: String,
    created_at: Date,
    updated_by: String,
    updated_at: Date,
    deleted: Boolean,
    uuid: { type: String, required: true, unique: true },
    passportInfo: {
     passportNumber: { type: String, required: true},
     dateOfExpiration: { type: Date, required: true},
     firstName: { type: String, required: true},
     lastName: { type: String, required: true},
     sex: { type: String, required: true},
     nationality: { type: String, required: true}
    },
    reservationInfo: {
     ticketNumber: { type: String, required: true},
     operatingCarrierCode: { type: String, required: true},
     fromCityAirportCode: { type: String, required: true},
     toCityAirportCode: { type: String, required: true},
     flightNumber: { type: String, required: true},
     dateOfFlight: { type: Date, required: true},
     frequentFlyerNumber: { type: String, required: true},
     reservationNumber: { type: String, required: true},
     class: { type: String, required: true},
     seatNumber: { type: String, required: true},
     boardingGroup: { type: String, required: true},
     specialNeeds: { type: String, required: true},
    },
    visaInfo: {
     controlNumber: { type: String, required: true},
     dateOfExpiration: { type: Date, required: true}
    }
  },
  'images': {

  },
  'sessions': {

  }
}
var collections = [];
for (var key in Collections) {
  collections.push({
    name: key,
    definition: Collections[key]
  });
}

module.exports = collections;
