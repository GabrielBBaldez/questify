import {
  BookOpen,
  CheckCircle2,
  Shuffle,
  Tags,
  BarChart3,
  Download,
  Upload,
  Image,
  HelpCircle,
  Smartphone,
  Monitor,
  Tablet,
  MessageCircle,
  ListChecks,
  ClipboardCheck,
  FileText,
  Settings,
  Search,
  Star,
} from 'lucide-react';
import styles from './HelpPage.module.css';

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  content: string;
  tips?: string[];
}

const sections: HelpSection[] = [
  {
    icon: <BookOpen size={24} />,
    title: 'O que é o Questify?',
    content:
      'O Questify é um aplicativo gratuito para estudar para concursos, residência médica, ENEM, certificações e qualquer tipo de prova. Você cria bancos de questões, treina nos diferentes modos e acompanha sua evolução ao longo do tempo.',
    tips: [
      'Funciona 100% offline após o primeiro acesso',
      'Seus dados ficam salvos no seu dispositivo',
      'Não precisa de login ou cadastro',
    ],
  },
  {
    icon: <FileText size={24} />,
    title: 'Tipos de Questão',
    content:
      'O app suporta 3 tipos de questão que cobrem os formatos mais usados em concursos e provas:',
    tips: [
      'Múltipla Escolha — A, B, C, D ou E. O formato clássico de concurso',
      'Verdadeiro ou Falso — Uma afirmativa que deve ser julgada como verdadeira ou falsa',
      'Assertivas — Afirmativas I, II, III com alternativas combinando quais são corretas (ex: "Apenas I e III")',
    ],
  },
  {
    icon: <ClipboardCheck size={24} />,
    title: 'Modos de Treino',
    content:
      'Ao iniciar um treino, você escolhe um dos 3 modos:',
    tips: [
      'Simulado — Responde todas as questões e vê o resultado só no final. Pode voltar e alterar respostas. Ideal para simular a prova real',
      'Estudo — Recebe feedback imediato após cada questão (certo ou errado). Bom para o dia a dia de estudo',
      'Revisão — Além do feedback, mostra a explicação de cada alternativa. Perfeito para entender seus erros',
      'Em todos os modos, você pode Pular uma questão. Questões puladas não contam na sua pontuação (nem como certa nem como errada)',
    ],
  },
  {
    icon: <Settings size={24} />,
    title: 'Configurações de Treino',
    content:
      'Antes de começar, você pode personalizar o treino:',
    tips: [
      'Embaralhar questões — Muda a ordem das questões aleatoriamente a cada treino',
      'Embaralhar alternativas — Muda a posição das alternativas para não decorar a letra',
      'Limitar questões — Escolha quantas questões quer fazer (ex: 30 de um banco de 200)',
    ],
  },
  {
    icon: <ListChecks size={24} />,
    title: 'Criando um Banco de Questões',
    content:
      'Na página "Criar", você monta seu banco de questões do zero:',
    tips: [
      'Dê um título e descrição para o banco',
      'Adicione questões uma a uma, escolhendo o tipo de cada uma',
      'Marque a alternativa correta',
      'Opcionalmente: adicione explicação por alternativa, tags e imagem',
    ],
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: 'Explicação por Alternativa',
    content:
      'Cada alternativa pode ter sua própria explicação — não só a questão como um todo. No modo Revisão, você vê por que cada alternativa está certa ou errada, o que ajuda muito na aprendizagem.',
  },
  {
    icon: <Tags size={24} />,
    title: 'Tags (Tópicos)',
    content:
      'Você pode adicionar tags (tópicos) em cada questão para organizar por assunto. Na página de consulta, pode buscar e filtrar por tags específicas.',
    tips: [
      'Digite a tag e pressione Enter ou virgula para adicionar',
      'Exemplos: "Cardiologia", "Direito Constitucional", "Java Collections"',
    ],
  },
  {
    icon: <Image size={24} />,
    title: 'Imagens nas Questões',
    content:
      'Cada questão pode ter uma imagem anexada — útil para gráficos, tabelas, exames de imagem ou enunciados escaneados. A imagem é salva dentro do JSON, então funciona offline.',
  },
  {
    icon: <Search size={24} />,
    title: 'Consulta de Questões',
    content:
      'Na página inicial, clique em "Consultar" em qualquer banco para abrir o modo de consulta. Você pode buscar por palavra-chave no enunciado, alternativas, tags ou explicações. Ideal para revisar questões específicas.',
  },
  {
    icon: <Star size={24} />,
    title: 'Favoritar Questões',
    content:
      'Clique na estrela ao lado de qualquer questão para marcá-la como favorita. Os favoritos ficam salvos e você pode acessá-los a qualquer momento.',
    tips: [
      'Favorite durante o treino, na revisão pós-quiz ou na consulta',
      'Na consulta, use o botão de estrela na barra de busca para filtrar e ver só as favoritas',
      'Os favoritos são salvos por banco — cada banco tem sua lista independente',
      'Clique na estrela novamente para remover dos favoritos',
    ],
  },
  {
    icon: <Shuffle size={24} />,
    title: 'Embaralhamento',
    content:
      'O embaralhamento usa o algoritmo Fisher-Yates para garantir aleatoriedade real. Cada vez que você inicia um treino com embaralhamento ativado, a ordem das questões e alternativas será completamente diferente.',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Histórico e Evolução',
    content:
      'A página de Histórico mostra todos os seus resultados anteriores. Você pode:',
    tips: [
      'Ver estatísticas gerais: total de tentativas, média, melhor resultado, tempo médio',
      'Filtrar por banco de questões e por modo de treino',
      'Visualizar um gráfico de evolução mostrando se você está melhorando',
    ],
  },
  {
    icon: <Download size={24} />,
    title: 'Exportar Banco de Questões',
    content:
      'Na página inicial, clique no botão de download em qualquer banco para exportar como arquivo JSON. Você pode salvar como backup ou compartilhar com colegas de estudo.',
  },
  {
    icon: <Upload size={24} />,
    title: 'Importar Banco de Questões',
    content:
      'Na página inicial, clique em "Importar JSON" para carregar um banco de questões. O app valida o arquivo automaticamente e avisa se houver algum problema no formato.',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Instalar no Celular',
    content:
      'O Questify é um PWA (Progressive Web App) — funciona como app nativo no seu celular:',
    tips: [
      'Android: Abra no Chrome, toque nos 3 pontinhos e depois em "Instalar aplicativo"',
      'iPhone: Abra no Safari, toque em Compartilhar e depois em "Adicionar a Tela de Início"',
    ],
  },
  {
    icon: <Tablet size={24} />,
    title: 'Instalar no Tablet',
    content:
      'O mesmo processo do celular funciona no tablet. Após instalar, o app abre em tela cheia como um aplicativo nativo, sem barra do navegador.',
  },
  {
    icon: <Monitor size={24} />,
    title: 'Usar no Computador',
    content:
      'No computador, acesse pelo navegador normalmente. No Chrome, você pode clicar no ícone de instalação na barra de endereço para instalar como app no desktop.',
  },
  {
    icon: <MessageCircle size={24} />,
    title: 'Dicas para Estudar Melhor',
    content:
      'Algumas sugestões para aproveitar ao máximo o app:',
    tips: [
      'Comece no modo Revisão para aprender o conteúdo e entender seus erros',
      'Depois passe para o modo Estudo no dia a dia para fixar',
      'Use o modo Simulado periodicamente para testar seu nível real',
      'Use o botão Pular quando não souber a resposta — é melhor pular do que chutar!',
      'Sempre ative o embaralhamento para não decorar a ordem',
      'Acompanhe o gráfico de evolução para ver seu progresso',
      'Favorite as questões que errou para revisar depois na consulta',
      'Exporte seus bancos para ter backup!',
    ],
  },
];

export default function HelpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <HelpCircle size={36} />
        <div>
          <h1>Como usar o Questify</h1>
          <p>Tudo que você precisa saber para aproveitar o app ao máximo</p>
        </div>
      </div>

      <nav className={styles.toc}>
        <h2>Índice</h2>
        <ul>
          {sections.map((section, i) => (
            <li key={i}>
              <button
                type="button"
                className={styles.tocLink}
                onClick={() => {
                  document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.sections}>
        {sections.map((section, i) => (
          <section key={i} id={`section-${i}`} className={styles.section}>
            <div className={styles.sectionIcon}>{section.icon}</div>
            <div className={styles.sectionContent}>
              <h2>{section.title}</h2>
              <p>{section.content}</p>
              {section.tips && (
                <ul className={styles.tips}>
                  {section.tips.map((tip, j) => (
                    <li key={j}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
