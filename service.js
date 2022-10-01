const fs = require("fs");

const dataDir = "./public/data";
const statusIconsDir = "./public/statusIcons";

// values for the random outcome generator
const possibleProcessingOutcomes = [true, false];

const possibleProcessingStatuses = [
  "beetle.svg",
  "cut.svg",
  "evergreenTree.svg",
  "honeybee.svg",
];

const possibleProcessingDescription = [
  "The journey of a thousand miles begins with one step.",
  "That which does not kill us makes us stronger.",
  "Life is what happens when you’re busy making other plans.",
  "When the going gets tough, the tough get going.",
  "You must be the change you wish to see in the world.",
  "You only live once, but if you do it right, once is enough.",
];

// const dataSample = {
//   dir: "539ad41d-9cba-49b1-a3f5-9c5e25e5a487",
//   imageName: "/image.jpg",
//   outcome: null,
//   description: null,
//   birthtime: "2022-10-01T01:00:12.646Z",
// };

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const getImageUrl = (data) => {
  return `${dataDir}/${data.dir}/${data.imageName}`;
};

const getRandomOutcome = (previousOutcome, imageToBeProcessed) => {
  const newOutcome = {
    ...previousOutcome,
    outcome:
      possibleProcessingOutcomes[
        getRandomInt(possibleProcessingOutcomes.length)
      ],
    statusIcon:
      possibleProcessingStatuses[
        getRandomInt(possibleProcessingStatuses.length)
      ],
    description:
      possibleProcessingDescription[
        getRandomInt(possibleProcessingDescription.length)
      ],
  };
  return newOutcome;
};

const getOutcome = (previousOutcome, imageToBeProcessed) => {
  //
  //
  //
  //
  // TODO do real image processing here
  //
  //
  //
  //
  const outcome = {
    ...previousOutcome,
    outcome: null,
    statusIcon: null,
    description: null,
  };
  return outcome;
};
//
exports.dirs = { dataDir, statusIconsDir };
exports.getRandomInt = getRandomInt;

exports.processFile = async (previousOutome, onProcessed) => {
  //change this value to 0, for no processing delay;
  const simulatedDelayInMseconds = 3000;

  setTimeout(() => {
    //image file to be processed
    const imageData = fs.readFileSync(getImageUrl(previousOutome));

    // *** uncomment this for the real processing ***
    //const outcome = getOutcome(previousOutome, imageData);

    //*** random outcome generator ***
    //comment this like to disable random generator , see the commoent above
    const outcome = getRandomOutcome(previousOutome, imageData);

    console.log("Processeed ... ", JSON.stringify(outcome, null, 2));

    //write outcome
    fs.writeFileSync(
      `${dataDir}/${outcome.dir}/result.json`,
      JSON.stringify(outcome, null, 2)
    );
    onProcessed();
  }, simulatedDelayInMseconds);
};
