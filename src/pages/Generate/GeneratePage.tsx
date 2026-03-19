import { useState } from 'react';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './GeneratePage.module.css';

const PROMPT_TEMPLATE = `Você é um assistente especializado em criar bancos de questões para o app Questify.

Sua tarefa: receber o texto de uma prova (copiado de um PDF) e um gabarito, e gerar um JSON no formato exato do Questify.

## FORMATO JSON OBRIGATÓRIO

{
  "id": "gere um UUID v4",
  "title": "Nome da prova",
  "description": "Descrição breve",
  "subject": "Área/matéria",
  "questions": [ ... ],
  "createdAt": "data ISO atual"
}

## TIPOS DE QUESTÃO

### 1. Múltipla Escolha (multiple_choice)
{
  "id": "UUID",
  "type": "multiple_choice",
  "text": "Enunciado da questão",
  "alternatives": [
    { "id": "A", "text": "Texto da alternativa A", "explanation": "Por que esta certa/errada (opcional)" },
    { "id": "B", "text": "Texto da alternativa B" },
    { "id": "C", "text": "Texto da alternativa C" },
    { "id": "D", "text": "Texto da alternativa D" },
    { "id": "E", "text": "Texto da alternativa E" }
  ],
  "correctAnswer": "C",
  "explanation": "Explicação geral da questão (opcional)",
  "tags": ["Tópico1", "Tópico2"]
}

### 2. Verdadeiro ou Falso (true_false)
{
  "id": "UUID",
  "type": "true_false",
  "text": "Afirmativa para julgar",
  "alternatives": [
    { "id": "V", "text": "Verdadeiro" },
    { "id": "F", "text": "Falso" }
  ],
  "correctAnswer": "V",
  "tags": ["Tópico"]
}

### 3. Assertivas (assertion)
{
  "id": "UUID",
  "type": "assertion",
  "text": "Analise as afirmativas:",
  "assertions": [
    { "id": "I", "text": "Primeira afirmativa", "correct": true },
    { "id": "II", "text": "Segunda afirmativa", "correct": false },
    { "id": "III", "text": "Terceira afirmativa", "correct": true }
  ],
  "alternatives": [
    { "id": "A", "text": "Apenas I e II" },
    { "id": "B", "text": "Apenas I e III" },
    { "id": "C", "text": "Apenas II e III" },
    { "id": "D", "text": "I, II e III" }
  ],
  "correctAnswer": "B",
  "tags": ["Tópico"]
}

## REGRAS IMPORTANTES

1. Cada questão DEVE ter um "id" único (UUID v4)
2. "correctAnswer" deve ser o "id" de uma das alternativas (ex: "A", "B", "C", "D", "E", "V", "F")
3. Para questões de assertiva, o campo "correct" de cada assertiva deve ser true/false baseado no gabarito
4. Se uma questão foi ANULADA no gabarito, NÃO inclua ela
5. Tags são opcionais mas recomendadas — use o tópico/especialidade da questão
6. O campo "explanation" em cada alternativa é opcional mas muito útil para estudo
7. Gere o JSON completo e válido, sem cortar no meio
8. NÃO use acentos nos campos id/type, apenas nos textos

## INSTRUÇÕES

Agora vou colar o texto da prova e o gabarito abaixo. Gere o JSON completo:

---

`;

const STEPS = [
  {
    number: 1,
    title: 'Copie o prompt',
    description:
      'Clique no botão "Copiar Prompt" acima. Ele já contém o formato JSON completo do Questify e todas as instruções pra IA.',
  },
  {
    number: 2,
    title: 'Abra sua IA favorita',
    description:
      'ChatGPT, Claude, Gemini, Copilot... qualquer uma funciona. Quanto mais potente o modelo, melhor o resultado.',
  },
  {
    number: 3,
    title: 'Cole o prompt + prova + gabarito',
    description:
      'Cole o prompt, depois cole o texto da prova (copie do PDF) e o gabarito. A IA vai gerar o JSON completo.',
  },
  {
    number: 4,
    title: 'Copie o JSON gerado',
    description:
      'A IA vai devolver um JSON grande. Copie todo o conteúdo (do primeiro { até o último }).',
  },
  {
    number: 5,
    title: 'Importe no Questify',
    description:
      'Volte ao Questify, vá na página inicial e clique em "Importar JSON". Selecione o arquivo ou cole o conteúdo. Pronto!',
  },
];

const TIPS = [
  'Se a prova for muito grande (100+ questões), divida em partes e peça pra IA gerar em blocos',
  'Revise o JSON gerado antes de importar — a IA pode errar o gabarito',
  'Para provas com imagens, você precisará adicionar as imagens manualmente depois',
  'Se a IA cortar o JSON no meio, peca "continue de onde parou"',
  'Modelos maiores (GPT-4o, Claude Sonnet, Gemini Pro) geram JSONs mais precisos que modelos menores',
  'Você pode pedir pra IA adicionar explicações por alternativa dizendo "explique cada alternativa"',
];

export default function GeneratePage() {
  const [copied, setCopied] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = PROMPT_TEMPLATE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Sparkles size={36} />
        <div>
          <h1>Gerar Banco com IA</h1>
          <p>
            Use o ChatGPT, Claude ou qualquer IA para transformar uma prova em
            banco de questões automaticamente
          </p>
        </div>
      </div>

      {/* Prompt Section */}
      <section className={styles.promptSection}>
        <div className={styles.promptHeader}>
          <h2>Prompt pronto para copiar</h2>
          <button
            className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={18} />
                Copiado!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copiar Prompt
              </>
            )}
          </button>
        </div>

        <div className={styles.promptPreview}>
          <pre>
            {showFullPrompt
              ? PROMPT_TEMPLATE
              : PROMPT_TEMPLATE.slice(0, 400) + '\n...'}
          </pre>
          <button
            className={styles.expandBtn}
            onClick={() => setShowFullPrompt(!showFullPrompt)}
          >
            {showFullPrompt ? (
              <>
                <ChevronUp size={16} /> Recolher
              </>
            ) : (
              <>
                <ChevronDown size={16} /> Ver prompt completo
              </>
            )}
          </button>
        </div>
      </section>

      {/* Steps */}
      <section className={styles.stepsSection}>
        <h2>Como usar</h2>
        <div className={styles.steps}>
          {STEPS.map((step) => (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepContent}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className={styles.tipsSection}>
        <h2>Dicas</h2>
        <ul className={styles.tipsList}>
          {TIPS.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
