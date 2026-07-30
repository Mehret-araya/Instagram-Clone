import Message from "../models/Message.js";


// Send Message
export const sendMessage = async (req, res) => {

    try {

        const {
            receiver,
            text
        } = req.body;


        const message = await Message.create({

            sender:req.user._id,

            receiver,

            text

        });


        res.status(201).json({

            message:"Message sent successfully",

            data:message

        });


    } catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};



// Get Conversation
export const getMessages = async (req, res) => {

    try {


        const messages = await Message.find({

            $or:[

                {
                    sender:req.user._id,
                    receiver:req.params.userId
                },

                {
                    sender:req.params.userId,
                    receiver:req.user._id
                }

            ]

        })

        .sort({
            createdAt:1
        });


        res.status(200).json({

            count:messages.length,

            messages

        });



    } catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};