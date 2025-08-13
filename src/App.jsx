import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Main_Page from './Components/Pages/Main_Page';
import Non_Found_Page from './Components/Pages/Non_Found_Page';
import Layout from './Components/Standart/Layout/Layout';
import InstallButton from './Components/Pages/InstallButton/InstallButton';
import AdminPage from './Components/Pages/AdminPage/AdminPage';
import HomePage from './Components/Pages/HomePage/HomePage';
import NewsPage from './Components/Pages/NewsPage/NewsPage';
import OneNewsPage from './Components/Pages/OneNewsPage/OneNewsPage';
import ImagesPage from './Components/Pages/ImagesPage/ImagesPage';
import VideosPage from './Components/Pages/VideosPage/VideosPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<OneNewsPage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="*" element={<Non_Found_Page />} />
        </Route>
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>

      {/* Кнопка установки */}
      {/* <InstallButton /> */}
    </>
  );
}

export default App;
