import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// Register User
export const registerUser = async (req, res) => {

    try {

        const { username, email, password } = req.body;


        // Check existing user
        const existingUser = await User.findOne({
            email
        });


        if(existingUser){
            return res.status(400).json({
                message:"User already exists"
            });
        }


        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });


        res.status(201).json({
            message:"User registered successfully",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        });


    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};




// Login User
export const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;


        // Find user
        const user = await User.findOne({
            email
        });


        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }



        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        if(!isPasswordCorrect){

            return res.status(400).json({
                message:"Invalid password"
            });

        }



        // Create JWT Token
        const token = jwt.sign(
            {
                id:user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );



        res.status(200).json({

            message:"Login successful",

            token,

            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }

        });



    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};