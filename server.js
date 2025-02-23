import express from "express";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const absPath = fileURLToPath(import.meta.url); // 當前檔案絕對路徑
const __dirname = dirname(absPath); //當前資料夾路徑
const app = express();

app.use(express.static(join(__dirname, "public"))); //public絕對路徑

const expressServer = app.listen(3500);

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV == "production" ? false : ["http://localhost:3500"],
  },
});
//Admin
const ADMIN = "Admin";
//message setting
function buildMsg(name, text) {
  return {
    name,
    text,
    time: Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).format(new Date()),
  };
}

class ChatManager {
  static defaultRooms = ["WeHelp #6"];
  static users = new Map();
  static rooms = new Map();
  static activeUser = new Set();
  //加入使用者
  static addUser(socketId, username, roomName) {
    this.users.set(socketId, {
      name: username || socketId.substring(0, 5),
      room: roomName,
    });
    //使用者加入房間
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(socketId);
    return this.users.get(socketId);
  }
  //獲取使用者名稱
  static getUser(socketId) {
    return this.users.get(socketId);
  }
  static getUserInRoom(roomName) {
    const allUserID = this.rooms.get(roomName);
    if (allUserID) {
      const userIds = Array.from(allUserID);
      return userIds.map((id) => this.users.get(id).name);
    } else {
      return null;
    }
  }
  //使用者離開房間
  static removeUser(socketId) {
    const user = this.users.get(socketId);
    const roomName = user?.room;
    const name = user?.name;
    if (roomName) {
      this.rooms.get(roomName).delete(socketId);
      if (
        this.rooms.get(roomName).size === 0 &&
        !this.defaultRooms.includes(roomName)
      ) {
        this.rooms.delete(roomName);
      }
      this.users.delete(socketId);
      this.activeUser.delete(name);
    }
  }

  static defaultRoomSetting() {
    for (let room of this.defaultRooms) {
      this.rooms.set(room, new Set());
    }
  }
}
//initialize rooms
ChatManager.defaultRoomSetting();

io.on("connection", (socket) => {
  //當用戶連線時更新房間
  io.emit("roomList", Array.from(ChatManager.rooms.keys()));

  socket.on("enterRoom", ({ username, room }) => {
    const prevUser = ChatManager.getUser(socket.id);
    const prevRoom = prevUser?.room;
    if (prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit(
        "message",
        buildMsg(ADMIN, `${prevUser.name} has left the room.`)
      );
      ChatManager.removeUser(socket.id);
      io.to(prevRoom).emit("userList", ChatManager.getUserInRoom(prevRoom));
    }
    const user = ChatManager.addUser(socket.id, username, room);
    socket.emit("username", user.name);
    console.log(ChatManager.users);
    socket.join(user.room);

    // console.log("當前房間: " + UserState.currentRooms);
    io.emit("roomList", Array.from(ChatManager.rooms.keys()));
    io.to(user.room).emit("userList", ChatManager.getUserInRoom(user.room));
    socket.emit(
      "message",
      buildMsg(ADMIN, `Welcome to ${user.room} chat room.`)
    );
    socket
      .to(room)
      .emit(
        "message",
        buildMsg(ADMIN, `User ${user.name} has enter the room.`)
      );
  });

  socket.on("message", (msg) => {
    const user = ChatManager.getUser(socket.id);
    const room = user?.room;
    io.to(room).emit("message", buildMsg(user?.name, msg));
  });

  //keypress
  socket.on("typing", (username) => {
    ChatManager.activeUser.add(username);
    const room = ChatManager.getUser(socket.id)?.room;
    socket.to(room).emit("typing", Array.from(ChatManager.activeUser));
  });

  socket.on("stopTyping", (username) => {
    ChatManager.activeUser.delete(username);
    const room = ChatManager.getUser(socket.id)?.room;
    socket.broadcast
      .to(room)
      .emit("typing", Array.from(ChatManager.activeUser));
  });

  socket.on("disconnect", () => {
    const user = ChatManager.getUser(socket.id);
    const room = user?.room;
    socket
      .to(room)
      .emit(
        "message",
        buildMsg(ADMIN, `${user?.name} has left the chat room.`)
      );

    ChatManager.removeUser(socket.id);
    console.log(ChatManager.users);
    console.log(ChatManager.rooms);
    //更新房間
    io.emit("roomList", Array.from(ChatManager.rooms.keys()));
    io.to(room).emit("userList", ChatManager.getUserInRoom(room));
    // console.log("剩餘使用者： " + JSON.stringify(UserState.users));
  });
});
