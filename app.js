const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-shahin:testsm@cluster0.tmbjl.mongodb.net/ToDoListDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemsschema = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("Item", itemsschema);

const brakfast = new Item({
  name: "Breakfast"

});

const Lunch = new Item({
  name: "Lunch"

});


const Dinner = new Item({
  name: "Dinner Time"

});

const listSchema = {
  name: String,
  items: [itemsschema]
}

const list = mongoose.model("List", listSchema);


app.get("/", function (req, res) {


  Item.find({}, function (err, foundItem) {

    if (foundItem.length === 0) {
      Item.insertMany([brakfast, Lunch, Dinner], function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Succesfully Inserted Documents!")
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {
        ListTitle: "Today",
        addItems: foundItem
      });
    }
    if (err) {
      console.log(err);

    }


  });


});



app.get("/:customListName", function (req, res) {

  const customList = _.capitalize(req.params.customListName);

  list.findOne({
    name: customList
  }, function (err, foundItem) {
    if (!err) {
      if (!foundItem) {
        //create a new list
        const List = new list({
          name: customList,
          items: [brakfast, Lunch, Dinner]
      
        })
        List.save();
        res.redirect("/" + customList)
      } else {
        //show an existing list
          res.render("list", {
          ListTitle: foundItem.name,
          addItems: foundItem.items 
        });
      }

    }

  })

  

})




app.post("/", function (req, res) {

const newItem = req.body.item;
const listName = req.body.list;

const item = new Item({
  name:newItem
})
if(listName==="Today"){
  item.save();
  res.redirect("/")
} else{

  list.findOne({name:listName}, function(err, foundList){
   
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName)

  })
}


  
});


app.post("/delete", function (req, res) {

  const CheckedItemId = req.body.checkbox;
  const listName = req.body.listName;
  

  if(listName==="Today"){

    Item.findByIdAndRemove(CheckedItemId, function (err) {
      console.log(err);
    })
    res.redirect("/");
  
  } else{

    list.findOneAndUpdate({name:listName}, {$pull:{items: {_id:CheckedItemId}}}, function(err, foundList){
    
      if(!err){
        res.redirect("/" + listName)
      }

    })
  }
  

  

})


app.listen(process.env.PORT || 3000, function () {
  console.log("server is running on port 3000");
});