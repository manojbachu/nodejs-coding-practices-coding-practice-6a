const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB ERROR: ${error.message}`);
  }
};

initializeServerAndDb();

//API 1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT * FROM state;`;
  const stateArray = await db.all(getStatesQuery);
  response.send(
    stateArray.map((eachState) => {
      return {
        stateId: eachState.state_id,
        stateName: eachState.state_name,
        population: eachState.population,
      };
    })
  );
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
  SELECT * FROM state
  WHERE state_id = ${stateId}`;
  const state = await db.get(getStateQuery);
  response.send({
    stateId: state.state_id,
    stateName: state.state_name,
    population: state.population,
  });
});

//API 3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictDetails = `
    INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
    VALUES
    ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const dbResponse = await db.run(addDistrictDetails);
  const districtId = dbResponse.lastID;
  response.send("District Successfully Added");
});

module.exports = app;
