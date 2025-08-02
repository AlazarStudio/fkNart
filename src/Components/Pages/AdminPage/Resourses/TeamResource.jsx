import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  ImageInput,
  ImageField,
  FunctionField,
} from 'react-admin';
import { handleSaveWithImages } from '../JS/fileUploadUtils';
import uploadsConfig from '../../../../uploadsConfig';

// ✅ Список команд
export const TeamList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Название" />
      <TextField source="city" label="Город" />
      <FunctionField
        label="Логотип"
        render={(record) => record.logo?.length || 0}
      />
      <FunctionField
        label="Изображения"
        render={(record) => record.images?.length || 0}
      />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// ✅ Создание команды
export const TeamCreate = (props) => (
  <Create {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="city" label="Город" />

      <ImageInput source="logoRaw" label="Лого" accept="image/*" multiple>
        <ImageField source="src" title="title" />
      </ImageInput>

      <ImageInput
        source="imagesRaw"
        label="Изображения"
        accept="image/*"
        multiple
      >
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

// ✅ Редактирование команды
export const TeamEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="city" label="Город" />

      <ImageInput
        source="logoRaw"
        label="Добавить новые лого"
        accept="image/*"
        multiple
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      <ImageInput
        source="logo"
        label="Текущие лого"
        multiple
        format={(value) =>
          value?.map((src) => ({
            src: src.startsWith('http') ? src : `${uploadsConfig}${src}`,
            title: src,
          })) || []
        }
        parse={(value) =>
          value.map((file) =>
            file.rawFile ? file.rawFile : file.src.replace(uploadsConfig, '')
          )
        }
      >
        <ImageField source="src" title="title" />
      </ImageInput>

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
          value?.map((src) => ({
            src: src.startsWith('http') ? src : `${uploadsConfig}${src}`,
            title: src,
          })) || []
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
