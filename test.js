// const express = require('express');
// const { MongoClient, ObjectId } = require('mongodb');
// const cors = require('cors');
// require('dotenv').config();

// const PASSWORD = process.env.PASSWORD
// const USER = process.env.USER

// const uri = `mongodb+srv://${USER}:${PASSWORD}@cluster0.yyza8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const client = new MongoClient(uri);

// async function connectToDatabase() {
//     try {
//       await client.connect();
//       console.log('Connected to MongoDB');
//     } catch (error) {
//       console.error('Error connecting to MongoDB:', error);
//       process.exit(1);
//     }
//   }
// async function main(){
//     await connectToDatabase();
    
//     const userId = "206459561"
//     const metamaskAddress = "0xc758C85e15255EAD509C6A120de3543f29dDC8AA"
    
//     const db = client.db('VoterDB');
//     const collection = db.collection('voters_and_candidates');
    
//     const user = await collection.findOne({ [userId]: metamaskAddress });
//     console.log(user)

//     if (user) {
//         console.log("User verified successfully");
//       } else {
//         console.log("User verification failed");
//       }
// }
// main()