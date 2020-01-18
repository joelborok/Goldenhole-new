//============================
//           Declarations
//============================
const express        		= require("express");
const mongoose       		= require("mongoose");
const bodyParser     		= require("body-parser");
const passport       		= require("passport");
const LocalStrategy  		= require("passport-local");
const passportLocalMongoose	= require("passport-local-mongoose");	
const User     				= require("./user");
const multer				= require("multer");
const fs 					= require("fs");
const app            		= express();
var   fileName;

//============================
//           Configurations
//============================

app.use(require("express-session")({
	secret:"Hello world by kolos",
	resave:false,
	saveUninitialized:false
}));
app.use(express.static("css"));
app.use(express.static("images"));
app.use(express.static("uploads"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost/goldehole_01");


/*const storage=multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"./uploads");
	},filename:function(req,file,cb){
		cb(null,file.originalname);
	}
});*/
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
  	fileName=Date.now()+file.originalname;
    	cb(null,fileName);
  	}
})	
const upload=multer({
	storage:storage,
	limits:{
		fileSize:2000000//2mb
	},fileFilter(req,file,cb){
		if(!file.originalname.match(/\.(png|jpg|jpeg|svg)$/)){ 
			return cb(newError("Please upload a png image"));		
		}
		cb(undefined, true);
	}});
const uploadImage=multer({
	storage:storage,
	limits:{
		fileSize:2000000//2mb
	},fileFilter(req,file,cb){
		if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){ 
			return cb(newError("Please upload a png, jpg or jpeg image"));		
		}
		cb(undefined, true);
	}});

//mongoose.connect("mongodb://localhost/goldehole_01",{useNewUrlParser:true});

//============================
//           Schemas
//============================
const counsellingPage=new mongoose.Schema({
	name:String,
	gender:String,
	date:String,
	phone:Number,
	email:String,
	notified:Boolean
});
const CounsellingPage= mongoose.model("CounsellingPage",counsellingPage);

const careersNotification=new mongoose.Schema({
	email:String,
	notified:Boolean
});
const CareersNotification= mongoose.model("CareersNotification",careersNotification);

const careersApplication=new mongoose.Schema({
	firstName:String,
	lastName:String,
	email:String,
	position:String,
	file:String,
	notified:Boolean
});
const CareersApplication= mongoose.model("CareersApplication",careersApplication);

const contactsPage= new mongoose.Schema({
	name:String,
	email:String,
	question:String,
	notified:Boolean
});
const ContactsPage=mongoose.model("ContactsPage",contactsPage);

const counsellors=new mongoose.Schema({
	name:String,
	designation:String,
	bio_data:String,
	image:String
});
const Counsellors=mongoose.model("counsellors",counsellors);

const admissionPage =new mongoose.Schema({
	name:String,
	course:String,
	email:String,
	notified:Boolean
});
const Admission=mongoose.model("Admission",admissionPage);

//============================
//           Routes
//============================
app.get("/",function(req,res){
	res.render("index");
});
	
app.get("/about",function(req,res){
	res.render("about");
});

app.get("/counselling",function(req,res){
	res.render("counselling");
});
app.post("/counselling",function(req,res){
	var counselling=new CounsellingPage({
		name:req.body.name,
		gender:req.body.gender,
		date:req.body.date,
		phone:req.body.phone,
		email:req.body.email,
		notified:false

	});
	CounsellingPage.create(counselling,function(err,newCounsellor){
        	if(err){
             console.log("Error");
        	}else{
             res.redirect("/counselling");
        	}
        });
});

app.get("/counsellingData",isLoggedIn,function(req,res){
	CounsellingPage.find({},function(err,counsellingData){
		if(err){
			console.log(err);
		}else{
			res.render("counsellingData",{counsellingData:counsellingData});
		}
	});

});
app.post("/counsellingData/:id",isLoggedIn,function(req,res){
	CounsellingPage.findByIdAndUpdate(req.params.id,{notified:"true"},function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/counsellingData");
  	    }
	});
});
app.post("/counsellingData/:id/remove",isLoggedIn,function(req,res){
	CounsellingPage.findByIdAndRemove(req.params.id,function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/counsellingData");
  	    }
	});
});

