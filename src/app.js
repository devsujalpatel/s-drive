import express from "express";
import "dotenv/config";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());


app.get("/", (req, res, next) => {
  try {
    res.send("Hello World! 😀")
  } catch (error) {
    next(error)
  }
});

app.post("/user", (req, res, next) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            throw new Error("Email and Password is required");
        }
        res.status(201).json("User Logged in")
    } catch (error) {
        next(error)
    }
});


app.patch("/user:id", (req, res, next) => {
    try {
        const {email} = req.body; 
        const {id} = req.params.id;

        if(!email) {
            throw new Error("Email is not available")
        }

        if(!id) {
            throw new Error("User Id is required")
        }

        res.status(200).json("User Updated successfully")

    } catch (error) {
        next(error)
    }
})

app.delete("/user:id", (req, res, next) => {
    try {
        const {id} = req.params.id;

        if(!id) {
            throw new Error("User Id is required")
        }
        // Deletion Logic

        res.status(200).json("User deleted successfully")
    } catch (error) {
        next(error)
    }
})

app.use((err, req, res, next) => {
    res.send(err.message)
})