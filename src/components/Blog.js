import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/blog-new.css';

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
   <div className="blog-main">
     <div className="blog-header">
       <h1>Latest Posts</h1>
       {isAdmin && (
         <Link to="/new-post" className="new-post-button">
           Write New Post
         </Link>
       )}
     </div>
     
     <div className="blog-posts-grid">
       {blogPosts.map(post => (
         <article key={post.id} className="post-card">
           <div className="post-image">
             {post.imageUrl && (
               <img src={post.imageUrl} alt={post.title} />
             )}
           </div>
           <div className="post-content">
             <h2>{post.title}</h2>
             <div className="post-meta">
               <span className="author">{post.author}</span>
               <span className="date">
                 {new Date(post.fechaCreacion).toLocaleDateString()}
               </span>
             </div>
             <div className="post-excerpt" 
               dangerouslySetInnerHTML={{ 
                 __html: post.content.substring(0, 150) + '...' 
               }}>
             </div>
             <div className="post-actions">
               <Link to={`/blog/${post.id}`} className="read-more">
                 Read More →
               </Link>
               {isAdmin && (
                 <div className="admin-actions">
                   <button onClick={() => handleEdit(post.id)}>Edit</button>
                   <button onClick={() => handleDelete(post.id)}>Delete</button>
                 </div>
               )}
             </div>
           </div>
         </article>
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
 );
}

export default Blog;