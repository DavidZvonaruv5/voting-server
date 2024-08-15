const {MongoClient} = require('mongodb')
require('dotenv').config();

class DBConnector
{
    
    constructor(dbName) 
    {
        const PASSWORD = process.env.PASSWORD
        const USER = process.env.USER

        this.dbName = dbName;

        this.uri = `mongodb+srv://${USER}:${PASSWORD}@cluster0.yyza8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        this.client = new MongoClient(this.uri);
    }

    async connectToDatabase() {
        try {
          await this.client.connect();
          console.log('Connected to MongoDB');
        } catch (error) {
          console.error('Error connecting to MongoDB:', error);
          process.exit(1);
        }
    }
}


module.exports = DBConnector