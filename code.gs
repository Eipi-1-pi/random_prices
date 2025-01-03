// File: Code.gs

/**
 * Constants for sheet names.
 */
const SALES_OPTIONS_SHEET_NAME = 'SalesOptions';
const SALES_LOG_SHEET_NAME = 'SalesLog';
const IP_LOG_SHEET_NAME = 'IPLog';
const CUSTOMERS_SHEET_NAME = 'Customers';
const LOCKED_USERS_SHEET_NAME = 'LockedUsers';

/**
 * Spreadsheet ID where IPs and Customers will be logged.
 * Replace the placeholder with your actual Spreadsheet ID.
 */
const SPREADSHEET_ID = '1T2WXJVLNr7NzxsG4GRxjtosdaRpUKMdH432Oc4RPAVY'; // <-- Replace with your Spreadsheet ID

/**
 * Script property key for admin password.
 */
const ADMIN_PASSWORD_PROPERTY = 'adminPassword';

/**
 * Default admin password. Change this to a secure password.
 * It's recommended to set this via a secure method instead of hardcoding.
 */
const DEFAULT_ADMIN_PASSWORD = 'admin123'; // <-- Change this to a secure password

/**
 * Serves the User.html file as the web app interface.
 * Adds a viewport meta tag for responsive design.
 *
 * @param {Object} e - Event parameter.
 * @return {HtmlOutput} - The rendered User.html file.
 */
function doGet(e) {
  // Initialize admin password if not set
  initializeAdminPassword();

  return HtmlService.createTemplateFromFile('User')
    .evaluate()
    .setTitle('Price Generator')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Function to include external HTML files.
 * Allows the use of <?!= include('filename'); ?> in HTML templates.
 *
 * @param {string} filename - The name of the HTML file to include (without .html extension).
 * @return {string} - The content of the included HTML file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}

/**
 * Initializes the admin password if not already set.
 * Hashes the password for secure storage.
 */
function initializeAdminPassword() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const storedHash = scriptProperties.getProperty(ADMIN_PASSWORD_PROPERTY);
  
  if (!storedHash) {
    const hashedPassword = hashString(DEFAULT_ADMIN_PASSWORD);
    scriptProperties.setProperty(ADMIN_PASSWORD_PROPERTY, hashedPassword);
    Logger.log('Admin password initialized to default.');
  }
}

/**
 * Hashes a given string using SHA-256.
 *
 * @param {string} str - The string to hash.
 * @return {string} - The hashed string in hexadecimal format.
 */
function hashString(str) {
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str);
  return hash.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * Validates the admin password by comparing hashed values.
 *
 * @param {string} password - The password entered by the admin.
 * @return {boolean} - True if password is correct, false otherwise.
 */
function validateAdminPassword(password) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const storedHash = scriptProperties.getProperty(ADMIN_PASSWORD_PROPERTY);
  
  if (!storedHash) {
    // Initialize with the default admin password
    initializeAdminPassword();
    Logger.log('Admin password initialized during validation.');
  }
  
  const inputHash = hashString(password);
  const isValid = inputHash === storedHash;
  Logger.log(`Admin password validation result: ${isValid}`);
  return isValid;
}

/**
 * Sets a new admin password by storing its hash.
 * Use this function carefully and ensure it's only accessible by authorized personnel.
 *
 * @param {string} newPassword - The new admin password to set.
 */
function setNewAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const newHash = hashString(newPassword);
  scriptProperties.setProperty(ADMIN_PASSWORD_PROPERTY, newHash);
  Logger.log('Admin password has been updated.');
}

/**
 * Logs visitor IP addresses and User IDs to the 'IPLog' sheet.
 * Each entry includes the timestamp, IP address, and User ID.
 *
 * @param {string} ip - The IP address of the visitor.
 * @param {string} userId - The unique User ID of the visitor.
 */
