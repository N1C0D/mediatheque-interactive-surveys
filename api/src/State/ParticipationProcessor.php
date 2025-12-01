<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Participation;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * @implements ProcessorInterface<Participation, Participation>
 */
final class ParticipationProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<Participation, Participation> $persistProcessor
     */
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Participation
    {
        if ($operation instanceof Post) {
            // Generate unique token
            $data->setToken(bin2hex(random_bytes(32)));

            // Set updatedAt
            $data->setUpdatedAt(new \DateTimeImmutable());

            // Set isCompleted to false if not set
            if (null === $data->isCompleted()) {
                $data->setIsCompleted(false);
            }

            // Set currentQuestion to questionnaire's startQuestion if not set
            if (null === $data->getCurrentQuestion() && $data->getQuestionnaire()?->getStartQuestion()) {
                $data->setCurrentQuestion($data->getQuestionnaire()->getStartQuestion());
            }

            // Associate with current user if logged in
            $user = $this->security->getUser();
            if ($user instanceof User && null === $data->getRespondent()) {
                $data->setRespondent($user);
            }
        }

        // For updates, update the timestamp
        if (!$operation instanceof Post) {
            $data->setUpdatedAt(new \DateTimeImmutable());
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
