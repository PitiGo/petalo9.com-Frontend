import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import gameRegistry from './GameRegistry';
import Prism from 'prismjs';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Insertar Código</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Pega tu código aquí..."
          className="code-input"
          autoFocus
        />
        <div className="modal-buttons">
          <button onClick={handleSubmit} className="submit-btn">Insertar</button>
          <button onClick={onClose} className="cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// Custom hooks
const useImageUpload = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return [image, imagePreview, handleImageChange];
};

const useFormValidation = (title, content, image) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if (!content.trim()) newErrors.content = 'El contenido es requerido';
    if (!image) newErrors.image = 'La imagen es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return [errors, validate];
};

// Componente Alert
const Alert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`alert alert-${type}`}>
      {message}
      <button className="alert-close" onClick={onClose}>×</button>
    </div>
  );
};

function TextEditor() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [juegoSeleccionado, setJuegoSeleccionado] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isTest, setIsTest] = useState(false);

  const editorRef = useRef(null);
  const navigate = useNavigate();

  const [image, imagePreview, handleImageChange] = useImageUpload();
  const [errors, validate] = useFormValidation(title, content, image);

  useEffect(() => {
    const storedAuthor = localStorage.getItem('user');
    if (storedAuthor) setAuthor(storedAuthor);
  }, []);

  const handleEditorChange = (content) => setContent(content);

  const handleLinkInsert = () => {
    const linkUrl = prompt("Por favor, ingresa la URL del enlace:");
    const linkText = prompt("Por favor, ingresa el texto para mostrar:");
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      editorRef.current?.insertContent(linkHtml);
    }
  };

  const handleYouTubeEmbed = () => {
    const youtubeUrl = prompt("Por favor, ingresa la URL del video de YouTube:");
    if (youtubeUrl) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (videoId) {
        const embedCode = `<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        editorRef.current?.insertContent(embedCode);
      } else {
        setAlert({
          type: 'error',
          message: 'URL de YouTube no válida'
        });
      }
    }
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

  const handleAudioUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3,.wav,.ogg,.aac,.m4a,.webm';
    input.multiple = true;
    const apiUrl = process.env.REACT_APP_API_URL;

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

          if (!response.ok) {
            throw new Error(`Error al subir el archivo`);
          }

          const data = await response.json();

          const audioHtml = `
            <div class="audio-container">
              <div class="audio-title">${file.name}</div>
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
          setAlert({
            type: 'error',
            message: `Error al subir ${file.name}: ${error.message}`
          });
        }
      }
    };
    input.click();
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      setAlert({
        type: 'error',
        message: 'Por favor, corrige los errores antes de enviar'
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', editorRef.current.getContent());
    if (image) formData.append('image', image);
    formData.append('author', author);
    if (juegoSeleccionado) formData.append('juego', juegoSeleccionado);
    formData.append('isTest', isTest);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al crear el post');
      }

      setAlert({
        type: 'success',
        message: '¡Post creado exitosamente!'
      });

      setTimeout(() => navigate('/blog'), 1500);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="editor-container">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del Post"
            className={`form-control ${errors.title ? 'error' : ''}`}
          />
          {errors.title && <p className="error-message">{errors.title}</p>}
        </div>

        <div className="form-group">
          <div className="image-upload-container">
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className={errors.image ? 'error' : ''}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            )}
          </div>
          {errors.image && <p className="error-message">{errors.image}</p>}
        </div>

        <select
          value={juegoSeleccionado}
          onChange={(e) => {
            setJuegoSeleccionado(e.target.value);
            if (e.target.value) {
              editorRef.current?.insertContent(`{{{Juego:${e.target.value}}}} `);
            }
          }}
          className="form-control"
        >
          <option value="">Selecciona un juego (opcional)</option>
          {Object.entries(gameRegistry.games).map(([key, { name }]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>

        {/* Nuevo Checkbox para Test */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="isTest"
            checked={isTest}
            onChange={(e) => setIsTest(e.target.checked)}
            style={{ width: 'auto' }}
          />
          <label htmlFor="isTest" style={{ marginBottom: '0' }}>
            Marcar como post de prueba (solo visible para administradores)
          </label>
        </div>

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

              /* Video Container */
              .video-container {
                position: relative;
                padding-bottom: 56.25%;
                height: 0;
                overflow: hidden;
                margin: 1em 0;
              }
              .video-container iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
              }

              /* Audio Container */
              .audio-container {
                background: #f7fafc;
                border-radius: 8px;
                padding: 1em;
                margin: 1em 0;
              }
              .audio-title {
                font-weight: 600;
                margin-bottom: 0.5em;
                color: #4a5568;
              }
              audio {
                width: 100%;
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
                onAction: () => handleAudioUpload()
              });
            }
          }}
        />
        {errors.content && <p className="error-message">{errors.content}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Post'}
        </button>
      </form>

      <CodeInputModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSubmit={handleCodeSubmit}
      />
    </div>
  );
}

export default TextEditor;