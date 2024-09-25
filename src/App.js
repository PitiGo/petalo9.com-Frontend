import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
/* import Header from './components/Header'; */
import Footer from './components/Footer';
import Home from './components/Home';
import Blog from './components/Blog';
import About from './components/About';
import Login from './components/Login';
import BlogPost from './components/BlogPost';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorComponent from './components/ErrorComponent';
import TextEditor from './components/TextEditor';
import EditPost from './components/EditPost'; // Importa el nuevo componente EditPost
import 'bootstrap/dist/css/bootstrap.min.css';
import ParticleSystem from './components/shaders/ParticleSystem';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* <Header /> */}

        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            { <Link className="navbar-brand" to="/"><ParticleSystem /></Link> }
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar-nav ms-auto">
                <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                <Link className="nav-link" to="/blog">Blog</Link>
                <Link className="nav-link" to="/about">About</Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mt-4 flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/login" element={<Login />} />
            <Route path="/error" element={<ErrorComponent />} />
            <Route path="/edit" element={<ProtectedRoute><TextEditor /></ProtectedRoute>} />
            <Route path="/edit-post/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} /> {/* Nueva ruta para editar posts */}
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;