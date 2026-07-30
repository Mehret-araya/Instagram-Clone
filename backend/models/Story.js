import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
{
    user:{
        type: mongoose.Schema.Types.ObjectId,
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

    viewers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],

    expiresAt:{
        type:Date,
        required:true
    }

},
{
    timestamps:true
});


// Automatically delete stories after expiration
storySchema.index(
    { expiresAt:1 },
    { expireAfterSeconds:0 }
);


const Story = mongoose.model(
    "Story",
    storySchema
);


export default Story;