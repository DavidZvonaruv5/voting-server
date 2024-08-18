const { ObjectId } = require('mongodb');

async function getAll(dbConnector,name) {
    try {
        // Ensure the dbConnector is provided and properly initialized
        if (!dbConnector || !dbConnector.client) {
            throw new Error("Database connector is not initialized.");
        }
        // Ensure the name is either candidates or voters
        if(!name || (name !== 'candidates' && name !== 'voters')){
            throw new Error("name argument is wrong.");
        }

        const db = dbConnector.client.db(dbConnector.dbName);
        const collection = db.collection('voters_and_candidates');

        const id = "66b8737c3469f64e5f3e22b0";

        // Check if the ID is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            throw new Error("Invalid ObjectId format.");
        }

        const doc = await collection.findOne({ _id: new ObjectId(id) });

        // Check if the document was found
        if (!doc) {
            throw new Error(`Document with ID ${id} not found.`);
        }

        const data = doc[name];

        // Ensure the 'voters' field exists and is an array
        if (!data || !Array.isArray(data)) {
            throw new Error("Voters data is missing or not in the correct format.");
        }
        
        console.log(data)
        return data;

    } catch (error) {
        console.error(`Error fetching data:`, error.message);
        throw error; // Re-throw the error after logging it, or handle it as needed
    }
}

module.exports = {getAll}