var express = require("express");
var app=express();

app.use(express.static("css"));
app.use(express.static("images"));
app.set("view engine", "ejs");


app.get("/",function(req,res){
	res.render("index");
});
	
app.get("/about",function(req,res){
	res.render("about");
});

app.get("/counselling",function(req,res){
	res.render("counselling");
});

app.get("/counsellor",function(req,res){
	res.render("counsellor");
});

app.get("/kolos",function(req,res){
	res.render("kolos");
});

app.get("/careers",function(req,res){
	res.render("careers");
});

app.get("/contacts",function(req,res){
	res.render("contacts");
});

app.listen(80,function(){
	console.log("Server started at port 80");
});