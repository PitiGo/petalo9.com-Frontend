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
      <p className="about-paragraph">
        From 2016 to 2020, I worked as a <span className="highlight">Java developer</span> at NTT Data, a leading consultancy firm. During my time there, I primarily focused on developing and maintaining several web platforms for a major bank. This role helped me gain extensive experience in large-scale web applications and refined my skills in backend development.
      </p>
      <p className="about-paragraph">
        In 2020, I shifted my career towards education, becoming a <span className="highlight">programming and mobile app development instructor</span> for vocational training. Over the next four years, I had the rewarding opportunity to teach and inspire future developers, while keeping up to date with the latest trends and technologies in the industry.
      </p>
      <p className="about-paragraph">
        Apart from my professional career, I have a passion for creating personal automation projects, mostly utilizing <span className="highlight">Python</span>. These projects have allowed me to explore various problem-solving techniques and automate complex tasks effectively.
      </p>
      <p className="about-paragraph">
        Since the release of ChatGPT 3 in November 2022, I've been actively exploring and utilizing various <span className="highlight">AI-powered code generation tools</span>. I've gained experience with advanced language models like <span className="highlight">Claude 3.5</span> and <span className="highlight">LLaMA 3.2</span>, integrating these cutting-edge technologies into my development workflow to enhance productivity and explore innovative solutions.
      </p>
      <p className="about-paragraph">
        Throughout my journey, I've worked with several technologies, but I specialize in:
      </p>
      <ul className="skills-list">
        <li className="skill-item">Java</li>
        <li className="skill-item">JavaScript</li>
        <li className="skill-item">Python</li>
        <li className="skill-item">Flutter</li>
      </ul>
      <p className="about-paragraph">
        I'm always eager to learn new skills and take on challenging projects that push the boundaries of what I can do, especially at the intersection of traditional software development and emerging AI technologies.
      </p>
    </div>
  );
}

export default About;
