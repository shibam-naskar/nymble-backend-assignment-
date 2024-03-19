const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());

app.use(express.json());
app.use(authRouter);

authRouter.get('/play/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(`${__dirname}/files/${filename}.mp3`);
});

const DB =
  "mongodb+srv://SHIBAM:Shibam9064@cluster0.kg8r2.mongodb.net/nymble";

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`connected at port ${PORT}`);
});
