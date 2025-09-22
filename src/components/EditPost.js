import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';

// Importar lenguajes adicionales de Prism
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

// Componente Modal para ingresar código
const CodeInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const languages = [
    'javascript', 'python', 'java', 'html', 'css',
    'typescript', 'jsx', 'tsx', 'sql', 'json', 'bash'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(code, language);
    setCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Insertar Código</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Pega tu código aquí..."
          className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm mb-4"
          autoFocus
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Insertar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Alert
const Alert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
  const borderColor = type === 'success' ? 'border-green-200' : type === 'error' ? 'border-red-200' : 'border-blue-200';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${bgColor} ${borderColor} flex items-center`}>
      <span className={`${textColor} font-medium`}>{message}</span>
      <button
        onClick={onClose}
        className={`ml-4 ${textColor} hover:opacity-75`}
      >
        ×
      </button>
    </div>
  );
};

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTest, setIsTest] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${apiUrl}/api/posts/${id}`, { headers });
        if (!response.ok) throw new Error('Error al cargar el post');

        const data = await response.json();
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        if (data.imageUrl) setImagePreview(data.imageUrl);
        setIsTest(data.isTest || false);
      } catch (error) {
        console.error('Error:', error);
        setAlert({
          type: 'error',
          message: 'Error al cargar el post'
        });
      }
    };

    fetchPost();
  }, [id, apiUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleYouTubeEmbed = () => {
    const youtubeUrl = prompt("Por favor, ingresa la URL del video de YouTube:");
    if (!youtubeUrl) return;

    const videoId = extractYouTubeId(youtubeUrl);
    if (videoId) {
      const embedCode = `
        <div class="video-container">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/${videoId}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
      editorRef.current?.insertContent(embedCode);
    } else {
      setAlert({
        type: 'error',
        message: 'URL de YouTube no válida'
      });
    }
  };

  const handleAudioUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3,.wav,.ogg,.aac,.m4a,.webm';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = Array.from(e.target.files);

      for (const file of files) {
        const formData = new FormData();
        formData.append('audio', file);

        try {
          setAlert({
            type: 'info',
            message: `Subiendo ${file.name}...`
          });

          const response = await fetch(`${apiUrl}/api/upload-audio`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
            },
            body: formData
          });

          if (!response.ok) throw new Error('Error al subir el audio');

          const data = await response.json();
          const fileName = data.audioUrl.split('/').pop();

          const audioHtml = `
            <div class="audio-container" data-audio-file="${fileName}">
              <div class="audio-header">
                <div class="audio-title">${file.name}</div>
                <button type="button" class="delete-audio-btn" onclick="window.handleAudioDelete('${fileName}')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <audio controls>
                <source src="${data.audioUrl}" type="${file.type}">
                Your browser does not support the audio element.
              </audio>
            </div>
          `;
          editorRef.current?.insertContent(audioHtml);

          setAlert({
            type: 'success',
            message: `${file.name} subido exitosamente!`
          });
        } catch (error) {
          console.error('Error:', error);
          setAlert({
            type: 'error',
            message: `Error al subir ${file.name}`
          });
        }
      }
    };
    input.click();
  };

  const handleCodeSubmit = (code, language) => {
    if (code) {
      const codeBlockId = `code-block-${Date.now()}`;
      const preElement = document.createElement('pre');
      const codeElement = document.createElement('code');

      preElement.id = codeBlockId;
      preElement.className = `language-${language}`;
      codeElement.className = `language-${language}`;
      codeElement.textContent = code;
      preElement.appendChild(codeElement);

      Prism.plugins.toolbar.registerButton('copy-to-clipboard', {
        text: 'Copy',
        onClick: function () {
          navigator.clipboard.writeText(code).then(() => {
            const copyButton = document.querySelector(`#${codeBlockId} .copy-to-clipboard`);
            copyButton.textContent = 'Copied!';
            setTimeout(() => copyButton.textContent = 'Copy', 2000);
          });
        }
      });

      editorRef.current?.insertContent(preElement.outerHTML);
      Prism.highlightElement(preElement);
    }
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', editorRef.current.getContent());
    if (image) formData.append('image', image);
    formData.append('isTest', isTest);

    try {
      const response = await fetch(`${apiUrl}/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Error al actualizar el post');

      setAlert({
        type: 'success',
        message: '¡Post actualizado exitosamente!'
      });

      setTimeout(() => navigate(`/blog/${id}`), 1500);
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        type: 'error',
        message: 'Error al actualizar el post'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkInsert = () => {
    const linkUrl = prompt("Por favor, ingresa la URL del enlace:");
    const linkText = prompt("Por favor, ingresa el texto para mostrar:");
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      editorRef.current?.insertContent(linkHtml);
    }
  };


  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Post
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe un título atractivo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen Destacada
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Seleccionar Imagen
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-md"
                />
              )}
            </div>
          </div>
        </div>

        {/* Nuevo Checkbox para Test */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <input
            type="checkbox"
            id="isTest"
            checked={isTest}
            onChange={(e) => setIsTest(e.target.checked)}
            style={{ width: 'auto' }}
          />
          <label htmlFor="isTest" style={{ marginBottom: '0', fontWeight: '500' }}>
            Marcar como post de prueba (solo visible para administradores)
          </label>
        </div>

        <Editor
          onInit={(evt, editor) => editorRef.current = editor}
          apiKey='d2cmewtag6kjp2p8p17tsmvvvqjqxaqifks441d9txizwi3g'
          initialValue={content}
          init={{
            height: 600,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
              'visualchars', 'quickbars', 'pagebreak', 'nonbreaking', 'advtemplate'
            ],

            toolbar1: 'styles | fontfamily fontsize | forecolor backcolor | advtemplate',
            toolbar2: 'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent',
            toolbar3: 'removeformat | table image media | link customlink youtube | emoticons insertcode audio pagebreak | code fullscreen help',

            style_formats: [
              {
                title: 'Encabezados', items: [
                  { title: 'Título principal', block: 'h1', classes: 'blog-title' },
                  { title: 'Subtítulo', block: 'h2', classes: 'blog-subtitle' },
                  { title: 'Sección', block: 'h3', classes: 'blog-section' }
                ]
              },
              {
                title: 'Bloques', items: [
                  { title: 'Cita destacada', block: 'blockquote', classes: 'blog-quote' },
                  { title: 'Nota al margen', block: 'div', classes: 'blog-note' },
                  { title: 'Caja de alerta', block: 'div', classes: 'blog-alert' }
                ]
              },
              {
                title: 'Inline', items: [
                  { title: 'Texto destacado', inline: 'span', classes: 'highlight' },
                  { title: 'Código inline', inline: 'code' },
                  { title: 'Texto subrayado', inline: 'span', classes: 'underline-text' }
                ]
              }
            ],

            advtemplate_templates: [
              {
                id: 'blog-article',
                title: 'Artículo de Blog',
                description: 'Estructura básica para un artículo',
                content: `
                  <h1 class="blog-title">Título del Artículo</h1>
                  <p class="blog-meta">Por [Autor] | [Fecha]</p>
                  <img src="placeholder.jpg" alt="Imagen destacada" class="featured-image"/>
                  <h2 class="blog-subtitle">Introducción</h2>
                  <p>Tu introducción aquí...</p>
                  <h2 class="blog-subtitle">Desarrollo</h2>
                  <p>Contenido principal...</p>
                  <h2 class="blog-subtitle">Conclusión</h2>
                  <p>Tus conclusiones aquí...</p>
                `
              },
              {
                id: 'game-review',
                title: 'Review de Juego',
                description: 'Plantilla para reviews de juegos',
                content: `
                  <h1 class="blog-title">Review: [Nombre del Juego]</h1>
                  <div class="game-meta">
                    <p><strong>Género:</strong> [Género]</p>
                    <p><strong>Plataforma:</strong> [Plataforma]</p>
                    <p><strong>Puntuación:</strong> ⭐⭐⭐⭐☆</p>
                  </div>
                  <h2>Resumen</h2>
                  <p>Resumen breve del juego...</p>
                  <h2>Gráficos y Sonido</h2>
                  <p>Análisis de los aspectos técnicos...</p>
                  <h2>Jugabilidad</h2>
                  <p>Descripción de la mecánica del juego...</p>
                  <h2>Conclusión</h2>
                  <p>Veredicto final...</p>
                `
              },
              {
                id: 'technical-tutorial',
                title: 'Tutorial Técnico',
                description: 'Estructura para tutoriales',
                content: `
                  <h1 class="blog-title">Tutorial: [Título]</h1>
                  <div class="tutorial-meta">
                    <p><strong>Nivel:</strong> [Principiante/Intermedio/Avanzado]</p>
                    <p><strong>Tiempo estimado:</strong> [X minutos]</p>
                  </div>
                  <h2>Requisitos Previos</h2>
                  <ul>
                    <li>Requisito 1</li>
                    <li>Requisito 2</li>
                  </ul>
                  <h2>Paso 1: [Título del Paso]</h2>
                  <p>Instrucciones detalladas...</p>
                  <h2>Paso 2: [Título del Paso]</h2>
                  <p>Instrucciones detalladas...</p>
                  <h2>Conclusión</h2>
                  <p>Resumen y siguientes pasos...</p>
                `
              }
            ],

            content_style: `
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #2d3748;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              
              /* Estilos para títulos */
              .blog-title {
                font-size: 2.5em;
                font-weight: 800;
                color: #1a202c;
                margin-bottom: 0.5em;
                line-height: 1.2;
              }
              
              .blog-subtitle {
                font-size: 1.8em;
                font-weight: 700;
                color: #2d3748;
                margin: 1.5em 0 0.5em;
              }
              
              .blog-section {
                font-size: 1.4em;
                font-weight: 600;
                color: #4a5568;
                margin: 1.2em 0 0.4em;
              }
              
              /* Bloques especiales */
              .blog-quote {
                border-left: 4px solid #4a5568;
                padding: 1em 2em;
                margin: 1.5em 0;
                background: #f7fafc;
                font-style: italic;
              }
              
              .blog-note {
                background: #ebf8ff;
                border: 1px solid #90cdf4;
                border-radius: 8px;
                padding: 1em;
                margin: 1em 0;
              }
              
              .blog-alert {
                background: #fff5f5;
                border: 1px solid #feb2b2;
                border-radius: 8px;
                padding: 1em;
                margin: 1em 0;
                color: #c53030;
              }
              
              /* Elementos inline */
              .highlight {
                background: #fef3c7;
                padding: 0.2em 0.4em;
                border-radius: 4px;
              }
              
              .underline-text {
                border-bottom: 2px solid #4a5568;
              }
              
              /* Meta información */
              .blog-meta {
                color: #718096;
                font-size: 0.9em;
                margin-bottom: 2em;
              }
              
              /* Imágenes */
              .featured-image {
                width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 1em 0;
              }
              
              /* Review específicos */
              .game-meta {
                background: #f7fafc;
                padding: 1em;
                border-radius: 8px;
                margin: 1em 0;
              }
              
              /* Tutorial específicos */
              .tutorial-meta {
                background: #f0fff4;
                padding: 1em;
                border-radius: 8px;
                margin: 1em 0;
              }

              /* Código */
              .code-block { 
                margin: 1em 0; 
                background: #282c34;
                border-radius: 8px;
                overflow: hidden;
              }
              
              .code-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #21252b;
                border-bottom: 1px solid #373b41;
              }
              
              .code-language {
                color: #abb2bf;
                font-weight: 600;
                text-transform: uppercase;
              }
              
              .copy-button {
                padding: 6px 12px;
                background: #323842;
                color: #abb2bf;
                border: 1px solid #373b41;
                border-radius: 4px;
                cursor: pointer;
              }
              
              pre[class*="language-"] { 
                margin: 0; 
                padding: 16px; 
                background: #282c34;
                font-size: 0.9em;
              }
              
              code[class*="language-"] { 
                color: #abb2bf; 
                font-family: 'Fira Code', monospace;
              }

              /* Contenedores multimedia */
              .video-container {
                position: relative;
                padding-bottom: 56.25%;
                height: 0;
                overflow: hidden;
                max-width: 100%;
                margin: 1em 0;
              }
              
              .video-container iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
              }

              .audio-container {
                margin: 1em 0;
                padding: 1em;
                background: #f7fafc;
                border-radius: 8px;
              }
              
              .audio-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5em;
              }
              
              .audio-title {
                font-weight: bold;
                color: #2d3748;
              }
              
              .delete-audio-btn {
                background: none;
                border: none;
                color: #e53e3e;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                transition: background-color 0.2s;
              }
              
              .delete-audio-btn:hover {
                background-color: #fed7d7;
              }
              
              audio {
                width: 100%;
                margin-top: 0.5em;
              }
            `,

            setup: (editor) => {
              editor.ui.registry.addButton('youtube', {
                text: 'YouTube',
                onAction: handleYouTubeEmbed
              });

              editor.ui.registry.addButton('customlink', {
                text: 'Insertar Enlace',
                onAction: handleLinkInsert
              });

              editor.ui.registry.addButton('insertcode', {
                text: 'Insertar Código',
                onAction: () => setIsCodeModalOpen(true),
                icon: 'code'
              });

              editor.ui.registry.addButton('audio', {
                text: 'Audio',
                onAction: handleAudioUpload
              });
            }
          }}
        />

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              px-6 py-2 bg-blue-600 text-white rounded-md
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar Post'}
          </button>
        </div>
      </form>

      <CodeInputModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSubmit={handleCodeSubmit}
      />
    </div>
  );
}

export default EditPost;