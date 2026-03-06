import PublicPage from '@/components/anesia/PublicPage';
import { useLang } from '@/contexts/LanguageContext';

export default function About() {
  const { lang } = useLang();

  const copy =
    lang === 'fr'
      ? {
          title: 'A propos d AnesIA',
          description:
            'AnesIA organise contenu clinique, calculateurs et support de decision rapide dans une interface plus lisible pour le bloc et la consultation.',
          sections: [
            {
              title: 'Mission',
              body: 'Rendre la consultation anesthesique plus rapide, plus structuree et plus partageable.',
            },
            {
              title: 'Positionnement',
              body: 'Le produit se place entre la fiche memoire, la base de connaissances clinique et le cockpit operatoire personnalise.',
            },
          ],
        }
      : lang === 'pt'
        ? {
            title: 'Sobre o AnesIA',
            description:
              'O AnesIA organiza conteudo clinico, calculadoras e apoio rapido a decisao numa interface mais clara para bloco e consulta.',
            sections: [
              {
                title: 'Missao',
                body: 'Tornar a consulta anestesica mais rapida, estruturada e facil de partilhar.',
              },
              {
                title: 'Posicionamento',
                body: 'O produto fica entre ficha rapida, base de conhecimento clinica e cockpit operatorio personalizado.',
              },
            ],
          }
        : {
            title: 'About AnesIA',
            description:
              'AnesIA organizes clinical content, calculators, and fast decision support into a cleaner interface for consult and OR use.',
            sections: [
              {
                title: 'Mission',
                body: 'Make anesthesia consultation faster, more structured, and easier to share.',
              },
              {
                title: 'Positioning',
                body: 'The product sits between a quick-reference sheet, a clinical knowledge base, and a personalized OR cockpit.',
              },
            ],
          };

  return (
    <PublicPage
      eyebrow="AnesIA"
      title={copy.title}
      description={copy.description}
      sections={copy.sections.map((section) => ({
        title: section.title,
        body: <p>{section.body}</p>,
      }))}
    />
  );
}
