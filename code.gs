/**
 * Serves the User.html file as the web app interface.
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('User')
    .evaluate()
    .setTitle('Price Generator')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Includes HTML files for the web app.
 * @param {string} filename - The name of the HTML file to include.
 * @return {string} - The content of the HTML file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Validates the admin password.
 * @param {string} inputPassword - The password entered by the admin.
 * @return {boolean} - Returns true if valid, false otherwise.
 */
function validateAdminPassword(inputPassword) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const storedPassword = scriptProperties.getProperty('adminPassword') || 'admin'; // Default password is 'admin'
  return inputPassword === storedPassword;
}

/**
 * Sets a new admin password. (Use with caution)
 * @param {string} newPassword - The new admin password.
 */
function setAdminPassword(newPassword) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('adminPassword', newPassword);
}

/**
 * Retrieves all multipliers and their probabilities.
 * @return {Object} - An object containing arrays of multipliers and probabilities.
 */
function getMultipliers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Multipliers');
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('Multipliers');
    // Set headers
    sheet.appendRow(['Multiplier', 'Probability']);
    return { multipliers: [], probabilities: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  
  // Assuming the first row is headers
  const multipliers = [];
  const probabilities = [];
  
  for (let i = 1; i < data.length; i++) {
    const multiplier = parseFloat(data[i][0]);
    const probability = parseFloat(data[i][1]);
    if (!isNaN(multiplier) && !isNaN(probability)) {
      multipliers.push(multiplier);
      probabilities.push(probability);
    }
  }
  
  return { multipliers, probabilities };
}

/**
 * Saves multipliers and their probabilities to the sheet.
 * @param {Object} settings - An object containing arrays of multipliers and probabilities.
 */
function saveMultipliers(settings) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Multipliers');
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('Multipliers');
    // Set headers
    sheet.appendRow(['Multiplier', 'Probability']);
  }
  
  // Clear existing data except headers
  sheet.clearContents();
  sheet.appendRow(['Multiplier', 'Probability']);
  
  // Append new data
  for (let i = 0; i < settings.multipliers.length; i++) {
    sheet.appendRow([settings.multipliers[i], settings.probabilities[i]]);
  }
}

/**
 * Retrieves all sales options.
 * @return {Array} - An array of sales options objects.
 */
function getSalesOptions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SalesOptions');
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('SalesOptions');
    // Set headers
    sheet.appendRow(['Number', 'Name', 'Cost (成本)', 'Selling Price (售價)']);
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  
  // Assuming the first row is headers
  const salesOptions = [];
  
  for (let i = 1; i < data.length; i++) {
    const number = parseInt(data[i][0], 10);
    const name = data[i][1];
    const cost = parseFloat(data[i][2]);
    const sellingPrice = parseFloat(data[i][3]);
    if (!isNaN(number) && name && !isNaN(cost) && !isNaN(sellingPrice)) {
      salesOptions.push({ number, name, cost, sellingPrice });
    }
  }
  
  return salesOptions;
}

/**
 * Saves sales options to the sheet.
 * @param {Object} settings - An object containing arrays of numbers, names, costs, and sellingPrices.
 */
function saveSalesOptions(settings) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SalesOptions');
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('SalesOptions');
    // Set headers
    sheet.appendRow(['Number', 'Name', 'Cost (成本)', 'Selling Price (售價)']);
  }
  
  // Clear existing data except headers
  sheet.clearContents();
  sheet.appendRow(['Number', 'Name', 'Cost (成本)', 'Selling Price (售價)']);
  
  // Append new data
  for (let i = 0; i < settings.numbers.length; i++) {
    sheet.appendRow([
      settings.numbers[i],
      settings.names[i],
      settings.costs[i],
      settings.sellingPrices[i]
    ]);
  }
}

/**
 * Retrieves the full setup including multipliers and sales options.
 * @return {Object} - An object containing multipliers, probabilities, and sales options.
 */
function getFullSetup() {
  const multipliersData = getMultipliers();
  const salesOptions = getSalesOptions();
  return { multipliers: multipliersData.multipliers, probabilities: multipliersData.probabilities, salesOptions };
}

