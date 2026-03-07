import PublicPage from '@/components/anesia/PublicPage';
import { useLang } from '@/contexts/LanguageContext';
import { LEGAL_CONFIG, isPlaceholderValue } from '@/config/legal';

const LAST_UPDATED = {
  fr: '7 mars 2026',
  pt: '7 de marco de 2026',
  en: 'March 7, 2026',
} as const;

export default function Terms() {
  const { lang } = useLang();
  const legalWarning =
    isPlaceholderValue(LEGAL_CONFIG.entityName) ||
    isPlaceholderValue(LEGAL_CONFIG.supportEmail) ||
    isPlaceholderValue(LEGAL_CONFIG.jurisdictionCity);

  if (lang === 'fr') {
    return (
      <PublicPage
        eyebrow="Mentions legales"
        title="Conditions generales d utilisation"
        description={`Derniere mise a jour : ${LAST_UPDATED.fr}. En utilisant AnesIA, vous acceptez les presentes conditions.`}
        sections={[
          {
            title: '1. Objet du service',
            body: (
              <div className="space-y-2">
                <p>
                  AnesIA est un outil d aide et de reference a usage educatif pour les
                  professionnels de sante en anesthesie.
                </p>
                <p>
                  Editeur : <span className="font-medium text-foreground">{LEGAL_CONFIG.entityName}</span>
                </p>
                <p>Hebergement : {LEGAL_CONFIG.hostingSummary}.</p>
                {legalWarning && <p className="text-xs italic">Finaliser les mentions legales avant lancement public.</p>}
              </div>
            ),
          },
          {
            title: '2. Avertissement medical',
            body: (
              <div className="rounded-lg border border-clinical-warning/40 bg-clinical-warning/5 p-4">
                <p className="font-semibold text-foreground">
                  AnesIA ne remplace pas les protocoles locaux, le jugement clinique, la formation
                  medicale ni l avis d un senior en situation critique.
                </p>
                <p className="mt-2">
                  Toute decision clinique reste sous la responsabilite exclusive du professionnel de
                  sante.
                </p>
              </div>
            ),
          },
          {
            title: '3. Acces et compte',
            body: (
              <div className="space-y-2">
                <p>Le service peut exiger la creation d un compte avec une adresse e-mail valide.</p>
                <p>
                  Le compte gratuit donne acces a une partie du contenu. Le niveau Pro ouvre les
                  guidelines, protocoles, ALR et fonctions avancees selon l offre en vigueur.
                </p>
                <p>L utilisateur est responsable de la confidentialite de ses identifiants.</p>
              </div>
            ),
          },
          {
            title: '4. Abonnement, resiliation et remboursement',
            body: (
              <div className="space-y-2">
                <p>
                  Les abonnements payants sont factures a l avance selon la periodicite choisie.
                </p>
                <p>
                  La resiliation prend effet a la fin de la periode deja payee, sauf obligation
                  legale contraire.
                </p>
                <p>
                  Toute politique de remboursement doit etre precisee dans les conditions
                  commerciales finales.
                </p>
              </div>
            ),
          },
          {
            title: '5. Propriete intellectuelle',
            body: (
              <p>
                Les contenus, interfaces, bases compilees et elements logiciels d AnesIA sont
                proteges. Toute reproduction ou extraction substantielle sans autorisation est
                interdite.
              </p>
            ),
          },
          {
            title: '6. Responsabilite, droit applicable et contact',
            body: (
              <div className="space-y-2">
                <p>
                  Le service est fourni en l etat, sans garantie de disponibilite continue ni
                  d absence d erreur residuelle.
                </p>
                <p>
                  Ces conditions sont regies par le droit francais. Juridiction competente :
                  {LEGAL_CONFIG.jurisdictionCity}, France.
                </p>
                <p>
                  Contact : <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
                </p>
              </div>
            ),
          },
        ]}
      />
    );
  }

  if (lang === 'pt') {
    return (
      <PublicPage
        eyebrow="Legal"
        title="Termos de Utilizacao"
        description={`Ultima atualizacao: ${LAST_UPDATED.pt}. Ao utilizar o AnesIA, aceitas estes termos.`}
        sections={[
          {
            title: '1. Objeto do servico',
            body: (
              <div className="space-y-2">
                <p>
                  O AnesIA e uma ferramenta de apoio e referencia de uso educativo para
                  profissionais de saude em anestesia.
                </p>
                <p>
                  Entidade responsavel: <span className="font-medium text-foreground">{LEGAL_CONFIG.entityName}</span>
                </p>
                {legalWarning && <p className="text-xs italic">Finaliza os dados legais antes do lancamento publico.</p>}
              </div>
            ),
          },
          {
            title: '2. Aviso medico',
            body: (
              <div className="rounded-lg border border-clinical-warning/40 bg-clinical-warning/5 p-4">
                <p className="font-semibold text-foreground">
                  O AnesIA nao substitui protocolos locais, julgamento clinico, formacao medica ou
                  apoio de especialista em situacoes urgentes.
                </p>
                <p className="mt-2">
                  Qualquer decisao clinica e da responsabilidade exclusiva do profissional de
                  saude.
                </p>
              </div>
            ),
          },
          {
            title: '3. Conta e acesso',
            body: (
              <div className="space-y-2">
                <p>A utilizacao pode exigir conta com email valido.</p>
                <p>
                  O plano gratuito tem acesso limitado. O plano Pro desbloqueia o conteudo e
                  funcionalidades avancadas definidas na oferta comercial.
                </p>
                <p>O utilizador e responsavel por guardar as credenciais em seguranca.</p>
              </div>
            ),
          },
          {
            title: '4. Subscricao e cancelamento',
            body: (
              <div className="space-y-2">
                <p>As subscricoes pagas sao cobradas antecipadamente.</p>
                <p>
                  O cancelamento produz efeito no fim do periodo pago, salvo obrigacoes legais
                  diferentes.
                </p>
              </div>
            ),
          },
          {
            title: '5. Propriedade intelectual',
            body: (
              <p>
                Os conteudos, interfaces e elementos de software do AnesIA estao protegidos. Nao e
                permitida reproducao ou extracao substancial sem autorizacao.
              </p>
            ),
          },
          {
            title: '6. Responsabilidade e lei aplicavel',
            body: (
              <div className="space-y-2">
                <p>
                  O servico e fornecido tal como esta, sem garantia de disponibilidade continua.
                </p>
                <p>
                  Estes termos regem-se pela lei francesa. Tribunal competente: {LEGAL_CONFIG.jurisdictionCity}, Franca.
                </p>
                <p>
                  Contacto: <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
                </p>
              </div>
            ),
          },
        ]}
      />
    );
  }

  return (
    <PublicPage
      eyebrow="Legal"
      title="Terms of Use"
      description={`Last updated: ${LAST_UPDATED.en}. By using AnesIA, you agree to these terms.`}
      sections={[
        {
          title: '1. Scope of the service',
          body: (
            <div className="space-y-2">
              <p>
                AnesIA is an educational support and clinical reference tool for anesthesia
                professionals.
              </p>
              <p>
                Operating entity: <span className="font-medium text-foreground">{LEGAL_CONFIG.entityName}</span>
              </p>
              {legalWarning && <p className="text-xs italic">Complete legal placeholders before public launch.</p>}
            </div>
          ),
        },
        {
          title: '2. Medical disclaimer',
          body: (
            <div className="rounded-lg border border-clinical-warning/40 bg-clinical-warning/5 p-4">
              <p className="font-semibold text-foreground">
                AnesIA does not replace local protocols, clinical judgment, formal medical
                training, or expert consultation in urgent situations.
              </p>
              <p className="mt-2">
                All clinical decisions remain the sole responsibility of the healthcare
                professional.
              </p>
            </div>
          ),
        },
        {
          title: '3. Account and access',
          body: (
            <div className="space-y-2">
              <p>Use of the service may require an account with a valid email address.</p>
              <p>
                The free plan provides limited access. Pro unlocks the additional content and
                advanced features described in the current offer.
              </p>
              <p>Users are responsible for keeping their login credentials confidential.</p>
            </div>
          ),
        },
        {
          title: '4. Subscription and cancellation',
          body: (
            <div className="space-y-2">
              <p>Paid subscriptions are billed in advance based on the selected billing cycle.</p>
              <p>
                Cancellation takes effect at the end of the paid period unless mandatory law
                requires otherwise.
              </p>
            </div>
          ),
        },
        {
          title: '5. Intellectual property',
          body: (
            <p>
              AnesIA content, interface assets, compiled knowledge base, and software elements are
              protected. Unauthorized copying or substantial extraction is prohibited.
            </p>
          ),
        },
        {
          title: '6. Liability, governing law, and contact',
          body: (
            <div className="space-y-2">
              <p>
                The service is provided as is, without any guarantee of uninterrupted availability
                or absence of residual error.
              </p>
              <p>
                These terms are governed by French law. Competent court: {LEGAL_CONFIG.jurisdictionCity}, France.
              </p>
              <p>
                Contact: <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}
