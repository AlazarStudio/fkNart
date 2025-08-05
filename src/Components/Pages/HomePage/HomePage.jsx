import React from 'react';
import classes from './HomePage.module.css';
import Container1 from '../../ui/HomePageContainers/Container1/Container1';
import Container2 from '../../ui/HomePageContainers/Container2/Container2';
import Container3 from '../../ui/HomePageContainers/Container3/Container3';

export default function HomePage() {
  return (
    <div>
      <Container1 />
      <Container2 />
      <Container3 />
    </div>
  );
}
