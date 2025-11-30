<?php

namespace App\Factory;

use App\Entity\Questionnaire;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<Questionnaire>
 */
final class QuestionnaireFactory extends PersistentObjectFactory
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
        return Questionnaire::class;
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     */
    #[\Override]
    protected function defaults(): array|callable
    {
        $titles = [
            'Questionnaire de satisfaction',
            'Parcours découverte médiathèque',
            'Quiz culture générale',
            'Orientation services',
            'Enquête de fréquentation',
            'Retour atelier du samedi',
            'Sondage nouveaux services',
            'Évaluation animations jeunesse',
        ];

        return [
            'title' => self::faker()->randomElement($titles),
            'description' => self::faker()->optional(0.7)->paragraph(),
            'createdAt' => \DateTimeImmutable::createFromMutable(self::faker()->dateTimeBetween('-1 year', 'now')),
            'startQuestion' => null,
        ];
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#initialization
     */
    #[\Override]
    protected function initialize(): static
    {
        return $this
            // ->afterInstantiate(function(Questionnaire $questionnaire): void {})
        ;
    }
}
