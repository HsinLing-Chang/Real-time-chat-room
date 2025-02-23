# Real-Time Chat Room

Real-time chat room is a small, lightweight chat application built with JavaScript and Socket.IO. It allows users to join or create rooms and send message in real-time. The app doesn't store message, making it simple and easy to use for quick conversations.

## Introduction

The real-time chat room uses Socket.IO to establish a real-time communication channel between the client and server. By chosing Socket.IO, the application is able to handle multiple users in real-time.
In the future, there are plans to add additional features such as private chat rooms, user authentication, and more customization options to enhance the user experience.

## Feature

- **Muti-user real-time chat:** Users can send and receive messages instantly with other users in the same room.
- **Dynamic room management:** Users can create or join rooms. Rooms are automatically removed when all users leave, except for the default room.
- **Room-based communication:** Messages are only visible to users in the same room.
- **No message storage:** Messages are not stored on the server, ensuring that only active users can see them.
- **Typing status:** Displays "Someone is typing..." to others in the same room when a user is typing.

## Usage

- **Create or join room:** The user inputs a name and room, then clicks the "Join Room" button to either create a new room or join an exisiting room.

- **Room sidebar navigation:** The sidebar allows user to see a list of available rooms to join. If user has not entered a name, the system will assign a random ID. If a name is provided, it will be used instead.

- **Current room display:** At the top of the chat interface, the user can see the name of the room they are currently in and a list of user who are also in the room.

- **Chat in room:** Once user join a room, the user can send and receive messages in real-time with others in the same room.
