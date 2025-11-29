import mongoose from 'mongoose'
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD


const URL = `mongodb+srv://${username}:${password}@cluster0.q9eo3o8.mongodb.net/?appName=Cluster0`
const connectToDatabase = async () => {
    try {
      await mongoose.connect(URL, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true
      });
      console.log(`Connection is successful`);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };
export default connectToDatabase;  