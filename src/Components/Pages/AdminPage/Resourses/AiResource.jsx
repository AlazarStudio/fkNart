import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  ReferenceField,
  FunctionField,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput,
  ImageInput,
  ImageField,
  NumberInput,
} from 'react-admin';
import { handleSaveWithImages } from '../JS/fileUploadUtils';
import uploadsConfig from '../../../uploadsConfig';

// 🔹 Список
export const AiList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Название" />
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
          record.images?.length ? record.images.join(', ') : '—'
        }
      />
      <TextField source="priceStandart" label="Стандарт" />
      <TextField source="pricePro" label="Pro" />
      <TextField source="pricePremium" label="Premium" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// 🔹 Создание
export const AiCreate = (props) => (
  <Create {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="descriptionSmall" label="Краткое описание" />
      <TextInput source="descriptionBig" label="Полное описание" multiline />
      <TextInput source="advantages" label="Преимущества" multiline />
      <TextInput source="flaws" label="Недостатки" multiline />
      <TextInput source="use" label="Когда использовать" multiline />
      <TextInput source="process" label="Процесс" multiline />
      <TextInput source="advice" label="Советы" multiline />

      <ReferenceInput
        source="categoryId"
        reference="categories"
        label="Категория"
      >
        <SelectInput optionText="title" />
      </ReferenceInput>

      <NumberInput source="priceStandart" label="Цена (Стандарт)" />
      <NumberInput source="pricePro" label="Цена (Pro)" />
      <NumberInput source="pricePremium" label="Цена (Premium)" />

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

// 🔹 Редактирование
export const AiEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="title" label="Название" fullWidth />
      <TextInput source="descriptionSmall" label="Краткое описание" />
      <TextInput source="descriptionBig" label="Полное описание" multiline />
      <TextInput source="advantages" label="Преимущества" multiline />
      <TextInput source="flaws" label="Недостатки" multiline />
      <TextInput source="use" label="Когда использовать" multiline />
      <TextInput source="process" label="Процесс" multiline />
      <TextInput source="advice" label="Советы" multiline />

      <ReferenceInput
        source="categoryId"
        reference="categories"
        label="Категория"
      >
        <SelectInput optionText="title" />
      </ReferenceInput>

      <NumberInput source="priceStandart" label="Цена (Стандарт)" />
      <NumberInput source="pricePro" label="Цена (Pro)" />
      <NumberInput source="pricePremium" label="Цена (Premium)" />

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
