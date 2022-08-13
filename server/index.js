import express from "express";
import cors from "cors"
import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors());

mongoose.connect('mongodb://localhost:27017/newuser').then(() => {
        console.log("connected to db");
}).catch((err) => {
        console.log("no connection")
})

const userSchema = mongoose.Schema({
        email: String,
        password: String,
        tokens: [
                {
                        token: {
                                type: String,
                                required: true
                        }
                }
        ]
})



app.post("/login", async (req, res) => {
        try {

                const { email, password } = req.body
                User.findOne({ email: email }, async (err, user) => {
                        if (user) {
                                const isMatch = await bcrypt.compare(password, user.password);

                                console.log(isMatch)
                                if (isMatch) {
                                        const token = await user.generateAuthToken();
                                        res.cookie("loginvalidtoken", token)

                                        res.status(200).send({ message: "Login Successfull", user: token })
                                }
                                else {
                                        res.status(401).send({ message: "Password didnt match" })
                                }
                        } else {
                                res.status(400).send("user not registered")
                        }
                })
        } catch (err) {
                console.log(err)
        }
})



app.post("/register", (req, res) => {
        const { email, password } = req.body
        User.findOne({ email: email }, (err, user) => {
                if (user) {
                        res.send({ message: "user already registered" })
                }
                else {
                        const user = new User({
                                email,
                                password
                        })
                        user.save(err => {
                                if (err) {
                                        res.send(err)
                                }
                                else {
                                        res.send({ message: "user added sussefully", });
                                }
                        })
                }
        })
        console.log(User)
})

userSchema.pre('save', async function (next) {
        const user = this;
        if (user.isModified('password')) {
                user.password = await bcrypt.hash(user.password, 12)
        }
        next();
})
userSchema.methods.generateAuthToken = async function () {
        try {
                let SECRET_KEY = "BGHNVCdgVrtJvhDVCDtyhBhgZSEdrctYVGHkmMKnHvGFCerddCgcDeDctDerRDcCszRthjmKokjHVdCResesZESxd"
                let token = jwt.sign({ _id: this._id }, SECRET_KEY)
                this.tokens = this.tokens.concat({ token: token });
                await this.save();
                return token
        }
        catch (err) {
                console.log(err);
        }
}




const User = new mongoose.model("User", userSchema)
app.listen(3008, () => {
        console.log("server started on 3002")
})

//routes
