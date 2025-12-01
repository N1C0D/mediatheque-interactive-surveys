'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getIri } from '@/lib/api';
import { Questionnaire, Question, Choice } from '@/types';
import { Button, Card, CardContent, Alert, LoadingPage } from '@/components/ui';
import styles from './page.module.css';

interface TreeNode {
  question: Question;
  children: { choice: Choice; node: TreeNode | null }[];
}

export default function QuestionnaireTreePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = Number(params.id);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildTree = useCallback((questions: Question[], startQuestion: Question): TreeNode => {
    const questionMap = new Map<number, Question>();
    questions.forEach((q) => questionMap.set(q.id, q));

    const visited = new Set<number>();

    const buildNode = (question: Question): TreeNode => {
      visited.add(question.id);

      const children: { choice: Choice; node: TreeNode | null }[] = [];

      for (const choice of question.choices || []) {
        if (choice.targetQuestion) {
          const targetId = typeof choice.targetQuestion === 'object' 
            ? choice.targetQuestion.id 
            : parseInt(String(choice.targetQuestion).split('/').pop() || '0', 10);

          const targetQuestion = questionMap.get(targetId);

          if (targetQuestion && !visited.has(targetId)) {
            children.push({
              choice,
              node: buildNode(targetQuestion),
            });
          } else if (targetQuestion && visited.has(targetId)) {
            // Circular reference
            children.push({
              choice,
              node: { question: targetQuestion, children: [] },
            });
          } else {
            children.push({ choice, node: null });
          }
        } else {
          children.push({ choice, node: null });
        }
      }

      return { question, children };
    };

    return buildNode(startQuestion);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const questionnaireData = await api.getQuestionnaire(questionnaireId);
      setQuestionnaire(questionnaireData);

      if (questionnaireData.startQuestion && questionnaireData.questions) {
        const treeData = buildTree(
          questionnaireData.questions,
          questionnaireData.startQuestion
        );
        setTree(treeData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  }, [questionnaireId, buildTree]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return <LoadingPage message="Chargement de l'arbre..." />;
  }

  if (!questionnaire) {
    return (
      <div className={styles.container}>
        <Alert variant="error">Questionnaire non trouvé</Alert>
        <Button onClick={() => router.push('/admin')}>Retour</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/admin">Administration</Link>
        <span>/</span>
        <Link href={`/admin/questionnaires/${questionnaireId}`}>{questionnaire.title}</Link>
        <span>/</span>
        <span>Arbre de décision</span>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>Arbre de décision</h1>
        <p className={styles.subtitle}>{questionnaire.title}</p>
      </header>

      {error && (
        <Alert variant="error" onClose={() => setError(null)} className={styles.alert}>
          {error}
        </Alert>
      )}

      {!questionnaire.startQuestion ? (
        <Card>
          <CardContent>
            <div className={styles.noStart}>
              <p>Aucune question de départ n'est définie.</p>
              <Link href={`/admin/questionnaires/${questionnaireId}`}>
                <Button>Configurer le questionnaire</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : !tree ? (
        <Card>
          <CardContent>
            <p className={styles.noTree}>Impossible de construire l'arbre de décision.</p>
          </CardContent>
        </Card>
      ) : (
        <div className={styles.treeContainer}>
          <TreeNodeComponent node={tree} questionnaireId={questionnaireId} level={0} />
        </div>
      )}

      <div className={styles.legend}>
        <h3>Légende</h3>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon} style={{ background: '#6366f1' }}></span>
            <span>Question</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon} style={{ background: '#f59e0b' }}></span>
            <span>Fin du questionnaire (message final)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon} style={{ background: '#ecfdf5', border: '1px solid #10b981' }}></span>
            <span>Choix → Question suivante</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TreeNodeComponentProps {
  node: TreeNode;
  questionnaireId: number;
  level: number;
}

function TreeNodeComponent({ node, questionnaireId, level }: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(level < 3);

  const hasChildren = node.children.length > 0;
  const isTerminalQuestion = !hasChildren;

  return (
    <div className={styles.treeNode}>
      <div className={styles.questionNode}>
        <button
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasChildren}
        >
          {hasChildren && (isExpanded ? '−' : '+')}
        </button>
        <Link
          href={`/admin/questionnaires/${questionnaireId}/questions/${node.question.id}`}
          className={styles.questionLink}
        >
          <div className={`${styles.questionContent} ${isTerminalQuestion ? styles.terminalQuestion : ''}`}>
            <span className={`${styles.questionBadge} ${isTerminalQuestion ? styles.terminalBadge : ''}`}>
              {isTerminalQuestion ? 'FIN' : `Q${node.question.id}`}
            </span>
            <span className={styles.questionText}>
              {node.question.content.length > 60
                ? node.question.content.substring(0, 60) + '...'
                : node.question.content}
            </span>
            {node.question.mediaFilename && (
              <span className={styles.mediaBadge}>
                {node.question.mediaType === 'video' ? '🎬' : '🖼️'}
              </span>
            )}
          </div>
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <div className={styles.choicesContainer}>
          {node.children.map(({ choice, node: childNode }, index) => (
            <div key={choice.id} className={styles.choiceBranch}>
              <div className={styles.connector}>
                <div className={styles.verticalLine}></div>
                <div className={styles.horizontalLine}></div>
              </div>
              <div className={styles.choiceNode}>
                <span
                  className={`${styles.choiceLabel} ${!childNode ? styles.endChoice : ''}`}
                >
                  {choice.label}
                  {!choice.targetQuestion && (
                    <span className={styles.endBadge}>FIN</span>
                  )}
                </span>
              </div>
              {childNode && (
                <TreeNodeComponent
                  node={childNode}
                  questionnaireId={questionnaireId}
                  level={level + 1}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
