<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\ChoiceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ChoiceRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['choice:read']],
    denormalizationContext: ['groups' => ['choice:write']],
)]
class Choice
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['choice:read', 'question:read', 'questionnaire:read', 'participation:read', 'participationAnswer:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['choice:read', 'choice:write', 'question:read', 'questionnaire:read', 'participation:read', 'participationAnswer:read'])]
    private ?string $label = null;

    #[ORM\ManyToOne(inversedBy: 'choices')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['choice:read', 'choice:write'])]
    private ?Question $question = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    #[Groups(['choice:read', 'choice:write', 'question:read', 'questionnaire:read', 'participation:read'])]
    private ?Question $targetQuestion = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function getQuestion(): ?Question
    {
        return $this->question;
    }

    public function setQuestion(?Question $question): static
    {
        $this->question = $question;

        return $this;
    }

    public function getTargetQuestion(): ?Question
    {
        return $this->targetQuestion;
    }

    public function setTargetQuestion(?Question $targetQuestion): static
    {
        $this->targetQuestion = $targetQuestion;

        return $this;
    }
}
