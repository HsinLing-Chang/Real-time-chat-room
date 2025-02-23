const socket = io("ws://localhost:3500");

const msgInput = document.querySelector("#message");
const msgForm = document.querySelector(".msg-form");
const activity = document.querySelector(".activity");
const activityWrapper = document.querySelector(".activity-wrapper");
//Join room
const userName = document.querySelector("#name");
const userRoom = document.querySelector("#room");
const roomForm = document.querySelector(".room-form");

const toggleBtn = document.querySelector(".toggle-btn");
const roomInfo = document.querySelector(".room-info");
const roomDisplay = document.querySelector(".room-ul");
const bars = document.querySelectorAll(".bar");

const currentRoom = document.querySelector(".current-room");
const usersInfo = document.querySelector(".users-info");

class UserValue {
  static username = null;
  static room = [];
}

toggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  roomInfo.classList.toggle("active");
  bars.forEach((bar) => bar.classList.toggle("color-white"));
});

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  UserValue.username = userName.value;
  UserValue.room = userRoom.value;
  const userValue = {
    username: UserValue.username,
    room: UserValue.room,
  };
  socket.emit("enterRoom", userValue);

  currentRoom.textContent = "Current Room:  " + UserValue.room;
});

msgForm.addEventListener("submit", msgFomrSubmit);
function msgFomrSubmit(e) {
  e.preventDefault();
  if (msgInput.value && UserValue.username && UserValue.room) {
    socket.emit("message", msgInput.value);
    msgInput.value = "";
  }
}
// keypress event
let activityTimer;
msgInput.addEventListener("keydown", () => {
  socket.emit("typing", UserValue.username);
  clearTimeout(activityTimer);
  //user typing countor
  activityTimer = setTimeout(() => {
    socket.emit("stopTyping", UserValue.username);
  }, 1500);
});

roomDisplay.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    UserValue.username = userName.value || UserValue.username || null;
    UserValue.room = event.target.innerText;
    const userValue = {
      username: UserValue.username,
      room: UserValue.room,
    };
    socket.emit("enterRoom", userValue);
    currentRoom.textContent = "Current Room:  " + UserValue.room;
  }
});

socket.on("typing", (userList) => {
  const typingUser = userList.filter((user) => user !== UserValue.username);
  activityWrapper.classList.add("activity-color");
  activity.textContent =
    typingUser.length > 0
      ? `${typingUser.join(", ")} ${
          typingUser.length > 1 ? "are" : "is"
        } typing...`
      : "";
  if (typingUser.length == 0) {
    activityWrapper.classList.remove("activity-color");
  }
});

socket.on("message", ({ name, text, time }) => {
  activity.textContent = "";
  activityWrapper.classList.remove("activity-color");
  const chatMsg = document.createElement("li");
  const chatDisplay = document.querySelector(".chat-display");
  if (name === "Admin") {
    chatMsg.classList.add("admin");
    chatMsg.textContent = text;
  } else if (name === UserValue.username) {
    chatMsg.classList.add("user", "text-box");
  } else {
    chatMsg.classList.add("others", "text-box");
  }
  if (name !== "Admin") {
    chatMsg.innerHTML = `<div class='name-and-time  ${
      name == UserValue.username ? "user-color" : "other-color"
    }'>
    <span class='username'>${name}</span>
    <span class='time'>${time}</span></div>
    <div class='text'>${text}</div>`;
  }
  chatDisplay.appendChild(chatMsg);
  //跳轉到最新訊息
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

if (!UserValue.username) {
  socket.on("username", (username) => {
    UserValue.username = username;
    userName.value = UserValue.username;
  });
}

socket.on("roomList", (roomList) => {
  UserValue.roomList = roomList;
  roomDisplay.innerHTML = UserValue.roomList
    .map((room) => `<a href="#"><li class="room-li">${room}</li></a>`)
    .join("");
});

socket.on("userList", (userList) => {
  usersInfo.innerHTML =
    "Current User :  " +
    userList.map((user) => `<a href='#'><span>${user}</span></a> `);
});
