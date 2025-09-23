// src/admin/Resourses/MatchResource.jsx
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
  TextInput,
  NumberInput,
  DateTimeInput,
  ReferenceInput,
  SelectInput,
  ImageInput,
  ImageField,
  FunctionField,
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  TabbedForm,
  FormTab,
  useGetMany,
} from 'react-admin';

import uploadsConfig from '../../../../uploadsConfig';
import { handleSaveWithImagesAndVideos } from '../JS/fileUploadUtils';
import LineupSection from './LineupSection';

const statusChoices = [
  { id: 'SCHEDULED', name: 'Запланирован' },
  { id: 'LIVE', name: 'Идёт' },
  { id: 'FINISHED', name: 'Завершён' },
];

const eventTypes = [
  { id: 'GOAL', name: 'Гол' },
  { id: 'ASSIST', name: 'Передача' },
  { id: 'YELLOW_CARD', name: 'Жёлтая карточка' },
  { id: 'RED_CARD', name: 'Красная карточка' },
  { id: 'SUBSTITUTION', name: 'Замена' },
  { id: 'PENALTY_SCORED', name: 'Пенальти (забит)' },
  { id: 'PENALTY_MISSED', name: 'Пенальти (не реализован)' },
];

const refereeRoleChoices = [
  { id: 'MAIN', name: 'Главный' },
  { id: 'ASSISTANT1', name: 'Лайнсмен 1' },
  { id: 'ASSISTANT2', name: 'Лайнсмен 2' },
  { id: 'FOURTH', name: 'Четвёртый' },
  { id: 'VAR', name: 'VAR' },
  { id: 'AVAR', name: 'AVAR' },
];

const toLocalInputValue = (v) => {
  if (!v) return '';
  const d = new Date(v); // v в ISO/UTC из API
  const off = d.getTimezoneOffset(); // минуты
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
};

const fromLocalInputValue = (v) => {
  if (!v) return null;
  // v — локальная строка 'YYYY-MM-DDTHH:mm'
  // делаем Date (как локальное) и отправляем в UTC
  return new Date(v).toISOString();
};

export const MatchList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <FunctionField label="Лига" render={(r) => r.league?.title || '—'} />
      <FunctionField
        label="Стадион"
        render={(r) => r.stadiumRel?.name || r.stadium || '—'}
      />
      <TextField source="status" label="Статус" />
      <NumberField source="homeScore" label="Счёт (Команда 1)" />
      <NumberField source="guestScore" label="Счёт (Команда 2)" />
      <FunctionField
        label="Команда 1"
        render={(r) => r.homeTeam?.title || '—'}
      />
      <FunctionField
        label="Команда 2"
        render={(r) => r.guestTeam?.title || '—'}
      />
      <FunctionField
        label="Судьи"
        render={(r) =>
          (r.matchReferees || [])
            .map(
              (mr) =>
                `${mr.referee?.name ?? '—'}${mr.role ? ` (${mr.role})` : ''}`
            )
            .join(', ')
        }
      />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// --- вспомогательные селекты для событий ---
const TeamSelectLimited = ({ source }) => (
  <FormDataConsumer>
    {({ formData, getSource }) => {
      const ids = [formData?.homeTeamId, formData?.guestTeamId].filter(Boolean);
      const { data: teams = [] } = useGetMany('teams', { ids });
      const choices = teams.map((t) => ({ id: t.id, title: t.title }));
      return (
        <SelectInput
          source={getSource ? getSource(source) : source}
          label="Команда"
          choices={choices}
          optionText="title"
          optionValue="id"
          parse={(v) => Number(v)}
        />
      );
    }}
  </FormDataConsumer>
);

const PlayerSelectByTeam = ({ source, teamField = 'teamId' }) => (
  <FormDataConsumer>
    {({ scopedFormData, getSource }) => {
      const teamId = scopedFormData?.[teamField];
      return (
        <ReferenceInput
          source={getSource ? getSource(source) : source}
          reference="players"
          label="Игрок"
          filter={teamId ? { teamId } : undefined}
          perPage={200}
        >
          <SelectInput optionText="name" />
        </ReferenceInput>
      );
    }}
  </FormDataConsumer>
);

// --- базовые поля формы матча ---
const MatchFormFields = () => (
  <>
    <ReferenceInput source="leagueId" reference="leagues" label="Лига">
      <SelectInput optionText="title" />
    </ReferenceInput>

    <ReferenceInput
      source="stadiumId"
      reference="stadiums"
      label="Стадион (справочник)"
      perPage={200}
    >
      <SelectInput
        optionText={(r) =>
          r?.location ? `${r.name} — ${r.location}` : r?.name
        }
        optionValue="id"
        parse={(v) => (v == null ? null : Number(v))}
      />
    </ReferenceInput>

    <DateTimeInput
      source="date"
      label="Дата"
      format={toLocalInputValue}
      parse={fromLocalInputValue}
    />

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

    {/* ----- Медиа ----- */}
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
      <ImageField source="src" title="title" />
    </ImageInput>

    <ImageInput
      source="videosRaw"
      label="Новые видео"
      multiple
      accept="video/*"
    >
      <ImageField source="src" title="title" />
    </ImageInput>

    <ImageInput
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
      <ImageField source="src" title="title" />
    </ImageInput>

    {/* ----- Судьи матча ----- */}
    <ArrayInput source="matchReferees" label="Судейская бригада">
      <SimpleFormIterator inline getItemLabel={(idx) => `Судья #${idx + 1}`}>
        <ReferenceInput
          source="refereeId"
          reference="referees"
          label="Судья"
          perPage={200}
        >
          <SelectInput optionText="name" />
        </ReferenceInput>
        <SelectInput source="role" label="Роль" choices={refereeRoleChoices} />
      </SimpleFormIterator>
    </ArrayInput>

    {/* ----- События матча ----- */}
    <ArrayInput source="events" label="События">
      <SimpleFormIterator inline>
        <NumberInput source="minute" label="Минута" />
        <SelectInput
          source="half"
          label="Тайм"
          choices={[
            { id: 1, name: '1' },
            { id: 2, name: '2' },
          ]}
          parse={(v) => Number(v)}
        />
        <SelectInput source="type" label="Тип" choices={eventTypes} />
        <TeamSelectLimited source="teamId" />
        <PlayerSelectByTeam source="playerId" teamField="teamId" />
        <FormDataConsumer>
          {({ scopedFormData }) =>
            scopedFormData?.type === 'GOAL' ? (
              <PlayerSelectByTeam source="assistPlayerId" teamField="teamId" />
            ) : null
          }
        </FormDataConsumer>
        <TextInput source="description" label="Описание" fullWidth />
      </SimpleFormIterator>
    </ArrayInput>
  </>
);

export const MatchCreate = (props) => (
  <Create {...props} transform={handleSaveWithImagesAndVideos}>
    <TabbedForm>
      <FormTab label="Матч">
        <MatchFormFields />
      </FormTab>
      <FormTab label="Составы">
        <LineupSection />
      </FormTab>
    </TabbedForm>
  </Create>
);

export const MatchEdit = (props) => (
  <Edit {...props} transform={handleSaveWithImagesAndVideos}>
    <TabbedForm>
      <FormTab label="Матч">
        <MatchFormFields />
      </FormTab>
      <FormTab label="Составы">
        <LineupSection />
      </FormTab>
    </TabbedForm>
  </Edit>
);
