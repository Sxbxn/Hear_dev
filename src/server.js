import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("main"));
app.get("/meeting", (_, res) => res.render("meeting"));
app.get("/header", (_, res) => res.render("header"));
app.get("/footer", (_, res) => res.render("footer"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function checkRoom(roomName) {
    let count = wsServer.sockets.adapter.rooms.get(roomName)?.size;
    if (count == 1) {
        return true;
    } else {
        return false;
    }
}

wsServer.on("connection", socket => {
    socket.on("enter_code", (roomName) => {
        socket.emit("enter_code", checkRoom(roomName));
    });
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
});

const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);