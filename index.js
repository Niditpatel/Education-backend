const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
mongoose.set('strictQuery', true);
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());

app.use('/', require('./api/Authentication/auth'));
app.use('/', require('./api/Route/getdata_route'));
app.use('/user', require('./api/Route/user_route'));
app.use('/institute', require('./api/Route/institute_route'));
app.use('/class', require('./api/Route/class_route'));
app.use('/book', require('./api/Route/book_route'));


const db = mongoose.connect("mongodb://localhost/ControllerApp").then(() => console.log("db connected")).catch((e) => console.log(e));
app.listen(3000, () => console.log("server connected"));