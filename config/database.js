const neo4j = require('neo4j-driver');

require('dotenv').config();

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

async function testDatabaseConnection(){
  try{
    await driver.verifyConnectivity();

    console.log('CognoDB connection successful');
    

  }catch(err){
    console.log('CognoDB connection failed:', err.message);
  }
}

module.exports = {
  driver,
  testDatabaseConnection,
};