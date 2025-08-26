import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SidebarMenu from './components/SideBarMenu';
import Home from './components/Home';
import Blog from './components/Blog';
import About from './components/About';
import Login from './components/Login';
import BlogPost from './components/BlogPost';
import GamePage from './components/GamePage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorComponent from './components/ErrorComponent';
import TextEditor from './components/TextEditor';
import EditPost from './components/EditPost';
import Contact from './components/Contact';

import GamePlayer from './components/GamePlayer';
import Tools from './components/Tools';
import ToolPlayer from './components/ToolPlayer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <div className="d-flex flex-grow-1">
          <main className="flex-grow-1 main-content">
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
              <Route path="/edit" element={
                <ProtectedRoute>
                  <TextEditor />
                </ProtectedRoute>
              } />
              <Route path="/edit-post/:id" element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              } />
              {/* Aquí puedes añadir rutas para tus juegos individuales */}
            </Routes>
          </main>
          {/*  <SidebarMenu /> */}
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
