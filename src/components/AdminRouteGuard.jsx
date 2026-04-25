import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRouteGuard from './components/AdminRouteGuard'; 
import AdminDashboard from './pages/AdminDashboard'; 
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        {/* The open student feed */}
        <Route path="/" element={<Home />} />

        {/* The admin dashboard */}
        <Route 
          path="/admin" 
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;