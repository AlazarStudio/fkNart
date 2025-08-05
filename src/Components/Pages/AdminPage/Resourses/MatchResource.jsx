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
  DateTimeInput,
  ReferenceInput,
  SelectInput,
  ImageInput,
  ImageField,
  FunctionField,
} from 'react-admin';
import {
  // handleSaveWithImages,
  handleSaveWithImagesAndVideos,
} from '../JS/fileUploadUtils';
import uploadsConfig from '../../../../uploadsConfig';

// 📌 Список матчей
const statusMap = {
  SCHEDULED: 'Запланирован',
  // LIVE: 'Идёт',
  FINISHED: 'Завершён',
};

// 📌 Список матчей
export const MatchList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <FunctionField
        label="Лига"
        render={(record) => record.league?.title || '—'}
      />
      <TextField source="stadium" label="Стадион" />

      <FunctionField
        label="Статус"
        render={(record) => statusMap[record.status] || record.status}
      />

      <NumberField source="homeScore" label="Счёт (Команда 1)" />
      <NumberField source="guestScore" label="Счёт (Команда 2)" />

      <FunctionField
        label="Команда 1"
        render={(record) => record.homeTeam?.title || '—'}
      />
      <FunctionField
        label="Команда 2"
        render={(record) => record.guestTeam?.title || '—'}
      />
      <FunctionField
        label="Лига"
        render={(record) => record.league?.title || '—'}
      />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// 📌 Создание матча
const statusChoices = [
  { id: 'SCHEDULED', name: 'Запланирован' },
  { id: 'LIVE', name: 'Идёт' },
  { id: 'FINISHED', name: 'Завершён' },
];

// 📌 Создание матча
export const MatchCreate = (props) => (
  <Create {...props} transform={handleSaveWithImagesAndVideos}>
    <SimpleForm>
      <ReferenceInput source="leagueId" reference="leagues" label="Лига">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <TextInput source="stadium" label="Стадион" fullWidth />
      <DateTimeInput source="date" label="Дата" />

      <SelectInput
        source="status"
        label="Статус"
        choices={statusChoices}
        optionText="name"
        optionValue="id"
        defaultValue="SCHEDULED"
      />

      <ReferenceInput source="homeTeamId" reference="teams" label="Команда 1">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <ReferenceInput source="guestTeamId" reference="teams" label="Команда 2">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <NumberInput source="homeScore" label="Счёт (Команда 1)" />
      <NumberInput source="guestScore" label="Счёт (Команда 2)" />
      <NumberInput source="round" label="Раунд" />

      <ImageInput
        source="imagesRaw"
        label="Изображения"
        multiple
        accept="image/*"
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      <ImageInput source="videosRaw" label="Видео" multiple accept="video/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

// 📌 Редактирование матча
export const MatchEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImagesAndVideos}>
    <SimpleForm>
      <ReferenceInput source="leagueId" reference="leagues" label="Лига">
        <SelectInput optionText="title" />
      </ReferenceInput>
      <TextInput source="stadium" label="Стадион" fullWidth />
      <DateTimeInput source="date" label="Дата" />

      <SelectInput
        source="status"
        label="Статус"
        choices={statusChoices}
        optionText="name"
        optionValue="id"
      />

      <ReferenceInput source="homeTeamId" reference="teams" label="Команда 1">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <ReferenceInput source="guestTeamId" reference="teams" label="Команда 2">
        <SelectInput optionText="title" />
      </ReferenceInput>
      <NumberInput source="homeScore" label="Счёт (Команда 1)" />
      <NumberInput source="guestScore" label="Счёт (Команда 2)" />
      <NumberInput source="round" label="Раунд" />
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

      <ImageInput source="videosRaw" label="Видео" multiple accept="video/*">
        <ImageField source="src" title="title" />
      </ImageInput>
      <ImageInput
        source="videos"
        label="Старые видео"
        multiple
        accept="video/*"
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
