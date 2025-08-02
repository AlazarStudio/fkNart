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
  NumberInput,
  ReferenceInput,
  SelectInput,
  DateInput,
  ImageInput,
  ImageField,
  FunctionField,
} from 'react-admin';
import { handleSaveWithImages } from '../JS/fileUploadUtils';
import uploadsConfig from '../../../../uploadsConfig';

// ✅ Объявляем только один раз
const positions = [
  { id: 'GOALKEEPER', name: 'Вратарь' },
  { id: 'DEFENDER', name: 'Защитник' },
  { id: 'MIDFIELDER', name: 'Полузащитник' },
  { id: 'FORWARD', name: 'Нападающий' },
];

// 📌 Список игроков
export const PlayerList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" label="Имя" />
      <FunctionField
        label="Позиция"
        render={(record) => {
          const pos = positions.find((p) => p.id === record.position);
          return pos ? pos.name : record.position;
        }}
      />
      <TextField source="number" label="Номер" />
      <FunctionField
        label="Команда"
        render={(record) => record.team?.title || '—'}
      />
      <FunctionField
        label="Фото"
        render={(record) => record.images?.length || 0}
      />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// 📌 Создание игрока
export const PlayerCreate = (props) => (
  <Create {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="name" label="Имя" fullWidth />
      <SelectInput source="position" label="Позиция" choices={positions} />
      <NumberInput source="number" label="Номер" />
      <DateInput source="birthDate" label="Дата рождения" />

      <ReferenceInput source="teamId" reference="teams" label="Команда">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <ImageInput source="imagesRaw" label="Фото" multiple accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

// 📌 Редактирование игрока
export const PlayerEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="name" label="Имя" fullWidth />
      <SelectInput source="position" label="Позиция" choices={positions} />
      <NumberInput source="number" label="Номер" />
      <DateInput source="birthDate" label="Дата рождения" />

      <ReferenceInput source="teamId" reference="teams" label="Команда">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <ImageInput
        source="imagesRaw"
        label="Новые фото"
        multiple
        accept="image/*"
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      <ImageInput
        source="images"
        label="Старые фото"
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
