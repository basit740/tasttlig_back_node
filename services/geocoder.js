// Libraries
const NodeGeocoder = require("node-geocoder");
const { gis } = require("../db/db-config");

const geocoder = NodeGeocoder({
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: process.env.MAPQUEST_KEY,
  formatter: null,
});

// Set address co-ordinates helper function
const setAddressCoordinates = async (details) => {
  try {
    console.log("details from coordinates: ", details)
    const address = [
      details.address,
      details.city,
      details.state,
      details.country,
      details.postal_code,
    ].join(",");
    
    const coordinates = (await geocoder.geocode(address))[0];
    
    details.latitude = coordinates.latitude;
    details.longitude = coordinates.longitude;
    details.coordinates = gis.setSRID(
      gis.makePoint(coordinates.longitude, coordinates.latitude),
      4326
      );
      console.log("coordinates: ",details)

    return details;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  geocoder,
  setAddressCoordinates,
};
