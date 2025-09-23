import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  ImageInput,
  ImageField,
  FunctionField,
  FileInput,
  FileField,
} from 'react-admin';
import uploadsConfig from '../../../../uploadsConfig';
import { handleSaveWithImagesAndVideos } from '../JS/fileUploadUtils';
import ReactQuillInput from './ReactQuillInput';

// Список
export const NewsList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Заголовок" />
      <DateField source="date" label="Дата" showTime={false} />
      <FunctionField
        label="Изображения"
        render={(record) => record.images?.length || 0}
      />
      <FunctionField
        label="Видео"
        render={(record) => record.videos?.length || 0}
      />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Создание
export const NewsCreate = (props) => (
  <Create {...props} transform={handleSaveWithImagesAndVideos}>
    <SimpleForm>
      <TextInput source="title" label="Заголовок" fullWidth />
      <ReactQuillInput source="description" label="Описание" fullWidth />
      <DateInput source="date" label="Дата" />

      {/* Новые изображения */}
      <ImageInput
        source="imagesRaw"
        label="Новые изображения"
        multiple
        accept="image/*"
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      {/* Новые видео */}
      <FileInput
        source="videosRaw"
        label="Новые видео"
        multiple
        accept="video/*"
      >
        <FileField source="src" title="title" />
      </FileInput>
    </SimpleForm>
  </Create>
);

// Редактирование
export const NewsEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImagesAndVideos}>
    <SimpleForm>
      <TextInput source="title" label="Заголовок" fullWidth />
      <ReactQuillInput source="description" label="Описание" fullWidth />
      <DateInput source="date" label="Дата" />

      {/* Новые изображения */}
      <ImageInput
        source="imagesRaw"
        label="Новые изображения"
        multiple
        accept="image/*"
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      {/* Старые изображения */}
      <ImageInput
        source="images"
        label="Старые изображения"
        multiple
        accept="image/*"
        format={(value) =>
          value?.length
            ? value.map((src) => ({
                src: src?.startsWith?.('http') ? src : `${uploadsConfig}${src}`,
                title: src,
              }))
            : []
        }
        parse={(value) =>
          value.map((file) =>
            file.rawFile ? file.rawFile : file.src.replace(uploadsConfig, '')
          )
        }
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      {/* Новые видео */}
      <FileInput
        source="videosRaw"
        label="Новые видео"
        multiple
        accept="video/*"
      >
        <FileField source="src" title="title" />
      </FileInput>

      {/* Старые видео */}
      <FileInput
        source="videos"
        label="Старые видео"
        multiple
        accept="video/*"
        format={(value) =>
          value?.map((src) => ({
            src: src?.startsWith?.('http') ? src : `${uploadsConfig}${src}`,
            title: src,
          })) || []
        }
        parse={(value) =>
          value.map((file) =>
            file.rawFile ? file.rawFile : file.src.replace(uploadsConfig, '')
          )
        }
      >
        <FileField source="src" title="title" />
      </FileInput>
    </SimpleForm>
  </Edit>
);
