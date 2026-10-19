import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage.jsx';
import { TopicDetailsPage } from './pages/TopicDetailsPage.jsx';
import { DocumentsPage } from './pages/DocumentsPage.jsx';
import { VideosPage } from './pages/VideosPage.jsx';
import { ProjectsPage } from './pages/ProjectsPage.jsx';
import { BookmarksPage } from './pages/BookmarksPage.jsx';
import { SearchPage } from './pages/SearchPage.jsx';
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';

// App Layout Wrapper (No login barrier - website is fully open for study)
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcff] text-slate-900">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />

            <Route
              path="/"
              element={
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              }
            />

            <Route
              path="/study-materials"
              element={
                <AppLayout>
                  <StudyMaterialsPage />
                </AppLayout>
              }
            />

            <Route
              path="/topics/:id"
              element={
                <AppLayout>
                  <TopicDetailsPage />
                </AppLayout>
              }
            />

            <Route
              path="/documents"
              element={
                <AppLayout>
                  <DocumentsPage />
                </AppLayout>
              }
            />

            <Route
              path="/videos"
              element={
                <AppLayout>
                  <VideosPage />
                </AppLayout>
              }
            />

            <Route
              path="/projects"
              element={
                <AppLayout>
                  <ProjectsPage />
                </AppLayout>
              }
            />

            <Route
              path="/bookmarks"
              element={
                <AppLayout>
                  <BookmarksPage />
                </AppLayout>
              }
            />

            <Route
              path="/search"
              element={
                <AppLayout>
                  <SearchPage />
                </AppLayout>
              }
            />

            <Route
              path="/favorites"
              element={
                <AppLayout>
                  <FavoritesPage />
                </AppLayout>
              }
            />

            <Route
              path="/admin"
              element={
                <AppLayout>
                  <AdminDashboardPage />
                </AppLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;