function logIP(ip, userId) {
  if (!ip || !userId) {
    throw new Error('Invalid IP address or User ID provided.');
  }
  
  const sheet = getOrCreateSheet(IP_LOG_SHEET_NAME, ['Timestamp', 'IP Address', 'User ID']);
  const timestamp = new Date();
  sheet.appendRow([timestamp, ip, userId]);
  
  Logger.log(`Logged IP: ${ip}, User ID: ${userId} at ${timestamp.toISOString()}`);
}

/**
 * Retrieves or creates a sheet with the given name and headers.
 *
 * @param {string} sheetName - The name of the sheet.
 * @param {Array} headers - The headers for the sheet.
 * @return {Sheet} - The retrieved or newly created sheet.
 */
function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    Logger.log(`Created new sheet: ${sheetName}`);
  } else {
    // Verify headers
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headersMatch = headers.every((header, index) => currentHeaders[index] === header);
    if (!headersMatch) {
      sheet.clear(); // Clear existing data
      sheet.appendRow(headers);
      Logger.log(`Reset headers for sheet: ${sheetName}`);
    }
  }
  
  return sheet;
}

/**
 * Retrieves or creates the 'Customers' sheet.
 *
 * @return {Sheet} - The 'Customers' sheet.
 */
function getOrCreateCustomersSheet() {
  return getOrCreateSheet(CUSTOMERS_SHEET_NAME, ['Customer Number', 'Timestamp']);
}

/**
 * Retrieves or creates the 'LockedUsers' sheet.
 *
 * @return {Sheet} - The 'LockedUsers' sheet.
 */
function getOrCreateLockedUsersSheet() {
  return getOrCreateSheet(LOCKED_USERS_SHEET_NAME, ['User ID', 'Customer Number', 'Timestamp']);
}

/**
 * Retrieves or creates the 'SalesLog' sheet.
 *
 * @return {Sheet} - The 'SalesLog' sheet.
 */
function getOrCreateSalesLogSheet() {
  const headers = [
    'Timestamp',
    'Number',
    'Chooses',
    'Selling Price (售價)',
    'Profit',
    'Total Offer',
    'Total Income (累加)',
    'Total Profit (累加)',
    'Bonus Bottles' // Added Bonus Bottles column
  ];
  return getOrCreateSheet(SALES_LOG_SHEET_NAME, headers);
}

/**
 * Retrieves or creates the 'SalesOptions' sheet.
 *
 * @return {Sheet} - The 'SalesOptions' sheet.
 */
function getOrCreateSalesOptionsSheet() {
  const headers = ['Number', 'Name', 'Cost (成本)', 'Selling Price (售價)'];
  return getOrCreateSheet(SALES_OPTIONS_SHEET_NAME, headers);
}

/**
 * Retrieves all sales options from the 'SalesOptions' sheet.
 *
 * @return {Array} - Array of sales option objects.
 */
function getSalesOptions() {
  const sheet = getOrCreateSalesOptionsSheet();
  const data = sheet.getDataRange().getValues();
  const salesOptions = [];
  
  // Assuming the first row is headers: Number, Name, Cost, Selling Price
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const number = parseInt(row[0], 10);
    const name = row[1];
    const cost = parseFloat(row[2]);
    const sellingPrice = parseFloat(row[3]);
    if (!isNaN(number) && name && !isNaN(cost) && !isNaN(sellingPrice)) {
      salesOptions.push({
        number,
        name,
        cost,
        sellingPrice
      });
    } else {
      Logger.log(`Invalid sales option data at row ${i + 1}: ${JSON.stringify(row)}`);
    }
  }
  
  return salesOptions;
}

/**
 * Saves sales options to the 'SalesOptions' sheet.
 *
 * @param {Object} settings - An object containing arrays of numbers, names, costs, and sellingPrices.
 */
function saveSalesOptions(settings) {
  const { numbers, names, costs, sellingPrices } = settings;
  
  if (!Array.isArray(numbers) || !Array.isArray(names) || !Array.isArray(costs) || !Array.isArray(sellingPrices)) {
    throw new Error('Invalid data format for sales options.');
  }
  
  if (!(numbers.length === names.length && names.length === costs.length && costs.length === sellingPrices.length)) {
    throw new Error('All sales options arrays must be of the same length.');
  }
  
  const sheet = getOrCreateSalesOptionsSheet();
  
  // Clear existing data except headers
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  
  // Append new sales options
  for (let i = 0; i < numbers.length; i++) {
    sheet.appendRow([
      numbers[i],
      names[i],
      costs[i],
      sellingPrices[i]
    ]);
  }
  
  Logger.log('Sales options have been updated.');
}

