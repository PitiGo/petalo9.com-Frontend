import React from 'react';
import SEO from './SEO';
import '../css/about.css';
import { SITE_IMAGES } from '../config/images';

function About() {
  return (
    <>
      <SEO
        title="About Me - Dante Collazzi | Fullstack Developer"
        description="Meet Dante Collazzi, a fullstack software developer and ICT teacher at the European School of Munich, with expertise in backend development using Python and Java, frontend with React, PostgreSQL databases, and experience in teaching and freelance projects."
        name="Dante Collazzi"
        type="website"
      />
      <div className="about-container">
        <h2 className="about-title">About Me</h2>

        {/* Nuevo contenedor para el layout de dos columnas */}
        <div className="about-layout">
          {/* Columna principal (izquierda en escritorio) */}
          <div className="about-main-content">
            <p className="about-paragraph">
              Hello! I'm a <span className="highlight">software engineer</span> with a degree in Computer Engineering from the University of Alicante, where I graduated in 2016. Since then, I have been continuously developing my skills and working in various roles within the tech industry.
            </p>

            <p className="about-paragraph">
              Since February 2026, I have been working as an <span className="highlight">ICT Teacher</span> at the <span className="highlight">European School of Munich</span>, where I teach information and communication technology and share my passion for software development with the next generation. Previously, after my role as a <span className="highlight">Backend Developer</span> at <span className="highlight">Adstella.ai</span> specializing in Python and PostgreSQL, I worked as a full-time <span className="highlight">freelancer</span> on web applications and automation systems. I continue to develop personal projects and take on selected client work alongside my teaching.
            </p>

            <p className="about-paragraph">
              I have a passion for creating automation solutions and data-driven applications using <span className="highlight">Python</span>. These projects have allowed me to explore various problem-solving techniques and implement efficient systems for complex tasks.
            </p>

            <p className="about-paragraph">
              Since the emergence of AI-powered development tools, I've been actively exploring and utilizing various code generation and assistance technologies. I've gained experience with advanced language models and AI coding assistants, integrating these cutting-edge technologies into my development workflow to enhance productivity and explore innovative solutions.
            </p>

            {/* Timeline de Experiencia */}
            <div className="experience-section">
              <h3>Professional Journey</h3>
              <div className="timeline-item">
                <div className="timeline-date">February 2026 - Present</div>
                <div className="timeline-role">ICT Teacher</div>
                <div className="timeline-company">European School of Munich</div>
                <p>Teaching information and communication technology, guiding students through programming and digital skills while staying current with the latest developments in software and AI.</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">July 2024 - January 2026</div>
                <div className="timeline-role">Independent Developer & Freelancer</div>
                <div className="timeline-company">Personal Projects & Client Work</div>
                <p>Developing personal projects showcased on this website while taking on freelance assignments for various clients, focusing on web application development, automation solutions, and technical consulting.</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">February 2024 - July 2024</div>
                <div className="timeline-role">Backend Developer</div>
                <div className="timeline-company">Adstella.ai</div>
                <p>Worked with Python and PostgreSQL to develop robust backend solutions, focusing on scalable API development and database optimization.</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">2020 - February 2024</div>
                <div className="timeline-role">Programming & Mobile App Development Instructor</div>
                <div className="timeline-company">Vocational Training Institute</div>
                <p>Taught and inspired future developers while keeping up to date with the latest industry trends and technologies.</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">2016 - 2020</div>
                <div className="timeline-role">Java Developer</div>
                <div className="timeline-company">NTT Data</div>
                <p>Developed and maintained web platforms for a major bank, gaining extensive experience in large-scale web applications and backend development.</p>
              </div>
            </div>
          </div>

          {/* Barra lateral (derecha en escritorio) */}
          <div className="about-sidebar">
            <div className="profile-section">
              <img src={SITE_IMAGES.profile} alt="Dante Collazzi software developer profile photo" className="profile-image" />
            </div>
            <h3>Key Skills</h3>
            <ul className="skills-list">
              <li className="skill-item">Python</li>
              <li className="skill-item">PostgreSQL</li>
              <li className="skill-item">Java</li>
              <li className="skill-item">JavaScript</li>
              <li className="skill-item">React</li>
              <li className="skill-item">Flutter</li>
              <li className="skill-item">AI Integration</li>
            </ul>
          </div>
        </div>

        {/* Párrafo final (opcional, fuera del layout de columnas si quieres que ocupe todo el ancho) */}
        <p className="about-paragraph final-paragraph">
          I'm always eager to learn new skills and take on challenging projects that push the boundaries of what I can do, especially at the intersection of traditional software development and emerging AI technologies.
        </p>
      </div>
    </>
  );
}

export default About;