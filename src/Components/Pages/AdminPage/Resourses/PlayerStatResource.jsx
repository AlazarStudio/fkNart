import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  Edit,
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  NumberInput,
  EditButton,
  DeleteButton,
  FormDataConsumer,
} from 'react-admin';

export const PlayerStatList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="player.name" label="Игрок" />
      <NumberField source="matchesPlayed" label="Матчи" />
      <NumberField source="goals" label="Голы" />
      <NumberField source="assists" label="Пасы" />
      <NumberField source="yellow_cards" label="ЖК" />
      <NumberField source="red_cards" label="КК" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

const PlayerStatForm = () => (
  <SimpleForm>
    {/* Сначала выбираем команду */}
    <ReferenceInput source="teamId" reference="teams" label="Команда">
      <SelectInput optionText="title" />
    </ReferenceInput>

    {/* Динамически показываем игроков по выбранной команде */}
    <FormDataConsumer>
      {({ formData, ...rest }) =>
        formData.teamId && (
          <ReferenceInput
            source="playerId"
            reference="players"
            label="Игрок"
            filter={{ teamId: formData.teamId }}
            {...rest}
          >
            <SelectInput optionText="name" />
          </ReferenceInput>
        )
      }
    </FormDataConsumer>

    <NumberInput source="matchesPlayed" label="Матчи" />
    <NumberInput source="goals" label="Голы" />
    <NumberInput source="assists" label="Пасы" />
    <NumberInput source="yellow_cards" label="ЖК" />
    <NumberInput source="red_cards" label="КК" />
  </SimpleForm>
);

export const PlayerStatCreate = (props) => (
  <Create {...props}>
    <PlayerStatForm />
  </Create>
);

export const PlayerStatEdit = (props) => (
  <Edit {...props}>
    <PlayerStatForm />
  </Edit>
);
