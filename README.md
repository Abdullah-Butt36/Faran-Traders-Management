# 🚀 Faran Traders - Business Management System

A complete, modern, and beautiful business management system with inventory tracking, customer/supplier management, sales/purchase modules, and profit/loss calculations.

## ✨ Features

### 💰 Dashboard
- **Real-time Money Overview**: Total Receivable, Payable, Cash in Hand
- **Profit & Loss Tracking**: Automatic calculations
- **Top Parties**: View top customers and suppliers
- **Inventory Alerts**: Low stock and out of stock notifications
- **Recent Transactions**: Quick access to latest activities

### 👥 Customer & Supplier Management
- Add/Edit/Delete customers and suppliers
- City-wise search and filtering
- Complete ledger view
- Opening balance management
- Regular and one-time party types

### 📦 Inventory Management
- Real-time stock tracking
- Automatic stock updates on sales/purchases
- Low stock alerts (< 10 items)
- Out of stock notifications
- Category-wise organization

### 💵 Sales & Purchase Modules
- Multi-item invoices
- Auto-generated invoice numbers
- Dynamic pricing
- Automatic calculations
- Transport and expense tracking

### 📊 Ledger System
- Complete transaction history
- Debit/Credit tracking
- Running balance
- PDF export functionality
- Date range filtering

### 🎨 Design Features
- **Modern Dark Theme**: Professional gradient design
- **Smooth Animations**: Fade-in, slide, and scale effects
- **Glassmorphism**: Backdrop blur effects
- **Responsive Design**: Works on all devices
- **Interactive Elements**: Hover effects and transitions

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Icons**: Font Awesome 6.4
- **Fonts**: Google Fonts (Inter)
- **Charts**: Chart.js
- **3D Effects**: Three.js

## 📋 Requirements

- XAMPP (or any PHP/MySQL server)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Modern web browser (Chrome, Firefox, Edge)

## 🚀 Installation

### Step 1: Setup XAMPP
1. Install XAMPP from [https://www.apachefriends.org](https://www.apachefriends.org)
2. Start Apache and MySQL services

### Step 2: Database Setup
1. Open phpMyAdmin: `http://localhost:8080/phpmyadmin`
2. Create a new database or import the SQL file:
   ```sql
   mysql -u root -p < database.sql
   ```
   Or manually:
   - Click "New" to create database named `faran_traders`
   - Select the database
   - Click "Import" tab
   - Choose `database.sql` file
   - Click "Go"

### Step 3: Configure Database Connection
1. Open `config.php`
2. Update database credentials if needed:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   define('DB_NAME', 'faran_traders');
   ```

### Step 4: Access the Application
1. Open your browser
2. Navigate to: `http://localhost:8080/Faran_Traders/`
3. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin125` if password is inavlid go to admin-reset

## 📁 Project Structure

```
Faran_Traders/
├── assets/
│   ├── css/
│   │   └── style.css          # Main stylesheet with animations
│   ├── js/
│   │   └── main.js            # JavaScript functionality
│   └── images/
├── includes/
│   ├── header.php             # HTML head and meta tags
│   ├── navbar.php             # Sidebar and top navigation
│   ├── footer.php             # Footer and scripts
│   └── functions.php          # Utility functions
├── config.php                 # Database configuration
├── database.sql               # Database schema
├── index.php                  # Entry point
├── login.php                  # Login page
├── logout.php                 # Logout handler
├── dashboard.php              # Main dashboard
├── customers.php              # Customer management
├── suppliers.php              # Supplier management
├── items.php                  # Item management
├── inventory.php              # Inventory tracking
├── sales.php                  # Sales module
├── purchases.php              # Purchase module
├── ledger.php                 # Ledger system
└── profit_loss.php            # Profit & Loss reports
```

## 🎯 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## 🎨 Design Highlights

### Color Scheme
- **Primary**: Purple gradient (#667eea → #764ba2)
- **Background**: Dark theme (#0f172a)
- **Accent Green**: #10b981
- **Warning**: #f59e0b
- **Danger**: #ef4444

### Animations
- ✨ Fade-in effects on page load
- 🎭 Smooth transitions on hover
- 📊 Animated number counting
- 🔄 Loading spinners
- 💫 Floating logo animation
- 🌊 Background pulse effects

### Interactive Elements
- Hover effects on all cards
- Smooth sidebar toggle
- Real-time search
- Notification panel
- Animated alerts

## 📱 Responsive Design

The system is fully responsive and works on:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

## 🔐 Security Features

- Password hashing (bcrypt)
- SQL injection prevention
- XSS protection
- Session management
- Input sanitization

## 📊 Database Schema

### Main Tables
1. **users** - System users
2. **customers** - Customer records
3. **suppliers** - Supplier records
4. **items** - Product catalog
5. **sales** - Sales transactions
6. **sale_items** - Sale line items
7. **purchases** - Purchase transactions
8. **purchase_items** - Purchase line items
9. **transactions** - Unified ledger
10. **expenses** - Business expenses
11. **notifications** - System notifications

## 🚧 Development Status

### ✅ Completed
- Database schema
- Core backend functions
- Authentication system
- Dashboard with stats
- Login page with animations
- Premium UI design
- Responsive layout

### 🔄 In Progress
- Customer management module
- Supplier management module
- Item management module
- Sales module
- Purchase module
- Ledger system
- PDF generation
- Notification system

### 📅 Upcoming
- Reports module
- Settings page
- User management
- Backup/Restore
- Email notifications
- Mobile app

## 🎓 Usage Guide

### Adding a Customer
1. Go to "Customers" from sidebar
2. Click "Add New Customer"
3. Fill in details (Name, Phone, City, Type)
4. Set opening balance if any
5. Click "Save"

### Making a Sale
1. Go to "Sales" from sidebar
2. Click "New Sale"
3. Select customer
4. Add items with quantity and rate
5. Enter payment received
6. Click "Save" - Stock and ledger auto-update

### Viewing Ledger
1. Go to "Ledger" from sidebar
2. Select party type (Customer/Supplier)
3. Select party name
4. Choose date range
5. View transactions
6. Export to PDF if needed

### Checking Inventory
1. Go to "Inventory" from sidebar
2. View all items with stock levels
3. Red badge = Out of stock
4. Yellow badge = Low stock
5. Click item for details

## 🐛 Troubleshooting

### Database Connection Error
- Check XAMPP MySQL is running
- Verify database credentials in `config.php`
- Ensure database `faran_traders` exists

### Login Not Working
- Clear browser cache
- Check database has user record
- Verify password hash in database

### Styles Not Loading
- Check `assets/css/style.css` exists
- Clear browser cache
- Check file permissions

### JavaScript Not Working
- Check browser console for errors
- Ensure `assets/js/main.js` is loaded
- Check for JavaScript conflicts

## 📞 Support

For issues or questions:
- Check the documentation
- Review the code comments
- Test with default data

## 📄 License

This project is created for Faran Traders business management.

## 🙏 Credits

- **Design**: Modern dark theme with glassmorphism
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **Framework**: Custom PHP/MySQL

---

**Made with ❤️ for Faran Traders**

**Version**: 1.0.0  
**Last Updated**: December 2025

**Version**: 2.0.0  
**Last Updated**: March 2026
