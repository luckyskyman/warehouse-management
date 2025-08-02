# Warehouse Management System

Enterprise-grade warehouse management system with advanced file classification and duplicate detection capabilities.

## Features

- **Inventory Management**: Real-time stock tracking and management
- **User Management**: Role-based access control and permissions
- **File Management**: Advanced file upload, categorization, and duplicate detection
- **BOM Management**: Bill of Materials tracking and management
- **Transaction History**: Complete audit trail of all operations
- **Work Diary**: Collaborative work logging and reporting
- **Excel Integration**: Import/export functionality for inventory data

## Tech Stack

- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Render
- **State Management**: React Query

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/warehouse-management.git
cd warehouse-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

## Deployment

This project is configured for deployment on Render:

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render
4. Deploy

## Environment Variables

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
NODE_ENV=production
```

## License

MIT License