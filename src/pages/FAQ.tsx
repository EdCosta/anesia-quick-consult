import PublicPage from '@/components/anesia/PublicPage';
import { useLang } from '@/contexts/LanguageContext';

export default function FAQ() {
  const { lang } = useLang();

  const copy =
    lang === 'fr'
      ? {
          title: 'Questions frequentes',
          description: 'Les reponses aux questions produit, usage clinique et abonnement.',
          sections: [
            {
              title: 'Est-ce un dispositif medical ?',
              body: 'Non. AnesIA est un support educatif et operationnel. Les decisions restent sous responsabilite clinique locale.',
            },
            {
              title: 'Pourquoi une partie du contenu est-elle limitee ?',
              body: 'Le mode gratuit montre le fonctionnement general. Le mode Pro debloque la profondeur clinique, les references et les contenus avances.',
            },
            {
              title: 'A quoi sert le mode hopital ?',
              body: 'Il permet de filtrer selon un profil hospitalier, un formulaire local et des overrides de protocole.',
            },
          ],
        }
      : lang === 'pt'
        ? {
            title: 'Perguntas frequentes',
            description: 'Respostas para produto, utilizacao clinica e subscricao.',
            sections: [
              {
                title: 'Isto e um dispositivo medico?',
                body: 'Nao. O AnesIA e uma ferramenta de apoio educativo e operacional. A decisao clinica continua local.',
              },
              {
                title: 'Porque e que parte do conteudo esta limitada?',
                body: 'O modo gratuito mostra o funcionamento base. O modo Pro desbloqueia profundidade clinica, referencias e conteudo avancado.',
              },
              {
                title: 'Para que serve o modo hospital?',
                body: 'Permite filtrar por perfil hospitalar, formulario local e overrides de protocolo.',
              },
            ],
          }
        : {
            title: 'Frequently asked questions',
            description: 'Answers for product usage, clinical context, and subscription model.',
            sections: [
              {
                title: 'Is this a medical device?',
                body: 'No. AnesIA is an educational and operational support tool. Clinical decisions remain local and professional.',
              },
              {
                title: 'Why is some content limited?',
                body: 'Free mode demonstrates the product. Pro unlocks deeper clinical content, references, and advanced sections.',
              },
              {
                title: 'What is hospital mode for?',
                body: 'It filters content with a hospital profile, local formulary, and protocol overrides.',
              },
            ],
          };

  return (
    <PublicPage
      eyebrow="FAQ"
      title={copy.title}
      description={copy.description}
      sections={copy.sections.map((section) => ({
        title: section.title,
        body: <p>{section.body}</p>,
      }))}
    />
  );
}
