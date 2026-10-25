import dns from "node:dns";
import mongoose from "mongoose";

// Use Google Public DNS to resolve MongoDB Atlas SRV records
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (dnsErr) {
    console.warn("Could not set DNS servers:", dnsErr);
}

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log('MongoDB connected successfully');
        });
        await mongoose.connect(process.env.MONGODB_URI!);
    } catch (error: any) {
        console.error('MongoDB Connection Error:', error?.message || error);
        console.log('Tip: Check your MongoDB Atlas Network Access whitelist (allow 0.0.0.0/0 or current IP).');
    }
}

export default connectDB;


