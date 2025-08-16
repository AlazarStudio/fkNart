import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  ImageInput,
  ImageField,
  FunctionField,
} from 'react-admin';
import { handleSaveWithImages } from '../JS/fileUploadUtils';
import uploadsConfig from '../../../../uploadsConfig';

/* -------------------- ФИЛЬТРЫ -------------------- */
const listFilters = [
  <TextInput source="q" label="Поиск (название/город)" alwaysOn resettable />,
  <TextInput source="city" label="Город" resettable />,
];

/* -------------------- СПИСОК -------------------- */
export const TeamList = (props) => (
  <List
    {...props}
    filters={listFilters}
    perPage={25}
    sort={{ field: 'id', order: 'DESC' }}
  >
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Название" />
      <TextField source="city" label="Город" />

      {/* Статистика из модели Team */}
      <NumberField source="games" label="Игры" />
      <NumberField source="wins" label="Победы" />
      <NumberField source="goals" label="Голы" />
      <NumberField source="tournaments" label="Турниры" />

      <FunctionField label="Логотипы" render={(r) => r.logo?.length || 0} />
      <FunctionField
        label="Изображения"
        render={(r) => r.images?.length || 0}
      />

      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

/* -------------------- СОЗДАНИЕ -------------------- */
export const TeamCreate = (props) => (
  <Create {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="city" label="Город" />

      {/* Статистика (при желании можно оставить пустой — будет 0 по умолчанию) */}
      <NumberInput source="games" label="Игры" min={0} />
      <NumberInput source="wins" label="Победы" min={0} />
      <NumberInput source="goals" label="Голы" min={0} />
      <NumberInput source="tournaments" label="Турниры" min={0} />

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

/* -------------------- РЕДАКТИРОВАНИЕ -------------------- */
export const TeamEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="city" label="Город" />

      {/* Статистика — редактируемые поля модели Team */}
      <NumberInput source="games" label="Игры" min={0} />
      <NumberInput source="wins" label="Победы" min={0} />
      <NumberInput source="goals" label="Голы" min={0} />
      <NumberInput source="tournaments" label="Турниры" min={0} />

      {/* Новые лого */}
      <ImageInput
        source="logoRaw"
        label="Добавить новые лого"
        accept="image/*"
        multiple
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      {/* Текущие лого */}
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

      {/* Новые изображения */}
      <ImageInput
        source="imagesRaw"
        label="Новые изображения"
        multiple
        accept="image/*"
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      {/* Текущие изображения */}
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
