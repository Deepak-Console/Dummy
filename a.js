const fs = require("fs");
const csv = require("csv-parser");
const fastCsv = require("fast-csv");
const natural = require("natural");

// Load trained classifier
natural.BayesClassifier.load("classifier.json", null, function (err, classifier) {
  if (err) {
    console.error("Error loading model:", err);
    return;
  }

  // Read CSV file and classify utterances
  const inputFile = "input.csv";
  const outputFile = "output.csv";
  const results = [];

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on("data", (row) => {
      if (row.utterance) {
        row.category = classifier.classify(row.utterance); // Classify utterance
      } else {
        row.category = "unknown";
      }
      results.push(row);
    })
    .on("end", () => {
      // Write updated data to new CSV file
      const ws = fs.createWriteStream(outputFile);
      fastCsv.write(results, { headers: true }).pipe(ws);
      console.log(`Classification complete! Check the file: ${outputFile}`);
    });
});
