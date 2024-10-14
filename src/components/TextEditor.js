import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import gameRegistry from './GameRegistry';
import '../css/editor.css';

// Custom hook para manejar la carga de imágenes
const useImageUpload = () => {
  const [image, setImage] = useState(null);
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };
  return [image, handleImageChange];
};

function TextEditor() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [juegoSeleccionado, setJuegoSeleccionado] = useState('');
  const editorRef = useRef(null);
  const navigate = useNavigate();

  const [image, handleImageChange] = useImageUpload();

  useEffect(() => {
    const storedAuthor = localStorage.getItem('user');
    if (storedAuthor) {
      setAuthor(storedAuthor);
    }
  }, []);

  const handleEditorChange = (content, editor) => {
    setContent(content);
  };

  const handleLinkInsert = () => {
    const linkUrl = prompt("Por favor, ingresa la URL del enlace:");
    const linkText = prompt("Por favor, ingresa el texto para mostrar:");
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      editorRef.current.insertContent(linkHtml);
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

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Por favor, ingresa un título para tu post.");
      return;
    }
    if (!content.trim()) {
      alert("Por favor, ingresa el contenido de tu post.");
      return;
    }
    if (!image) {
      alert("Por favor, selecciona una imagen para tu post.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image, image.name);
    }
    formData.append('author', author);
    formData.append('juego', juegoSeleccionado);

    const token = localStorage.getItem('auth-token');
    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        alert(`Ocurrió un error: ${errorData.message || 'Error desconocido'}`);
        throw new Error(`HTTP status ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      navigate('/blog');
    } catch (error) {
      console.error('Error al enviar el post:', error);
      alert("Ocurrió un error al enviar tu post. Por favor, intenta de nuevo más tarde.");
    }
  };

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
      <select
        value={juegoSeleccionado}
        onChange={(e) => {
          setJuegoSeleccionado(e.target.value);
          editorRef.current && editorRef.current.insertContent(`{{{Juego:${e.target.value}}}} `);
        }}
      >
        <option value="">Selecciona un juego</option>
        {Object.entries(gameRegistry).map(([key, { id, name }]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
      <Editor
        apiKey='d2cmewtag6kjp2p8p17tsmvvvqjqxaqifks441d9txizwi3g'
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue="<p>Contenido del Post</p>"
        onEditorChange={handleEditorChange}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | youtube customlink',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
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
      <button type="submit">Guardar Post</button>
    </form>
  );
}

export default TextEditor;