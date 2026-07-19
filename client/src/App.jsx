import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import MyTasks from './pages/MyTasks';
import TeamManagement from './pages/TeamManagement';
import TaskHistory from './pages/TaskHistory';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="history" element={<TaskHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
