const express = require('express')
const port = process.env.PORT || 8080
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Admin = require('./model/admin')
const Voter = require('./model/voter')
const Candidate = require('./model/candidate')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const multer = require('multer')
const dotenv = require('dotenv')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')

const localStrategy = require('passport-local').Strategy

dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder:"DEV"
    }
})
const upload = multer({
    storage: storage,
   
})
app.use(session({
    secret:"topibakat",
    resave: false,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())

//MIDDLEWARES
app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'/views'))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended:true}))
app.use(flash())

mongoose.connect("mongodb+srv://beefysalad:topibakat@cluster0.bgpas.mongodb.net/Voters?retryWrites=true&w=majority", {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    
})
const db = mongoose.connection
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
    console.log('Database connected')
})
//PASSPORT
passport.use('admin',new localStrategy(async (username,password,done)=>{
    Admin.findOne({username:username},function (err,user){
        if(err) return done(err)
        if(!user) return done(null,false,{message:'Invalid username or password!'})
        bcrypt.compare(password,user.password,function(err,res){
            if(err) return done(err)
            if(res==false) return done(null,false,{message:'Invalid username or password!'})
            return done(null,user)
        })
    })
}))
passport.use('voter',new localStrategy(async (username,password,done)=>{
    Voter.findOne({username:username},function(err,user){
        if(err) return done(err)
        if(!user) return done(null,false,{message:'Invalid username or password'})
        bcrypt.compare(password,user.password,function(err,res){
            if(err) return done(err)
            if(res==false) return done(null,false,{message:'Invalid username or password!'})
            return done(null,user)

        })
    })
}))
function isLoggedInV(req,res,next){
    if(req.isAuthenticated()){
        console.log("ATHE")
        if(req.user instanceof Voter){
            console.log('nisud')
            return next()
        }else if(req.user instanceof Admin){
            res.redirect('/admin-dashboard')
        }
    }
    console.log("wa ka sud")
    res.redirect('/voters-login')
}
function isLoggedOutV(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/voters-dashboard')
}
function isLoggedInA(req,res,next){
    if(req.isAuthenticated()){
        if(req.user instanceof Admin){
            return next()
        }
        else if(req.user instanceof Voter){
            res.redirect('/voters-dashboard')
        }
    }
    res.redirect('/admin-login')
}
function isLoggedOutA(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/admin-dashboard')
}
passport.serializeUser((user,done)=>{
    if(user instanceof Admin){
        done(null,{id:user.id,type:'Admin'})
    }else if(user instanceof Voter){
        done(null,{id:user.id,type:'Voter'})
    }
})
passport.deserializeUser((id,done)=>{
    if(id.type==='Admin'){
        Admin.findById(id.id,function(err,user){
            if(user){
                done(null,user)
            }else{
                done(err)
            }
        })
    }
    else if(id.type==='Voter'){
        Voter.findById(id.id,function(err,voter){
            if(voter){
                done(null,voter)
            }else{
                done(err)
            }
        })
    }
})

app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
})
// MAIN LANDING PAGE
app.get('/',(req,res)=>{
    res.render('landing/main')
})
app.get('/about-us',(req,res)=>{
    res.render('landing/about')
})
//VOTERS DASHBOARD AND ETC
app.get('/voters-login',isLoggedOutV,(req,res)=>{
    res.render("voter/login")
})
app.get('/voters-registration',isLoggedOutV,(req,res)=>{
    res.render("voter/register")
})
// app.post('/voters-registration',(req,res)=>{
//     res.send(req.body)
// })
app.get('/voters-dashboard',isLoggedInV,(req,res)=>{
    const user = req.user
    res.render('voter/dashboard',{user})
})
app.get('/voters-execom',isLoggedInV,(req,res)=>{
    res.render('voter/execom')
})
app.post('/voters-login',passport.authenticate('voter',{
    successRedirect: '/voters-dashboard',
    failureRedirect: '/voters-login',
    failureFlash: true
}))
app.get('/logoutVoter',(req,res)=>{
    req.logOut()
    res.redirect('/voters-login')
})
app.post('/voters-registration',(req,res)=>{
    Voter.findOne({username:req.body.username},(err,user)=>{
        if(user){
            req.flash('error','Username already taken')
            res.redirect('/voters-registration')
        }
        else{
            bcrypt.genSalt(10,function(err,salt){
                if(err) return next(err)
                bcrypt.hash(req.body.password,salt,async function(err,hash){
                    if(err) return next(err)
                    const newUser = new Voter({
                        firstName: req.body.firstName,
                        lastName:req.body.lastName,
                        username:req.body.username,
                        birthDate:req.body.birthDate,
                        address:req.body.address,
                        emailAddress:req.body.emailAddress,
                        contactNumber:req.body.contactNumber,
                        gender:req.body.gender,
                        password:hash,
                        imgUrl:"https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg"

                    })
                    await newUser.save().then(()=>{})
                    res.redirect('/voters-login')
                })
                
            })
        }
    })
})