/**
 * Retrieves a sales option by its number.
 *
 * @param {number} number - The option number.
 * @return {Object|null} - Sales option object or null if not found.
 */
function getSalesOptionByNumber(number) {
  const salesOptions = getSalesOptions();
  for (let i = 0; i < salesOptions.length; i++) {
    if (salesOptions[i].number === number) {
      return salesOptions[i];
    }
  }
  return null;
}

/**
 * Generates all possible offer combinations based on the total quantity.
 * Each combination includes deductions and bonuses based on groupings.
 * Prioritizes bonus bottles first.
 *
 * @param {Array} selectedOptions - Array of selected options with quantities.
 * @param {string} userId - The unique User ID of the user.
 * @return {Object} - Object containing offers for the user to choose from or auto-application details.
 */
function generateFinalPrices(selectedOptions, userId) {
  if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
    throw new Error('No sales options selected.');
  }
  
  // Check if User ID is locked
  if (isUserLocked(userId)) {
    throw new Error('You have already generated a price.');
  }
  
  let totalQuantity = 0;
  let totalPrice = 0;
  let totalCost = 0;
  
  // Calculate total quantity, total price, and total cost
  selectedOptions.forEach(option => {
    const salesOption = getSalesOptionByNumber(option.optionNumber);
    if (!salesOption) {
      throw new Error(`Sales option with number ${option.optionNumber} not found.`);
    }
    const quantity = parseInt(option.quantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for option ${option.optionNumber}.`);
    }
    totalQuantity += quantity;
    totalPrice += salesOption.sellingPrice * quantity;
    totalCost += salesOption.cost * quantity;
  });
  
  Logger.log(`Total Quantity: ${totalQuantity}, Total Price: ${totalPrice}, Total Cost: ${totalCost}`);
  
  // Define offer types
  const offerTypes = [
    { name: 'Bottles of Drink Offer', groupSize: 4, bonusBottles: 1, deduction: 0 }, // 4 items for 1 bottle
    { name: 'Discount 10', groupSize: 3, bonusBottles: 0, deduction: 10 },          // 3 items for $10 discount
    { name: 'Discount 5', groupSize: 2, bonusBottles: 0, deduction: 5 }             // 2 items for $5 discount
  ];
  
  /**
   * Recursive function to generate all possible offer combinations.
   *
   * @param {number} quantity - Remaining quantity to allocate.
   * @param {number} currentBonus - Accumulated bonus bottles.
   * @param {number} currentDeduction - Accumulated deductions.
   * @param {number} startIndex - Current index in offerTypes to prevent duplicate combinations.
   * @param {Array} results - Accumulated results.
   */
  function generateOffers(quantity, currentBonus, currentDeduction, startIndex, results) {
    // Base case: No more items to allocate
    if (quantity === 0) {
      results.push({ bonusBottles: currentBonus, deductions: currentDeduction });
      return;
    }
    
    // Iterate through offer types starting from startIndex to allow multiple uses
    for (let i = startIndex; i < offerTypes.length; i++) {
      const offer = offerTypes[i];
      if (quantity >= offer.groupSize) {
        // Apply the current offer
        generateOffers(
          quantity - offer.groupSize,
          currentBonus + offer.bonusBottles,
          currentDeduction + offer.deduction,
          i, // Allow the same offer to be used multiple times
          results
        );
      }
    }
  }
  
  // Initialize results array
  let offers = [];
  
  // Generate all possible offers
  generateOffers(totalQuantity, 0, 0, 0, offers);
  
  // Remove duplicate offers
  const uniqueOffers = [];
  const seen = new Set();
  
  offers.forEach(offer => {
    const key = `Deduction:${offer.deductions},Bonus:${offer.bonusBottles}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueOffers.push(offer);
    }
  });
  
  // Sort offers by descending bonusBottles and then descending deductions
  uniqueOffers.sort((a, b) => {
    if (b.bonusBottles !== a.bonusBottles) {
      return b.bonusBottles - a.bonusBottles;
    }
    return b.deductions - a.deductions;
  });
  
  // If only one unique offer exists, automatically apply it
  if (uniqueOffers.length === 1) {
    const autoOffer = uniqueOffers[0];
    const result = applyChosenOffer(selectedOptions, userId, autoOffer);
    return { autoApply: true, result };
  }
  
  return { offers: uniqueOffers };
}

