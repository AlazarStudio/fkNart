import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  ImageInput,
  ImageField,
  DateField,
  DateInput,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput,
  ReferenceField,
  FunctionField,
  BooleanField,
  BooleanInput,
} from 'react-admin';
import { handleSave, uploadFile, uploadFiles } from '../JS/fileUploadUtils';
import { handleSaveWithImages } from '../JS/fileUploadUtils';
import uploadsConfig from '../../../uploadsConfig';
import RichTextInput from '../Auth/RichTextInput';

// Список проектов
export const ProjectList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Название" />
      <TextField source="description" label="Описание" />
      <ReferenceField
        source="categoryId"
        reference="categories"
        label="Категория"
      >
        <TextField source="title" />
      </ReferenceField>

      <FunctionField
        label="Изображения"
        render={(record) =>
          record.images && record.images.length ? record.images.join(', ') : '—'
        }
      />
      <BooleanField source="favorite" label="Избранное" />

      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Создание проекта
export const ProjectCreate = (props) => (
  <Create {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="description" label="Описание" />
      <BooleanInput source="favorite" label="Избранное" />
      <ReferenceInput
        source="categoryId"
        reference="categories"
        label="Категория"
      >
        <SelectInput optionText="title" />
      </ReferenceInput>

      <ImageInput
        source="imagesRaw"
        label="Изображения"
        multiple
        accept="image/*"
      >
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

// Редактирование проекта
export const ProjectEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="description" label="Описание" />
      <BooleanInput source="favorite" label="Избранное" />
      <ReferenceInput
        source="categoryId"
        reference="categories"
        label="Категория"
      >
        <SelectInput optionText="title" />
      </ReferenceInput>

      <ImageInput
        source="imagesRaw"
        label="Новые изображения"
        multiple
        accept="image/*"
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      <ImageInput
        source="images"
        label="Старые изображения"
        multiple
        accept="image/*"
        format={(value) =>
          value && value.length
            ? value.map((src) => ({
                src: src.startsWith('http') ? src : `${uploadsConfig}${src}`,
                title: src,
              }))
            : []
        }
        parse={(value) =>
          value.map((file) =>
            file.rawFile
              ? file.rawFile
              : file.src.replace(`${uploadsConfig}`, '')
          )
        }
      >
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Edit>
);
