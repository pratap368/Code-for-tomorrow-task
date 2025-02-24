import express from "express";
import http from "http";
import {Server} from "socket.io";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./db";
import router from "./authRouter";
import dotenv from "dotenv";
import errorHandler from "./errorhandllingMiddleware";;


dotenv.config();
const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:""}});

app.use(express.json());       
app.use(cookieParser());            
app.use(router);               
app.use(errorHandler);          


AppDataSource.initialize()
.then(()=>console.log("database connected"))
.catch((err)=>console.log("dayabase connection error",err))

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("sendMessage", (data) => {
        io.emit("receiveMessage", data); 
    });

    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on("leaveRoom", (room) => {
        socket.leave(room);
        console.log(`User left room: ${room}`);
    });

    socket.on("disconnect", () => console.log("Client disconnected"));
});

const PORT=5000;
server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})