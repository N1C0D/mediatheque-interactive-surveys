'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import { MediaFile } from '@/types';
import styles from './MediaSelector.module.css';

interface MediaSelectorProps {
  label?: string;
  value: { filename: string; type: 'image' | 'video' | '' };
  onChange: (value: { filename: string; type: 'image' | 'video' | '' }) => void;
}

type TabType = 'upload' | 'gallery';
type FilterType = 'all' | 'image' | 'video';

export function MediaSelector({ label, value, onChange }: MediaSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [filter, setFilter] = useState<FilterType>('all');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    setIsLoadingMedia(true);
    setError(null);
    try {
      const mediaList = await api.getMedia();
      setMedia(mediaList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les médias');
    } finally {
      setIsLoadingMedia(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const result = await api.uploadMedia(file);
      // Refresh media list
      await loadMedia();
      // Select the uploaded file
      onChange({ filename: result.filename, type: result.type });
      setActiveTab('gallery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSelectMedia = (mediaFile: MediaFile) => {
    onChange({ filename: mediaFile.filename, type: mediaFile.type });
  };

  const handleRemove = () => {
    onChange({ filename: '', type: '' });
  };

  const filteredMedia = media.filter(m => {
    if (filter === 'all') return true;
    return m.type === filter;
  });

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}

      {/* Current Selection */}
      {value.filename && (
        <div className={styles.currentSelection}>
          {value.type === 'image' ? (
            <img
              src={getMediaUrl(value.filename)}
              alt="Média sélectionné"
              className={styles.currentPreview}
            />
          ) : (
            <video
              src={getMediaUrl(value.filename)}
              className={styles.currentPreview}
            />
          )}
          <div className={styles.currentInfo}>
            <span className={styles.currentFilename}>{value.filename}</span>
            <span className={styles.currentType}>{value.type}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeButton}
            title="Supprimer le média"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'gallery' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Bibliothèque
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'upload' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Ajouter un fichier
        </button>
      </div>

      {/* Error message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Upload Section */}
      {activeTab === 'upload' && (
        <div className={styles.uploadSection}>
          {isUploading ? (
            <div className={styles.uploadingOverlay}>
              <div className={styles.spinner}></div>
              <span>Upload en cours...</span>
            </div>
          ) : (
            <div
              className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className={styles.dropzoneContent}>
                <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
                <p className={styles.dropzoneText}>
                  <strong>Cliquez</strong> ou glissez un fichier ici
                </p>
                <p className={styles.dropzoneHint}>
                  Images (JPEG, PNG, GIF, WebP) ou Vidéos (MP4, WebM, OGG)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Gallery Section */}
      {activeTab === 'gallery' && (
        <div className={styles.gallerySection}>
          {/* Filter tabs */}
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('all')}
            >
              Tous
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${filter === 'image' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('image')}
            >
              Images
            </button>
            <button
              type="button"
              className={`${styles.filterTab} ${filter === 'video' ? styles.filterTabActive : ''}`}
              onClick={() => setFilter('video')}
            >
              Vidéos
            </button>
          </div>

          {/* Media Grid */}
          {isLoadingMedia ? (
            <div className={styles.loadingGallery}>
              <div className={styles.spinner}></div>
              <span>Chargement...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className={styles.emptyGallery}>
              {filter === 'all'
                ? 'Aucun média disponible. Ajoutez-en un !'
                : `Aucune ${filter === 'image' ? 'image' : 'vidéo'} disponible.`}
            </div>
          ) : (
            <div className={styles.gallery}>
              {filteredMedia.map((mediaFile) => (
                <div
                  key={mediaFile.filename}
                  className={`${styles.mediaItem} ${value.filename === mediaFile.filename ? styles.mediaItemSelected : ''}`}
                  onClick={() => handleSelectMedia(mediaFile)}
                  title={mediaFile.name}
                >
                  {mediaFile.type === 'image' ? (
                    <img
                      src={getMediaUrl(mediaFile.filename)}
                      alt={mediaFile.name}
                      className={styles.mediaThumb}
                    />
                  ) : (
                    <>
                      <video
                        src={getMediaUrl(mediaFile.filename)}
                        className={styles.mediaThumb}
                      />
                      <div className={styles.videoOverlay}>
                        <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </>
                  )}
                  <span className={styles.mediaName}>{mediaFile.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