/**
 * Generates the final prices based on selected options and random multiplier selection.
 * @param {Array} selectedOptions - An array of selected sales options with their quantities.
 * @return {Object} - An object containing the total final price, total profit, and summary data.
 */
function generateFinalPrices(selectedOptions) {
  const multipliersData = getMultipliers();
  const totalMultipliers = multipliersData.multipliers.length;
  
  if (totalMultipliers === 0) {
    throw new Error('No multipliers defined. Please configure multipliers in the Admin Panel.');
  }
  
  // Determine selected multiplier based on probability
  const random = Math.random() * 100;
  let cumulative = 0;
  let selectedMultiplier = multipliersData.multipliers[0];
  
  for (let i = 0; i < totalMultipliers; i++) {
    cumulative += multipliersData.probabilities[i];
    if (random <= cumulative) {
      selectedMultiplier = multipliersData.multipliers[i];
      break;
    }
  }
  
  // Calculate total final price and total profit
  let totalFinalPrice = 0;
  let totalProfit = 0;
  
  selectedOptions.forEach(option => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SalesOptions');
    const data = sheet.getDataRange().getValues();
    
    // Find the sales option by number
    let salesOption = null;
    for (let i = 1; i < data.length; i++) {
      if (parseInt(data[i][0], 10) === option.optionNumber) {
        salesOption = {
          number: parseInt(data[i][0], 10),
          name: data[i][1],
          cost: parseFloat(data[i][2]),
          sellingPrice: parseFloat(data[i][3])
        };
        break;
      }
    }
    
    if (salesOption) {
      const finalPrice = salesOption.sellingPrice * option.quantity * selectedMultiplier;
      const profit = (salesOption.sellingPrice - salesOption.cost) * option.quantity * selectedMultiplier;
      totalFinalPrice += finalPrice;
      totalProfit += profit;
    }
  });
  
  // Log the sale
  logSale({ selectedOptions, selectedMultiplier, totalFinalPrice, totalProfit });
  
  // Prepare summary
  const summary = getSummary();
  
  return { totalFinalPrice, totalProfit, summary, selectedMultiplier };
}

/**
 * Logs the sale details to the SalesLog sheet.
 * @param {Object} saleData - An object containing sale details.
 */
function logSale(saleData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SalesLog');
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('SalesLog');
    sheet.appendRow(['Timestamp', 'Selected Options', 'Selected Multiplier', 'Total Final Price', 'Total Profit']);
  }
  
  // Prepare log entry
  const timestamp = new Date();
  const selectedOptionsStr = saleData.selectedOptions.map(opt => 
    `#${opt.optionNumber} (${opt.quantity})`
  ).join(', ');
  const logEntry = [
    timestamp,
    selectedOptionsStr,
    saleData.selectedMultiplier,
    saleData.totalFinalPrice,
    saleData.totalProfit
  ];
  
  // Append to SalesLog
  sheet.appendRow(logEntry);
}

/**
 * Retrieves a summary of total income, revenue, and profit.
 * @return {Object} - An object containing total income, total revenue, and total profit.
 */
function getSummary() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SalesLog');
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('SalesLog');
    sheet.appendRow(['Timestamp', 'Selected Options', 'Selected Multiplier', 'Total Final Price', 'Total Profit']);
    return { totalIncome: 0, totalRevenue: 0, totalProfit: 0 };
  }
  
  const data = sheet.getDataRange().getValues();
  
  let totalIncome = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  
  for (let i = 1; i < data.length; i++) { // Skip headers
    const finalPrice = parseFloat(data[i][3]);
    const profit = parseFloat(data[i][4]);
    
    if (!isNaN(finalPrice)) {
      totalIncome += finalPrice;
    }
    if (!isNaN(profit)) {
      totalProfit += profit;
    }
  }
  
  // Assuming Total Revenue = Total Income in this context
  totalRevenue = totalIncome;
  
  return { totalIncome, totalRevenue, totalProfit };
}