app.get("/counsellor",function(req,res){
	Counsellors.find({},function(err,Counsellors){
		if(err){
			console.log(err);
			res.redirect("/");
		}else{
			res.render("counsellor",{Counsellors:Counsellors});		
		}
	});
	
});
app.get("/counsellor/:id",function(req,res){
	Counsellors.findById(req.params.id,function(err,Counsellor){
		if(err){
			console.log(err);
			res.redirect("/");
		}else{
			res.render("sub-counsellor",{Counsellor:Counsellor});		
		}
	});
});
app.get("/newCounsellor",isLoggedIn,function(req,res){
	res.render("newCounsellor");
});
app.post("/newCounsellor",uploadImage.single('upload'),function(req,res){
	/*req.body.upload = req.file.buffer;*/
	var counsellor=new Counsellors({
		name:req.body.name,
		designation:req.body.designation,
		bio_data:req.body.bio_data,
		image:fileName
	});
	Counsellors.create(counsellor,function(err,newCounsellor){
        if(err){
            console.log("Error");
        }else{
            res.redirect("/newCounsellor");
        }
	});
});
app.get("/counsellorsList",isLoggedIn,function(req,res){
	Counsellors.find({},function(err,Counsellors){
		if(err){
			console.log(err);
			res.redirect("/");
		}else{
			res.render("counsellorsList",{Counsellors:Counsellors});		
		}
	});
	
});
app.post("/counsellorsList/:id",isLoggedIn,function(req,res){
	Counsellors.findByIdAndUpdate(req.params.id,{notified:"true"},function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/counsellorsList");
  	    }
	});
});
app.post("/counsellorsList/:id/remove",isLoggedIn,function(req,res){
	var filePath;
	Counsellors.findById(req.params.id,function(err,returnData){
		filePath=returnData.image;
		console.log(filePath);
	});
	Counsellors.findByIdAndRemove(req.params.id,function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
  	    	 fs.unlink('uploads/'+filePath, function(err){
                if (err){
                	console.log(err);
                }
                console.log('path/file.txt was deleted');
              });
              res.redirect("/counsellorsList");
  	    }
	});
});




app.get("/admission",function(req,res){
	res.render("admission");
});
app.post("/admission",function(req,res){
	var admission=new Admission({
		name:req.body.name,
		course:req.body.course,
		email:req.body.email,
		notified:false

	});
	Admission.create(admission,function(err,admission){
        	if(err){
             console.log("Error");
        	}else{
             res.redirect("/admission");
        	}
        });
});
app.get("/admissionNotification",isLoggedIn,function(req,res){
	Admission.find({},function(err,Admission){
		if(err){
			console.log(err);
		}else{
			res.render("admissionNotification",{Admission:Admission});
		}
	});

});
app.post("/admissionNotification/:id",isLoggedIn,function(req,res){
	Admission.findByIdAndUpdate(req.params.id,{notified:"true"},function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/admissionNotification");
  	    }
	});
});
app.post("/admissionNotification/:id/remove",isLoggedIn,function(req,res){
	Admission.findByIdAndRemove(req.params.id,function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/admissionNotification");
  	    }
	});
});

app.get("/kolos",function(req,res){
	res.render("kolos");
});

app.get("/careers",function(req,res){
	res.render("careers");
});

app.get("/careersNotification",isLoggedIn,function(req,res){
	CareersNotification.find({},function(err,careersNotification){
		if(err){
			console.log(err);
		}else{
			res.render("careersNotification",{careersNotification:careersNotification});
		}
	});

});
app.post("/careersNotification/:id",isLoggedIn,function(req,res){
	CareersNotification.findByIdAndUpdate(req.params.id,{notified:"true"},function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/careersNotification");
  	    }
	});
});
app.post("/careersNotification/:id/remove",isLoggedIn,function(req,res){
	CareersNotification.findByIdAndRemove(req.params.id,function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/careersNotification");
  	    }
	});
});



