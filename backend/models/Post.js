import mongoose from "mongoose";


const postSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    image:{
        url:{
            type:String,
            required:true
        },

        public_id:{
            type:String,
            required:true
        }
    },


    caption:{
        type:String,
        maxlength:2200
    },
    hashtags:[
    {
        type:String
    }
],


    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],


    comments:[
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },

        text:{
            type:String
        },

        replies:[
            {
                user:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"User"
                },

                text:{
                    type:String
                },

                createdAt:{
                    type:Date,
                    default:Date.now
                }
            }
        ]
    }
]



},
{
    timestamps:true
});


const Post = mongoose.model(
    "Post",
    postSchema
);


export default Post;