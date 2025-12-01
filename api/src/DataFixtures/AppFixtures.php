<?php

namespace App\DataFixtures;

use App\Factory\ChoiceFactory;
use App\Factory\ParticipationAnswerFactory;
use App\Factory\ParticipationFactory;
use App\Factory\QuestionFactory;
use App\Factory\QuestionnaireFactory;
use App\Factory\UserFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Random\RandomException;

class AppFixtures extends Fixture
{
    /**
     * @throws RandomException
     */
    public function load(ObjectManager $manager): void
    {
        $this->createDiscoveryQuestionnaire();
        $this->createSatisfactionQuestionnaire();
        $this->createCultureQuizQuestionnaire();
        $this->createServiceOrientationQuestionnaire();
        $this->createSampleParticipations();
        $this->createUsers();
        $this->createUserParticipations();
    }

    /**
     * Questionnaire d'orientation des usagers (arbre de décision complexe).
     */
    private function createDiscoveryQuestionnaire(): void
    {
        $questionnaire = QuestionnaireFactory::createOne([
            'title' => 'Parcours Découverte Médiathèque',
            'startQuestion' => null,
        ]);

        $endJeuneA = QuestionFactory::createOne([
            'content' => 'Super ! Rejoignez notre club de lecture "Junior" le mercredi à 14h. Inscription à l\'accueil.',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
        ]);

        $endJeuneB = QuestionFactory::createOne([
            'content' => 'Pas de souci ! Découvrez notre ludothèque jeux vidéo au 2ème étage, ouverte tous les jours.',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
        ]);

        $endAdulteA = QuestionFactory::createOne([
            'content' => 'Nous avons un atelier CV tous les mardis matin de 9h à 12h. Rendez-vous au service emploi.',
            'mediaFilename' => 'videos/placeholder-video.mp4',
            'mediaType' => 'video',
            'questionnaire' => $questionnaire,
        ]);

        $endAdulteB = QuestionFactory::createOne([
            'content' => 'Consultez notre catalogue de romans policiers, section C au 1er étage. Bonne lecture !',
            'questionnaire' => $questionnaire,
        ]);

        $endAdulteC = QuestionFactory::createOne([
            'content' => 'Découvrez nos ressources numériques gratuites : journaux, magazines, formations en ligne.',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
        ]);

        $qJeune = QuestionFactory::createOne([
            'content' => 'Aimes-tu lire des livres ?',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
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
            'questionnaire' => $questionnaire,
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
            'mediaFilename' => 'videos/placeholder-video.mp4',
            'mediaType' => 'video',
            'questionnaire' => $questionnaire,
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

        $questionnaire->setStartQuestion($qStart);
    }

    /**
     * Questionnaire de satisfaction (recueil de retours).
     */
    private function createSatisfactionQuestionnaire(): void
    {
        $questionnaire = QuestionnaireFactory::createOne([
            'title' => 'Satisfaction Atelier du Samedi',
            'startQuestion' => null,
        ]);

        $endTresSatisfait = QuestionFactory::createOne([
            'content' => 'Merci beaucoup ! Nous sommes ravis que vous soyez satisfait. À bientôt !',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
        ]);

        $endPeuSatisfait = QuestionFactory::createOne([
            'content' => 'Merci pour votre retour. Nous allons prendre en compte vos remarques pour nous améliorer.',
            'questionnaire' => $questionnaire,
        ]);

        $endRecommandation = QuestionFactory::createOne([
            'content' => 'Merci de nous recommander ! N\'hésitez pas à partager vos bons moments avec vos proches.',
            'questionnaire' => $questionnaire,
        ]);

        $endPasRecommandation = QuestionFactory::createOne([
            'content' => 'Nous sommes désolés. Vos commentaires sont précieux pour progresser. Merci.',
            'questionnaire' => $questionnaire,
        ]);

        $qRecommandation = QuestionFactory::createOne([
            'content' => 'Recommanderiez-vous notre médiathèque à vos proches ?',
            'questionnaire' => $questionnaire,
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
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
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

        $questionnaire->setStartQuestion($qSatisfaction);
    }

    /**
     * Questionnaire ludique et pédagogique (quiz).
     */
    private function createCultureQuizQuestionnaire(): void
    {
        $questionnaire = QuestionnaireFactory::createOne([
            'title' => 'Quiz Culture Générale',
            'startQuestion' => null,
        ]);

        $endBravo = QuestionFactory::createOne([
            'content' => 'Bravo ! Vous êtes un expert ! Découvrez notre section Histoire au 1er étage.',
            'mediaFilename' => 'videos/placeholder-video.mp4',
            'mediaType' => 'video',
            'questionnaire' => $questionnaire,
        ]);

        $endBienJoue = QuestionFactory::createOne([
            'content' => 'Bien joué ! Continuez à explorer notre médiathèque pour en apprendre davantage.',
            'questionnaire' => $questionnaire,
        ]);

        $endDommage = QuestionFactory::createOne([
            'content' => 'Dommage ! Mais ne vous découragez pas, nous avons plein de livres pour apprendre.',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
        ]);

        $qCulture2 = QuestionFactory::createOne([
            'content' => 'En quelle année a eu lieu la Révolution française ?',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
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
            'mediaFilename' => 'videos/placeholder-video.mp4',
            'mediaType' => 'video',
            'questionnaire' => $questionnaire,
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

        $questionnaire->setStartQuestion($qCulture1);
    }

    /**
     * Questionnaire d'orientation vers les services (arbre complexe).
     */
    private function createServiceOrientationQuestionnaire(): void
    {
        $questionnaire = QuestionnaireFactory::createOne([
            'title' => 'Orientation Services - Trouvez votre espace',
            'startQuestion' => null,
        ]);

        $endEspaceEnfant = QuestionFactory::createOne([
            'content' => 'Direction l\'espace enfants ! Rez-de-chaussée, à gauche après l\'entrée.',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
        ]);

        $endEspaceAdo = QuestionFactory::createOne([
            'content' => 'Rendez-vous à l\'espace ados, 1er étage. Mangas, BD, et bien plus !',
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
        ]);

        $endBibliotheque = QuestionFactory::createOne([
            'content' => 'Bienvenue à la bibliothèque générale, 2ème étage. Silence demandé.',
            'questionnaire' => $questionnaire,
        ]);

        $endMultimedia = QuestionFactory::createOne([
            'content' => 'L\'espace multimédia vous attend ! Ordinateurs, tablettes, impression disponibles.',
            'mediaFilename' => 'videos/placeholder-video.mp4',
            'mediaType' => 'video',
            'questionnaire' => $questionnaire,
        ]);

        $endEspaceCoworking = QuestionFactory::createOne([
            'content' => 'Notre espace coworking est au 3ème étage. WiFi haut débit et prises disponibles.',
            'questionnaire' => $questionnaire,
        ]);

        $qActiviteAdulte = QuestionFactory::createOne([
            'content' => 'Quel type d\'activité vous intéresse ?',
            'questionnaire' => $questionnaire,
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
            'questionnaire' => $questionnaire,
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
            'mediaFilename' => 'images/placeholder-image.jpg',
            'mediaType' => 'image',
            'questionnaire' => $questionnaire,
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

        $questionnaire->setStartQuestion($qServiceStart);
    }

    /**
     * Crée des exemples de participations (en cours, complétées).
     *
     * @throws RandomException
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
            'questionnaire' => $questionnaire,
        ]);

        $choice1 = $startQuestion->getChoices()->first();
        ParticipationAnswerFactory::createOne([
            'participation' => $completedParticipation,
            'choice' => $choice1,
            'question' => $startQuestion,
            'answeredAt' => $baseDate,
        ]);

        if ($secondQuestion && $secondQuestion->getChoices()->count() > 0) {
            $choice2 = $secondQuestion->getChoices()->first();
            ParticipationAnswerFactory::createOne([
                'participation' => $completedParticipation,
                'choice' => $choice2,
                'question' => $secondQuestion,
                'answeredAt' => $baseDate->modify('+2 minutes'),
            ]);

            $thirdQuestion = $choice2->getTargetQuestion();
            if ($thirdQuestion && $thirdQuestion->getChoices()->count() > 0) {
                $choice3 = $thirdQuestion->getChoices()->first();
                ParticipationAnswerFactory::createOne([
                    'participation' => $completedParticipation,
                    'choice' => $choice3,
                    'question' => $thirdQuestion,
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
            'questionnaire' => $questionnaire,
        ]);

        ParticipationAnswerFactory::createOne([
            'participation' => $inProgressParticipation,
            'choice' => $choice1,
            'question' => $startQuestion,
            'answeredAt' => $inProgressDate,
        ]);

        ParticipationFactory::createOne([
            'token' => bin2hex(random_bytes(32)),
            'isCompleted' => false,
            'currentQuestion' => $startQuestion,
            'updatedAt' => new \DateTimeImmutable('-5 minutes'),
            'questionnaire' => $questionnaire,
        ]);
    }

    /**
     * Crée des utilisateurs de test.
     */
    private function createUsers(): void
    {
        UserFactory::createOne([
            'email' => 'jean.dupont@example.com',
            'password' => password_hash('password', PASSWORD_BCRYPT),
            'roles' => ['ROLE_USER'],
        ]);

        UserFactory::createOne([
            'email' => 'marie.martin@example.com',
            'password' => password_hash('password', PASSWORD_BCRYPT),
            'roles' => ['ROLE_USER'],
        ]);

        UserFactory::createOne([
            'email' => 'admin@example.com',
            'password' => password_hash('admin', PASSWORD_BCRYPT),
            'roles' => ['ROLE_ADMIN'],
        ]);

        UserFactory::createMany(3);
    }

    /**
     * Crée des participations associées à des utilisateurs.
     *
     * @throws RandomException
     */
    private function createUserParticipations(): void
    {
        $userJean = UserFactory::repository()->findOneBy(['email' => 'jean.dupont@example.com']);
        $userMarie = UserFactory::repository()->findOneBy(['email' => 'marie.martin@example.com']);

        $quizQuestionnaire = QuestionnaireFactory::repository()->findOneBy(['title' => 'Quiz Culture Générale']);
        $satisfactionQuestionnaire = QuestionnaireFactory::repository()->findOneBy(['title' => 'Satisfaction Atelier du Samedi']);
        $discoveryQuestionnaire = QuestionnaireFactory::repository()->findOneBy(['title' => 'Parcours Découverte Médiathèque']);

        $quizStartQuestion = $quizQuestionnaire->getStartQuestion();
        $jeanQuizDate = new \DateTimeImmutable('-3 days 14:00:00');

        $jeanQuizParticipation = ParticipationFactory::createOne([
            'token' => bin2hex(random_bytes(32)),
            'isCompleted' => true,
            'currentQuestion' => null,
            'updatedAt' => $jeanQuizDate->modify('+4 minutes'),
            'questionnaire' => $quizQuestionnaire,
            'respondent' => $userJean,
        ]);

        $quizChoice1 = $quizStartQuestion->getChoices()->filter(
            fn ($choice) => 'Victor Hugo' === $choice->getLabel()
        )->first();

        ParticipationAnswerFactory::createOne([
            'participation' => $jeanQuizParticipation,
            'choice' => $quizChoice1,
            'question' => $quizStartQuestion,
            'answeredAt' => $jeanQuizDate,
        ]);

        $quizQuestion2 = $quizChoice1->getTargetQuestion();
        if ($quizQuestion2) {
            $quizChoice2 = $quizQuestion2->getChoices()->filter(
                fn ($choice) => '1789' === $choice->getLabel()
            )->first();

            if ($quizChoice2) {
                ParticipationAnswerFactory::createOne([
                    'participation' => $jeanQuizParticipation,
                    'choice' => $quizChoice2,
                    'question' => $quizQuestion2,
                    'answeredAt' => $jeanQuizDate->modify('+2 minutes'),
                ]);
            }
        }

        $satisfactionStartQuestion = $satisfactionQuestionnaire->getStartQuestion();
        $marieSatisfactionDate = new \DateTimeImmutable('-1 day 10:30:00');

        $marieSatisfactionParticipation = ParticipationFactory::createOne([
            'token' => bin2hex(random_bytes(32)),
            'isCompleted' => true,
            'currentQuestion' => null,
            'updatedAt' => $marieSatisfactionDate->modify('+3 minutes'),
            'questionnaire' => $satisfactionQuestionnaire,
            'respondent' => $userMarie,
        ]);

        $satisfactionChoice1 = $satisfactionStartQuestion->getChoices()->filter(
            fn ($choice) => 'Satisfait' === $choice->getLabel()
        )->first();

        ParticipationAnswerFactory::createOne([
            'participation' => $marieSatisfactionParticipation,
            'choice' => $satisfactionChoice1,
            'question' => $satisfactionStartQuestion,
            'answeredAt' => $marieSatisfactionDate,
        ]);

        $recommendationQuestion = $satisfactionChoice1->getTargetQuestion();
        if ($recommendationQuestion) {
            $satisfactionChoice2 = $recommendationQuestion->getChoices()->filter(
                fn ($choice) => 'Oui, certainement' === $choice->getLabel()
            )->first();

            if ($satisfactionChoice2) {
                ParticipationAnswerFactory::createOne([
                    'participation' => $marieSatisfactionParticipation,
                    'choice' => $satisfactionChoice2,
                    'question' => $recommendationQuestion,
                    'answeredAt' => $marieSatisfactionDate->modify('+1 minute 30 seconds'),
                ]);
            }
        }

        $discoveryStartQuestion = $discoveryQuestionnaire->getStartQuestion();
        $marieDiscoveryDate = new \DateTimeImmutable('-2 hours');

        $marieDiscoveryParticipation = ParticipationFactory::createOne([
            'token' => bin2hex(random_bytes(32)),
            'isCompleted' => false,
            'currentQuestion' => $discoveryStartQuestion->getChoices()->first()->getTargetQuestion(),
            'updatedAt' => $marieDiscoveryDate->modify('+1 minute'),
            'questionnaire' => $discoveryQuestionnaire,
            'respondent' => $userMarie,
        ]);

        $discoveryChoice1 = $discoveryStartQuestion->getChoices()->filter(
            fn ($choice) => 'J\'ai 18 ans ou plus' === $choice->getLabel()
        )->first();

        ParticipationAnswerFactory::createOne([
            'participation' => $marieDiscoveryParticipation,
            'choice' => $discoveryChoice1,
            'question' => $discoveryStartQuestion,
            'answeredAt' => $marieDiscoveryDate,
        ]);
    }
}
