<?php

namespace App\DataFixtures;

use App\Factory\ChoiceFactory;
use App\Factory\ParticipationAnswerFactory;
use App\Factory\ParticipationFactory;
use App\Factory\QuestionFactory;
use App\Factory\QuestionnaireFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $this->createDiscoveryQuestionnaire();
        $this->createSatisfactionQuestionnaire();
        $this->createCultureQuizQuestionnaire();
        $this->createServiceOrientationQuestionnaire();
        $this->createSampleParticipations();
    }

    /**
     * Questionnaire d'orientation des usagers (arbre de décision complexe).
     */
    private function createDiscoveryQuestionnaire(): void
    {
        $endJeuneA = QuestionFactory::createOne([
            'content' => 'Super ! Rejoignez notre club de lecture "Junior" le mercredi à 14h. Inscription à l\'accueil.',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        $endJeuneB = QuestionFactory::createOne([
            'content' => 'Pas de souci ! Découvrez notre ludothèque jeux vidéo au 2ème étage, ouverte tous les jours.',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        $endAdulteA = QuestionFactory::createOne([
            'content' => 'Nous avons un atelier CV tous les mardis matin de 9h à 12h. Rendez-vous au service emploi.',
            'mediaFilename' => 'placeholder-video.mp4',
            'mediaType' => 'video',
        ]);

        $endAdulteB = QuestionFactory::createOne([
            'content' => 'Consultez notre catalogue de romans policiers, section C au 1er étage. Bonne lecture !',
        ]);

        $endAdulteC = QuestionFactory::createOne([
            'content' => 'Découvrez nos ressources numériques gratuites : journaux, magazines, formations en ligne.',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        $qJeune = QuestionFactory::createOne([
            'content' => 'Aimes-tu lire des livres ?',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        ChoiceFactory::createOne([
            'label' => 'Oui, j\'adore !',
            'question' => $qJeune,
            'targetQuestion' => $endJeuneA,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Bof, je préfère les écrans',
            'question' => $qJeune,
            'targetQuestion' => $endJeuneB,
        ]);

        $qAdulte = QuestionFactory::createOne([
            'content' => 'Que recherchez-vous aujourd\'hui ?',
        ]);

        ChoiceFactory::createOne([
            'label' => 'Aide à la recherche d\'emploi',
            'question' => $qAdulte,
            'targetQuestion' => $endAdulteA,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Lecture de loisir',
            'question' => $qAdulte,
            'targetQuestion' => $endAdulteB,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Accès numérique',
            'question' => $qAdulte,
            'targetQuestion' => $endAdulteC,
        ]);

        $qStart = QuestionFactory::createOne([
            'content' => 'Bonjour ! Pour commencer, quel est votre âge ?',
            'mediaFilename' => 'placeholder-video.mp4',
            'mediaType' => 'video',
        ]);

        ChoiceFactory::createOne([
            'label' => 'J\'ai moins de 18 ans',
            'question' => $qStart,
            'targetQuestion' => $qJeune,
        ]);
        ChoiceFactory::createOne([
            'label' => 'J\'ai 18 ans ou plus',
            'question' => $qStart,
            'targetQuestion' => $qAdulte,
        ]);

        QuestionnaireFactory::createOne([
            'title' => 'Parcours Découverte Médiathèque',
            'startQuestion' => $qStart,
        ]);
    }

    /**
     * Questionnaire de satisfaction (recueil de retours).
     */
    private function createSatisfactionQuestionnaire(): void
    {
        $endTresSatisfait = QuestionFactory::createOne([
            'content' => 'Merci beaucoup ! Nous sommes ravis que vous soyez satisfait. À bientôt !',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        $endPeuSatisfait = QuestionFactory::createOne([
            'content' => 'Merci pour votre retour. Nous allons prendre en compte vos remarques pour nous améliorer.',
        ]);

        $endRecommandation = QuestionFactory::createOne([
            'content' => 'Merci de nous recommander ! N\'hésitez pas à partager vos bons moments avec vos proches.',
        ]);

        $endPasRecommandation = QuestionFactory::createOne([
            'content' => 'Nous sommes désolés. Vos commentaires sont précieux pour progresser. Merci.',
        ]);

        $qRecommandation = QuestionFactory::createOne([
            'content' => 'Recommanderiez-vous notre médiathèque à vos proches ?',
        ]);

        ChoiceFactory::createOne([
            'label' => 'Oui, certainement',
            'question' => $qRecommandation,
            'targetQuestion' => $endRecommandation,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Non, pas vraiment',
            'question' => $qRecommandation,
            'targetQuestion' => $endPasRecommandation,
        ]);

        $qSatisfaction = QuestionFactory::createOne([
            'content' => 'Comment évaluez-vous votre visite aujourd\'hui ?',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        ChoiceFactory::createOne([
            'label' => 'Très satisfait',
            'question' => $qSatisfaction,
            'targetQuestion' => $endTresSatisfait,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Satisfait',
            'question' => $qSatisfaction,
            'targetQuestion' => $qRecommandation,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Peu satisfait',
            'question' => $qSatisfaction,
            'targetQuestion' => $endPeuSatisfait,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Pas satisfait',
            'question' => $qSatisfaction,
            'targetQuestion' => $endPeuSatisfait,
        ]);

        QuestionnaireFactory::createOne([
            'title' => 'Satisfaction Atelier du Samedi',
            'startQuestion' => $qSatisfaction,
        ]);
    }

    /**
     * Questionnaire ludique et pédagogique (quiz).
     */
    private function createCultureQuizQuestionnaire(): void
    {
        $endBravo = QuestionFactory::createOne([
            'content' => 'Bravo ! Vous êtes un expert ! Découvrez notre section Histoire au 1er étage.',
            'mediaFilename' => 'placeholder-video.mp4',
            'mediaType' => 'video',
        ]);

        $endBienJoue = QuestionFactory::createOne([
            'content' => 'Bien joué ! Continuez à explorer notre médiathèque pour en apprendre davantage.',
        ]);

        $endDommage = QuestionFactory::createOne([
            'content' => 'Dommage ! Mais ne vous découragez pas, nous avons plein de livres pour apprendre.',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        $qCulture2 = QuestionFactory::createOne([
            'content' => 'En quelle année a eu lieu la Révolution française ?',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        ChoiceFactory::createOne([
            'label' => '1789',
            'question' => $qCulture2,
            'targetQuestion' => $endBravo,
        ]);
        ChoiceFactory::createOne([
            'label' => '1792',
            'question' => $qCulture2,
            'targetQuestion' => $endBienJoue,
        ]);
        ChoiceFactory::createOne([
            'label' => '1804',
            'question' => $qCulture2,
            'targetQuestion' => $endDommage,
        ]);

        $qCulture1 = QuestionFactory::createOne([
            'content' => 'Qui a écrit "Les Misérables" ?',
            'mediaFilename' => 'placeholder-video.mp4',
            'mediaType' => 'video',
        ]);

        ChoiceFactory::createOne([
            'label' => 'Victor Hugo',
            'question' => $qCulture1,
            'targetQuestion' => $qCulture2,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Émile Zola',
            'question' => $qCulture1,
            'targetQuestion' => $endDommage,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Alexandre Dumas',
            'question' => $qCulture1,
            'targetQuestion' => $endDommage,
        ]);

        QuestionnaireFactory::createOne([
            'title' => 'Quiz Culture Générale',
            'startQuestion' => $qCulture1,
        ]);
    }

    /**
     * Questionnaire d'orientation vers les services (arbre complexe).
     */
    private function createServiceOrientationQuestionnaire(): void
    {
        $endEspaceEnfant = QuestionFactory::createOne([
            'content' => 'Direction l\'espace enfants ! Rez-de-chaussée, à gauche après l\'entrée.',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        $endEspaceAdo = QuestionFactory::createOne([
            'content' => 'Rendez-vous à l\'espace ados, 1er étage. Mangas, BD, et bien plus !',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        $endBibliotheque = QuestionFactory::createOne([
            'content' => 'Bienvenue à la bibliothèque générale, 2ème étage. Silence demandé.',
        ]);

        $endMultimedia = QuestionFactory::createOne([
            'content' => 'L\'espace multimédia vous attend ! Ordinateurs, tablettes, impression disponibles.',
            'mediaFilename' => 'placeholder-video.mp4',
            'mediaType' => 'video',
        ]);

        $endEspaceCoworking = QuestionFactory::createOne([
            'content' => 'Notre espace coworking est au 3ème étage. WiFi haut débit et prises disponibles.',
        ]);

        $qActiviteAdulte = QuestionFactory::createOne([
            'content' => 'Quel type d\'activité vous intéresse ?',
        ]);

        ChoiceFactory::createOne([
            'label' => 'Lecture et étude',
            'question' => $qActiviteAdulte,
            'targetQuestion' => $endBibliotheque,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Informatique et Internet',
            'question' => $qActiviteAdulte,
            'targetQuestion' => $endMultimedia,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Travail à distance',
            'question' => $qActiviteAdulte,
            'targetQuestion' => $endEspaceCoworking,
        ]);

        $qActiviteJeune = QuestionFactory::createOne([
            'content' => 'Tu as quel âge exactement ?',
        ]);

        ChoiceFactory::createOne([
            'label' => 'Moins de 12 ans',
            'question' => $qActiviteJeune,
            'targetQuestion' => $endEspaceEnfant,
        ]);
        ChoiceFactory::createOne([
            'label' => '12 à 17 ans',
            'question' => $qActiviteJeune,
            'targetQuestion' => $endEspaceAdo,
        ]);

        $qServiceStart = QuestionFactory::createOne([
            'content' => 'Bienvenue ! Vous cherchez un espace pour...',
            'mediaFilename' => 'placeholder-image.jpg',
            'mediaType' => 'image',
        ]);

        ChoiceFactory::createOne([
            'label' => 'Les enfants/ados',
            'question' => $qServiceStart,
            'targetQuestion' => $qActiviteJeune,
        ]);
        ChoiceFactory::createOne([
            'label' => 'Les adultes',
            'question' => $qServiceStart,
            'targetQuestion' => $qActiviteAdulte,
        ]);

        QuestionnaireFactory::createOne([
            'title' => 'Orientation Services - Trouvez votre espace',
            'startQuestion' => $qServiceStart,
        ]);
    }

    /**
     * Crée des exemples de participations (en cours, complétées).
     */
    private function createSampleParticipations(): void
    {
        $questionnaire = QuestionnaireFactory::repository()->findOneBy(['title' => 'Parcours Découverte Médiathèque']);
        $startQuestion = $questionnaire->getStartQuestion();
        $secondQuestion = $startQuestion->getChoices()->first()->getTargetQuestion();

        $baseDate = new \DateTimeImmutable('-2 days 10:30:00');

        $completedParticipation = ParticipationFactory::createOne([
            'token' => bin2hex(random_bytes(32)),
            'isCompleted' => true,
            'currentQuestion' => null,
            'updatedAt' => $baseDate->modify('+5 minutes'),
        ]);

        $choice1 = $startQuestion->getChoices()->first();
        ParticipationAnswerFactory::createOne([
            'participation' => $completedParticipation,
            'choice' => $choice1,
            'answeredAt' => $baseDate,
        ]);

        if ($secondQuestion && $secondQuestion->getChoices()->count() > 0) {
            $choice2 = $secondQuestion->getChoices()->first();
            ParticipationAnswerFactory::createOne([
                'participation' => $completedParticipation,
                'choice' => $choice2,
                'answeredAt' => $baseDate->modify('+2 minutes'),
            ]);

            $thirdQuestion = $choice2->getTargetQuestion();
            if ($thirdQuestion && $thirdQuestion->getChoices()->count() > 0) {
                $choice3 = $thirdQuestion->getChoices()->first();
                ParticipationAnswerFactory::createOne([
                    'participation' => $completedParticipation,
                    'choice' => $choice3,
                    'answeredAt' => $baseDate->modify('+4 minutes'),
                ]);
            }
        }

        $inProgressDate = new \DateTimeImmutable('-1 hour 15 minutes');

        $inProgressParticipation = ParticipationFactory::createOne([
            'token' => bin2hex(random_bytes(32)),
            'isCompleted' => false,
            'currentQuestion' => $secondQuestion,
            'updatedAt' => $inProgressDate->modify('+1 minute'),
        ]);

        ParticipationAnswerFactory::createOne([
            'participation' => $inProgressParticipation,
            'choice' => $choice1,
            'answeredAt' => $inProgressDate,
        ]);

        ParticipationFactory::createOne([
            'token' => bin2hex(random_bytes(32)),
            'isCompleted' => false,
            'currentQuestion' => $startQuestion,
            'updatedAt' => new \DateTimeImmutable('-5 minutes'),
        ]);
    }
}
