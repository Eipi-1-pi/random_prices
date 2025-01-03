```markdown
# Price Generator Web Application

A dynamic web application built with Google Apps Script for generating customized pricing and managing sales offers. This application provides an intuitive interface for price calculations, offer management, and sales tracking with administrative controls.

## Features

### Core Functionality
- Dynamic price calculation based on selected items
- Automatic offer generation with bonus bottles and discounts
- Real-time price updates and offer selection
- Customer tracking and sales logging

### Administrative Features
- Secure admin panel (accessible via Ctrl+Shift+B)
- Sales options management
- User management with unlock capabilities
- Sales data logging and tracking
- IP logging for security

### User Interface
- Clean, responsive design
- Interactive product selection
- Real-time price calculations
- Loading animations and feedback
- Mobile-friendly layout

## Technical Stack

- **Backend**: Google Apps Script
- **Frontend**: HTML, JavaScript, CSS
- **Database**: Google Sheets
- **Authentication**: Custom implementation with SHA-256 hashing

## Project Structure

```
├── Code.gs              # Server-side Google Apps Script code
├── User.html            # Main application interface
└── UserStyles.html      # CSS styles and responsive design
```

## Setup Instructions

1. **Create a new Google Sheets document**:
   - Create a new Google Sheets document
   - Copy the Spreadsheet ID from the URL:
     ```
     https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
     ```
   - The Spreadsheet ID is the long string of characters in the URL between 'd/' and '/edit'

2. **Set up the required sheets**:
   In your Google Sheets document, create the following sheets (exact names required):
   - 'SalesOptions'
   - 'SalesLog'
   - 'IPLog'
   - 'Customers'
   - 'LockedUsers'

3. **Create a new Google Apps Script project**:
   - Open Google Apps Script (script.google.com)
   - Create a new project
   - Replace the default `Code.gs` content with the provided code
   - Create new HTML files for `User.html` and `UserStyles.html`
   - Copy the respective code into each file

4. **Update the Spreadsheet ID**:
   In `Code.gs`, find this line:
   ```javascript
   const SPREADSHEET_ID = '1T2WXJVLNr7NzxsG4GRxjtosdaRpUKMdH432Oc4RPAVY';
   ```
   Replace it with your Spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```

5. **Deploy as a web application**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app"
   - Set the following options:
     - Execute as: 'Me'
     - Who has access: 'Anyone' or 'Anyone within [your organization]'
   - Click "Deploy"
   - Authorize the application when prompted
   - Copy the deployment URL for access

## Security Setup

1. **Change the default admin password**:
   - The default password is 'admin123'
   - Access the admin panel using Ctrl+Shift+B
   - Change this password immediately after deployment
   - Update this line in `Code.gs` if desired:
   ```javascript
   const DEFAULT_ADMIN_PASSWORD = 'YOUR_NEW_PASSWORD';
   ```

## Configuration

### Admin Setup
1. Access the admin panel using Ctrl+Shift+B
2. Login with your admin password
3. Configure sales options with:
   - Product Number
   - Product Name
   - Cost Price (成本)
   - Selling Price (售價)

### Sales Options
Configure the following for each product:
- Product Number (unique identifier)
- Product Name
- Cost Price (成本)
- Selling Price (售價)

## Offer System

The application automatically generates offers based on quantity:
- 4 items → 1 bonus bottle
- 3 items → $10 discount
- 2 items → $5 discount

## Logging System

The application automatically tracks:
- Sales transactions
- Customer information
- IP addresses
- User actions
- System events

## Troubleshooting

Common issues and solutions:
1. **Spreadsheet not found error**:
   - Verify your Spreadsheet ID is correct
   - Ensure the Google Apps Script has permission to access the spreadsheet

2. **Sheets not found error**:
   - Verify all required sheets exist with exact names
   - Check sheet names for extra spaces

3. **Permission errors**:
   - Ensure the script is authorized to access Google Sheets
   - Check deployment settings for correct access levels

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security Notes

- Change the default admin password immediately after deployment
- Regularly monitor the IP log for suspicious activity
- Keep the Google Apps Script project permissions limited
- Regularly backup your Google Sheets data
- Do not share your Spreadsheet ID publicly

## Support

For support:
1. Open an issue in the GitHub repository
2. Check the troubleshooting section
3. Review Google Apps Script documentation

## Disclaimer

This application is provided "as is", without warranty of any kind. Use at your own risk.

## Updates and Maintenance

- Regularly check for updates to the codebase
- Monitor Google Apps Script quota usage
- Perform regular data backups
- Review access logs periodically

---

Last updated: [Current Date]
```

This README.md provides comprehensive setup instructions with special emphasis on the Spreadsheet ID requirement. Users can now easily understand how to set up their own instance of the application with their own Google Sheets document.

Would you like me to add or modify any section further?
