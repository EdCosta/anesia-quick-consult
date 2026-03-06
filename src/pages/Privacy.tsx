import PublicPage from '@/components/anesia/PublicPage';
import { useLang } from '@/contexts/LanguageContext';

export default function Privacy() {
  const { lang } = useLang();

  const copy =
    lang === 'fr'
      ? {
          title: 'Confidentialite',
          description: 'Base de politique de confidentialite a completer avec vos mentions legales finales.',
          sections: [
            {
              title: 'Donnees patient',
              body: 'Le produit ne doit pas stocker de donnees patient identifiables. Les interactions IA doivent rester de-identifiees.',
            },
            {
              title: 'Donnees compte',
              body: 'Les donnees compte servent a l authentification, aux droits d acces et a la personnalisation de l experience.',
            },
          ],
        }
      : lang === 'pt'
        ? {
            title: 'Privacidade',
            description: 'Base de politica de privacidade para completares com texto legal final.',
            sections: [
              {
                title: 'Dados do doente',
                body: 'O produto nao deve guardar dados identificaveis do doente. As interacoes com IA devem ser desidentificadas.',
              },
              {
                title: 'Dados de conta',
                body: 'Os dados de conta servem para autenticacao, permissao de acesso e personalizacao da experiencia.',
              },
            ],
          }
        : {
            title: 'Privacy',
            description: 'A starter privacy page to complete with your final legal language.',
            sections: [
              {
                title: 'Patient data',
                body: 'The product should not store identifiable patient data. AI interactions should remain de-identified.',
              },
              {
                title: 'Account data',
                body: 'Account data is used for authentication, entitlement checks, and experience personalization.',
              },
            ],
          };

  return (
    <PublicPage
      eyebrow={lang === 'fr' ? 'Legal' : lang === 'pt' ? 'Legal' : 'Legal'}
      title={copy.title}
      description={copy.description}
      sections={copy.sections.map((section) => ({
        title: section.title,
        body: <p>{section.body}</p>,
      }))}
    />
  );
}
