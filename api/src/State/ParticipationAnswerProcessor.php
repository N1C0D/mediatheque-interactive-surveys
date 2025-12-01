<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ParticipationAnswer;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<ParticipationAnswer, ParticipationAnswer>
 */
final class ParticipationAnswerProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<ParticipationAnswer, ParticipationAnswer> $persistProcessor
     */
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ParticipationAnswer
    {
        if ($operation instanceof Post) {
            // Set answeredAt timestamp
            $data->setAnsweredAt(new \DateTimeImmutable());

            // Update participation's currentQuestion and updatedAt
            $participation = $data->getParticipation();
            if ($participation) {
                $participation->setUpdatedAt(new \DateTimeImmutable());

                // If choice has a targetQuestion, update currentQuestion
                $choice = $data->getChoice();
                if ($choice && $choice->getTargetQuestion()) {
                    $participation->setCurrentQuestion($choice->getTargetQuestion());
                } else {
                    // No next question = questionnaire completed
                    $participation->setCurrentQuestion(null);
                    $participation->setIsCompleted(true);
                }
            }
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
