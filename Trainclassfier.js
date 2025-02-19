const fs = require("fs");
const xlsx = require("xlsx");
const natural = require("natural");

const classifier = new natural.BayesClassifier();

// Load classifier.xlsx
const workbook = xlsx.readFile("classifier.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const trainingData = xlsx.utils.sheet_to_json(sheet);

// Check if data is loaded correctly
if (trainingData.length === 0) {
  console.error("Error: No training data found in classifier.xlsx");
  process.exit(1);
}

// Train the classifier
trainingData.forEach((row) => {
  if (row.Scenario && row.Category) {
    const label = JSON.stringify({
      category: row.Category.trim(),
      subCategory: row["Sub-Category"] ? row["Sub-Category"].trim() : "N/A",
      reason: row.Reason ? row.Reason.trim() : "N/A",
    });

    console.log(`Training with: "${row.Scenario}" → ${label}`); // Debugging log
    classifier.addDocument(row.Scenario, label);
  }
});

// Train and save model
classifier.train();

classifier.save("classifier.json", (err) => {
  if (err) console.error("Error saving model:", err);
  else console.log("✅ Classifier model saved successfully!");
});
