const express = require("express");
const app = express();

const morgan = require("morgan");
const bodyParser = require("body-parser");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var cors = require("cors");
app.use(cors({ origin: "*", credentials: true }));

const { port } = require("./api/config/config");

app.get('/', (req, res) => {
    res.send("CRUD api's using node & firebase")
});

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});