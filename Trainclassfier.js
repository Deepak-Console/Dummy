const fs = require("fs");
const xlsx = require("xlsx");
const natural = require("natural");

const classifier = new natural.BayesClassifier();

// Load training data from classifier.xlsx
const workbook = xlsx.readFile("classifier.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const trainingData = xlsx.utils.sheet_to_json(sheet);

// Train the classifier
trainingData.forEach((row) => {
  if (row.Scenario && row.Category) {
    classifier.addDocument(row.Scenario, JSON.stringify({
      category: row.Category,
      subCategory: row["Sub-Category"] || "N/A",
      reason: row.Reason || "N/A",
    }));
  }
});

classifier.train();

// Save trained model
classifier.save("classifier.json", (err) => {
  if (err) console.error("Error saving model:", err);
  else console.log("Classifier model saved!");
});
