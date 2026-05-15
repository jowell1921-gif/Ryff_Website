import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { FeedPage } from '@/pages/FeedPage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { MessagesPage } from '@/pages/MessagesPage'
import { BandsPage } from '@/pages/BandsPage'
import { BandProfilePage } from '@/pages/BandProfilePage'
import { ReelsPage } from '@/pages/ReelsPage'

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/feed" replace /> },
          { path: 'feed', element: <FeedPage /> },
          { path: 'discover', element: <DiscoverPage /> },
          { path: 'bands', element: <BandsPage /> },
          { path: 'bands/:id', element: <BandProfilePage /> },
          { path: 'reels', element: <ReelsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/:id', element: <ProfilePage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'messages/:conversationId', element: <MessagesPage /> },
        ],
      },
    ],
  },
])
