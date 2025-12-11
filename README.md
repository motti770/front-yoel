# The Shul CRM Frontend

React frontend for The Shul CRM system - a comprehensive customer relationship management system for managing customers, orders, products, tasks, and workflows.

## Tech Stack

- **React 19** + Vite
- **Axios** - API communication
- **Recharts** - Charts and analytics
- **Lucide React** - Icons
- **React Router** - Navigation

## Features

- **Multi-language support**: Hebrew (RTL), English, Ukrainian
- **Multiple view modes**: Table, Cards, List, Kanban, Pipeline, Calendar
- **Role-based access**: Admin, Manager, Employee
- **Real-time API integration** with The Shul CRM backend

## Pages

| Page | Description |
|------|-------------|
| Dashboard | KPIs and analytics overview |
| Customers | Customer management with advanced filters |
| Products | Product catalog |
| Orders | Order management |
| Tasks | Task tracking by department |
| Workflows | Production workflow management |
| Departments | Department configuration |
| Parameters | Product parameters/options |

## Getting Started

### Install dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### Build for production
```bash
npm run build
```

## API Configuration

The frontend connects to the CRM API at `https://api.the-shul.com`

To use a different API URL, create a `.env` file:
```env
VITE_API_URL=https://your-api-url.com
```

## Test Credentials

| Field | Value |
|-------|-------|
| Email | `admin@yoel.com` |
| Password | `Admin1234` |
| Role | ADMIN |

## API Documentation

See [API-REFERENCE.md](./API-REFERENCE.md) for full API documentation.

## Project Structure

```
src/
├── contexts/        # React contexts (Auth)
├── pages/           # Page components
├── services/        # API service layer
└── App.jsx          # Main app with routing
```

## Notes

- All API endpoints have a maximum `limit` of 100 items per request
- Debug console.log statements are present for development (remove for production)
