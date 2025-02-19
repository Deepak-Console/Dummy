const fs = require("fs");
const xlsx = require("xlsx");
const natural = require("natural");

// Load trained classifier
natural.BayesClassifier.load("classifier.json", null, (err, classifier) => {
  if (err) {
    console.error("Error loading classifier:", err);
    return;
  }

  // Read input.xlsx file
  const inputWorkbook = xlsx.readFile("input.xlsx");
  const inputSheet = inputWorkbook.Sheets[inputWorkbook.SheetNames[0]];
  const inputData = xlsx.utils.sheet_to_json(inputSheet);

  // Process each utterance
  const results = inputData.map((row) => {
    if (row.Scenario) {
      const prediction = JSON.parse(classifier.classify(row.Scenario));
      return {
        Scenario: row.Scenario,
        Category: prediction.category,
        "Sub-Category": prediction.subCategory,
        Reason: prediction.reason,
      };
    }
    return { Scenario: row.Scenario, Category: "Unknown", "Sub-Category": "N/A", Reason: "Could not classify" };
  });

  // Convert to Excel format
  const newSheet = xlsx.utils.json_to_sheet(results);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Classified Data");

  // Save output.xlsx
  xlsx.writeFile(newWorkbook, "output.xlsx");
  console.log("Classification completed! Check output.xlsx");
});
