import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { FaGithub, FaTwitter } from 'react-icons/fa';
import '../css/home.css';
import ThreeJSCSS3DSprites from './juegos/ThreeJSCSS3DSprites';
import HandInvadersGame from './juegos/HandInvadersGame';

function Home() {
  const technologies = ['Java', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AI-assisted development', 'Flutter'];
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
    <div className="home-container">
      <header className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="main-title">
              <span className="greeting">Hello, I'm</span>
              <span className="name">Dante Collazzi</span>
            </h1>
            <p className="subtitle">Creating digital experiences through code</p>
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
            <ThreeJSCSS3DSprites />
          </div>
        </div>

        <div className="hero-game-container">
          <HandInvadersGame />
        </div>

        <div className="scroll-indicator">
          <div className="mouse"></div>
          <span>Scroll to explore</span>
        </div>
      </header>

      <section id="about" className="about-section">
        <h2 className="section-title">About Me</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              Hello! I'm Dante, a passionate developer with years of experience in creating elegant solutions
              to complex problems. My journey in tech has been driven by curiosity and a desire to make a positive impact.
            </p>
            <p>
              With a strong foundation in Java and Python, I've honed my skills across various aspects of software development.
              From building robust backend systems to crafting intuitive user interfaces, I approach each project with
              enthusiasm and attention to detail.
            </p>
            <p>
              My experience includes a rewarding period as a programming instructor, which broadened my perspective
              and enhanced my ability to communicate complex concepts effectively.
            </p>
            <p>
              Recently, I've been exploring AI-assisted development tools, integrating them into my workflow
              to enhance productivity and push the boundaries of what's possible in software development.
            </p>
          </div>
          <div className="skills-container">
            <h3>Tech Stack</h3>
            <div className="technologies">
              {technologies.map((tech, index) => (
                <span key={index} className="tech-item">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="latest-post" className="latest-post-section">
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
      </section>

      <section id="projects" className="projects-section">
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
      </section>

      <footer className="footer">
        <div className="social-links">
          <a href="https://github.com/PitiGo" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
          <a href="https://x.com/DAcerbus" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
