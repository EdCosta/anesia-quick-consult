import PublicPage from '@/components/anesia/PublicPage';
import { useLang } from '@/contexts/LanguageContext';

export default function Contact() {
  const { lang } = useLang();

  const copy =
    lang === 'fr'
      ? {
          title: 'Contact',
          description: 'Page de contact simple pour support, retours produit et demandes hopital.',
          sections: [
            {
              title: 'Support produit',
              body: 'Pour un acces, une question de contenu ou un bug, creez un canal support dedie ou reliez cette page a votre email de support.',
            },
            {
              title: 'Demandes hopital',
              body: 'Le mode hopital merite un onboarding specifique: formulary, protocoles locaux, acces et validation de contenu.',
            },
          ],
        }
      : lang === 'pt'
        ? {
            title: 'Contacto',
            description: 'Pagina simples para suporte, feedback de produto e pedidos hospitalares.',
            sections: [
              {
                title: 'Suporte de produto',
                body: 'Para acesso, duvidas de conteudo ou bugs, liga esta pagina a um email ou canal de suporte dedicado.',
              },
              {
                title: 'Pedidos hospitalares',
                body: 'O modo hospital deve ter onboarding proprio: formulario, protocolos locais, acessos e validacao de conteudo.',
              },
            ],
          }
        : {
            title: 'Contact',
            description: 'A simple contact page for support, product feedback, and hospital onboarding.',
            sections: [
              {
                title: 'Product support',
                body: 'Connect this page to a dedicated support email or channel for access issues, bugs, or content questions.',
              },
              {
                title: 'Hospital requests',
                body: 'Hospital mode deserves dedicated onboarding for formulary, protocol overrides, access, and content validation.',
              },
            ],
          };

  return (
    <PublicPage
      eyebrow={lang === 'fr' ? 'Support' : lang === 'pt' ? 'Suporte' : 'Support'}
      title={copy.title}
      description={copy.description}
      sections={copy.sections.map((section) => ({
        title: section.title,
        body: <p>{section.body}</p>,
      }))}
    />
  );
}
