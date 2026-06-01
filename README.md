# 🏥 MediCare HMS — Hospital Management System

A complete, fully-functional Hospital Management System built with **React** and **localStorage** (no backend required).

---

## 🚀 Quick Start

```bash
# 1. Extract this folder
# 2. Open terminal inside the folder
npm install
npm start
# Opens at http://localhost:3000
```

---

## 🔐 Default Login Credentials

| Role       | Email                  | Password    |
|------------|------------------------|-------------|
| Admin      | admin@hospital.com     | admin123    |
| Pharmacist | pharma@hospital.com    | pharma123   |
| Doctor     | Register via login page | (you set it) |
| Patient    | Register via login page | (you set it) |

---

## 📦 Modules

| Module | Roles |
|--------|-------|
| 🏠 Dashboard | Admin |
| 👨‍⚕️ Doctor Management | Admin |
| 🧑‍🤝‍🧑 Patient Management | Admin, Doctor |
| 📅 Appointments | Admin, Doctor, Patient |
| 🛏️ Admissions & Bed Management | Admin, Doctor |
| 💊 Prescriptions | Admin, Doctor, Patient (view) |
| 🏪 Pharmacy Billing | Admin, Pharmacist |
| 🧾 Billing & Invoice | Admin, Pharmacist |
| 📊 Reports & Analytics | Admin |

---

## 🛏️ Bed Types & Rates

| Ward      | Beds | Rate/Day |
|-----------|------|----------|
| General   | 5    | ₹500     |
| Private   | 4    | ₹1,500   |
| ICU       | 3    | ₹3,500   |
| Emergency | 2    | ₹2,000   |

---

## 📁 Project Structure

```
src/
├── App.js
├── index.js
├── index.css
├── context/
│   └── AuthContext.js
├── components/
│   └── Sidebar.js
├── utils/
│   └── api.js               ← All data logic (localStorage)
└── pages/
    ├── AdminDashboard.js
    ├── auth/
    │   ├── Login.js
    │   ├── PatientRegister.js
    │   ├── DoctorRegister.js
    │   └── ForgotPassword.js
    ├── doctor/
    │   ├── DoctorList.js
    │   └── DoctorDashboard.js
    ├── patient/
    │   ├── PatientList.js
    │   └── PatientProfile.js
    ├── appointment/
    │   ├── BookAppointment.js
    │   └── AppointmentList.js
    ├── admission/
    │   └── AdmissionPage.js  ← Admit / Bed / Discharge
    ├── prescription/
    │   └── PrescriptionPage.js
    ├── pharmacy/
    │   └── PharmacyBilling.js
    ├── billing/
    │   └── BillingPage.js
    └── reports/
        └── ReportsPage.js
```
