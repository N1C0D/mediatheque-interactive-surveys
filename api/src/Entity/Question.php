<?php

namespace App\Entity;

use App\Repository\QuestionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: QuestionRepository::class)]
class Question
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $content = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $mediaFilename = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $mediaType = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getMediaFilename(): ?string
    {
        return $this->mediaFilename;
    }

    public function setMediaFilename(?string $mediaFilename): static
    {
        $this->mediaFilename = $mediaFilename;

        return $this;
    }

    public function getMediaType(): ?string
    {
        return $this->mediaType;
    }

    public function setMediaType(?string $mediaType): static
    {
        $this->mediaType = $mediaType;

        return $this;
    }
}
