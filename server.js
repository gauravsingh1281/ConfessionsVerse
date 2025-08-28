require("dotenv").config();
const connectDb = require("./config/db.config");
const app = require("./src/app");

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
connectDb();
app.listen(port, () =>
    console.log(`Server has started on port ${port} successfully !`)
);
