const express = require("express");
var cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const _ = require("lodash");

const dataDir = "./public/data";
const statusIconsDir = "./public/statusIcons";

app.use(express.static("public"));

app.use(cors());
app.use(fileUpload({ createParentPath: true }));
app.use(bodyParser.json());

const walkDataDir = (dir) => {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fileFullPath = dir + "/" + file;
    const stat = fs.statSync(fileFullPath);
    if (stat && stat.isDirectory()) {
      const resultFile = JSON.parse(
        fs.readFileSync(fileFullPath + "/result.json")
      );
      results.push({
        dir: file,
        ...resultFile,
        birthtime: stat.birthtime,
      });
    }
  });
  return _.orderBy(results, ["birthtime"], ["desc"]);
};

console.log(walkDataDir(dataDir));

app.get("/list", (req, res) => {
  return res.status(200).json(walkDataDir(dataDir));
});

app.get("/download", (req, res) => {
  const file = `${dataDir}/upload-folder/dramaticpenguin.MOV`;
  res.download(file); // Set disposition and send it.
});

app.post("/upload", (req, res) => {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.sampleFile;
  const fileExtension = sampleFile.name.split(".")[1];
  const path = dataDir + "/" + uuidv4();
  const imageName = "/image." + fileExtension;
  uploadPath = path + imageName;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);
    fs.writeFileSync(
      path + "/result.json",
      JSON.stringify({
        imageName: imageName,
        statusIcon: null,
        outcome: null,
        description: null,
      })
    );
    res.send("File uploaded!");
  });
});

console.log("server listening on port 3000");
app.listen(3000);
