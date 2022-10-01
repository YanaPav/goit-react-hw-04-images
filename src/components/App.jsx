import { useState, useEffect } from 'react';

import { fetchImages } from './api';
import css from './App.module.css';
import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';
import { Modal } from './Modal/Modsl';

export const App = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [modalAlt, setModalAlt] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;

    async function getImages() {
      setIsLoading(true);

      try {
        const { newImages, totalImages } = await fetchImages(query, page);

        if (newImages.length === 0) {
          throw new Error(`There is no results for ${query} :( Try again`);
        }

        setImages(prevImages => [...prevImages, ...newImages]);
        setTotalImages(totalImages);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    getImages();
  }, [query, page]);

  const onFormSubmit = e => {
    e.preventDefault();
    const newQuery = e.target.elements.searchQuery.value;

    if (query !== newQuery) {
      setImages([]);
      setPage(1);
      setError(null);
      setTotalImages(0);
      setQuery(newQuery);
    }
  };

  const onLoadMoreClick = () => {
    setPage(prevPage => prevPage + 1);
  };

  const openModal = (url, alt) => {
    setIsModalOpen(true);
    setModalUrl(url);
    setModalAlt(alt);
  };

  const closeModal = e => {
    if (e.target === e.currentTarget || e.code === 'Escape') {
      setIsModalOpen(false);
      setModalUrl('');
      setModalAlt('');
    }
  };

  return (
    <div className={css.app}>
      <Searchbar onSubmit={onFormSubmit} isSubmiting={isLoading} />

      {isLoading && <Loader />}

      {error && <p>{error}</p>}

      {isModalOpen && (
        <Modal imageURL={modalUrl} alt={modalAlt} closeModal={closeModal} />
      )}

      {images.length > 0 && (
        <ImageGallery images={images} openModal={openModal} />
      )}

      {images.length < totalImages && images.length > 0 && (
        <Button onClick={onLoadMoreClick} />
      )}
    </div>
  );
};
