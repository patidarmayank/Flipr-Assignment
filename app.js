const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const validator = require("validator");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

//connecting to database
const connectDatabase = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/Assignment", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    })
    .catch((err) => {
      console.log(err);
    });
};
connectDatabase();


//Task 1

const customerSchema = new mongoose.Schema({
  customerName:String,
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  mobileNumber:Number,
  city:String,
});


const Customer = new mongoose.model("Customer", customerSchema);



//creating new product as per the Task Api 1

app.post("/customer/new", async (req, res) => {
  const customerNow = await Customer.create(req.body);

  res.status(200).json({
    success: true,
    customerNow,
  })
});


// TASK 2
const purchaseSchema = mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Please Enter product Name"],
  },
  quantity: {
    type: Number,
    required: [true, "Please Enter product quantity"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter product Price"],
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,

  },
  
});

const Purchase = new mongoose.model("Purchase", purchaseSchema);

app.post("/purchase", async (req, res) => {

  const customerNow = await Customer.findById(req.body.customerId);
    if (!customerNow) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    const purchaseMade = await Purchase.create(req.body);

  res.status(200).json({
    success: true,
    purchaseMade,
  })
});


//Task 3 Shipping details

const shippingSchema = new mongoose.Schema({
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pinCode: {
      type: Number,
      required: true,
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    }
});


const Shipping = new mongoose.model("Shipping", shippingSchema);

app.post("/shipping", async (req, res) => {

  const purchaseFound = await Purchase.findById(req.body.purchaseId);
  
    if (!purchaseFound) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }
    if(purchaseFound.customerId!=await req.body.customerId ){
      return res.status(404).json({
        success:false,
        error:"Wrong user",
      });
    }

    const shippingInfo = await Shipping.create(req.body);

  res.status(200).json({
    success: true,
    shippingInfo,
  })
});


app.get("/customers/:city",async(req,res)=>{

  const customersWithShipments = await Shipping.find({params}).populate("Shipping");
  
});




const server = app.listen(2000, () => {
  console.log(`Server is working on http://localhost:2000`);
});
