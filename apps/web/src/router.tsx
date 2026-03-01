import { Navigate, createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import ActivityList from './pages/ActivityList';
import ActivityForm from './pages/ActivityForm';
import ActivityDetail from './pages/ActivityDetail';
import RevisionTimeline from './pages/RevisionTimeline';
import AdminUsers from './pages/AdminUsers';
import { Layout } from './components/Layout';
import { useAuthStore } from './stores/auth.store';

const guard = (element: JSX.Element) => (useAuthStore.getState().accessToken ? element : <Navigate to='/login' />);

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: guard(<Layout />),
    children: [
      { index: true, element: <Navigate to='/activities' /> },
      { path: 'activities', element: <ActivityList /> },
      { path: 'activities/new', element: <ActivityForm /> },
      { path: 'activities/:id', element: <ActivityDetail /> },
      { path: 'activities/:id/history', element: <RevisionTimeline /> },
      { path: 'admin/users', element: <AdminUsers /> },
    ],
  },
]);
