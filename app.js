const express = require('express')
const port = process.env.PORT || 8080
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Admin = require('./model/admin')
const Voter = require('./model/voter')
const Candidate = require('./model/candidate')
const General = require('./model/general')
const Department = require('./model/department')
const Votes = require('./model/votes')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const multer = require('multer')
const dotenv = require('dotenv')
const UserVote = require('./model/uservote')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')
console.clear()
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
        // console.log("ATHE")
        if(req.user instanceof Voter){
            // console.log('nisud')
            return next()
        }else if(req.user instanceof Admin){
            res.redirect('/admin-dashboard')
        }
    }
    // console.log("wa ka sud")
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
app.get('/voters-candidates/GeneralElection',isLoggedInV,async(req,res)=>{
    const user = req.user
    const votingFor = "General Election"
    const data = await General.find({})
    let executive = []
    let representative = []
    const check = true
    let array = []
    for(let i=0; i<data.length; i++){
        if(data[i].executive==='Representative'){
           representative.push(data[i])
        }else if(data[i].executive==='Execom'){
            executive.push(data[i])
        }
    }
    res.render('voter/eventtlist',{user,votingFor,executive,representative,check,data})
})
app.get('/voters-candidates/DepartmentalElection',isLoggedInV,async(req,res)=>{
    const user = req.user
    const check = false
    const votingFor = "Departmental Election"
    const data = await Department.find({})
    let array = []
    // for(let i=0; i<data.length; i++){
    //     if(data[i].event===votingFor){
    //         array.push(data[i])
    //     }
    // }
    res.render('voter/eventlist',{user,votingFor,array,check,data})
})
app.get('/voters-dashboard',isLoggedInV,async(req,res)=>{
    const user = req.user
    const department = await Department.find({})
    const general = await General.find({})
    res.render('voter/dashboard',{user,department,general})
})
app.get('/voters-general-execom',isLoggedInV,async(req,res)=>{
    const user = req.user
    const data = await General.find({})
    let execom = []
    let representative = []
    for(let i=0; i<data.length; i++){
        if(data[i].executive==='Execom'){
            execom.push(data[i])
        }else if(data[i].executive==='Representative'){
            representative.push(data[i])
        }
    }
    res.render('voter/execom',{data,execom,representative,user})
})
app.get('/voters-general-representative',isLoggedInV,async(req,res)=>{
    const user = req.user
    
})
app.get('/voters-departmental',isLoggedInV,async(req,res)=>{
    const user = req.user  
    

})
app.post('/cast-vote-execom',async(req,res)=>{
    const {president,vicepresident,secgeneral} = req.body
    let voteArray = []
    voteArray.push(president)
    voteArray.push(vicepresident)
    voteArray.push(secgeneral)
    const data = await General.find({})
    let id,voteCount
    
    
    for(let i=0; i<data.length; i++){
        for(let j=0;j<voteArray.length;j++){
            if(`${data[i].firstName}${data[i].lastName} ${data[i].position} ${data[i].party}`===voteArray[j]){
                id = data[i]._id
                voteCount = data[i].voteCount
                voteCount++
                General.findOneAndUpdate({_id:id},{voteCount}).then(data=>{console.log()})
                const arrObject = [{
                    firstName: data[i].firstName,
                    lastName:data[i].lastName,
                    party:data[i].party,
                    position:data[i].position,
                    imgUrl:data[i].imgUrl
                }]
                UserVote.findOneAndUpdate({_id:req.user._id},
                    {$push:{execom: arrObject}}).then(data=>console.log('yay'))
            }
        }
        
    }
    Voter.findOneAndUpdate({_id:req.user._id},{exeComHasV:true}).then(()=>{})
   
    res.redirect('/voters-dashboard')
    // res.send(voteArray)
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
app.get('/my-execom',isLoggedInV,async(req,res)=>{
    const id = req.user._id
    // console.log(id)
    const user = req.user
    const data = await UserVote.findById(id)
    // console.log(data)
    res.render('voter/myexecom',{user,data})
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
                        department:req.body.department,
                        password:hash,
                        imgUrl:"https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg"

                    })
                    await newUser.save().then((data)=>{
                        const userVoteLogs = new UserVote({
                            _id:data._id
                        })
                        userVoteLogs.save().then(()=>{})
                    })
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
    const data = await General.find({})
    let executive = []
    let representative = []
    const check = true
    let array = []
    for(let i=0; i<data.length; i++){
        if(data[i].executive==='Representative'){
           representative.push(data[i])
        }else if(data[i].executive==='Execom'){
            executive.push(data[i])
        }
    }
    res.render('adminn/eventlist',{user,votingFor,executive,representative,check,data})
})
app.get('/registered-candidates/DepartmentalElection',isLoggedInA,async(req,res)=>{
    const user = req.user
    const check = false
    const votingFor = "Departmental Election"
    const data = await Department.find({})
    let array = []
    // for(let i=0; i<data.length; i++){
    //     if(data[i].event===votingFor){
    //         array.push(data[i])
    //     }
    // }
    res.render('adminn/eventlist',{user,votingFor,array,check,data})
})
app.get('/admin-dashboard',isLoggedInA,async(req,res)=>{
    const user = req.user
    const department = await Department.find({})
    const general = await General.find({})
    res.render("adminn/dashboard",{user,department,general})
})
app.get('/admin-add-candidates',isLoggedInA,(req,res)=>{
    const user = req.user
    res.render('adminn/addcandidate',{user})
})
app.post('/admin-add-candidate',upload.single('img'),async(req,res)=>{
    // res.send(req.body.executive)
    if(req.body.event === 'General Election'){
        let general
        if(req.body.executive === 'Representative'){
            if(req.file){
                general = new General({
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    position:req.body.position,
                    department:req.body.department,
                    event:req.body.event,
                    executive:req.body.executive,
                    schoolTerm:req.body.schoolyear,
                    imgUrl: req.file.path,
                    voteCount:0,
                    party:req.body.party
                })
            }else{
                general = new General({
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    position:req.body.position,
                    department:req.body.department,
                    executive:req.body.executive,
                    event:req.body.event,
                    schoolTerm:req.body.schoolyear,
                    voteCount:0,
                    imgUrl: "https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg",
                    party:req.body.party
                })
                
            }

        }else if(req.body.executive === 'Execom'){
            if(req.file){
                general = new General({
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    position:req.body.position,
                    event:req.body.event,
                    executive:req.body.executive,
                    voteCount:0,
                    // department:req.body.department,
                    schoolTerm:req.body.schoolyear,
                    imgUrl: req.file.path,
                    party:req.body.party
                })
            }else{
                general = new General({
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    position:req.body.position,
                    executive:req.body.executive,
                    event:req.body.event,
                    voteCount:0,
                    // department:req.body.department,
                    schoolTerm:req.body.schoolyear,
                    imgUrl: "https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg",
                    party:req.body.party
                })
                
            }
        }
        await general.save().then(()=>{})
    }else if(req.body.event ==='Departmental Election'){
        // console.log(req.body.department)
        let department 
        if(req.file){
            department = new Department({
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                position:req.body.position,
                department:req.body.department,
                event:req.body.event,
                schoolTerm:req.body.schoolyear,
                imgUrl: req.file.path,
                voteCount:0,
                party:req.body.party
            })
        }else{
            department = new Department({
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                position:req.body.position,
                department:req.body.department,
                executive:req.body.executive,
                event:req.body.event,
                schoolTerm:req.body.schoolyear,
                voteCount:0,
                imgUrl: "https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg",
                party:req.body.party
            })
            
        }
        await department.save().then(()=>{})
    }
  
    res.redirect('/admin-add-candidates')
})
