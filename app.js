const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

var app = express();
//app config
mongoose.connect('mongodb://localhost:27017/restful_blog', { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//mongoose model config
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//restful routes

app.get("/blogs/new" ,function (req, res) {
  res.render("new");
});

app.get("/blogs/:id", function (req, res){
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/")
    } else {
      res.render("show", {blog: foundBlog});
    }
  });
});

app.get("/blogs/:id/edit", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/")
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

app.put("/blogs/:id", function (req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog){
    if(err){
      res.redirect("/");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

app.post("/blogs", function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function (err, newBlog) {
    if (err){
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.delete("/blogs/:id", function (req, res){
  Blog.findByIdAndRemove(req.params.id, function (err) {
    if(err){
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  })
});

app.get("/blogs", function(req, res){
  Blog.find({}, function (err, blogs){
    if(err){
      console.log("ERROR!");
    } else {
      res.render("index", {blogs: blogs});
    }
  });
});

app.get("/", function(req, res){
  res.redirect("/blogs");
});

app.listen(3000, function(){
  console.log("Blog Started");
});
