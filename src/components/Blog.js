import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/blog.css';

function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/posts?page=${currentPage}`)
      .then(response => response.json())
      .then(data => {
        setBlogPosts(data.posts || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch(error => console.error('Error:', error));
  }, [currentPage, apiUrl]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = (postId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este post?');
    if (confirmDelete) {
      fetch(`${apiUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al eliminar el post');
          }
          return response.json();
        })
        .then(() => {
          setBlogPosts(blogPosts.filter(post => post.id !== postId));
        })
        .catch(error => console.error('Error:', error));
    }
  };

  const handleEdit = (postId) => {
    navigate(`/edit-post/${postId}`);
  };

  return (
    <div className="blog-container">
      <div className="wave-container">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      <div className="content">
        <h2 className="blog-title">Blog</h2>
        <div className="blog-grid">
          {blogPosts.map(post => (
            <div key={post.id} className="blog-card">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="blog-image"
                />
              )}
              <div className="blog-card-content">
                <h3>{post.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) + '...' }}></div>
                <p className="blog-meta">Author: {post.author}</p>
                <p className="blog-meta">Published: {new Date(post.fechaCreacion).toLocaleString()}</p>
                <Link to={`/blog/${post.id}`} className="read-more">Read More</Link>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleEdit(post.id)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`page-button ${index + 1 === currentPage ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Blog;