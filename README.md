# EcoRatings Admin Dashboard

A modern admin dashboard built with React, TypeScript, Redux Toolkit, and Tailwind CSS for managing products and orders. Features include data persistence via localStorage, mock API simulation, and a fully responsive UI.

## 🚀 Features

- **Dashboard**: Summary statistics and charts (orders per day, order status distribution)
- **Products Management**: 
  - CRUD operations (Create, Read, Update, Delete)
  - Search by name
  - Filter by category and status
  - Sort by price or updated date
  - Pagination (10 items per page)
  - Responsive design (table on desktop, cards on mobile)
- **Orders Management**:
  - Create orders from products with shopping cart
  - View order details
  - Filter by status
  - Update order status (Pending → Completed/Cancelled)
- **Data Persistence**: Redux state automatically saved to and rehydrated from localStorage
- **Mock API**: Simulated API calls with delays (300-800ms) for realistic experience

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Redux Toolkit** (slices + async thunks)
- **Tailwind CSS** (only styling method)
- **React Router** (client-side routing)
- **Recharts** (charting library)
- **Vite** (build tool)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd EcoRatings
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── mock/
│   ├── products.json      # Initial product seed data
│   ├── orders.json        # Initial order seed data
│   └── api.ts             # Mock API with simulated delays
├── store/
│   ├── productsSlice.ts   # Redux slice for products
│   ├── ordersSlice.ts     # Redux slice for orders
│   ├── index.ts           # Store configuration + persistence
│   └── hooks.ts           # Typed Redux hooks
├── hooks/
│   ├── useDebounce.ts     # Debounce hook for search
│   ├── usePagination.ts   # Pagination hook
│   ├── useFilters.ts      # Filtering hook
│   └── useSort.ts         # Sorting hook
├── pages/
│   ├── Dashboard.tsx       # Dashboard with charts
│   ├── Products.tsx        # Products management page
│   └── Orders.tsx         # Orders management page
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                 # Main app component with routing
└── main.tsx               # Entry point with Redux Provider
```

## 🎯 Key Features Explained

### Redux Persistence
- Products and orders data are automatically persisted to `localStorage`
- On app reload, state is rehydrated from `localStorage`
- Loading and error states are NOT persisted (only data)

### Mock API
- All API calls are simulated using `Promise` + `setTimeout`
- Delays range from 300-800ms for realistic feel
- Initial data comes from JSON files in `src/mock/`

### Custom Hooks
- `useDebounce`: Debounces search input (300ms delay)
- `usePagination`: Handles pagination logic (10 items per page)
- `useFilters`: Filters products by search, category, and status
- `useSort`: Sorts data by any field (handles dates, numbers, strings)

### Validation
- Product name: minimum 3 characters
- Price: must be > 0
- Stock: must be >= 0
- Category: required
- Rating: must be between 1-5

## 📱 Responsive Design

- **Desktop**: Full table view for products, side-by-side layout for orders
- **Mobile**: Card-based layout for products, stacked layout for orders
- Uses Tailwind breakpoints: `sm`, `md`, `lg`


## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Tailwind CSS
Configuration is in `tailwind.config.js`. The app uses Tailwind's default theme with custom extensions as needed.

### Redux Store
Store configuration is in `src/store/index.ts`. Persistence logic only saves products and orders data, not loading/error states.

## 📄 License

This project is open source and available under the MIT License.

## 🎨 Live Demo


Example:
- Vercel: `https://ecorating-admin.vercel.app`


---

Built with ❤️ using React, TypeScript, and Redux Toolkit
