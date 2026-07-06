import { useEffect, useMemo, useRef } from 'react'
import { Btn } from '../shared/UI.jsx'
import { C, getThemeColors } from '../shared/theme.js'
import { useTheme } from '../shared/ThemeContext.jsx'

const F = "'Plus Jakarta Sans','Inter',sans-serif"

function ToolButton({ onClick, children, title }) {
  return (
    <Btn type="button" variant="outline" size="sm" onClick={onClick} style={{ minWidth: 38, justifyContent: 'center', padding: '6px 10px' }} title={title}>
      {children}
    </Btn>
  )
}

export default function RichTextEditor({ value, onChange, minHeight = 280 }) {
  const ref = useRef(null)
  const imgInputRef = useRef(null)
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  const apply = (command, commandValue = null) => {
    ref.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(ref.current?.innerHTML || '')
  }

  const insertLink = () => {
    const url = window.prompt('Enter link URL')
    if (!url) return
    apply('createLink', url)
  }

  const insertTable = () => {
    ref.current?.focus()
    document.execCommand(
      'insertHTML',
      false,
      '<table style="width:100%;border-collapse:collapse;margin:16px 0;"><tr><th style="border:1px solid #d1d5db;padding:8px;text-align:left;">Header 1</th><th style="border:1px solid #d1d5db;padding:8px;text-align:left;">Header 2</th></tr><tr><td style="border:1px solid #d1d5db;padding:8px;">Value</td><td style="border:1px solid #d1d5db;padding:8px;">Value</td></tr></table>',
    )
    onChange(ref.current?.innerHTML || '')
  }

  const insertImage = () => imgInputRef.current?.click()

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      ref.current?.focus()
      document.execCommand('insertHTML', false, `<img src="${ev.target.result}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`)
      onChange(ref.current?.innerHTML || '')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const tools = useMemo(() => ([
    { label: 'H2', title: 'Heading', action: () => apply('formatBlock', '<h2>') },
    { label: 'P', title: 'Paragraph', action: () => apply('formatBlock', '<p>') },
    { label: 'B', title: 'Bold', action: () => apply('bold') },
    { label: 'I', title: 'Italic', action: () => apply('italic') },
    { label: '•', title: 'Bulleted list', action: () => apply('insertUnorderedList') },
    { label: '1.', title: 'Numbered list', action: () => apply('insertOrderedList') },
    { label: 'Link', title: 'Insert link', action: insertLink },
    { label: 'Table', title: 'Insert table', action: insertTable },
    { label: 'Image', title: 'Insert image', action: insertImage },
  ]), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: F }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tools.map(tool => (
          <ToolButton key={tool.title} onClick={tool.action} title={tool.title}>
            {tool.label}
          </ToolButton>
        ))}
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || '')}
        style={{
          minHeight,
          border: `1px solid ${TC.g200}`,
          borderRadius: 12,
          padding: '14px 16px',
          background: TC.card,
          color: TC.text,
          fontSize: 14,
          lineHeight: 1.7,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      <input ref={imgInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageFile} style={{ display: 'none' }} />

      <div style={{ fontSize: 12, color: TC.textSecondary }}>
        Supports headings, paragraphs, lists, bold, italic, links, tables, and images.
      </div>

      <style>{`
        [contenteditable="true"] h2 { font-size: 22px; line-height: 1.2; margin: 0 0 12px; color: ${TC.g800}; }
        [contenteditable="true"] h3 { font-size: 18px; line-height: 1.3; margin: 18px 0 10px; color: ${TC.g700}; letter-spacing: 0.04em; text-transform: uppercase; }
        [contenteditable="true"] p { margin: 0 0 12px; }
        [contenteditable="true"] ul, [contenteditable="true"] ol { margin: 0 0 12px 18px; }
        [contenteditable="true"] li { margin-bottom: 6px; }
        [contenteditable="true"] a { color: ${C.primary}; text-decoration: underline; }
      `}</style>
    </div>
  )
}
