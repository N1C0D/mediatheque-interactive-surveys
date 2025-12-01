<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/media')]
class MediaController extends AbstractController
{
    private string $mediaDirectory;

    public function __construct()
    {
        $this->mediaDirectory = __DIR__.'/../../public/media';
    }

    /**
     * Liste tous les fichiers médias disponibles.
     */
    #[Route('', name: 'api_media_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $media = [];

        // Lister les images
        $imagesDir = $this->mediaDirectory.'/images';
        if (is_dir($imagesDir)) {
            $files = scandir($imagesDir);
            foreach ($files as $file) {
                if ('.' !== $file && '..' !== $file && is_file($imagesDir.'/'.$file)) {
                    $media[] = [
                        'filename' => 'images/'.$file,
                        'type' => 'image',
                        'name' => $file,
                        'url' => '/media/images/'.$file,
                    ];
                }
            }
        }

        // Lister les vidéos
        $videosDir = $this->mediaDirectory.'/videos';
        if (is_dir($videosDir)) {
            $files = scandir($videosDir);
            foreach ($files as $file) {
                if ('.' !== $file && '..' !== $file && is_file($videosDir.'/'.$file)) {
                    $media[] = [
                        'filename' => 'videos/'.$file,
                        'type' => 'video',
                        'name' => $file,
                        'url' => '/media/videos/'.$file,
                    ];
                }
            }
        }

        return new JsonResponse($media);
    }

    /**
     * Upload un nouveau fichier média.
     */
    #[Route('/upload', name: 'api_media_upload', methods: ['POST'])]
    public function upload(Request $request, SluggerInterface $slugger): JsonResponse
    {
        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse([
                'error' => 'Aucun fichier envoyé',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que le fichier a été uploadé correctement
        if (!$file->isValid()) {
            return new JsonResponse([
                'error' => 'Erreur lors de l\'upload: '.$file->getErrorMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier le type MIME
        $mimeType = $file->getMimeType();
        $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

        if (in_array($mimeType, $allowedImageTypes)) {
            $mediaType = 'image';
            $subDirectory = 'images';
        } elseif (in_array($mimeType, $allowedVideoTypes)) {
            $mediaType = 'video';
            $subDirectory = 'videos';
        } else {
            return new JsonResponse([
                'error' => 'Type de fichier non supporté. Images (JPEG, PNG, GIF, WebP) et vidéos (MP4, WebM, OGG) uniquement.',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier la taille (max 10MB pour images, 50MB pour vidéos)
        $maxSize = 'image' === $mediaType ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        if ($file->getSize() > $maxSize) {
            $maxSizeMB = $maxSize / (1024 * 1024);

            return new JsonResponse([
                'error' => "Le fichier est trop volumineux. Taille maximale: {$maxSizeMB}MB",
            ], Response::HTTP_BAD_REQUEST);
        }

        // Générer un nom de fichier unique
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $extension = $file->guessExtension() ?: $file->getClientOriginalExtension();
        $newFilename = $safeFilename.'-'.uniqid().'.'.$extension;

        // S'assurer que le répertoire existe
        $targetDirectory = $this->mediaDirectory.'/'.$subDirectory;
        if (!is_dir($targetDirectory)) {
            mkdir($targetDirectory, 0755, true);
        }

        // Déplacer le fichier
        try {
            $file->move($targetDirectory, $newFilename);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Impossible de sauvegarder le fichier: '.$e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $filename = $subDirectory.'/'.$newFilename;

        return new JsonResponse([
            'success' => true,
            'filename' => $filename,
            'type' => $mediaType,
            'name' => $newFilename,
            'url' => '/media/'.$filename,
        ], Response::HTTP_CREATED);
    }
}
