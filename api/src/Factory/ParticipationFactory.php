<?php

namespace App\Factory;

use App\Entity\Participation;
use Random\RandomException;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<Participation>
 */
final class ParticipationFactory extends PersistentObjectFactory
{
    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#factories-as-services
     */
    public function __construct()
    {
    }

    #[\Override]
    public static function class(): string
    {
        return Participation::class;
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     *
     * @throws RandomException
     */
    #[\Override]
    protected function defaults(): array|callable
    {
        return [
            'isCompleted' => self::faker()->boolean(30),
            'token' => bin2hex(random_bytes(32)),
            'updatedAt' => \DateTimeImmutable::createFromMutable(
                self::faker()->dateTimeBetween('-30 days', 'now')
            ),
            'currentQuestion' => null,
            'questionnaire' => null,
            'respondent' => null,
        ];
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#initialization
     */
    #[\Override]
    protected function initialize(): static
    {
        return $this
            // ->afterInstantiate(function(Participation $participation): void {})
        ;
    }
}
