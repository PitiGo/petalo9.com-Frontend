import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import '../css/home.css';

function Home() {
  const technologies = ['Java', 'Python', 'React', 'Node.js', 'SQL', 'Git'];
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
  }, []);

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  }

  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="main-title">Dante Collazzi</h1>
          <p className="subtitle">Passionate Developer & Problem Solver</p>
          <div className="cta-buttons">
            <a href="#about" className="cta-button primary">Learn More</a>
            <a href="#latest-post" className="cta-button secondary">Read Blog</a>
          </div>
        </div>
      </header>

      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                Hello! I'm Dante, a passionate developer with a knack for creating elegant solutions
                to complex problems. With a strong foundation in Java and Python, I'm constantly
                expanding my skillset to stay at the forefront of technology.
              </p>
              <p>
                My journey in tech is driven by curiosity and a desire to make a positive impact.
                Whether it's building robust backend systems or crafting intuitive user interfaces,
                I approach each project with enthusiasm and attention to detail.
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
        </div>
      </section>

      <section id="latest-post" className="latest-post-section">
        <div className="container">
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

      <section className="projects-section">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            {/* Project 1 - Código fuente de tu página personal */}
            <div className="project-card">
              <h3>Personal Website</h3>
              <p>
                This is the source code of my personal website, featuring a blog and
                embedded games, built with React, CSS, and other modern technologies.
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

            {/* Project 2 - Otro proyecto */}
            <div className="project-card">
              <h3>Project 2</h3>
              <p>Short description of the project.</p>
              <a href="#" className="project-link">View Project</a>
            </div>

            {/* Add more project cards as needed */}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="social-links">
            <a href="https://github.com/PitiGo" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
          </div>
          <p>&copy; 2023 Dante Collazzi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;