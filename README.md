# 🏋️ Gym Management System

A full-stack web application for managing gym members, trainers, and payments.

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database:** MySQL

## Project Structure

```
gym-management-system/
├── backend/
│   ├── server.js          # Express server
│   ├── db.js              # MySQL connection pool
│   ├── package.json       # Node.js dependencies
│   └── routes/
│       ├── memberRoutes.js
│       ├── trainerRoutes.js
│       └── paymentRoutes.js
├── frontend/
│   ├── index.html          # Dashboard
│   ├── add-member.html     # Add/Edit Member
│   ├── view-members.html   # View Members
│   ├── add-trainer.html    # Add/Edit Trainer
│   ├── view-trainers.html  # View Trainers
│   ├── add-payment.html    # Add/Edit Payment
│   ├── payment-history.html# Payment History
│   ├── css/styles.css      # Stylesheet
│   └── js/app.js           # Shared JavaScript
└── database/
    └── schema.sql          # MySQL schema + sample data
```

## Setup Instructions

### 1. Set up the Database

```bash
mysql -u root -p < database/schema.sql
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Database (Optional)

Create a `.env` file in the `backend/` folder:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gym_management
PORT=3000
```

### 4. Start the Server

```bash
cd backend
node server.js
```

### 5. Open the App

Visit **http://localhost:3000** in your browser.

## API Endpoints

| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| GET    | /api/members         | List all members    |
| POST   | /api/members         | Create a member     |
| GET    | /api/members/:id     | Get a member        |
| PUT    | /api/members/:id     | Update a member     |
| DELETE | /api/members/:id     | Delete a member     |
| GET    | /api/trainers        | List all trainers   |
| POST   | /api/trainers        | Create a trainer    |
| GET    | /api/trainers/:id    | Get a trainer       |
| PUT    | /api/trainers/:id    | Update a trainer    |
| DELETE | /api/trainers/:id    | Delete a trainer    |
| GET    | /api/payments        | List all payments   |
| POST   | /api/payments        | Create a payment    |
| GET    | /api/payments/:id    | Get a payment       |
| PUT    | /api/payments/:id    | Update a payment    |
| DELETE | /api/payments/:id    | Delete a payment    |
