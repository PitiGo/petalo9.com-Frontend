import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import gameRegistry from './GameRegistry';

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
    }, [id]);

    const renderPostContent = (content) => {
        const contentParts = content.split(/\{\{\{Juego:(\w+)\}\}\}/g);

        return contentParts.map((part, index) => {
            if (gameRegistry[part] && gameRegistry[part].path) {
                const GameComponent = React.lazy(gameRegistry[part].path);
                return (
                    <Suspense key={index} fallback={<div>Loading...</div>}>
                        <GameComponent />
                    </Suspense>
                );
            } else {
                return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
            }
        });
    };

    if (!post) {
        return <div className="text-center py-5">Cargando...</div>;
    }

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-lg-8 offset-lg-2">
                    <h1 className="mb-4">{post.title}</h1>
                    {post.imageUrl && (
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="img-fluid rounded mb-4"
                        />
                    )}
                    <p className="text-muted">
                        Autor: {post.author} | 
                        Publicado: {post.fechaCreacion && new Date(post.fechaCreacion).toLocaleString()}
                    </p>
                    <div className="post-content">
                        {renderPostContent(post.content)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogPost;