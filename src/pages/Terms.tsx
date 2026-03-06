import PublicPage from '@/components/anesia/PublicPage';
import { useLang } from '@/contexts/LanguageContext';

export default function Terms() {
  const { lang } = useLang();

  const copy =
    lang === 'fr'
      ? {
          title: 'Conditions d utilisation',
          description: 'Base de conditions a faire valider juridiquement avant publication finale.',
          sections: [
            {
              title: 'Usage',
              body: 'AnesIA fournit du contenu d aide et ne remplace ni les protocoles locaux ni le jugement clinique.',
            },
            {
              title: 'Acces et abonnement',
              body: 'Certaines fonctions dependent d un compte, d un abonnement Pro ou d un profil hopital actif.',
            },
          ],
        }
      : lang === 'pt'
        ? {
            title: 'Termos de utilizacao',
            description: 'Base de termos para validacao juridica antes de publicacao final.',
            sections: [
              {
                title: 'Utilizacao',
                body: 'O AnesIA fornece apoio de conteudo e nao substitui protocolos locais nem julgamento clinico.',
              },
              {
                title: 'Acesso e subscricao',
                body: 'Algumas funcoes dependem de conta, subscricao Pro ou perfil hospitalar ativo.',
              },
            ],
          }
        : {
            title: 'Terms of use',
            description: 'A starter terms page to complete with final legal review before publication.',
            sections: [
              {
                title: 'Usage',
                body: 'AnesIA provides support content and does not replace local protocols or clinical judgment.',
              },
              {
                title: 'Access and subscription',
                body: 'Some features depend on account access, Pro subscription, or an active hospital profile.',
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
