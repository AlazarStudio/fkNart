import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useInput } from 'react-admin';

// ленивый импорт — важен для окружений с SSR/StrictMode/ранним монтированием
const Quill = React.lazy(() => import('react-quill'));

// CSS темы подключаем тут же (будет подхвачено Vite)
import 'react-quill/dist/quill.snow.css';

export default function ReactQuillInput({
  source,
  label,
  fullWidth,
  toolbarOptions,
  formats: formatsProp,
  ...props
}) {
  const {
    field, // { name, value, onChange, onBlur, ref }
    fieldState: { invalid, error },
    isRequired,
  } = useInput({ source, ...props });

  // Рендерим только в браузере
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const modules = useMemo(
    () => ({
      toolbar: toolbarOptions || [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'blockquote', 'code-block', 'clean'],
      ],
      // можно добавить другие модули, но важно держать объект стабильным
    }),
    [toolbarOptions]
  );

  const formats = useMemo(
    () =>
      formatsProp || [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'color',
        'background',
        'list',
        'bullet',
        'align',
        'link',
        'blockquote',
        'code-block',
      ],
    [formatsProp]
  );

  // всегда отдаем строку
  const value = typeof field.value === 'string' ? field.value : '';

  return (
    <div style={{ width: fullWidth ? '100%' : 600 }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
          {label} {isRequired ? ' *' : ''}
        </label>
      )}

      {/* Фолбек, пока Quill лениво подгружается, и защита от раннего рендера */}
      <Suspense
        fallback={<div style={{ minHeight: 120 }}>Загрузка редактора…</div>}
      >
        {isClient && (
          <Quill
            theme="snow"
            value={value}
            onChange={(html) => {
              // React-Admin ждёт строку — сохраняем HTML
              field.onChange(html || '');
            }}
            onBlur={field.onBlur}
            modules={modules}
            formats={formats}
            // чтобы Quill не падал на autofill/IME
            placeholder="Введите описание…"
          />
        )}
      </Suspense>

      {invalid && (
        <div style={{ color: 'crimson', marginTop: 6, fontSize: 12 }}>
          {error?.message}
        </div>
      )}
    </div>
  );
}
