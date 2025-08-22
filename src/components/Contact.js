import React, { useState } from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import SEO from './SEO';
import '../css/contact.css';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Sending...');

    try {
      // Simulación de espera para demo
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setStatus('Message sent successfully! Thanks for reaching out.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatus(`Error: ${errorData.message || 'Could not send message. Please try again or use another method.'}`);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setStatus('Error sending message. Please check your connection or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact - Dante Collazzi | Fullstack Developer"
        description="Contact Dante Collazzi for fullstack development projects, backend solutions with Python and Java, frontend with React, web applications, technical consulting or collaborations."
        name="Dante Collazzi"
        type="website"
      />
      <div className="contact-page-container">
        <h2 className="contact-title section-title">Get In Touch</h2>

        <p className="contact-intro">
          I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
          Feel free to reach out using the form below or through my social channels.
        </p>

        <div className="contact-content-wrapper">
          <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message here..."
                  required
                  disabled={isLoading}
                ></textarea>
              </div>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Message'}
                {!isLoading && <FaArrowRight style={{ marginLeft: '10px' }} />}
              </button>
            </form>
            {status && (
              <p className={`status-message ${status.startsWith('Error') ? 'error' : 'success'}`}>
                {status}
              </p>
            )}
          </div>

          <div className="contact-alternatives">
            <h3>Other ways to connect:</h3>
            <div className="social-links-contact">
              <a href="https://github.com/PitiGo" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub /> <span>GitHub</span>
              </a>
              <a href="https://x.com/DAcerbus" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter /> <span>Twitter</span>
              </a>
              <a href="https://www.linkedin.com/in/dantecollazzi/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin /> <span>LinkedIn</span>
              </a>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;