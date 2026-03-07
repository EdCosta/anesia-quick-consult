import PublicPage from '@/components/anesia/PublicPage';
import { useLang } from '@/contexts/LanguageContext';
import { LEGAL_CONFIG } from '@/config/legal';

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
                body: `Pour un acces, une question de contenu ou un bug, contactez ${LEGAL_CONFIG.supportEmail}.`,
              },
              {
                title: 'Demandes hopital',
                body: `Le mode hopital merite un onboarding specifique: formulary, protocoles locaux, acces et validation de contenu. Contact dedié: ${LEGAL_CONFIG.hospitalSalesEmail}.`,
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
                body: `Para acesso, duvidas de conteudo ou bugs, usa ${LEGAL_CONFIG.supportEmail}.`,
              },
              {
                title: 'Pedidos hospitalares',
                body: `O modo hospital deve ter onboarding proprio: formulario, protocolos locais, acessos e validacao de conteudo. Contacto dedicado: ${LEGAL_CONFIG.hospitalSalesEmail}.`,
              },
            ],
          }
        : {
            title: 'Contact',
            description: 'A simple contact page for support, product feedback, and hospital onboarding.',
            sections: [
              {
                title: 'Product support',
                body: `For access issues, bugs, or content questions, contact ${LEGAL_CONFIG.supportEmail}.`,
              },
              {
                title: 'Hospital requests',
                body: `Hospital mode deserves dedicated onboarding for formulary, protocol overrides, access, and content validation. Dedicated contact: ${LEGAL_CONFIG.hospitalSalesEmail}.`,
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
