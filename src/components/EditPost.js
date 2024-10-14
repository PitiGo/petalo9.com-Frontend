import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const editorRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/posts/${id}`)
      .then(response => response.json())
      .then(data => {
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
      })
      .catch(error => console.error('Error fetching post:', error));
  }, [id, apiUrl]);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleYouTubeEmbed = () => {
    const youtubeUrl = prompt("Por favor, ingresa la URL completa del video de YouTube:");
    if (youtubeUrl) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (videoId) {
        const embedCode = `<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        editorRef.current.insertContent(embedCode);
      } else {
        alert("URL de YouTube no válida. Por favor, intenta de nuevo.");
      }
    }
  };

  const handleLinkInsert = () => {
    const linkUrl = prompt("Por favor, ingresa la URL del enlace:");
    const linkText = prompt("Por favor, ingresa el texto para mostrar:");
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      editorRef.current.insertContent(linkHtml);
    }
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', editorRef.current.getContent());
    if (image) {
      formData.append('image', image, image.name);
    }

    const token = localStorage.getItem('auth-token');

    try {
      const response = await fetch(`${apiUrl}/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      navigate(`/blog/${id}`);
    } catch (error) {
      console.error('Error al actualizar el post:', error);
      alert("Ocurrió un error al actualizar tu post. Por favor, intenta de nuevo más tarde.");
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título del Post"
      />
      <input
        type="file"
        onChange={handleImageChange}
      />
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        apiKey='d2cmewtag6kjp2p8p17tsmvvvqjqxaqifks441d9txizwi3g'
        initialValue={content}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | youtube customlink',
          setup: (editor) => {
            editor.ui.registry.addButton('youtube', {
              text: 'YouTube',
              onAction: handleYouTubeEmbed
            });
            editor.ui.registry.addButton('customlink', {
              text: 'Insertar Enlace',
              onAction: handleLinkInsert
            });
          }
        }}
      />
      <button type="submit">Actualizar Post</button>
    </form>
  );
}

export default EditPost;