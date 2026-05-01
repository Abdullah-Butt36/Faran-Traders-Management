# Faran Traders - Business Management System

A complete, modern, and highly responsive business management system built to streamline operations for trading businesses. It provides end-to-end management from inventory tracking and party ledgers to dynamic sales, purchases, and automated financial reporting.

---

## 📑 Core Modules & Page Functionality

### 1. 📊 Dashboard (Home)
The nerve center of the application providing real-time business insights.
- **Financial Overview**: Live tracking of Total Receivables, Total Payables, and Net Balance.
- **Interactive Charts**: Visual representation of the last 6 months' revenue and profit trends.
- **Quick Stats**: Summaries of today's sales, purchases, and expenses.
- **Stock Alerts**: Automated warnings for items running low or completely out of stock.
- **Recent Activity**: Quick view of the latest transactions across all modules.

### 2. 🛒 Sales Module
Complete point-of-sale and invoicing system.
- **Dynamic Invoicing**: Create multi-item sale invoices with auto-calculated totals, discounts, and net amounts.
- **Stock Automation**: Selling an item automatically deducts it from the central inventory.
- **Ledger Integration**: Unpaid amounts are automatically added to the customer's receivable ledger.
- **Print-Ready Invoices**: One-click generation of professional, A4-optimized sales receipts.

### 3. 📦 Purchase Module
Manage incoming stock and supplier accounts.
- **Purchase Recording**: Log incoming shipments with dynamic pricing and item quantities.
- **Auto-Restock**: Purchasing automatically increases the inventory levels.
- **Payable Tracking**: Unpaid purchase amounts are instantly reflected in the supplier's payable ledger.
- **Printable Records**: Generate clean, professional purchase records for physical filing.

### 4. 🗄️ Inventory (Items & Stock Report)
Comprehensive catalog and warehouse management.
- **Item Master**: Add and edit products with base units (e.g., Pcs, Kg, Bags) and custom minimum-stock thresholds.
- **Real-Time Tracking**: Live view of current available quantities.
- **Stock Movement Report**: A dedicated reporting page showing Opening Stock, In/Out movements, and Closing Balance for any given date range.

### 5. 👥 Customers & Suppliers
Dedicated CRM and party management.
- **Profile Management**: Maintain detailed records including contact info, addresses, and party types.
- **Live Balances**: Instantly view how much money a specific customer owes or how much you owe a supplier.
- **Financial History**: Acts as the foundation for the Ledger system.

### 6. 💸 Expenses Management
Track operational costs to maintain accurate net profit calculations.
- **Categorized Tracking**: Log expenses by categories (Utilities, Salaries, Rent, Transport, etc.).
- **Date Filtering**: View operational costs over specific days, weeks, or months.
- **Expense Reporting**: Generate and print aggregated expense reports.

### 7. 📈 Profit & Loss Statement
Automated financial health analysis.
- **Income Statement**: Dynamically calculates Total Revenue vs. Total Cost of Goods Sold (COGS) and Operating Expenses.
- **Net Result**: Instantly outputs the final Net Profit or Loss for any selected period.
- **Executive Printing**: Print clean, numbers-focused financial statements without UI clutter for stakeholder meetings.

### 8. 🖨️ Professional Printing Suite
Built-in CSS logic to convert web views into physical documents.
- **A4 Optimization**: All printable pages automatically resize and format perfectly for standard A4 paper.
- **UI Clutter Removal**: Navigation bars, sidebars, and action buttons are automatically hidden during print.
- **Branded Documents**: Prints include localized business branding (Faran Traders, Wazirabad Sohdra).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS (Utility-first framework for responsive UI)
- **Routing**: React Router DOM v6
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Data Visualization**: Chart.js / React-Chartjs-2
- **Alerts & Modals**: React Toastify & Custom Animated Modals

---

## 🚀 Installation & Local Development

### Step 1: Clone the Repository
```bash
git clone https://github.com/Abdullah-Butt36/Faran-Traders-Management.git
cd Faran-Traders-Management
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Variables
Create a `.env` file in the root directory and add your Supabase connection strings:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Run the Application
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🌐 Deployment

This application is ready to be deployed on **Vercel**.
1. Ensure your code is pushed to your GitHub repository.
2. Log in to Vercel and import the repository.
3. Add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables in the Vercel project settings.
4. Deploy the project. Vercel will automatically detect Vite and configure the build settings.

---

**Made for Faran Traders Management**
