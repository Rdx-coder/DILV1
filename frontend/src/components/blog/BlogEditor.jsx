import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { getToken } from '../../utils/auth';

const CalloutBlock = Node.create({
  name: 'calloutBlock',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout', class: 'blog-callout-block' }), 0];
  },
  addCommands() {
    return {
      insertCalloutBlock: () => ({ commands }) => commands.insertContent({
        type: this.name,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Note: highlight key information here.' }] }]
      })
    };
  }
});

const ToggleSummary = Node.create({
  name: 'toggleSummary',
  content: 'inline*',
  marks: '_',
  defining: true,
  parseHTML() {
    return [{ tag: 'summary' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes, { class: 'blog-toggle-summary' }), 0];
  }
});

const ToggleContent = Node.create({
  name: 'toggleContent',
  content: 'block+',
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-type="toggle-content"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'blog-toggle-content', 'data-type': 'toggle-content' }), 0];
  }
});

const ToggleBlock = Node.create({
  name: 'toggleBlock',
  group: 'block',
  content: 'toggleSummary toggleContent',
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute('open'),
        renderHTML: (attributes) => (attributes.open ? { open: 'open' } : {})
      }
    };
  },
  parseHTML() {
    return [{ tag: 'details[data-type="toggle"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle', class: 'blog-toggle-block' }), 0];
  },
  addCommands() {
    return {
      insertToggleBlock: () => ({ commands }) => commands.insertContent({
        type: this.name,
        attrs: { open: true },
        content: [
          {
            type: 'toggleSummary',
            content: [{ type: 'text', text: 'Toggle title' }]
          },
          {
            type: 'toggleContent',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Add hidden content here.' }] }]
          }
        ]
      })
    };
  }
});

const ColumnBlock = Node.create({
  name: 'columnBlock',
  content: 'block+',
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'blog-column', 'data-type': 'column' }), 0];
  }
});

const ColumnsBlock = Node.create({
  name: 'columnsBlock',
  group: 'block',
  content: 'columnBlock columnBlock',
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns', class: 'blog-columns-block' }), 0];
  },
  addCommands() {
    return {
      insertColumnsBlock: () => ({ commands }) => commands.insertContent({
        type: this.name,
        content: [
          {
            type: 'columnBlock',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Left column content' }] }]
          },
          {
            type: 'columnBlock',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Right column content' }] }]
          }
        ]
      })
    };
  }
});

const SLASH_COMMANDS = [
  {
    key: 'h1',
    group: 'Text',
    icon: 'H1',
    label: 'Heading 1',
    description: 'Large section heading',
    keywords: ['heading', 'title', 'h1'],
    run: (editor) => editor.chain().focus().setHeading({ level: 1 }).run()
  },
  {
    key: 'h2',
    group: 'Text',
    icon: 'H2',
    label: 'Heading 2',
    description: 'Medium section heading',
    keywords: ['heading', 'subtitle', 'h2'],
    run: (editor) => editor.chain().focus().setHeading({ level: 2 }).run()
  },
  {
    key: 'h3',
    group: 'Text',
    icon: 'H3',
    label: 'Heading 3',
    description: 'Small section heading',
    keywords: ['heading', 'h3'],
    run: (editor) => editor.chain().focus().setHeading({ level: 3 }).run()
  },
  {
    key: 'bullet-list',
    group: 'Text',
    icon: 'BL',
    label: 'Bullet List',
    description: 'Create a bulleted list',
    keywords: ['list', 'bullet', 'ul'],
    run: (editor) => editor.chain().focus().toggleBulletList().run()
  },
  {
    key: 'ordered-list',
    group: 'Text',
    icon: 'NL',
    label: 'Numbered List',
    description: 'Create an ordered list',
    keywords: ['list', 'number', 'ordered', 'ol'],
    run: (editor) => editor.chain().focus().toggleOrderedList().run()
  },
  {
    key: 'quote',
    group: 'Text',
    icon: 'QT',
    label: 'Quote',
    description: 'Highlight quoted text',
    keywords: ['quote', 'blockquote'],
    run: (editor) => editor.chain().focus().toggleBlockquote().run()
  },
  {
    key: 'code-block',
    group: 'Text',
    icon: 'CD',
    label: 'Code Block',
    description: 'Insert formatted code area',
    keywords: ['code', 'snippet'],
    run: (editor) => editor.chain().focus().toggleCodeBlock().run()
  },
  {
    key: 'divider',
    group: 'Text',
    icon: 'DV',
    label: 'Divider',
    description: 'Horizontal visual separator',
    keywords: ['rule', 'divider', 'line'],
    run: (editor) => editor.chain().focus().setHorizontalRule().run()
  },
  {
    key: 'callout',
    group: 'Layout',
    icon: 'CO',
    label: 'Callout Block',
    description: 'Emphasized note panel with rich content',
    keywords: ['callout', 'note', 'alert'],
    run: (editor) => editor.chain().focus().insertCalloutBlock().run()
  },
  {
    key: 'toggle',
    group: 'Layout',
    icon: 'TG',
    label: 'Toggle / Collapsible',
    description: 'Expandable details with rich content',
    keywords: ['toggle', 'collapsible', 'accordion', 'details'],
    run: (editor) => editor.chain().focus().insertToggleBlock().run()
  },
  {
    key: 'columns-2',
    group: 'Layout',
    icon: '2C',
    label: '2-Column Layout',
    description: 'Side-by-side rich text columns',
    keywords: ['column', 'columns', 'layout', 'grid'],
    run: (editor) => editor.chain().focus().insertColumnsBlock().run()
  },
  {
    key: 'table',
    group: 'Media',
    icon: 'TB',
    label: 'Table (3x3)',
    description: 'Insert a table grid',
    keywords: ['table', 'grid'],
    run: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  },
  {
    key: 'image',
    group: 'Media',
    icon: 'IM',
    label: 'Image from URL',
    description: 'Embed image from web link',
    keywords: ['image', 'media', 'photo'],
    run: (editor) => {
      const url = window.prompt('Paste image URL');
      if (url && /^https?:\/\//i.test(url.trim())) {
        editor.chain().focus().setImage({ src: url.trim() }).run();
      }
    }
  }
];

