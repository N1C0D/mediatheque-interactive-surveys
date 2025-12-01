<?php

namespace App\Factory;

use App\Entity\Question;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<Question>
 */
final class QuestionFactory extends PersistentObjectFactory
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
        return Question::class;
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     */
    #[\Override]
    protected function defaults(): array|callable
    {
        $mediaChoice = self::faker()->randomElement([null, null, 'image', 'image', 'video']);

        $mediaFilename = null;
        $mediaType = null;

        if ('image' === $mediaChoice) {
            $mediaFilename = 'images/placeholder-image.jpg';
            $mediaType = 'image';
        } elseif ('video' === $mediaChoice) {
            $mediaFilename = 'videos/placeholder-video.mp4';
            $mediaType = 'video';
        }

        return [
            'content' => self::faker()->sentence(10).' ?',
            'mediaFilename' => $mediaFilename,
            'mediaType' => $mediaType,
            'questionnaire' => null,
        ];
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#initialization
     */
    #[\Override]
    protected function initialize(): static
    {
        return $this
            // ->afterInstantiate(function(Question $question): void {})
        ;
    }
}
