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
  AutocompleteInput,
} from 'react-admin';
import { handleSaveWithImages } from '../JS/fileUploadUtils';
import uploadsConfig from '../../../../uploadsConfig';

// --- Игровые позиции
const playerPositions = [
  { id: 'GOALKEEPER', name: 'Вратарь' },
  { id: 'DEFENDER', name: 'Защитник' },
  { id: 'MIDFIELDER', name: 'Полузащитник' },
  { id: 'FORWARD', name: 'Нападающий' },
];

// --- Штаб (старые роли + НОВЫЕ В КОНЦЕ)
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
  // --- новые роли (в самом НИЗУ):
  { id: 'GENERAL_DIRECTOR', name: 'Генеральный директор' },
  { id: 'SPORTS_DIRECTOR', name: 'Спортивный директор' },
  { id: 'DEPUTY_GENERAL_DIRECTOR', name: 'Заместитель генерального директора' },
  { id: 'MEDIA_OFFICER', name: 'Сотрудник клуба по работе со СМИ' },
  {
    id: 'SECURITY_OFFICER',
    name: 'Сотрудник клуба по обеспечению безопасности',
  },
  { id: 'FAN_LIAISON', name: 'Сотрудник по работе с болельщиками' },
];

// карта для отображения в списке
const positionsMap = [...playerPositions, ...staffRoles].reduce(
  (acc, p) => ((acc[p.id] = p.name), acc),
  {}
);

// группированный список для селекта
const groupedPositions = [
  ...playerPositions.map((p) => ({ ...p, group: 'Игроки' })),
  ...staffRoles.map((p) => ({ ...p, group: 'Тренерский штаб' })),
];

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

export const PlayerCreate = (props) => (
  <Create {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="name" label="Имя" fullWidth />

      <AutocompleteInput
        source="position"
        label="Позиция / Роль"
        choices={groupedPositions}
        optionText="name"
        optionValue="id"
        fullWidth
        options={{ groupBy: (choice) => choice.group }}
      />

      <NumberInput
        source="number"
        label="Номер"
        parse={(v) =>
          v === '' || v === undefined || v === null ? null : Number(v)
        }
      />

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

export const PlayerEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImages}>
    <SimpleForm>
      <TextInput source="name" label="Имя" fullWidth />

      <AutocompleteInput
        source="position"
        label="Позиция / Роль"
        choices={groupedPositions}
        optionText="name"
        optionValue="id"
        fullWidth
        options={{ groupBy: (choice) => choice.group }}
      />

      <NumberInput
        source="number"
        label="Номер"
        parse={(v) =>
          v === '' || v === undefined || v === null ? null : Number(v)
        }
      />

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
