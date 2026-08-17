Store Rating System

A full-stack web application that allows users to view stores and submit ratings. 
The system provides separate functionality for Users, Store Owners, and Admins.

 Features

 User
- Create an account
- Login and logout
- Change password
- View available stores
- Search and filter stores
- Submit ratings
- Update ratings

Store Owner
- Login to the system
- View store information
- View ratings given to the store
- View overall store rating

Admin
- Admin dashboard
- View total users
- View total stores
- View total ratings
- Add Users
- Add Store Owners
- Add Admins
- Create stores
- View user details
- View store details
- Delete users

 Roles

The system has three roles:

- USER- Normal application user
- OWNER - Store owner
- ADMIN - System administrator

Public registration creates a `USER` account.

Admins can create `USER`, `OWNER`, and `ADMIN` accounts from the Admin Panel.

 Technology Stack

Frontend
- React.js
- Vite
- JavaScript
- HTML
- CSS
- Axios

Backend
- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- bcryptjs

Database
- MySQL

Project Structure

```text
store-rating-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   │
│   ├── prisma/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
