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
  AutocompleteInput, // ⬅️ добавили
} from 'react-admin';
import { handleSaveWithImages } from '../JS/fileUploadUtils';
import uploadsConfig from '../../../../uploadsConfig';

// === Разделённые списки ===
const playerPositions = [
  { id: 'GOALKEEPER', name: 'Вратарь' },
  { id: 'DEFENDER', name: 'Защитник' },
  { id: 'MIDFIELDER', name: 'Полузащитник' },
  { id: 'FORWARD', name: 'Нападающий' },
];

const staffRoles = [
  { id: 'HEAD_COACH', name: 'Главный тренер' },
  { id: 'ASSISTANT_COACH', name: 'Тренер/ассистент' },
  { id: 'GOALKEEPER_COACH', name: 'Тренер вратарей' },
  { id: 'FITNESS_COACH', name: 'Тренер по физподготовке' },
  { id: 'ANALYST', name: 'Аналитик' },
  { id: 'PHYSIOTHERAPIST', name: 'Физиотерапевт' },
  { id: 'DOCTOR', name: 'Врач команды' },
  { id: 'TEAM_MANAGER', name: 'Администратор команды' },
  { id: 'MASSEUR', name: 'Массажист' },
  { id: 'KIT_MANAGER', name: 'Экипировщик' },
];

// Для отображения названия позиции в списке
const positionsMap = [...playerPositions, ...staffRoles].reduce(
  (acc, p) => ((acc[p.id] = p.name), acc),
  {}
);

// Объединяем и помечаем группу (для группировки в селекте)
const groupedPositions = [
  ...playerPositions.map((p) => ({ ...p, group: 'Игроки' })),
  ...staffRoles.map((p) => ({ ...p, group: 'Тренерский штаб' })),
];

// 📌 Список игроков/сотрудников
export const PlayerList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" label="Имя" />
      <FunctionField
        label="Позиция / Роль"
        render={(record) =>
          positionsMap[record.position] || record.position || '—'
        }
      />
      <TextField source="number" label="Номер" />
      <FunctionField label="Команда" render={(r) => r.team?.title || '—'} />
      <FunctionField label="Фото" render={(r) => r.images?.length || 0} />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// 📌 Создание
export const PlayerCreate = (props) => (
  <Create {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="name" label="Имя" fullWidth />

      {/* Группированный селект: Игроки / Тренерский штаб */}
      <AutocompleteInput
        source="position"
        label="Позиция / Роль"
        choices={groupedPositions}
        optionText="name"
        optionValue="id"
        fullWidth
        options={{ groupBy: (choice) => choice.group }}
      />

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

// 📌 Редактирование
export const PlayerEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="name" label="Имя" fullWidth />

      {/* Группированный селект: Игроки / Тренерский штаб */}
      <AutocompleteInput
        source="position"
        label="Позиция / Роль"
        choices={groupedPositions}
        optionText="name"
        optionValue="id"
        fullWidth
        options={{ groupBy: (choice) => choice.group }}
      />

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
