import React, { Suspense, lazy, useEffect } from "react";
import "./App.css";
import "./showcase.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLoader from "./components/AppLoader";
import { Toaster } from "./components/ui/sonner";
import RouteSEO from "./components/RouteSEO";
import FloatingContactButton from "./components/FloatingContactButton";
import Analytics from "./components/Analytics";
import ErrorBoundary from "./components/ErrorBoundary";
import { logClientError } from "./utils/errorLogger";
import useScrollToTop from "./hooks/useScrollToTop";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Programs = lazy(() => import("./pages/Programs"));
const Mentorship = lazy(() => import("./pages/Mentorship"));
const Transparency = lazy(() => import("./pages/Transparency"));
const Support = lazy(() => import("./pages/Support"));
const Contact = lazy(() => import("./pages/Contact"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Team = lazy(() => import("./pages/Team"));
const SuccessStories = lazy(() => import("./pages/SuccessStories"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));
const AdminTeamManager = lazy(() => import("./pages/admin/AdminTeamManager"));
const AdminEventsManager = lazy(() => import("./pages/admin/AdminEventsManager"));
const AdminProductsManager = lazy(() => import("./pages/admin/AdminProductsManager"));
const AdminSponsorsManager = lazy(() => import("./pages/admin/AdminSponsorsManager"));

const RouterScrollManager = () => {
  useScrollToTop();
  return null;
};

function App() {
  useEffect(() => {
    const onWindowError = (event) => {
      logClientError({
        message: event?.message || 'Uncaught window error',
        stack: event?.error?.stack || '',
        source: 'window.onerror'
      });
    };

    const onUnhandledRejection = (event) => {
      const reason = event?.reason;
      logClientError({
        message: reason?.message || String(reason || 'Unhandled promise rejection'),
        stack: reason?.stack || '',
        source: 'window.unhandledrejection'
      });
    };

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <RouterScrollManager />
        <ErrorBoundary>
          <RouteSEO />
          <Analytics />
          <Suspense fallback={<AppLoader />}>
            <Routes>
            {/* Admin Routes (no header/footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blogs"
              element={
                <ProtectedRoute>
                  <AdminBlogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog/new"
              element={
                <ProtectedRoute>
                  <AdminBlogEditor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/blog/edit/:id"
              element={
                <ProtectedRoute>
                  <AdminBlogEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/team"
              element={
                <ProtectedRoute>
                  <AdminTeamManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute>
                  <AdminEventsManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <AdminProductsManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sponsors"
              element={
                <ProtectedRoute>
                  <AdminSponsorsManager />
                </ProtectedRoute>
              }
            />
            {/* Public Routes (with header/footer) */}
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/success-stories" element={<SuccessStories />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:slug" element={<ProductDetail />} />
                      <Route path="/sponsors" element={<Sponsors />} />
                      <Route path="/blog" element={<BlogList />} />
                      <Route path="/blog/:slug" element={<BlogDetail />} />
                      <Route path="/programs" element={<Programs />} />
                      <Route path="/mentorship" element={<Mentorship />} />
                      <Route path="/transparency" element={<Transparency />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/contact" element={<Contact />} />
                      {/* Catch-all route for unknown paths */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <FloatingContactButton />
                  <Footer />
                </>
              }
            />
            </Routes>
          </Suspense>
          <Toaster />
        </ErrorBoundary>
      </BrowserRouter>
    </div>
  );
}

export default App;
