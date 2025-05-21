# Electricity Analytics Dashboard

This project is a full-stack web application that provides interactive electricity consumption and production analytics. It includes a React-based frontend and a Spring Boot backend.

---

## Features

- Interactive line charts and pie charts to visualize electricity consumption, production, and forecast data.
- Display of current and forecasted electricity production with offset calculation.
- Breakdown of energy sources by hour in a pie chart.
- Next day electricity price chart.
- Responsive design with animated highlights.
- Backend API providing real-time and forecast data.

---

## Technology Stack

- **Frontend:** React, TypeScript, Recharts, npm
- **Backend:** Spring Boot (Java), Gradle
- **Data:** Real-time electricity consumption and production data, forecast data, next day electricity prices

---

## Prerequisites

- Node.js (v14 or higher recommended)
- Java Development Kit (JDK) 11 or higher
- Gradle
- Internet connection

---

## Getting Started

### 1. Clone the Repository

```
git clone https://github.com/Abiskar0001/Energy-Overview-Tool.git
cd Energy-Overview-Tool
```

### 2. Backend Setup (Spring Boot)
Navigate to the backend directory & Open application.yml & enter your api key for fingrid and entso e platform respectively.
```
cd fingrid-backend\src\main\resources
code application.yml (Is VS Code is installed in the device)
```
Navigate back to fingrid-backend and run the server
```
cd ..\..\..
./gradlew bootRun
```

### 3. Frontend Setup
Navigate to Energy-Overview-Tool dir and run the frontend:
```
cd Energy-Overview-Tool
```
Install Dependencies and run the server
```
npm install
npm run dev
```
Your website is operational at localhost at the given port.

### Usage
- Use the interactive charts to explore electricity data.
- Click on chart points to view detailed energy source breakdown.
- Reset selections with the provided buttons.
- View forecast and next-day electricity price charts.

### API Key Generation Links
- https://developer-data.fingrid.fi/apis
- https://transparency.entsoe.eu/ 
