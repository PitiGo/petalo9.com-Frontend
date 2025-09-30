import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import SEO from './SEO';
import '../css/home.css';
// Remove the ThreeJS import if you're not using it elsewhere
// import ThreeJSCSS3DSprites from './juegos/ThreeJSCSS3DSprites';
import ThreeJSCSS3DSprites from './juegos/ThreeJSCSS3DSprites'; // <--- Importa el componente 3D
import developerIllustration from '../images/developer-illustration.webp'; // <-- Import the image

function Home() {
  const [latestPost, setLatestPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiUrl}/api/posts?page=1&pageSize=1`)
      .then(response => response.json())
      .then(data => {
        if (data.posts && data.posts.length > 0) {
          setLatestPost(data.posts[0]);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching latest blog post:', error);
        setIsLoading(false);
      });
  }, [apiUrl]);

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <>
      <SEO
        title="Dante Collazzi - Fullstack Developer"
        description="Personal portfolio of Dante Collazzi, a fullstack software developer specialized in backend development with Python and Java, frontend with React, and modern web applications."
        name="Dante Collazzi"
        type="website"
      />
      <div className="home-container">
        <header className="hero">
          <div className="hero-overlay"></div>
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="main-title">
                  <span className="greeting">Hello, I'm</span>
                  <span className="name">Dante Collazzi</span>
                </h1>
                <p className="subtitle">Let's build together</p>
                <div className="role-tags">
                  <span>Software Developer</span>
                  <span>Educator</span>
                  <span>Tech Enthusiast</span>
                </div>
                <div className="cta-buttons">
                  <a href="#projects" className="cta-button primary">View Projects</a>
                  <Link to="/blog" className="cta-button secondary">Read Blog</Link>
                </div>
              </div>

              <div className="hero-visual">
                {/* Replace ThreeJS component with the image */}
                <img
                  src={developerIllustration}
                  alt="Software developer programming illustration"
                  className="hero-illustration" // Add a class for styling
                />
              </div>
            </div>

            <div className="scroll-indicator">
              <div className="mouse"></div>
              <span>Scroll to explore</span>
            </div>
          </div>
        </header>

        {/* === Coloca el componente Three.js aquí === */}
        <div className="threejs-section-wrapper"> {/* Opcional: para centrar o limitar ancho */}
          <ThreeJSCSS3DSprites />
        </div>
        {/* ========================================== */}

        <section id="about" className="about-section">
          <div className="about-section-container">
            <h2 className="section-title">Welcome</h2>
            <div className="about-content">
              <div className="about-text">
                <p>
                  This is my personal corner on the web—a space to create, experiment with new technologies, and share my ideas.
                </p>
                <p>
                  I'm a software developer with a passion for building things that matter. My journey has taken me through 
                  backend systems, frontend interfaces, and everything in between. I've also spent time as a programming 
                  instructor, which taught me the value of clear communication and thoughtful design.
                </p>
                <p>
                  Here you'll find projects I'm working on, experiments with new tech, and articles about topics that 
                  interest me. This site is both a portfolio and a lab—a place where I can try new ideas and share 
                  what I learn along the way.
                </p>
              </div>
            </div>
          </div>
        </section>


        <section id="latest-post" className="latest-post-section">
          <div className="latest-post-section-container">
            <h2 className="section-title">Latest from the Blog</h2>
            {isLoading ? (
              <div className="loading">Loading latest post...</div>
            ) : latestPost ? (
              <div className="latest-post-card">
                {latestPost.imageUrl && (
                  <img
                    src={latestPost.imageUrl}
                    alt={latestPost.title}
                    className="latest-post-image"
                  />
                )}
                <div className="post-content">
                  <h3>{latestPost.title}</h3>
                  <div
                    className="latest-post-excerpt"
                    dangerouslySetInnerHTML={createMarkup(latestPost.content.substring(0, 150) + '...')}
                  />
                  <Link to={`/blog/${latestPost.id}`} className="read-more-link">Read More</Link>
                </div>
              </div>
            ) : (
              <p>No posts available at the moment.</p>
            )}
          </div>
        </section>

        <section id="projects" className="projects-section">
          <div className="projects-section-container">
            <h2 className="section-title">Featured Projects</h2>
            <div className="projects-grid">
              <div className="project-card">
                <h3>3D Online Football Game</h3>
                <p>
                  A multiplayer 3D football game built with Three.js and Socket.IO. Features real-time
                  multiplayer gameplay, team selection system, and interactive 3D graphics. Players can
                  join different rooms and compete in dynamic football matches.
                </p>
                <a
                  href="https://github.com/PitiGo/frontend_futball_3d_online"
                  className="project-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
              </div>

              <div className="project-card">
                <h3>Personal Website</h3>
                <p>
                  This website showcases my journey as a developer, featuring a blog and
                  embedded games, built with React and modern web technologies.
                </p>
                <a
                  href="https://github.com/PitiGo/petalo9.com-Frontend"
                  className="project-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
              </div>

              <div className="project-card">
                <h3>Easy Budget</h3>
                <p>
                  A modern web application for personal budget management with real-time banking integration.
                  Inspired by YNAB (You Need A Budget), it allows users to connect their bank accounts
                  and effectively manage their budget through an intuitive interface.
                </p>
                <a
                  href="https://github.com/PitiGo/Presupuesto_facil"
                  className="project-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-container">
            <div className="social-links">
              <a href="https://github.com/PitiGo" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://www.linkedin.com/in/dantecollazzi/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://x.com/DAcerbus" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Home;
