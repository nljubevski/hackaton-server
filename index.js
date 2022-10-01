const express = require("express");
var cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const { orderBy } = require("lodash");
const myService = require("./service");

const { dataDir, statusIconsDir } = myService.dirs;

app.use(express.static("public"));

app.use(cors());
app.use(fileUpload({ createParentPath: true }));
app.use(bodyParser.json());

let publicResults = [];

const processFiles = (dir) => {
  const results = [];
  var list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fileFullPath = dir + "/" + file;
    const stat = fs.statSync(fileFullPath);
    if (stat && stat.isDirectory()) {
      const resultFile = JSON.parse(
        fs.readFileSync(fileFullPath + "/result.json")
      );

      const payload = {
        dir: file,
        ...resultFile,
        birthtime: stat.birthtime,
      };

      //   if (payload.uploadedAt === undefined) {
      //     payload.uploadedAt = 0;
      //   }

      const isItemProcessingPending = payload.outcome === null;
      if (isItemProcessingPending) {
        myService.processFile(payload, () => {
          publicResults = processFiles(dataDir);
        });
      }

      results.push(payload);
    }
  });

  return orderBy(results, ["birthtime"], ["desc"]);
};

//process files
publicResults = processFiles(dataDir);

app.get("/list", (req, res) => {
  publicResults = processFiles(dataDir);
  return res.status(200).json(publicResults);
});

app.get("/status/:id", (req, res) => {
  const id = req.params.id;
  return res.status(200).json(publicResults.find((it) => it.dir === id));
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
  const id = uuidv4();
  const path = dataDir + "/" + id;
  const imageName = "/image." + fileExtension;
  uploadPath = path + imageName;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);

    const payload = {
      id: id,
      imageName: imageName,
      statusIcon: null,
      outcome: null,
      description: null,
    };
    fs.writeFileSync(path + "/result.json", JSON.stringify(payload));
    console.log("New data saved...", JSON.stringify(payload, null, 2));
    res.send("File uploaded!");
  });
});

console.log("server listening on port 3000");
app.listen(3000);