const BlogEditor = ({ value, onChange, backendUrl }) => {
  const rootRef = useRef(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value || '<p></p>');
  const [uploadJobs, setUploadJobs] = useState([]);
  const [inlineUploadError, setInlineUploadError] = useState('');
  const [slashMenu, setSlashMenu] = useState({
    open: false,
    query: '',
    x: 0,
    y: 0,
    from: 0,
    to: 0,
    selectedIndex: 0
  });

  const filteredSlashCommands = useMemo(() => {
    const query = slashMenu.query.trim().toLowerCase();
    if (!query) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter((item) => {
      const haystack = `${item.label} ${item.keywords.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [slashMenu.query]);

  const slashGroups = useMemo(() => {
    return filteredSlashCommands.reduce((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    }, {});
  }, [filteredSlashCommands]);

  const closeSlashMenu = useCallback(() => {
    setSlashMenu((prev) => ({ ...prev, open: false, query: '', selectedIndex: 0 }));
  }, []);

  const updateUploadJob = useCallback((id, patch) => {
    setUploadJobs((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const uploadInlineImage = useCallback((file, onProgress) => {
    if (!file || !backendUrl) {
      return Promise.reject(new Error('Editor upload endpoint is not configured'));
    }

    const token = getToken();
    if (!token) {
      return Promise.reject(new Error('Please login again before uploading images'));
    }

    const formData = new FormData();
    formData.append('image', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${backendUrl}/api/admin/blog/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const progress = Math.min(100, Math.round((event.loaded / event.total) * 100));
        onProgress(progress);
      };

      xhr.onerror = () => reject(new Error('Network error while uploading image'));

      xhr.onload = () => {
        let data;
        try {
          data = JSON.parse(xhr.responseText || '{}');
        } catch (_error) {
          data = { success: false, message: xhr.responseText || 'Image upload failed' };
        }

        if (xhr.status < 200 || xhr.status >= 300 || !data.success || !data.imageUrl) {
          reject(new Error(data.message || 'Image upload failed'));
          return;
        }

        resolve(data.imageUrl);
      };

      xhr.send(formData);
    });
  }, [backendUrl]);

  const insertImagesAtPosition = useCallback(async (files, editorView, event) => {
    if (!files.length) return false;

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return false;

    event.preventDefault();
    setInlineUploadError('');

    const coords = event.clientX != null && event.clientY != null
      ? editorView.posAtCoords({ left: event.clientX, top: event.clientY })
      : null;
    let insertPos = coords?.pos ?? editorView.state.selection.from;

    for (let index = 0; index < imageFiles.length; index += 1) {
      const file = imageFiles[index];
      const uploadId = `${Date.now()}-${index}-${file.name}`;
      setUploadJobs((prev) => ([
        ...prev,
        { id: uploadId, name: file.name, progress: 0, status: 'uploading', error: '' }
      ]));

      try {
        const imageUrl = await uploadInlineImage(file, (progress) => updateUploadJob(uploadId, { progress }));
        editorView.dispatch(editorView.state.tr.insert(insertPos, editorView.state.schema.nodes.image.create({ src: imageUrl })));
        insertPos += 1;
        updateUploadJob(uploadId, { progress: 100, status: 'done' });
      } catch (error) {
        const message = error.message || 'Failed to upload one or more images';
        updateUploadJob(uploadId, { status: 'error', error: message });
        setInlineUploadError(message);
      }
    }

    window.setTimeout(() => {
      setUploadJobs((prev) => prev.filter((item) => item.status === 'uploading'));
    }, 1800);

    return true;
  }, [updateUploadJob, uploadInlineImage]);

  const uploadingCount = useMemo(
    () => uploadJobs.filter((item) => item.status === 'uploading').length,
    [uploadJobs]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
      }),
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Start writing your blog content...' }),
      CharacterCount,
      CalloutBlock,
      ToggleSummary,
      ToggleContent,
      ToggleBlock,
      ColumnBlock,
      ColumnsBlock
    ],
    content: value || '<p></p>',
    editorProps: {
      handleDrop: (view, event, _slice, moved) => {
        if (moved || isHtmlMode) return false;
        const droppedFiles = Array.from(event.dataTransfer?.files || []);
        if (!droppedFiles.length) return false;
        void insertImagesAtPosition(droppedFiles, view, event);
        return true;
      },
      handlePaste: (view, event) => {
        if (isHtmlMode) return false;
        const pastedFiles = Array.from(event.clipboardData?.files || []);
        if (!pastedFiles.length) return false;
        void insertImagesAtPosition(pastedFiles, view, event);
        return true;
      },
      handleKeyDown: (view, event) => {
        if (!slashMenu.open) return false;

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSlashMenu((prev) => {
            const maxIndex = Math.max(0, filteredSlashCommands.length - 1);
            return { ...prev, selectedIndex: prev.selectedIndex >= maxIndex ? 0 : prev.selectedIndex + 1 };
          });
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSlashMenu((prev) => {
            const maxIndex = Math.max(0, filteredSlashCommands.length - 1);
            return { ...prev, selectedIndex: prev.selectedIndex <= 0 ? maxIndex : prev.selectedIndex - 1 };
          });
          return true;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          closeSlashMenu();
          return true;
        }

        if (event.key === 'Enter') {
          const selected = filteredSlashCommands[slashMenu.selectedIndex] || filteredSlashCommands[0];
          if (!selected) return true;
          event.preventDefault();
          view.dispatch(view.state.tr.delete(slashMenu.from, slashMenu.to));
          selected.run(editor);
          closeSlashMenu();
          return true;
        }

        return false;
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      const nextHtml = currentEditor.getHTML();
      setHtmlSource(nextHtml);
      onChange(nextHtml);

      const { state, view } = currentEditor;
      const { $from } = state.selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      const slashMatch = textBefore.match(/(?:^|\s)\/(\w*)$/);

      if (!slashMatch || isHtmlMode) {
        closeSlashMenu();
        return;
      }

      const anchorPos = state.selection.from;
      const lineStart = $from.start();
      const slashTokenLength = slashMatch[0].trimStart().length;
      const slashFrom = anchorPos - slashTokenLength;
      const rootRect = rootRef.current?.getBoundingClientRect();
      const coords = view.coordsAtPos(anchorPos);

      setSlashMenu((prev) => ({
        ...prev,
        open: true,
        query: slashMatch[1] || '',
        x: rootRect ? coords.left - rootRect.left : 0,
        y: rootRect ? coords.bottom - rootRect.top + 6 : 0,
        from: Math.max(lineStart, slashFrom),
        to: anchorPos,
        selectedIndex: 0
      }));
    }
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    const next = value || '<p></p>';
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
      setHtmlSource(next);
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !isHtmlMode) return;
    setHtmlSource(editor.getHTML());
  }, [editor, isHtmlMode]);

  useEffect(() => {
    if (!slashMenu.open) return;
    const maxIndex = Math.max(0, filteredSlashCommands.length - 1);
    if (slashMenu.selectedIndex <= maxIndex) return;
    setSlashMenu((prev) => ({ ...prev, selectedIndex: 0 }));
  }, [filteredSlashCommands.length, slashMenu.open, slashMenu.selectedIndex]);

  if (!editor) return <div className="form-input">Loading editor...</div>;

  const canToggleButton = (command) => {
    try {
      return command();
    } catch (_error) {
      return false;
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  const addImage = () => {
    const url = window.prompt('Paste image URL');
    if (!url || !/^https?:\/\//i.test(url.trim())) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  const applyHtmlSource = () => {
    const next = htmlSource || '<p></p>';
    editor.commands.setContent(next, { emitUpdate: true });
    setIsHtmlMode(false);
  };

  const wordCount = editor.storage.characterCount?.words?.() || 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const headingOptions = useMemo(() => [1, 2, 3, 4], []);

  return (
    <div className="blog-editor-root" ref={rootRef}>
      <div className="blog-editor-toolbar" role="toolbar" aria-label="Blog editor toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>Bold</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}>Italic</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''}>Underline</button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''}>Strike</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'active' : ''}>Highlight</button>

        {headingOptions.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={editor.isActive('heading', { level }) ? 'active' : ''}
          >
            H{level}
          </button>
        ))}

        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'active' : ''}>Paragraph</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>Bullets</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}>Numbered</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''}>Quote</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'active' : ''}>Code</button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>Divider</button>
        <button type="button" onClick={() => editor.chain().focus().insertCalloutBlock().run()}>Callout</button>
        <button type="button" onClick={() => editor.chain().focus().insertToggleBlock().run()}>Toggle</button>
        <button type="button" onClick={() => editor.chain().focus().insertColumnsBlock().run()}>2-Column</button>

        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}>Left</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}>Center</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}>Right</button>

        <button type="button" onClick={setLink} className={editor.isActive('link') ? 'active' : ''}>Link</button>
        <button type="button" onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
        <button type="button" onClick={addImage}>Image URL</button>

        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          disabled={!canToggleButton(() => editor.can().chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
        >
          Table
        </button>
        <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>Row+</button>
        <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>Col+</button>
        <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>Table-</button>

        <button type="button" onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}>Redo</button>
        <button type="button" onClick={() => setIsHtmlMode((prev) => !prev)} className={isHtmlMode ? 'active' : ''}>HTML</button>
      </div>

      {isHtmlMode ? (
        <div className="blog-editor-html-mode">
          <textarea
            className="blog-editor-html-input"
            value={htmlSource}
            onChange={(event) => setHtmlSource(event.target.value)}
            spellCheck={false}
          />
          <div className="blog-editor-html-actions">
            <button type="button" onClick={applyHtmlSource}>Apply HTML</button>
            <button type="button" onClick={() => { setHtmlSource(editor.getHTML()); setIsHtmlMode(false); }}>
              Back to Visual
            </button>
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} className="blog-editor-content" />
      )}

      {slashMenu.open ? (
        <div className="blog-editor-slash-menu" style={{ left: slashMenu.x, top: slashMenu.y }}>
          {filteredSlashCommands.length ? (
            Object.keys(slashGroups).map((groupName) => (
              <div className="blog-editor-slash-group" key={groupName}>
                <div className="blog-editor-slash-group-title">{groupName}</div>
                {slashGroups[groupName].map((item) => {
                  const flatIndex = filteredSlashCommands.findIndex((entry) => entry.key === item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={flatIndex === slashMenu.selectedIndex ? 'active' : ''}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        editor.chain().focus().deleteRange({ from: slashMenu.from, to: slashMenu.to }).run();
                        item.run(editor);
                        closeSlashMenu();
                      }}
                    >
                      <span className="blog-editor-slash-icon">{item.icon}</span>
                      <span className="blog-editor-slash-text">
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="blog-editor-slash-empty">No matching command</div>
          )}
        </div>
      ) : null}

      <div className="blog-editor-upload-hint">
        <span>Drop or paste images directly into content to upload automatically.</span>
        {uploadingCount > 0 ? <span>Uploading {uploadingCount} image...</span> : null}
        {inlineUploadError ? <span className="error">{inlineUploadError}</span> : null}
      </div>

      {uploadJobs.length ? (
        <div className="blog-editor-upload-jobs">
          {uploadJobs.map((item) => (
            <div className="blog-editor-upload-job" key={item.id}>
              <div className="blog-editor-upload-job-top">
                <span>{item.name}</span>
                <span>{item.status === 'error' ? 'Failed' : `${item.progress}%`}</span>
              </div>
              <div className="blog-editor-upload-progress">
                <div
                  className={`blog-editor-upload-progress-fill ${item.status}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              {item.status === 'error' ? <small className="error">{item.error || 'Upload failed'}</small> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="blog-editor-footer-stats">
        <span>{wordCount} words</span>
        <span>{readingMinutes} min read</span>
      </div>
    </div>
  );
};

export default BlogEditor;