/**
 * Applies the chosen offer, calculates final price and bonus bottles, logs the sale, and locks the user.
 *
 * @param {Array} selectedOptions - Array of selected options with quantities.
 * @param {string} userId - The unique User ID of the user.
 * @param {Object} offer - The offer object chosen by the user.
 * @return {Object} - Object containing totalFinalPrice and bonusBottles.
 */
function applyChosenOffer(selectedOptions, userId, offer) {
  if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
    throw new Error('No sales options selected.');
  }
  
  // Check if User ID is locked
  if (isUserLocked(userId)) {
    throw new Error('You have already generated a price.');
  }
  
  let totalQuantity = 0;
  let totalPrice = 0;
  let totalCost = 0;
  
  // Calculate total quantity, total price, and total cost
  selectedOptions.forEach(option => {
    const salesOption = getSalesOptionByNumber(option.optionNumber);
    if (!salesOption) {
      throw new Error(`Sales option with number ${option.optionNumber} not found.`);
    }
    const quantity = parseInt(option.quantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for option ${option.optionNumber}.`);
    }
    totalQuantity += quantity;
    totalPrice += salesOption.sellingPrice * quantity;
    totalCost += salesOption.cost * quantity;
  });
  
  Logger.log(`Total Quantity: ${totalQuantity}, Total Price: ${totalPrice}, Total Cost: ${totalCost}`);
  
  // Apply deductions and bonuses from the chosen offer
  const finalPrice = Math.max(totalPrice - offer.deductions, 0); // Ensure final price is not negative
  const profit = finalPrice - totalCost;
  const bonusBottles = offer.bonusBottles;
  
  Logger.log(`Applying Offer: Deductions = ${offer.deductions}, Bonus Bottles = ${bonusBottles}`);
  Logger.log(`Final Price: ${finalPrice}, Profit: ${profit}`);
  
  // Get the next customer number
  const customerNumber = getNextCustomerNumber();
  
  // Calculate cumulative totals
  const sheet = getOrCreateSalesLogSheet();
  const lastRow = sheet.getLastRow();
  let lastTotalIncome = 0;
  let lastTotalProfit = 0;
  
  if (lastRow > 1) { // If there are existing entries
    const lastRowData = sheet.getRange(lastRow, 7, 1, 2).getValues()[0]; // Columns 7 and 8: Total Income, Total Profit
    lastTotalIncome = parseFloat(lastRowData[0]) || 0;
    lastTotalProfit = parseFloat(lastRowData[1]) || 0;
  }
  
  const newTotalIncome = lastTotalIncome + finalPrice;
  const newTotalProfit = lastTotalProfit + profit;
  
  Logger.log(`Cumulative Total Income: ${newTotalIncome}, Cumulative Total Profit: ${newTotalProfit}`);
  
  // Create offer description in the desired format
  let offerDescription = '';
  if (bonusBottles > 0) {
    offerDescription += `Bonus Bottles: ${bonusBottles}`;
  }
  if (offer.deductions > 0) {
    if (offerDescription.length > 0) offerDescription += ', ';
    offerDescription += `Discount: $${offer.deductions}`;
  }
  if (offerDescription.length === 0) {
    offerDescription = 'No Offer';
  }
  
  // Log the sale with customer number, bonus bottles, and cumulative totals
  logSale({
    customerNumber, // Include customer number
    selectedOptions,
    totalPrice,
    finalPrice,
    profit,
    bonusBottles,
    offerDescription,
    totalIncome: newTotalIncome,
    totalProfit: newTotalProfit
  });
  
  // Lock the User ID
  lockUser(userId, customerNumber);
  
  return { 
    totalFinalPrice: finalPrice.toFixed(2), 
    bonusBottles
  };
}

/**
 * Logs the sale details into the 'SalesLog' sheet, including customer number, profit, and cumulative totals.
 *
 * @param {Object} saleDetails - Object containing sale details.
 */
function logSale(saleDetails) {
  const sheet = getOrCreateSalesLogSheet();
  
  const timestamp = new Date();
  const { customerNumber, selectedOptions, totalPrice, finalPrice, profit, bonusBottles, offerDescription, totalIncome, totalProfit } = saleDetails;
  
  // Construct a string with actual product names and quantities
  const choosesStr = selectedOptions.map(opt => {
    const salesOption = getSalesOptionByNumber(opt.optionNumber);
    const name = salesOption ? salesOption.name : `Option ${opt.optionNumber}`;
    return `${name} x${opt.quantity}`;
  }).join(', ');
  
  // Validate finalPrice and profit before logging
  const validatedFinalPrice = isNaN(finalPrice) ? 0 : parseFloat(finalPrice.toFixed(2));
  const validatedProfit = isNaN(profit) ? 0 : parseFloat(profit.toFixed(2));
  
  // Append the sale log with all required details
  sheet.appendRow([
    timestamp,
    customerNumber,            // Ensure this is a number
    choosesStr,
    validatedFinalPrice,
    validatedProfit,
    offerDescription,
    totalIncome.toFixed(2),
    totalProfit.toFixed(2),
    bonusBottles               // Log Bonus Bottles
  ]);
  
  Logger.log(`Sale logged for Customer Number: ${customerNumber}`);
}

/**
 * Checks if the given User ID is locked (i.e., has already generated a price).
 *
 * @param {string} userId - The unique User ID to check.
 * @return {boolean} - True if locked, false otherwise.
 */
function isUserLocked(userId) {
  const sheet = getOrCreateLockedUsersSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) { // Skip headers
    if (data[i][0] === userId) {
      return true;
    }
  }
  
  return false;
}

/**
 * Locks a User ID by adding it to the 'LockedUsers' sheet.
 *
 * @param {string} userId - The unique User ID to lock.
 * @param {number} customerNumber - The assigned customer number.
 */
function lockUser(userId, customerNumber) {
  const sheet = getOrCreateLockedUsersSheet();
  const timestamp = new Date();
  sheet.appendRow([userId, customerNumber, timestamp]);
  Logger.log(`Locked User ID: ${userId} with Customer Number: ${customerNumber}`);
}

/**
 * Unlocks a User ID by removing it from the 'LockedUsers' sheet.
 *
 * @param {string} userId - The unique User ID to unlock.
 * @return {boolean} - True if unlocked successfully, false otherwise.
 */
function unlockUser(userId) {
  const sheet = getOrCreateLockedUsersSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) { // Skip headers
    if (data[i][0] === userId) {
      sheet.deleteRow(i + 1); // Sheets are 1-indexed
      Logger.log(`Unlocked User ID: ${userId}`);
      return true;
    }
  }
  
  throw new Error('User ID not found.');
}

/**
 * Retrieves the next customer number by incrementing the last number in the 'Customers' sheet.
 *
 * @return {number} - The next customer number.
 */
function getNextCustomerNumber() {
  const sheet = getOrCreateCustomersSheet();
  const lastRow = sheet.getLastRow();
  let nextNumber = 1;
  
  if (lastRow > 1) { // If there are existing entries
    const lastNumber = sheet.getRange(lastRow, 1).getValue();
    if (typeof lastNumber === 'number' && !isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  // Log the new customer number with timestamp
  sheet.appendRow([nextNumber, new Date()]);
  Logger.log(`Assigned Customer Number: ${nextNumber}`);
  
  return nextNumber;
}
