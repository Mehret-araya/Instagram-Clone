import { Server } from "socket.io";
import Message from "../models/Message.js";


let io;

const onlineUsers = new Map();



export const initSocket = (server) => {


    io = new Server(server, {

        cors:{
            origin:"*",
            methods:[
                "GET",
                "POST"
            ]
        }

    });



    io.on(
        "connection",
        (socket)=>{


            console.log(
                "User connected:",
                socket.id
            );



            // User joins
            socket.on(
                "join",
                (userId)=>{


                    onlineUsers.set(
                        userId.toString(),
                        socket.id
                    );


                    console.log(
                        "User online:",
                        userId
                    );


                    // Notify everyone
                    io.emit(
                        "userOnline",
                        {
                            userId
                        }
                    );


                }
            );




            // Send real-time message
            socket.on(
                "sendMessage",
                async(data)=>{


                    try {


                        const {
                            sender,
                            receiver,
                            text
                        } = data;



                        // Save message
                        const message =
                            await Message.create({

                                sender,

                                receiver,

                                text

                            });



                        // Find receiver socket
                        const receiverSocket =
                            onlineUsers.get(
                                receiver.toString()
                            );



                        // Send instantly
                        if(receiverSocket){


                            io.to(receiverSocket)
                            .emit(
                                "receiveMessage",
                                message
                            );


                        }



                    } catch(error){


                        console.log(
                            error.message
                        );


                    }


                }
            );





            // Typing indicator
            socket.on(
                "typing",
                (data)=>{


                    const receiverSocket =
                        onlineUsers.get(
                            data.receiverId.toString()
                        );



                    if(receiverSocket){


                        io.to(receiverSocket)
                        .emit(
                            "userTyping",
                            {
                                senderId:data.senderId
                            }
                        );


                    }


                }
            );





            // Stop typing indicator
            socket.on(
                "stopTyping",
                (data)=>{


                    const receiverSocket =
                        onlineUsers.get(
                            data.receiverId.toString()
                        );



                    if(receiverSocket){


                        io.to(receiverSocket)
                        .emit(
                            "userStoppedTyping",
                            {
                                senderId:data.senderId
                            }
                        );


                    }


                }
            );





            // User disconnects
            socket.on(
                "disconnect",
                ()=>{


                    for(
                        let [userId, socketId]
                        of onlineUsers.entries()
                    ){


                        if(socketId === socket.id){


                            onlineUsers.delete(userId);



                            console.log(
                                "User offline:",
                                userId
                            );



                            // Notify everyone
                            io.emit(
                                "userOffline",
                                {
                                    userId
                                }
                            );


                        }


                    }


                }
            );



        }
    );



    return io;


};





export const getIO = () => {


    if(!io){


        throw new Error(
            "Socket.IO not initialized"
        );


    }


    return io;


};





export const getOnlineUsers = () => {


    return onlineUsers;


};