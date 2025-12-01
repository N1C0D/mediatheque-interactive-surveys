import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Bienvenue à la <span className={styles.highlight}>Médiathèque</span>
        </h1>
        <p className={styles.subtitle}>
          Découvrez nos questionnaires interactifs pour mieux vous orienter, 
          partager vos avis ou simplement apprendre en vous amusant !
        </p>
        <div className={styles.ctas}>
          <Link href="/questionnaires" className={styles.primaryCta}>
            Voir les questionnaires
          </Link>
          <Link href="/register" className={styles.secondaryCta}>
            Créer un compte
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📋</div>
          <h3>Questionnaires interactifs</h3>
          <p>Répondez à des questionnaires personnalisés qui s'adaptent à vos choix</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>💾</div>
          <h3>Sauvegarde automatique</h3>
          <p>Reprenez votre questionnaire là où vous l'avez laissé</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🎯</div>
          <h3>Parcours personnalisés</h3>
          <p>Chaque réponse vous guide vers un contenu adapté</p>
        </div>
      </section>
    </div>
  );
}
