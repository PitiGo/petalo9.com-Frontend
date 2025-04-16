import React from 'react';
import '../css/about.css';
import profileImage from '../images/yo.png';

function About() {
  return (
    <div className="about-container">
      <div className="profile-section">
        <img src={profileImage} alt="Dante Collazzi" className="profile-image" />
      </div>

      <h2 className="about-title">About Me</h2>

      <p className="about-paragraph">
        Hello! I'm a <span className="highlight">software engineer</span> with a degree in Computer Engineering from the University of Alicante, where I graduated in 2016. Since then, I have been continuously developing my skills and working in various roles within the tech industry.
      </p>

      {/* Timeline de Experiencia */}
      <div className="experience-section">
        <h3>Professional Journey</h3>

        <div className="timeline-item">
          <div className="timeline-date">March 2025 - Present</div>
          <div className="timeline-role">Backend Developer</div>
          <div className="timeline-company">Adstella.ai</div>
          <p>Working with Python and PostgreSQL to develop robust backend solutions, focusing on scalable API development and database optimization.</p>
        </div>

        <div className="timeline-item">
          <div className="timeline-date">August 2024 - March 2025</div>
          <div className="timeline-role">Independent Developer & Freelancer</div>
          <div className="timeline-company">Personal Projects & Client Work</div>
          <p>Developed multiple personal projects showcased on this website while taking on freelance assignments for various clients. Freelance work included web application development, automation solutions, and technical consulting services.</p>
        </div>

        <div className="timeline-item">
          <div className="timeline-date">2020 - August 2024</div>
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

      <p className="about-paragraph">
        Currently, I'm working as a <span className="highlight">Backend Developer</span> at <span className="highlight">Adstella.ai</span>, where I utilize Python and PostgreSQL to build robust backend solutions. Previously, I split my time between developing personal projects and taking on freelance work for various clients, providing technical solutions ranging from web applications to automation systems.
      </p>

      <p className="about-paragraph">
        I have a passion for creating automation solutions and data-driven applications using <span className="highlight">Python</span>. These projects have allowed me to explore various problem-solving techniques and implement efficient systems for complex tasks.
      </p>

      <p className="about-paragraph">
        Since the release of ChatGPT 3 in November 2022, I've been actively exploring and utilizing various <span className="highlight">AI-powered code generation tools</span>. I've gained experience with advanced language models like <span className="highlight">Claude 3.5</span> and <span className="highlight">LLaMA 3.2</span>, integrating these cutting-edge technologies into my development workflow to enhance productivity and explore innovative solutions.
      </p>

      <p className="about-paragraph">
        Throughout my journey, I've worked with several technologies, but I specialize in:
      </p>

      <ul className="skills-list">
        <li className="skill-item">Python</li>
        <li className="skill-item">PostgreSQL</li>
        <li className="skill-item">Java</li>
        <li className="skill-item">JavaScript</li>
        <li className="skill-item">React</li>
        <li className="skill-item">Flutter</li>
        <li className="skill-item">AI Integration</li>
      </ul>

      <p className="about-paragraph">
        I'm always eager to learn new skills and take on challenging projects that push the boundaries of what I can do, especially at the intersection of traditional software development and emerging AI technologies.
      </p>
    </div>
  );
}

export default About;