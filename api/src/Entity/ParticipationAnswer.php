<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\ParticipationAnswerRepository;
use App\State\ParticipationAnswerProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ParticipationAnswerRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Get(
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Post(processor: ParticipationAnswerProcessor::class),
    ],
    normalizationContext: ['groups' => ['participationAnswer:read']],
    denormalizationContext: ['groups' => ['participationAnswer:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['participation' => 'exact', 'question' => 'exact', 'choice' => 'exact'])]
#[ApiFilter(DateFilter::class, properties: ['answeredAt'])]
#[ApiFilter(OrderFilter::class, properties: ['answeredAt', 'id'], arguments: ['orderParameterName' => 'order'])]
class ParticipationAnswer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['participationAnswer:read', 'participation:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'answers')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participationAnswer:read', 'participationAnswer:write'])]
    private ?Participation $participation = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['participationAnswer:read', 'participationAnswer:write', 'participation:read'])]
    private ?Choice $choice = null;

    #[ORM\Column]
    #[Groups(['participationAnswer:read', 'participation:read'])]
    private ?\DateTimeImmutable $answeredAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['participationAnswer:read', 'participationAnswer:write', 'participation:read'])]
    private ?Question $question = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getParticipation(): ?Participation
    {
        return $this->participation;
    }

    public function setParticipation(?Participation $participation): static
    {
        $this->participation = $participation;

        return $this;
    }

    public function getChoice(): ?Choice
    {
        return $this->choice;
    }

    public function setChoice(?Choice $choice): static
    {
        $this->choice = $choice;

        return $this;
    }

    public function getAnsweredAt(): ?\DateTimeImmutable
    {
        return $this->answeredAt;
    }

    public function setAnsweredAt(\DateTimeImmutable $answeredAt): static
    {
        $this->answeredAt = $answeredAt;

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
}