//ADMIN DASHBOARD AND ETC.
app.get('/admin-login', isLoggedOutA,(req,res)=>{
    res.render("adminn/login")
})
app.get('/admin-registration',isLoggedOutA,(req,res)=>{
    res.render("adminn/register")
})
app.post('/admin-registration',async(req,res)=>{
    Admin.findOne({username:req.body.username},(err,user)=>{
        if(user){
            req.flash('error','Username already taken')
            res.redirect('/admin-registration')
        }
        else{
            bcrypt.genSalt(10,function(err,salt){
                if(err) return next(err)
                bcrypt.hash(req.body.password,salt,async function(err,hash){
                    if(err) return next(err)
                    const newAdmin = new Admin({
                        department:req.body.department,
                        votationName:req.body.electionname,
                        name:req.body.Name,
                        idNumber:req.body.idnumber,
                        username:req.body.username,
                        email:req.body.email,
                        password:hash,
                        imgUrl:"https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg"
                    })
                    await newAdmin.save().then(()=>{})
                    res.redirect('/admin-login')
                })
                
            })
        }
    })
   
})
app.post('/admin-login',passport.authenticate('admin',{
    successRedirect: '/admin-dashboard',
    failureRedirect: '/admin-login',
    failureFlash: true
}))
app.get('/logoutAdmin',(req,res)=>{
    req.logOut()
    res.redirect('/admin-login')
})
app.get('/registered-candidates/GeneralElection',isLoggedInA,async(req,res)=>{
    const user = req.user
    const votingFor = "General Election"
    const data = await Candidate.find({})
    let array = []
    for(let i=0; i<data.length; i++){
        if(data[i].event===votingFor){
            array.push(data[i])
        }
    }
    res.render('adminn/eventlist',{user,votingFor,array})
})
app.get('/registered-candidates/DepartmentalElection',isLoggedInA,async(req,res)=>{
    const user = req.user
    const votingFor = "Departmental Election"
    const data = await Candidate.find({})
    let array = []
    for(let i=0; i<data.length; i++){
        if(data[i].event===votingFor){
            array.push(data[i])
        }
    }
    res.render('adminn/eventlist',{user,votingFor,array})
})
app.get('/admin-dashboard',isLoggedInA,async(req,res)=>{
    const user = req.user
    const data = await Candidate.find({})
    let departmental = []
    let general = []
    for(let i=0; i<data.length; i++){
        if(data[i].event==='Departmental Election'){
            departmental.push(data[i])
        }else if(data[i].event==='General Election'){
            general.push(data[i])
        }
    }
    // console.log(departmental)
    // console.log(data)
    res.render("adminn/dashboard",{user,departmental,general})
})
app.get('/admin-add-candidates',isLoggedInA,(req,res)=>{
    res.render('adminn/addcandidate')
})
app.post('/admin-add-candidate',upload.single('img'),async(req,res)=>{
    let addCandidate
    if(req.file){
         addCandidate = new Candidate({
            firstName:req.body.firstName,
           lastName:req.body.lastName,
           position:req.body.position,
           party:req.body.party,
           courseYear: req.body.course,
           event:req.body.event,
           schoolTerm:req.body.schoolyear,
           imgUrl: req.file.path
          })
        
    }else{
          addCandidate = new Candidate({
          firstName:req.body.firstName,
           lastName:req.body.lastName,
           position:req.body.position,
           party:req.body.party,
           courseYear: req.body.course,
           event:req.body.event,
           schoolTerm:req.body.schoolyear,
           imgUrl:"https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg"
    })
    }
    await addCandidate.save().then(()=>{})
    res.redirect('/admin-add-candidates')
})
