import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from './SEO';
import gameRegistry from './GameRegistry';
import Prism from 'prismjs';

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
import 'prismjs/components/prism-yaml';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';
import 'prismjs/plugins/show-language/prism-show-language';
import '../css/blogpost.css';

function BlogPost() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    const detectLanguage = (text) => {
        const sample = text.trim();
        if (!sample) return 'plaintext';
        // JSON
        if (/^\s*\{[\s\S]*\}\s*$/.test(sample) && /"[^"]+"\s*:/.test(sample)) return 'json';
        // HTML/Markup
        if (/^\s*</.test(sample) && /<\/?[a-zA-Z]/.test(sample)) return 'markup';
        // Bash/Shell (prioritize before YAML)
        const isBash = (
            /^\s*\$\s+/.test(sample) ||
            /^\s*#\!\/(bin\/bash|usr\/bin\/env\s+bash)/.test(sample) ||
            /(^|\n)\s*(curl|wget|ls|cat|grep|echo|chmod|chown|mkdir|rm|cp|mv|tar|ssh|scp|docker|kubectl|systemctl|service|apt|yum|brew|npm|yarn|pnpm)\b/.test(sample) ||
            /(^|\n)\s*([A-Z_][A-Z0-9_]*=|export\s+[A-Z_][A-Z0-9_]*=)/.test(sample) ||
            /\$\{?[A-Za-z_][A-Za-z0-9_]*\}?/.test(sample) ||
            /(^|\n)\s*(if|then|fi|elif|for|while)\b/.test(sample) ||
            /\$\(.*\)/.test(sample) ||
            /`[^`]+`/.test(sample)
        );
        if (isBash) return 'bash';
        // SQL
        if (/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b/i.test(sample)) return 'sql';
        // JavaScript/TypeScript
        if (/\b(async function|function\s+\w+\s*\(|const |let |=>|fetch\s*\(|console\.log)\b/.test(sample)) return 'javascript';
        // Python
        if (/\b(def\s+\w+\s*\(|class\s+\w+\s*:|import\s+\w+|from\s+\w+\s+import|print\s*\()/.test(sample) || /__name__\s*==\s*["']__main__["']/.test(sample)) return 'python';
        // CSS
        if (/^[\s\S]*\{[\s\S]*:[\s\S]*;[\s\S]*\}$/.test(sample) && /(^|\n)\s*[.#]?[a-zA-Z0-9_-]+\s*\{/.test(sample)) return 'css';
        // YAML/Ansible (stricter)
        const isYaml = (
            /(^|\n)\s*-\s+name\s*:\s+/.test(sample) ||
            (/(^|\n)\s*[a-zA-Z0-9_.-]+\s*:\s*(>|\||\[|\{|"|\'|\d|\w|\s)/.test(sample) && !/https?:\/\//.test(sample))
        );
        if (isYaml) return 'yaml';
        return 'plaintext';
    };

    const transformHtmlForPrism = (html) => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Unwrap legacy codehilite wrappers
            doc.querySelectorAll('div.codehilite').forEach((div) => {
                const parent = div.parentNode;
                while (div.firstChild) parent.insertBefore(div.firstChild, div);
                parent.removeChild(div);
            });

            // Normalize each pre > code
            doc.querySelectorAll('pre code').forEach((codeEl) => {
                const pre = codeEl.parentElement;

                // Extract language from existing classes
                let langClass = Array.from(codeEl.classList).find((c) => c.startsWith('language-'))
                    || Array.from(pre.classList).find((c) => c.startsWith('language-'));

                // Keep original text before stripping spans
                const originalText = codeEl.textContent;

                // Remove inner span markup from Pygments
                codeEl.textContent = originalText;

                // Auto-detect when missing
                if (!langClass) {
                    const lang = detectLanguage(originalText);
                    langClass = `language-${lang}`;
                }

                // Ensure both <code> and <pre> carry the language class
                if (langClass) {
                    if (!codeEl.classList.contains(langClass)) codeEl.classList.add(langClass);
                    if (!pre.classList.contains(langClass)) pre.classList.add(langClass);
                }
            });

            return doc.body.innerHTML;
        } catch (e) {
            return html;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(`${apiUrl}/api/posts/${id}`, { headers })
            .then(response => {
                if (response.status === 403) {
                    throw new Error('Forbidden');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setPost(data);
                setTimeout(() => {
                    // Ensure <pre> gets language-* from child <code>
                    document.querySelectorAll('pre > code[class^="language-"]').forEach(codeEl => {
                        const pre = codeEl.parentElement;
                        const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
                        if (pre && langClass && !pre.classList.contains(langClass)) {
                            pre.classList.add(langClass);
                        }
                    });
                    Prism.highlightAll();
                }, 0);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                if (error.message === 'Forbidden') {
                    navigate('/blog');
                } else {
                    setError('Post no encontrado o error de red.');
                }
            });
    }, [id, apiUrl, navigate]);

    // Efecto adicional para reinicializar Prism cuando el contenido cambie
    useEffect(() => {
        if (post) {
            // Ensure <pre> gets language-* from child <code>
            document.querySelectorAll('pre > code[class^="language-"]').forEach(codeEl => {
                const pre = codeEl.parentElement;
                const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
                if (pre && langClass && !pre.classList.contains(langClass)) {
                    pre.classList.add(langClass);
                }
            });
            Prism.highlightAll();
        }
    }, [post]);

    useEffect(() => {
        window.copyCode = (elementId) => {
            const pre = document.getElementById(elementId);
            if (!pre) return;

            const code = pre.querySelector('code');
            const text = code ? code.textContent : pre.textContent;

            navigator.clipboard.writeText(text)
                .then(() => {
                    const button = pre.parentElement.querySelector('.copy-button');
                    if (button) {
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                            button.textContent = 'Copy';
                        }, 2000);
                    }
                });
        };
    }, []);

    const renderPostContent = (content) => {
        const contentParts = content.split(/\{\{\{Juego:([\w-]+)\}\}\}/g);

        const result = [];
        for (let i = 0; i < contentParts.length; i++) {
            const part = contentParts[i];

            // Si es un índice par, es contenido normal
            if (i % 2 === 0) {
                if (part) { // Solo renderizar si no está vacío
                    const processedHtml = transformHtmlForPrism(part).replace(/<img /g, '<img class="img-fluid" ');
                    result.push(
                        <div
                            key={i}
                            className="content-part"
                            dangerouslySetInnerHTML={{
                                __html: processedHtml
                            }}
                        />
                    );
                }
            } else {
                // Si es un índice impar, es el nombre del juego/herramienta
                // Buscar de forma case-insensitive
                const findGameOrTool = (name) => {
                    const lowerName = name.toLowerCase();

                    // Buscar en juegos
                    for (const key in gameRegistry.games) {
                        if (key.toLowerCase() === lowerName) {
                            return gameRegistry.games[key];
                        }
                    }

                    // Buscar en herramientas
                    for (const key in gameRegistry.tools) {
                        if (key.toLowerCase() === lowerName) {
                            return gameRegistry.tools[key];
                        }
                    }

                    return null;
                };

                const gameInfo = findGameOrTool(part);

                if (gameInfo && gameInfo.path) {
                    const GameComponent = React.lazy(gameInfo.path);
                    result.push(
                        <Suspense key={i} fallback={<div>Loading...</div>}>
                            <div className="game-container my-4">
                                <GameComponent />
                            </div>
                        </Suspense>
                    );
                } else {
                    console.warn(`Juego/herramienta no encontrado: ${part}`);
                }
            }
        }

        return result;
    };

    if (error) {
        return <div className="text-center py-5 text-danger">{error}</div>;
    }

    if (!post) {
        return <div className="text-center py-5">Cargando...</div>;
    }

    // Extrae un resumen para la descripción
    const plainTextContent = post.content.replace(/<[^>]+>/g, '');
    const description = plainTextContent.substring(0, 155) + '...';

    return (
        <>
            <SEO
                title={`${post.title} | Dante Collazzi's Blog`}
                description={description}
                name={post.author}
                type="article"
                imageUrl={post.imageUrl}
                url={`${window.location.origin}/blog/${post.id}`}
            />
            <div className="container-fluid py-3 py-md-5 blog-post-container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8">
                        <article className="blog-post">
                            <h1 className="blog-title mb-3 mb-md-4">{post.title}</h1>
                            {post.imageUrl && (
                                <img
                                    src={post.imageUrl}
                                    alt={`Featured image for article: ${post.title}`}
                                    className="img-fluid rounded mb-3 mb-md-4"
                                />
                            )}
                            <p className="blog-meta">
                                <span className="d-block d-md-inline">Autor: {post.author}</span>
                                <span className="d-none d-md-inline"> | </span>
                                <span className="d-block d-md-inline">
                                    Publicado: {post.fechaCreacion && new Date(post.fechaCreacion).toLocaleString()}
                                </span>
                            </p>
                            <div className="post-content">
                                {renderPostContent(post.content)}
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BlogPost;