import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'prismjs/themes/prism-okaidia.css';

// Las rutas se cargan de forma diferida para mantener pequeño el bundle inicial.
// Componentes pesados (TinyMCE, Prism, three/babylon/phaser) solo se descargan
// cuando el usuario navega a la ruta que los necesita.
const Home = lazy(() => import('./components/Home'));
const Blog = lazy(() => import('./components/Blog'));
const About = lazy(() => import('./components/About'));
const Login = lazy(() => import('./components/Login'));
const BlogPost = lazy(() => import('./components/BlogPost'));
const GamePage = lazy(() => import('./components/GamePage'));
const GamePlayer = lazy(() => import('./components/GamePlayer'));
const Tools = lazy(() => import('./components/Tools'));
const ToolPlayer = lazy(() => import('./components/ToolPlayer'));
const ErrorComponent = lazy(() => import('./components/ErrorComponent'));
const Contact = lazy(() => import('./components/Contact'));
const TextEditor = lazy(() => import('./components/TextEditor'));
const EditPost = lazy(() => import('./components/EditPost'));

const RouteFallback = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: '#64ffda',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}
  >
    Loading...
  </div>
);

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <div className="d-flex flex-grow-1">
          <main className="flex-grow-1 main-content">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/login" element={<Login />} />
                <Route path="/games" element={<GamePage />} />
                <Route path="/games/:gameId" element={<GamePlayer />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/:toolId" element={<ToolPlayer />} />

                <Route path="/error" element={<ErrorComponent />} />
                <Route path="/contact" element={<Contact />} />
                {/* Rutas protegidas solo para Administradores */}
                <Route path="/new-post" element={
                  <AdminRoute>
                    <TextEditor />
                  </AdminRoute>
                } />
                <Route path="/edit-post/:id" element={
                  <AdminRoute>
                    <EditPost />
                  </AdminRoute>
                } />
                {/* Aquí puedes añadir rutas para tus juegos individuales */}
              </Routes>
            </Suspense>
          </main>
          {/*  <SidebarMenu /> */}
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
