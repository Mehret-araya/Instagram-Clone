import Notification from "../models/Notification.js";


// Get User Notifications
export const getNotifications = async (req, res) => {

    try {


        const notifications = await Notification.find({

            receiver:req.user._id

        })

        .populate(
            "sender",
            "username profilePicture"
        )

        .populate(
            "post"
        )

        .sort({
            createdAt:-1
        });



        res.status(200).json({

            count:notifications.length,

            notifications

        });



    } catch(error){


        res.status(500).json({

            message:error.message

        });


    }

};