app.get("/careersApplication",isLoggedIn,function(req,res){
	CareersApplication.find({},function(err,CareersApplication){
		if(err){
			console.log(err);
		}else{
			res.render("careersApplication",{CareersApplication:CareersApplication});
		}
	});

});

app.post("/careers/notification",function(req,res){
	var notifications=new CareersNotification({
		email:req.body.email,
		notified:false
	});
	CareersNotification.create(notifications,function(err,newCounsellor){
        if(err){
            console.log("Error");
        }else{
            res.redirect("/careers");
        }
	});
});
app.post("/careersApplication/:id",isLoggedIn,function(req,res){
	CareersApplication.findByIdAndUpdate(req.params.id,{notified:"true"},function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/careersApplication");
  	    }
	});
});
app.post("/careersApplication/:id/remove",isLoggedIn,function(req,res){
	var filePath;
	CareersApplication.findById(req.params.id,function(err,returnData){
		filePath=returnData.file;
		console.log(filePath);
	});
	CareersApplication.findByIdAndRemove(req.params.id,function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
  	    	  fs.unlink('uploads/'+filePath, function(err){
                if (err){
                	console.log(err);
                }
                console.log('path/file.txt was deleted');
              });
              res.redirect("/careersApplication");
  	    }
	});
});


app.get("/contacts",function(req,res){
	res.render("contacts");
});
app.post("/contacts",function(req,res){
	var contacts=new ContactsPage({
		name:req.body.name,
		email:req.body.email,
		question:req.body.question,
		notified:false
	});
	ContactsPage.create(contacts,function(err,newCounsellor){
        if(err){
            console.log("Error");
        }else{
            res.redirect("/contacts");
        }
	});
});
app.get("/contactsNotification",isLoggedIn,function(req,res){
	ContactsPage.find({},function(err,ContactsPage){
		if(err){
			console.log(err);
		}else{
			res.render("contactsNotification",{ContactsPage:ContactsPage});
		}
	});

});
app.post("/contactsNotification/:id",isLoggedIn,function(req,res){
	ContactsPage.findByIdAndUpdate(req.params.id,{notified:"true"},function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/contactsNotification");
  	    }
	});
});
app.post("/contactsNotification/:id/remove",isLoggedIn,function(req,res){
	ContactsPage.findByIdAndRemove(req.params.id,function(err,returnData){
		if(err){
              console.log("Error");
  	    }else{
              res.redirect("/contactsNotification");
  	    }
	});
});
//============================
//           Auth routes
//============================
app.get("/admin-register",function(req,res){
	res.render("admin-register");
});
	

app.post("/admin-register",function(req,res){
		User.register(new User({username:req.body.username}),req.body.password,function(err,user){
			if(err){
			console.log(err);
			return res.render("/admin-register");
			}
			passport.authenticate("local")(req,res,function(){
				res.redirect("/admin-page");
			});
		});
		
});

app.get("/admin-login",function(req,res){
	res.render("admin-login");
});
app.post("/admin-login",passport.authenticate("local",{
	successRedirect:"/admin-page",
	failureRedirect:"/admin-login"
}),function(req,res){
	res.render("admin-login");
});

app.get("/admin-page",isLoggedIn,function(req,res){
	res.render("admin-page");
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

app.get("/*",function(req,res){
	res.send("404 page not found");
});

app.post("/upload",upload.single('upload'),function(req,res){
	/*req.body.upload = req.file.buffer;*/
	var application=new CareersApplication({
		firstName:req.body.firstName,
		lastName:req.body.lastName,
		email:req.body.email,
		position:req.body.position,
		file:fileName,
		notified:false
	});
	CareersApplication.create(application,function(err,newCounsellor){
        if(err){
            console.log("Error");
        }else{
            res.redirect("/careers");
        }
	});
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/admin-login");
}
//============================
//           Listen
//============================
app.listen(80,function(){
	console.log("Server started at port 80");
});