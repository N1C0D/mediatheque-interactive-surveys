<?php

namespace App\Factory;

use App\Entity\Choice;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<Choice>
 */
final class ChoiceFactory extends PersistentObjectFactory
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
        return Choice::class;
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     */
    #[\Override]
    protected function defaults(): array|callable
    {
        $labels = [
            'Oui',
            'Non',
            'Peut-être',
            'Très satisfait',
            'Satisfait',
            'Peu satisfait',
            'Pas satisfait',
            'Moins de 18 ans',
            '18 ans et plus',
            'Continuer',
            'Passer',
        ];

        return [
            'label' => self::faker()->randomElement($labels),
            'question' => null,
            'targetQuestion' => null,
        ];
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#initialization
     */
    #[\Override]
    protected function initialize(): static
    {
        return $this
            // ->afterInstantiate(function(Choice $choice): void {})
        ;
    }
}
