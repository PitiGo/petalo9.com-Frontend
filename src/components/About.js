import React from 'react';

import '../css/about.css';

function About() {
  return (
    <div className="about-container">
      <h2 className="about-title">About Me</h2>
      <p className="about-paragraph">
        Hello! I'm a <span className="highlight">software engineer</span> with a degree in Computer Engineering from the University of Alicante, where I graduated in 2016. Since then, I have been continuously developing my skills and working in various roles within the tech industry.
      </p>
      <p className="about-paragraph">
        From 2016 to 2020, I worked as a <span className="highlight">Java developer</span> at Everis, a leading consultancy firm. During my time there, I primarily focused on developing and maintaining several web platforms for a major bank. This role helped me gain extensive experience in large-scale web applications and refined my skills in backend development.
      </p>
      <p className="about-paragraph">
        In 2020, I shifted my career towards education, becoming a <span className="highlight">programming and mobile app development instructor</span> for vocational training. Over the next four years, I had the rewarding opportunity to teach and inspire future developers, while keeping up to date with the latest trends and technologies in the industry.
      </p>
      <p className="about-paragraph">
        Apart from my professional career, I have a passion for creating personal automation projects, mostly utilizing <span className="highlight">Python</span>. These projects have allowed me to explore various problem-solving techniques and automate complex tasks effectively.
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
        I'm always eager to learn new skills and take on challenging projects that push the boundaries of what I can do.
      </p>
    </div>
  );
}

export default About;