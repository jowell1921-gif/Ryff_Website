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
import { NotificationsPage } from '@/pages/NotificationsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AnnouncementsPage } from '@/pages/AnnouncementsPage'
import { MusicPage } from '@/pages/MusicPage'
import { GoogleCallbackPage } from '@/pages/GoogleCallbackPage'
import { ComingSoonPage } from '@/pages/ComingSoonPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

export const router = createBrowserRouter([
  { path: '/auth/google/callback', element: <GoogleCallbackPage /> },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
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
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/:id', element: <ProfilePage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'messages/:conversationId', element: <MessagesPage /> },
          { path: 'announcements', element: <AnnouncementsPage /> },
          { path: 'music', element: <MusicPage /> },
          { path: 'music/:userId', element: <MusicPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'coming-soon', element: <ComingSoonPage /> },
        ],
      },
    ],
  },
])
