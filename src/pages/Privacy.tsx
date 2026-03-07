import PublicPage from '@/components/anesia/PublicPage';
import { useLang } from '@/contexts/LanguageContext';
import { LEGAL_CONFIG, isPlaceholderValue } from '@/config/legal';

const LAST_UPDATED = {
  fr: '7 mars 2026',
  pt: '7 de marco de 2026',
  en: 'March 7, 2026',
} as const;

export default function Privacy() {
  const { lang } = useLang();
  const legalWarning = isPlaceholderValue(LEGAL_CONFIG.entityName) || isPlaceholderValue(LEGAL_CONFIG.supportEmail);

  if (lang === 'fr') {
    return (
      <PublicPage
        eyebrow="Mentions legales"
        title="Politique de confidentialite"
        description={`Derniere mise a jour : ${LAST_UPDATED.fr}. AnesIA protege les donnees personnelles conformement au RGPD et a la loi Informatique et Libertes.`}
        sections={[
          {
            title: '1. Responsable du traitement',
            body: (
              <div className="space-y-2">
                <p>Le responsable du traitement des donnees collectees via AnesIA est :</p>
                <p className="font-medium text-foreground">{LEGAL_CONFIG.entityName}</p>
                <p>{LEGAL_CONFIG.postalAddress}</p>
                <p>
                  Contact : <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
                </p>
                {legalWarning && <p className="text-xs italic">
                  Cette section doit etre finalisee avec vos mentions legales exactes avant mise en
                  production publique.
                </p>}
              </div>
            ),
          },
          {
            title: '2. Donnees collectées',
            body: (
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-foreground">Donnees de compte</p>
                  <p>Adresse e-mail, identifiant, mot de passe chiffre et date de creation.</p>
                  <p className="text-xs">Base legale : execution du contrat (art. 6.1.b RGPD)</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Donnees d usage</p>
                  <p>
                    Pages visitees, recherches, contenus consultes et evenements d interaction.
                    Ces donnees sont pseudonymisees et servent au pilotage produit.
                  </p>
                  <p className="text-xs">Base legale : interet legitime (art. 6.1.f RGPD)</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Donnees de facturation</p>
                  <p>
                    Les paiements Pro sont traites par Stripe. AnesIA ne stocke pas de donnees de
                    carte bancaire en clair.
                  </p>
                  <p className="text-xs">Base legale : execution du contrat (art. 6.1.b RGPD)</p>
                </div>
                <p className="text-xs font-medium text-clinical-warning">
                  Aucune donnee patient identifiable ne doit etre saisie dans l application. Les
                  interactions doivent rester completement de-identifiees.
                </p>
              </div>
            ),
          },
          {
            title: '3. Finalites du traitement',
            body: (
              <ul className="list-disc list-inside space-y-1">
                <li>Authentification et gestion du compte utilisateur</li>
                <li>Acces au contenu clinique, calculateurs et parcours guides</li>
                <li>Gestion des abonnements et facturation</li>
                <li>Mesure de l usage, de la retention et de la conversion</li>
                <li>Support utilisateur et communications liees au compte</li>
              </ul>
            ),
          },
          {
            title: '4. Conservation des donnees',
            body: (
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <span className="font-medium text-foreground">Donnees de compte</span>
                <span>Duree de vie du compte + 3 ans</span>
                <span className="font-medium text-foreground">Donnees d usage</span>
                <span>24 mois glissants</span>
                <span className="font-medium text-foreground">Donnees de facturation</span>
                <span>10 ans selon les obligations comptables</span>
                <span className="font-medium text-foreground">Logs de securite</span>
                <span>12 mois</span>
              </div>
            ),
          },
          {
            title: '5. Sous-traitants et transferts',
            body: (
              <div className="space-y-2">
                <p>
                  Les donnees peuvent etre traitees par Supabase pour la base de donnees et
                  l authentification, et par Stripe pour les paiements.
                </p>
                <p>
                  Lorsque des transferts hors UE existent, ils doivent etre encadres par des
                  clauses contractuelles types ou un mecanisme equivalent.
                </p>
                <p>Aucune donnee n est vendue a des tiers.</p>
              </div>
            ),
          },
          {
            title: '6. Vos droits',
            body: (
              <div className="space-y-2">
                <p>
                  Vous disposez des droits d acces, de rectification, d effacement, de portabilite,
                  d opposition et de limitation.
                </p>
                <p>
                  Pour exercer ces droits :{' '}
                  <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
                </p>
                <p>
                  En cas de litige non resolu, vous pouvez saisir la CNIL.
                </p>
              </div>
            ),
          },
          {
            title: '7. Cookies et securite',
            body: (
              <div className="space-y-2">
                <p>
                  AnesIA utilise principalement des cookies techniques necessaires au fonctionnement
                  du service, aux preferences de langue et a la session.
                </p>
                <p>
                  Les donnees sont chiffrees en transit et l acces a la production est restreint.
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
        title="Politica de Privacidade"
        description={`Ultima atualizacao: ${LAST_UPDATED.pt}. O AnesIA trata dados pessoais de acordo com o RGPD e com principios de minimizacao de dados.`}
        sections={[
          {
            title: '1. Responsavel pelo tratamento',
            body: (
              <div className="space-y-2">
                <p className="font-medium text-foreground">{LEGAL_CONFIG.entityName}</p>
                <p>{LEGAL_CONFIG.postalAddress}</p>
                <p>
                  Contacto: <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
                </p>
                {legalWarning && <p className="text-xs italic">
                  Esta pagina precisa ainda dos teus dados legais finais antes de publicacao
                  definitiva.
                </p>}
              </div>
            ),
          },
          {
            title: '2. Dados recolhidos',
            body: (
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-foreground">Dados de conta</p>
                  <p>Email, identificador, password protegida e data de criacao da conta.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Dados de utilizacao</p>
                  <p>
                    Pesquisas, paginas vistas, procedimentos abertos e eventos de interacao
                    pseudonimizados.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Dados de faturacao</p>
                  <p>Os pagamentos sao processados pela Stripe; o AnesIA nao guarda cartoes.</p>
                </div>
                <p className="text-xs font-medium text-clinical-warning">
                  O produto nao deve ser usado para introduzir dados identificaveis do doente.
                </p>
              </div>
            ),
          },
          {
            title: '3. Finalidades',
            body: (
              <ul className="list-disc list-inside space-y-1">
                <li>Autenticacao e gestao da conta</li>
                <li>Entrega das funcionalidades clinicas e educativas</li>
                <li>Gestao de subscricoes e pagamentos</li>
                <li>Analise de uso, retencao e melhoria do produto</li>
                <li>Suporte e comunicacoes relacionadas com o servico</li>
              </ul>
            ),
          },
          {
            title: '4. Conservacao',
            body: (
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <span className="font-medium text-foreground">Dados de conta</span>
                <span>Vida da conta + 3 anos</span>
                <span className="font-medium text-foreground">Dados de utilizacao</span>
                <span>24 meses</span>
                <span className="font-medium text-foreground">Dados de faturacao</span>
                <span>10 anos, quando aplicavel por lei</span>
                <span className="font-medium text-foreground">Logs de seguranca</span>
                <span>12 meses</span>
              </div>
            ),
          },
          {
            title: '5. Direitos do titular',
            body: (
              <div className="space-y-2">
                <p>
                  Tens direito de acesso, retificacao, apagamento, portabilidade, oposicao e
                  limitacao do tratamento.
                </p>
                <p>
                  Pedido de exercicio de direitos:{' '}
                  <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
                </p>
              </div>
            ),
          },
          {
            title: '6. Cookies e seguranca',
            body: (
              <div className="space-y-2">
                <p>
                  Sao usados cookies tecnicos necessarios para sessao, autenticacao e preferencia
                  de idioma.
                </p>
                <p>Os dados sao transmitidos por ligacoes seguras e o acesso e restrito.</p>
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
      title="Privacy Policy"
      description={`Last updated: ${LAST_UPDATED.en}. AnesIA processes personal data under GDPR principles and aims to minimize what is collected.`}
      sections={[
        {
          title: '1. Data controller',
          body: (
            <div className="space-y-2">
              <p className="font-medium text-foreground">{LEGAL_CONFIG.entityName}</p>
              <p>{LEGAL_CONFIG.postalAddress}</p>
              <p>
                Contact: <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
              </p>
              {legalWarning && <p className="text-xs italic">Complete legal placeholders before public launch.</p>}
            </div>
          ),
        },
        {
          title: '2. Data we collect',
          body: (
            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground">Account data</p>
                <p>Email, login identifier, protected password, and account creation date.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Usage data</p>
                <p>
                  Search activity, viewed pages, opened procedures, and pseudonymized interaction
                  events used to improve the product.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Billing data</p>
                <p>Pro payments are handled by Stripe. AnesIA does not store raw card data.</p>
              </div>
              <p className="text-xs font-medium text-clinical-warning">
                Users should not input identifiable patient data into the product.
              </p>
            </div>
          ),
        },
        {
          title: '3. Why we process it',
          body: (
            <ul className="list-disc list-inside space-y-1">
              <li>Authentication and account management</li>
              <li>Providing clinical and educational product features</li>
              <li>Subscription and billing operations</li>
              <li>Analytics, retention measurement, and product improvement</li>
              <li>Support and account-related communications</li>
            </ul>
          ),
        },
        {
          title: '4. Retention periods',
          body: (
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <span className="font-medium text-foreground">Account data</span>
              <span>Life of the account + 3 years</span>
              <span className="font-medium text-foreground">Usage analytics</span>
              <span>24 rolling months</span>
              <span className="font-medium text-foreground">Billing records</span>
              <span>Up to 10 years where legally required</span>
              <span className="font-medium text-foreground">Security logs</span>
              <span>12 months</span>
            </div>
          ),
        },
        {
          title: '5. Your rights',
          body: (
            <div className="space-y-2">
              <p>
                You have the right to access, rectify, erase, port, object to, and restrict the
                processing of your personal data.
              </p>
              <p>
                Rights requests: <span className="text-accent">{LEGAL_CONFIG.supportEmail}</span>
              </p>
            </div>
          ),
        },
        {
          title: '6. Cookies and security',
          body: (
            <div className="space-y-2">
              <p>
                The service mainly uses technical cookies required for authentication, session
                continuity, and language preferences.
              </p>
              <p>
                Data is transmitted over secure connections and production access is restricted.
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}
