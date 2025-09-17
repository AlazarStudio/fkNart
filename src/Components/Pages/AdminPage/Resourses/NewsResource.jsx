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
} from 'react-admin';
import { handleSaveWithImages } from '../JS/fileUploadUtils';
import uploadsConfig from '../../../../uploadsConfig';

import ReactQuillInput from './ReactQuillInput';

// ✅ Список новостей
export const NewsList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Заголовок" />
      {/* <TextField source="description" label="Описание" /> */}
      <DateField source="date" label="Дата" showTime={false} />
      <FunctionField
        label="Изображения"
        render={(record) => record.images?.length || 0}
      />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// ✅ Создание новости
export const NewsCreate = (props) => (
  <Create {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Заголовок" fullWidth />

      {/* было: <TextInput source="description" multiline fullWidth /> */}
      <ReactQuillInput source="description" label="Описание" fullWidth />

      <DateInput source="date" label="Дата" />
      <ImageInput source="imagesRaw" label="Изображения" multiple accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

// ✅ Редактирование новости
export const NewsEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Заголовок" fullWidth />

      {/* было: <TextInput source="description" multiline fullWidth /> */}
      <ReactQuillInput source="description" label="Описание" fullWidth />

      <DateInput source="date" label="Дата" />
      <ImageInput source="imagesRaw" label="Новые изображения" multiple accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>

      <ImageInput
        source="images"
        label="Старые изображения"
        multiple
        accept="image/*"
        format={(value) =>
          value?.length
            ? value.map((src) => ({
                src: src.startsWith('http') ? src : `${uploadsConfig}${src}`,
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
    </SimpleForm>
  </Edit>
);