const express = require('express');
const bodyParser = require("body-parser");


const pg = require("pg");
const bcrypt = require("bcrypt");


// const path = require("path");
const saltRounds = 10;

const app = express();
require('dotenv').config();
//convert data into json format
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));

const db = new pg.Client({
    user: process.env.DB_USERNAME,
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

db.connect();

// app.use(session({
//     store: new pgSession({
//         pool: db, // Use the PostgreSQL client connection pool
//         tableName: 'session' // Name of the session table in the database
//     }),
//     secret: 'VERYTOPSECRET', // Secret used to sign the session ID cookie
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 24 * 60 * 60 * 1000 } // Cookie settings
// }));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));





//use ejs as the view engine
app.set('view engine','ejs');
//static file
// app.use(express.static("public"));

app.get("/",(req,res) => {
    res.render("index");
})

app.get("/lobby",(req,res) => {
    res.render("lobby");
})

app.get("/room",(req,res) => {
    res.render("room");
})

app.get("/chat",(req,res) => {
    res.render("chat");
})


app.get("/getstarted",(req,res) =>{
    res.render("getstarted");
})


app.get("/postlogin",(req,res) => {
    res.render("postlogin");
})

app.get("/postloginaiconv2",(req,res) => {
    res.render("postloginaiconv2");
})

app.get("/notes", (req, res) => {
    res.render("notes");

})

// app.get("/mynotes",(req, res) =>{

    
// })





app.get("/login",(req,res) => {
    res.render("login");
})

app.get("/signup",(req,res) => {
    
    res.render("signup");
})

app.get("/about" , (req,res)=>{
    res.render("about");
})

//Register user
app.post("/signup" ,async(req,res) => {

    const email = req.body.username;
    const Password = req.body.password;

    try{

        const checkResult = await db.query("SELECT * FROM users WHERE username = $1 ", [
            email,
        ]);
        if(checkResult.rows.length > 0)
        {
            res.send("username already exists...try a different username or try logging in instead");

        }
        else
        {
            //Password hashing
            bcrypt.hash(Password , saltRounds , async (err, hash) =>{
                if(err)
                {
                    console.log("Error hashing password: ", err);
                }
                else{

                    await db.query("INSERT INTO users (username , password) VALUES($1 , $2)", [email, hash]);
                    res.redirect("/login");
                }

            } )
    
        }

    } catch(err){
        console.log(err);
    }


    

});



    


//login user
app.post("/login",async (req,res) => {

    const email = req.body.username;
    const loginpassword = req.body.password;
    // console.log(username);
    // console.log(password);
    try{
        const result = await db.query("SELECT * FROM users WHERE username = $1 ", [
            email,
        ]);

        if(result.rows.length > 0)
        {
            const user = result.rows[0];
            const storedPassword = user.password;
            bcrypt.compare(loginpassword , storedPassword, (err, result) =>{
                if(err)
                {
                    console.log("Error comparing passwords ",err);
                }
                else
                {
                    if(result)
                    {
                        res.redirect("/getstarted");
                    }
                    else
                    {
                        res.send("Incorrect password");
                    }
                }
            } )
            

        }

        else
        {
            res.send("User not found");
        }

    } catch(err)
    {
        console.log(err);
    }


});

app.post("/notes", async (req, res) => {
    const email = req.body.username;
    const title = req.body.title;
    const content = req.body.content;
    try{
        const result = await db.query("SELECT * FROM users WHERE username = $1 ",[email]);
        if(result.rows.length >0)
        {
            const user = result.rows[0];
            const userid = user.id;

            await db.query("INSERT INTO note (title , content, user_id) VALUES($1 ,$2, $3)", [title, content,userid]);
            res.redirect(`/mynotes?id=${encodeURIComponent(userid)}`);
            
        }

        else
        {
            res.send("user not found");
        }

    }catch(err){
        console.log("Error inserting notes",err);
    }

    
});

app.get("/mynotes",async (req, res) =>{
    const noteid = req.query.id;
    try{

        const result =await db.query("SELECT * FROM note WHERE user_id = $1" ,[noteid]);
        if(result.rows.length > 0)
        {
            const data = result.rows;
            res.render("mynotes.ejs" , {data});
    
        }
        else
        {
            res.send("Notes not available");
        }

    }catch(err){
        console.log("Couldn't display notes",err);

    }

})

const port = 5000;
app.listen(port , () => {
console.log(`server running on port: ${port}`);
})