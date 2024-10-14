
import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import gameRegistry from './GameRegistry';
import '../css/blogpost.css';

function BlogPost() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}/api/posts/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => setPost(data))
            .catch(error => console.error('Error fetching data:', error));
    }, [id, apiUrl]);

    const renderPostContent = (content) => {
        const contentParts = content.split(/\{\{\{Juego:(\w+)\}\}\}/g);

        return contentParts.map((part, index) => {
            if (gameRegistry[part] && gameRegistry[part].path) {
                const GameComponent = React.lazy(gameRegistry[part].path);
                return (
                    <Suspense key={index} fallback={<div>Loading...</div>}>
                        <div className="game-container my-4">
                            <GameComponent />
                        </div>
                    </Suspense>
                );
            } else {
                return (
                    <div 
                        key={index} 
                        className="content-part"
                        dangerouslySetInnerHTML={{ __html: part.replace(/<img /g, '<img class="img-fluid" ') }} 
                    />
                );
            }
        });
    };

    if (!post) {
        return <div className="text-center py-5">Cargando...</div>;
    }

    return (
        <div className="container-fluid py-3 py-md-5 blog-post-container">
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8">
                    <article className="blog-post">
                        <h1 className="mb-3 mb-md-4">{post.title}</h1>
                        {post.imageUrl && (
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="img-fluid rounded mb-3 mb-md-4"
                            />
                        )}
                        <p className="text-muted small">
                            <span className="d-block d-md-inline">Autor: {post.author}</span>
                            <span className="d-none d-md-inline"> | </span>
                            <span className="d-block d-md-inline">Publicado: {post.fechaCreacion && new Date(post.fechaCreacion).toLocaleString()}</span>
                        </p>
                        <div className="post-content">
                            {renderPostContent(post.content)}
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}

export default BlogPost;