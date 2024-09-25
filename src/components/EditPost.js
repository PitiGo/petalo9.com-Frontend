import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
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
  }, [id]);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
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
          'removeformat | help'
        }}
        onEditorChange={(content, editor) => {
          setContent(content);
        }}
      />
      <button type="submit">Actualizar Post</button>
    </form>
  );
}

export default EditPost;