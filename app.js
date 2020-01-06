var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require("method-override"),
    app = express();

app.set("view engine" , "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

mongoose.connect("mongodb://localhost/blog_app");

var blogSchema = new mongoose.Schema({
    title : String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);
/* 
Blog.create({
    title: "Test Blog",
    image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=80",
    body: "djsladjksajdksakdsjak"
}); */

app.get("/" , function(req, res){
    res.redirect("/blogs");
});
  
app.get("/blogs" , function(req, res){    
    Blog.find({} , function(err, blogs){
        if(err) {
            console.log(err);
        } else {
            res.render("index" , {blogs: blogs});
        }
    });
});

//New route
app.get("/blogs/new" , function(req, res){
    res.render("new");
});

// create route
app.post("/blogs" , function(req,res){

    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog , function(err, newBlog){
       if(err){
           res.render("new");
       } else {
           res.redirect("/blogs");
       }
    });
});

//show route
app.get("/blogs/:id" , function(req, res){
    Blog.findById(req.params.id , function(err, foundBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("show" , {blog: foundBlog});
        }
    });
});

//edit route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, editBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("edit" , {blog: editBlog});
        }
    });
});

//update route
app.put("/blogs/:id" , function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id , req.body.blog, function(err, updatedBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//delete route
app.delete("/blogs/:id" , function(req,res) {
    Blog.findByIdAndRemove(req.params.id , function(err){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/blogs");
        } 
    });
});



app.listen(3000, function(req, res){
    console.log("Server has started");
})