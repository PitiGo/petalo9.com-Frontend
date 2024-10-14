import React, { useState } from 'react';
import '../css/contact.css';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setStatus('Message sent successfully');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('Error sending message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error sending message. Please try again.');
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact</h2>
      <div className="contact-content">
        <form onSubmit={handleSubmit} className="contact-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            required
          ></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

export default Contact;