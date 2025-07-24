import Cookies from 'js-cookie';
import uploadsConfig from '../../../uploadsConfig';
import serverConfig from '../../../serverConfig';

const token = Cookies.get('token');

// Функция для загрузки одного файла на сервер
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('img', file);

  try {
    const response = await fetch(`${uploadsConfig}/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.filePaths; // Возвращает массив ссылок на загруженные файлы
  } catch (error) {
    console.error('Ошибка при загрузке файлов:', error);
    throw error;
  }
};

// Функция для загрузки всех файлов перед сохранением формы
export const uploadFiles = async (files) => {
  const uploadedFiles = await Promise.all(
    files.map((file) => uploadFile(file.rawFile))
  );
  return uploadedFiles.flat(); // Получаем плоский массив с ссылками на файлы
};
// export const uploadFiles = async (files) => {
//   const uploadedFiles = await Promise.all(
//     files.map((file) => {
//       if (file.rawFile) {
//         return uploadFile(file.rawFile);
//       } else {
//         console.error('Файл не содержит rawFile:', file);
//         throw new Error('Файл не содержит rawFile');
//       }
//     })
//   );
//   return uploadedFiles.flat();
// };

// Функция для обработки сохранения формы
export const handleSave = async (values) => {
  if (values.img && values.img.length > 0) {
    // Загружаем все изображения на сервер
    const uploadedImages = await uploadFiles(values.img);

    // Заменяем файлы ссылками на загруженные изображения
    values.img = uploadedImages;
  }

  return values;
};

// export const handleSave = async (values) => {
//   if (values.img && values.img.length > 0) {
//     // Загружаем файлы через API
//     const uploadedImages = await uploadFiles(values.img);

//     // Заменяем файлы ссылками на сервер
//     values.img = uploadedImages;
//   }

//   // Убедитесь, что возвращаем объект данных
//   return {
//     ...values,
//     img: values.img, // Добавляем пути к изображениям
//   };
// };

// Функция для обновления изображений
export const updateImages = async (existingImages = [], newFiles = []) => {
  // Загружаем новые файлы на сервер
  let uploadedImages = [];
  if (newFiles.length > 0) {
    uploadedImages = await uploadFiles(newFiles);
  }

  // Объединяем старые изображения с новыми и удаляем дубликаты
  const updatedImages = Array.from(
    new Set([...existingImages, ...uploadedImages])
  );

  return updatedImages;
};

// Функция для сохранения формы
// export const handleSaveWithImages = async (values) => {
//   const existingImages = values.img || []; // Старые изображения
//   const newFiles = values.imagesRaw || []; // Новые загруженные файлы

//   console.log(values);

//   // Обновляем изображения (старые + новые)
//   const updatedImages = await updateImages(existingImages, newFiles);

//   // Сохраняем значения формы с обновленными изображениями
//   values.img = updatedImages;

//   // Удаляем временные поля
//   delete values.imagesRaw;

//   return values;
// };

export const handleSaveWithImages = async (data) => {
  const upload = async (images) => {
    const formData = new FormData();
    images.forEach((file) => formData.append('files', file.rawFile));
    const res = await fetch(`${serverConfig}/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    return json.filePaths;
  };

  const newImages = data.imagesRaw || [];
  const oldImages = Array.isArray(data.images)
    ? data.images.filter((img) => typeof img === 'string')
    : [];

  const uploaded = newImages.length ? await upload(newImages) : [];

  return {
    ...data,
    images: [...oldImages, ...uploaded],
    imagesRaw: undefined,
  };
};
