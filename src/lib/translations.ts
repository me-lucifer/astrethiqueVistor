
export const translations = {
    en: {
        // Header
        navHome: "Home",
        navDiscover: "Discover",
        navConferences: "Conferences",
        navHowItWorks: "How It Works",
        navContentHub: "Content Hub",
        navSupport: "Support",
        login: "Login",
        register: "Register",
        visitor: "Visitor",
        client: "Client",

        // Hero
        heroHeadline: "Guidance you can feel good about.",
        heroSub: "Speak with vetted consultants by chat, audio, or video — pay per minute, budget-friendly, and GDPR-respectful.",
        startNow: "Start Now",
        checkHoroscope: "Check Free Daily Horoscope",
        heroTiny: "Transparent per-minute pricing. Optional monthly ‘Budget Lock’.",

        // Value Pillars
        valueHeadline: "Clarity and Control, by Design.",
        valueSub: "Our commitment to ethical, transparent practices empowers you to connect with confidence.",
        pillar1Title: "Per-Consultant Rate",
        pillar1Desc: "Each expert sets a clear €/min rate shown before you start.",
        pillar2Title: "Prepaid Wallet & Live Meter",
        pillar2Desc: "Top up once, watch your remaining minutes in real time.",
        pillar3Title: "Optional Budget Lock",
        pillar3Desc: "Cap monthly spend; enable one emergency top-up if needed.",

        // Categories
        catHeadline: "Find the Right Guidance, Faster.",
        catSub: "Focus on what matters most to you right now. Our consultants cover a wide range of life's challenges and questions.",
        catLove: "Love",
        catLoveDesc: "Focused guidance on relationships.",
        catWork: "Work",
        catWorkDesc: "Focused guidance on career.",
        catHealth: "Health",
        catHealthDesc: "Focused guidance on well-being.",
        catMoney: "Money",
        catMoneyDesc: "Focused guidance on finances.",

        // Consultants
        consultantHeadline: "Connect with a Trusted Expert",
        consultantSub: "Our consultants are here to provide clarity and support, whenever you need it.",

        // Conferences
        confHeadline: "Upcoming Conferences",
        confSub: "Join live events hosted by our experts to deepen your understanding.",

        // Content
        contentHeadline: "Insights from our Content Hub",
        contentSub: "Explore articles and podcasts from our experts to gain clarity and perspective.",

        // Trust
        trustPillar1: "Admin-approved & KYC-verified consultants",
        trustPillar2: "GDPR-compliant data",
        trustPillar3: "Transparent pricing before you start",
        learnMore: "Learn more",

        // Footer
        copyright: "© 2025 ASTRETHIQUE. All rights reserved.",
        legalHub: "Legal Hub",
        pricing: "Pricing",
        privacy: "Privacy (GDPR)",
        terms: "Terms",
        support: "Support",
        
        // Privacy Policy Page
        privacyPolicy: {
            title: "Privacy Policy (GDPR)",
            lastUpdated: "Last updated",
            printDownload: "Print / Download PDF",
            toc: "On this page",
            dataController: {
                title: "Data Controller",
                content: ["The entity responsible for your data is:", "ASTRETHIQUE LTD, 221B Baker Street, London NW1 6XE, UK. privacy@astrethique.com"],
                address: "Address",
                email: "Email"
            },
            dataWeCollect: {
                title: "Data We Collect",
                intro: "We collect information necessary to provide our services:",
                accountInfo: { title: "Account Information", text: "Name, email, and preferences you provide." },
                kyc: { title: "KYC Signals", text: "Verification status signals for consultants (we do not store the documents)." },
                usage: { title: "Usage & Device Data", text: "How you interact with our service and technical data about your device." },
                payments: { title: "Payments", text: "Transaction data is handled by our payment provider; we only store transaction confirmations." },
                content: { title: "Content/Posts", text: "Any content you publicly post, like comments or reviews." }
            },
            whyWeProcess: {
                title: "Why We Process Your Data (Legal Bases)",
                intro: "We process your data based on the following legal grounds:",
                contract: { title: "To Fulfill a Contract", text: "To provide the core services you signed up for." },
                consent: { title: "Consent", text: "For optional services like marketing emails, where you have given explicit permission." },
                legitInterests: { title: "Legitimate Interests", text: "To improve our service, prevent fraud, and for analytics, balanced against your rights." },
                legalObligation: { title: "Legal Obligation", text: "To comply with legal requirements like financial regulations." }
            },
            internationalTransfers: {
                title: "International Transfers",
                content: ["Your data may be processed outside of your country. We ensure its protection through safeguards like Standard Contractual Clauses (SCCs) and the UK's International Data Transfer Agreement (IDTA)."]
            },
            dataRetention: {
                title: "Data Retention",
                intro: "We retain data only for as long as necessary.",
                table: {
                    category: "Data Category",
                    window: "Retention Window",
                    rows: [
                        { category: "Core Account Data", window: "Duration of account + 1 year" },
                        { category: "Session Records", window: "7 years for financial records" },
                        { category: "Support Tickets", window: "3 years after resolution" },
                        { category: "Usage Logs", window: "1 year (anonymized)" }
                    ]
                }
            },
            yourRights: {
                title: "Your Rights",
                intro: "Under GDPR, you have the right to:",
                rightsList: ["Access your data", "Rectify incorrect data", "Erase your data ('right to be forgotten')", "Data portability", "Restrict processing", "Object to processing"],
                howToExercise: {
                    title: "How to Exercise Your Rights",
                    text: ["To exercise any of these rights, please contact us at"]
                }
            },
            otherInfo: {
                title: "Other Information",
                agePolicy: { title: "Age Policy", text: "Our services are intended for individuals aged 18 and over." },
                cookies: { title: "Cookies", text: ["We use cookies to operate and improve our site. For details, see our"], linkText: "Cookie Policy" },
                policyChanges: { title: "Changes to This Policy", text: "We will notify you of any significant changes to this policy via email or a notice on our platform." },
                contact: { title: "Contact DPO", text: ["For any privacy-specific concerns, you can contact our Data Protection Officer at"] }
            },
            footer: { text: "Questions about this policy? Email" }
        },
        
        // Terms of Service Page
        termsOfService: {
            title: "Terms of Service",
            lastUpdated: "Last updated",
            toc: "On this page",
            eligibility: { title: "Eligibility & Account", content: "You must be 18 or older to use our services. You are responsible for your account and may be asked to complete identity verification (KYC)." },
            disclaimer: { title: "Not Professional Advice", content: "Services are for guidance and are not a substitute for professional medical, legal, or financial advice. Not for emergencies." },
            platform: { title: "Using ASTRETHIQUE", content: "Consultants are independent providers. Conferences and podcasts may be hosted on third-party platforms." },
            billing: { title: "Wallet & Billing", content: "All sessions are billed per minute from your prepaid wallet. You are responsible for any applicable taxes (e.g., VAT). See our", link: "Refunds Policy" },
            content: { title: "Content Ownership", content: "You own the content you upload, but you grant us a license to display it on our platform." },
            conduct: { title: "Prohibited Conduct", content: "Harassment, hate speech, illegal activities, making unsubstantiated medical or legal claims, and spam are strictly prohibited." },
            termination: { title: "Suspension & Termination", content: "We reserve the right to suspend or terminate accounts that violate these terms." },
            governingLaw: { title: "Governing Law", content: "These terms are governed by the laws of the United Kingdom." },
            contact: { title: "Contact", content: "For questions about these terms, contact us at" },
            footer: { text: "Questions about this policy? Email" }
        },

        // Pricing & Fees Page
        pricingAndFees: {
            title: "Pricing & Fees",
            lastUpdated: "Last updated",
            toc: "On this page",
            model: { title: "Per-Minute Rate", content: "Each consultant sets their own per-minute rate, which is clearly displayed on their profile and before you start a session. You only pay for the time you are connected." },
            wallet: { title: "Wallet & Top-Ups", content: "Our platform operates on a prepaid wallet system. You top up your wallet with funds (e.g., in EUR, USD), and session costs are deducted in real-time. An invoice is sent to your email after every session." },
            fees: { title: "Platform & Processing Fees", content: ["A small fee is included in the consultant's rate to cover payment processing and maintain our platform.", "Any applicable taxes like VAT or GST will be clearly indicated during the top-up process."] },
            example: { 
                title: "Example Cost Calculation",
                intro: "Here are a few examples of how session costs are calculated:",
                table: {
                    duration: "Session Duration",
                    rate: "Consultant Rate",
                    cost: "Total Cost"
                },
                note: "Billing is calculated to the second and rounded to the nearest cent."
            },
            footer: { 
                text: "For more details, see our Terms of Service and Refunds Policy.",
                textWithEmail: "Questions about this policy? Email",
            }
        },

        // Cookie Policy Page
        cookiePolicy: {
            title: "Cookie Policy",
            lastUpdated: "Last updated",
            toc: "On this page",
            whatAreCookies: {
                title: "What Are Cookies?",
                content: "Cookies are small text files stored on your device that help our website function and remember your preferences. They are standard for most modern websites."
            },
            howWeUse: {
                title: "How We Use Cookies",
                intro: "We use cookies for several purposes:",
                essential: { title: "Strictly Necessary", text: "These are required for core site functionality, like keeping you logged in." },
                analytics: { title: "Analytics", text: "These help us understand how visitors use our site so we can improve it. This data is aggregated and anonymous." },
                preferences: { title: "Preferences", text: "These remember your choices, like your preferred language, to personalize your experience." }
            },
            managing: {
                title: "Managing Your Preferences",
                content: "You can change your cookie preferences at any time. Adjusting your settings may impact your experience on our site.",
                buttonText: "Manage Cookie Settings"
            },
            footer: { 
                text: "For more information on how we handle your data, please see our",
                linkText: "Privacy Policy",
                textWithEmail: "Questions about this policy? Email"
             }
        },
        
        // Refunds & Cancellations Page
        refundsAndCancellations: {
            title: "Refunds & Cancellations",
            lastUpdated: "Last updated",
            toc: "On this page",
            consultantNoShow: {
                title: "Consultant No-Show",
                content: "If a consultant fails to attend a scheduled session, you are entitled to a full refund to your wallet or the option to reschedule. Please contact support to initiate this process."
            },
            userCancellations: {
                title: "User Cancellations",
                content: "You may cancel a scheduled session for a full refund up to 24 hours before the start time. Cancellations made within 24 hours of the session are non-refundable."
            },
            technicalFailures: {
                title: "Technical Failures",
                content: "If a session is significantly disrupted due to technical issues on our platform or the consultant's end, we will review the case and may issue a partial or full refund on a case-by-case basis."
            },
            conferences: {
                title: "Conferences",
                content: "Conferences are hosted by independent consultants on external platforms (e.g., Zoom). As such, any refunds or cancellations are governed by the host's individual policy. ASTRETHIQUE is not responsible for these transactions."
            },
            howToRequest: {
                title: "How to Request a Refund",
                content: "All refund requests must be sent via email to our support team. Please include the session date, time, and the consultant's name in your request."
            },
            footer: { text: "Questions about this policy? Email" }
        },

        // Community Guidelines Page
        communityGuidelines: {
            title: "Content & Community Guidelines",
            lastUpdated: "Last updated",
            toc: "On this page",
            respectfulConduct: {
                title: "Be Respectful",
                content: "Our community is built on trust and mutual respect. Harassment, hate speech, bullying, or any illegal content is strictly prohibited across all profiles, comments, articles, and sessions."
            },
            professionalBoundaries: {
                title: "Professional Boundaries",
                content: "Consultants must not present spiritual guidance as medical, legal, or financial fact. Always use appropriate disclaimers and encourage users to seek licensed professional help for such matters."
            },
            authenticity: {
                title: "Authenticity",
                content: "Do not misrepresent your identity, qualifications, or services. Impersonation, scams, or fraudulent activities will result in immediate and permanent suspension."
            },
            commentingRules: {
                title: "Commenting & Reviews",
                content: "Comments and reviews should be constructive and on-topic. Do not post malicious links, spam, or personal information about others (doxxing)."
            },
            enforcement: {
                title: "Enforcement",
                content: "Violations of these guidelines may result in a warning, content removal, or account suspension, depending on the severity of the offense. We reserve the right to take appropriate action at our discretion."
            },
            reporting: {
                title: "Reporting",
                content: "If you see content or behavior that violates these guidelines, please report it to our support team immediately by emailing"
            },
            footer: { text: "Questions about this policy? Email" }
        },
        
        // Safety & Reporting Page
        safetyAndReporting: {
            title: "Safety & Reporting",
            lastUpdated: "Last updated",
            toc: "On this page",
            emergencyDisclaimer: {
                title: "Emergency Disclaimer",
                content: "If you or someone else is in immediate danger, please contact your local emergency services immediately. Our platform is not equipped to handle crisis situations."
            },
            howToReport: {
                title: "How to Report an Issue",
                content: "To report inappropriate content, a concern about a consultant, or a technical issue, please email our support team with a link to the relevant page and a description of the problem."
            },
            blockingAndMuting: {
                title: "Blocking and Muting",
                content: "You can block or mute users or consultants to prevent them from contacting you. This can be done from their profile page. (Note: This feature is a placeholder for the prototype)."
            },
            lawEnforcement: {
                title: "Law Enforcement Inquiries",
                content: "Official requests from law enforcement agencies should be directed to our legal team. Please include the legal basis for your request."
            },
            footer: { text: "Questions about this policy? Email" }
        },
        kycIdVerification: {
            title: "KYC / ID Verification",
            lastUpdated: "Last updated",
            toc: "On this page",
            whatWeVerify: {
                title: "What We Verify",
                content: "We verify a consultant's identity using a valid, government-issued photo ID (e.g., passport, driver's license). This is a one-time process to confirm that the person is who they say they are."
            },
            whenAndWhy: {
                title: "When & Why We Verify",
                content: "Verification is mandatory for all consultants before they can offer services on the platform. This helps prevent fraud, increases trust, and ensures a safer environment for everyone."
            },
            dataFlow: {
                title: "Data Flow & Security",
                content: "The verification process is handled by a secure, third-party provider. We do not store your ID documents on our servers. We only receive a 'verified' or 'not verified' signal, which is used to display the 'KYC/ID verified' badge on a consultant's profile."
            },
            retentionAndRights: {
                title: "Retention & Your Rights",
                content: "Because we do not store the original documents, any data rights requests (like deletion) should be directed to our third-party provider, though we will facilitate this process. For more information on your data, please see our",
                link: "Privacy Policy"
            },
            footer: { text: "Questions about this policy? Email" }
        },
        dataProcessing: {
            title: "Data Processing & Sub-processors",
            lastUpdated: "Last updated",
            toc: "On this page",
            controllerProcessor: {
                title: "Controller vs. Processor",
                content: "Under GDPR, ASTRETHIQUE acts as the 'data controller' for our users' personal data (e.g., account info, usage data). Consultants are 'data controllers' for the information they gather during sessions. Our partners, listed below, act as 'data processors' on our behalf."
            },
            subprocessors: {
                title: "Our Sub-processors",
                intro: "We use a limited number of third-party services to provide our platform. We have vetted each one for their security and data protection standards.",
                table: {
                    category: "Category",
                    name: "Name",
                    region: "Region",
                    purpose: "Purpose"
                },
                rows: [
                    { category: "Payments", name: "Stripe, Inc.", region: "USA/EU", purpose: "Payment processing" },
                    { category: "Analytics", name: "Google Analytics", region: "USA/EU", purpose: "Website traffic analysis" },
                    { category: "Email", name: "Postmark (ActiveCampaign, LLC)", region: "USA/EU", purpose: "Transactional & marketing emails" },
                    { category: "ID Verification", name: "Veriff", region: "USA/EU", purpose: "Consultant KYC/ID checks" }
                ],
                note: "We will update this list before engaging any new sub-processor."
            },
            footer: { text: "Questions about this policy? Email" }
        },
        copyrightAndTakedown: {
            title: "Copyright & Takedown Policy",
            lastUpdated: "Last updated",
            toc: "On this page",
            submitComplaint: {
                title: "How to Submit a Copyright Complaint",
                content: "If you believe your copyrighted work has been infringed upon, please send a detailed notice to our legal team at"
            },
            requiredInfo: {
                title: "Required Information",
                intro: "Your complaint must include the following information:",
                list: [
                    "A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.",
                    "Identification of the copyrighted work claimed to have been infringed.",
                    "Identification of the material that is claimed to be infringing and where it is located on our platform.",
                    "Your contact information, including your address, telephone number, and an email address.",
                    "A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.",
                    "A statement that the information in the notification is accurate, and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner."
                ]
            },
            counterNotice: {
                title: "Counter-Notice Procedure",
                content: "If you believe your content was removed by mistake, you may send a counter-notice to our legal team. We may reinstate the content upon receipt of a valid counter-notice, unless we receive notice from the complaining party that they have filed a legal action."
            },
            footer: { text: "Questions about this policy? Email" }
        }
    },
    fr: {
        // Header
        navHome: "Accueil",
        navDiscover: "Découvrir",
        navConferences: "Conférences",
        navHowItWorks: "Comment ça marche",
        navContentHub: "Centre de Contenus",
        navSupport: "Support",
        login: "Connexion",
        register: "S'inscrire",
        visitor: "Visiteur",
        client: "Client",

        // Hero
        heroHeadline: "Des conseils qui font du bien.",
        heroSub: "Échangez avec des consultants vérifiés par chat, audio ou vidéo — paiement à la minute, respectueux de votre budget et du RGPD.",
        startNow: "Commencer",
        checkHoroscope: "Voir l'horoscope du jour",
        heroTiny: "Tarification transparente à la minute. ‘Verrouillage de budget’ mensuel en option.",
        
        // Value Pillars
        valueHeadline: "Clarté et Contrôle, par Conception.",
        valueSub: "Notre engagement pour des pratiques éthiques et transparentes vous permet de vous connecter en toute confiance.",
        pillar1Title: "Tarif par Consultant",
        pillar1Desc: "Chaque expert fixe un tarif clair en €/min, affiché avant de commencer.",
        pillar2Title: "Portefeuille prépayé & Compteur",
        pillar2Desc: "Rechargez une fois, suivez vos minutes restantes en temps réel.",
        pillar3Title: "Verrouillage de Budget (Optionnel)",
        pillar3Desc: "Plafonnez vos dépenses mensuelles ; activez une recharge d'urgence si besoin.",

        // Categories
        catHeadline: "Trouvez le Bon Conseil, Plus Vite.",
        catSub: "Concentrez-vous sur ce qui compte le plus pour vous. Nos consultants couvrent un large éventail de défis et de questions de la vie.",
        catLove: "Amour",
        catLoveDesc: "Conseils ciblés sur les relations.",
        catWork: "Travail",
        catWorkDesc: "Conseils ciblés sur la carrière.",
        catHealth: "Santé",
        catHealthDesc: "Conseils ciblés sur le bien-être.",
        catMoney: "Argent",
        catMoneyDesc: "Conseils ciblés sur les finances.",

        // Consultants
        consultantHeadline: "Connectez-vous avec un Expert de Confiance",
        consultantSub: "Nos consultants sont là pour vous apporter clarté et soutien, quand vous en avez besoin.",

        // Conferences
        confHeadline: "Conférences à Venir",
        confSub: "Participez à des événements en direct animés par nos experts pour approfondir votre compréhension.",

        // Content
        contentHeadline: "Les Pépites de notre Centre de Contenus",
        contentSub: "Explorez des articles et podcasts de nos experts pour gagner en clarté et en perspective.",

        // Trust
        trustPillar1: "Consultants approuvés et vérifiés (KYC)",
        trustPillar2: "Données conformes au RGPD",
        trustPillar3: "Tarifs transparents avant de commencer",
        learnMore: "En savoir plus",

        // Footer
        copyright: "© 2025 ASTRETHIQUE. Tous droits réservés.",
        legalHub: "Pôle Juridique",
        pricing: "Tarifs",
        privacy: "Confidentialité (RGPD)",
        terms: "Conditions",
        support: "Support",

        // Privacy Policy Page
        privacyPolicy: {
            title: "Politique de Confidentialité (RGPD)",
            lastUpdated: "Dernière mise à jour",
            printDownload: "Imprimer / Télécharger PDF",
            toc: "Sur cette page",
            dataController: {
                title: "Responsable du traitement",
                content: ["L'entité responsable de vos données est :", "ASTRETHIQUE LTD, 221B Baker Street, Londres NW1 6XE, Royaume-Uni. privacy@astrethique.com"],
                address: "Adresse",
                email: "Email"
            },
            dataWeCollect: {
                title: "Données que nous collectons",
                intro: "Intro FR...",
                accountInfo: { title: "Informations sur le compte", text: "Texte FR..." },
                kyc: { title: "Signaux KYC", text: "Texte FR..." },
                usage: { title: "Données d'utilisation et de l'appareil", text: "Texte FR..." },
                payments: { title: "Paiements", text: "Texte FR..." },
                content: { title: "Contenu/Publications", text: "Texte FR..." }
            },
            whyWeProcess: {
                title: "Pourquoi nous traitons vos données (Bases légales)",
                intro: "Intro FR...",
                contract: { title: "Pour exécuter un contrat", text: "Texte FR..." },
                consent: { title: "Consentement", text: "Texte FR..." },
                legitInterests: { title: "Intérêts légitimes", text: "Texte FR..." },
                legalObligation: { title: "Obligation légale", text: "Texte FR..." }
            },
            internationalTransfers: {
                title: "Transferts internationaux",
                content: ["Texte FR..."]
            },
            dataRetention: {
                title: "Conservation des données",
                intro: "Intro FR...",
                table: {
                    category: "Catégorie",
                    window: "Durée",
                    rows: [
                        { category: "Données de compte", window: "Durée du compte + 1 an" },
                        { category: "Enregistrements de session", window: "7 ans" },
                        { category: "Tickets de support", window: "3 ans" },
                        { category: "Journaux d'utilisation", window: "1 an" }
                    ]
                }
            },
            yourRights: {
                title: "Vos droits",
                intro: "Intro FR...",
                rightsList: ["Accès", "Rectification", "Effacement", "Portabilité", "Limitation", "Objection"],
                howToExercise: {
                    title: "Comment exercer vos droits",
                    text: ["Contactez-nous à"]
                }
            },
            otherInfo: {
                title: "Autres informations",
                agePolicy: { title: "Politique d'âge", text: "Texte FR..." },
                cookies: { title: "Cookies", text: ["Voir notre"], linkText: "Politique de cookies" },
                policyChanges: { title: "Modifications", text: "Texte FR..." },
                contact: { title: "Contacter le DPO", text: ["Contactez notre DPO à"] }
            },
            footer: { text: "Des questions sur cette politique ? Envoyez un e-mail à" }
        },
        
        // Terms of Service Page
        termsOfService: {
            title: "Conditions d'Utilisation",
            lastUpdated: "Dernière mise à jour",
            toc: "Sur cette page",
            eligibility: { title: "Éligibilité et Compte", content: "Texte FR..." },
            disclaimer: { title: "Avis de non-responsabilité", content: "Texte FR..." },
            platform: { title: "Utilisation d'ASTRETHIQUE", content: "Texte FR..." },
            billing: { title: "Portefeuille et Facturation", content: "Texte FR... Voir notre", link: "Politique de Remboursement" },
            content: { title: "Propriété du Contenu", content: "Texte FR..." },
            conduct: { title: "Conduite Interdite", content: "Texte FR..." },
            termination: { title: "Suspension et Résiliation", content: "Texte FR..." },
            governingLaw: { title: "Droit Applicable", content: "Texte FR..." },
            contact: { title: "Contact", content: "Contactez-nous à" },
            footer: { text: "Des questions sur cette politique ? Envoyez un e-mail à" }
        },

        // Pricing & Fees Page
        pricingAndFees: {
            title: "Tarifs & Frais",
            lastUpdated: "Dernière mise à jour",
            toc: "Sur cette page",
            model: { title: "Taux à la minute", content: "Texte FR..." },
            wallet: { title: "Portefeuille & Recharges", content: "Texte FR..." },
            fees: { title: "Frais de Plateforme & de Traitement", content: ["Texte FR...", "Texte FR..."] },
            example: { 
                title: "Exemple de Calcul",
                intro: "Voici quelques exemples :",
                table: {
                    duration: "Durée",
                    rate: "Tarif",
                    cost: "Coût total"
                },
                note: "Note FR..."
            },
            footer: { 
                text: "Pour plus de détails, voir nos CGU et notre politique de remboursement.",
                textWithEmail: "Des questions sur cette politique ? Envoyez un e-mail à"
            }
        },

        // Cookie Policy Page
        cookiePolicy: {
            title: "Politique de Cookies",
            lastUpdated: "Dernière mise à jour",
            toc: "Sur cette page",
            whatAreCookies: {
                title: "Que sont les cookies ?",
                content: "Texte FR..."
            },
            howWeUse: {
                title: "Comment nous utilisons les cookies",
                intro: "Intro FR...",
                essential: { title: "Strictement nécessaires", text: "Texte FR..." },
                analytics: { title: "Analytiques", text: "Texte FR..." },
                preferences: { title: "Préférences", text: "Texte FR..." }
            },
            managing: {
                title: "Gérer vos préférences",
                content: "Texte FR...",
                buttonText: "Gérer les cookies"
            },
            footer: { 
                text: "Pour plus d'informations, voir notre",
                linkText: "Politique de Confidentialité",
                textWithEmail: "Des questions sur cette politique ? Envoyez un e-mail à"
             }
        },
        
        // Refunds & Cancellations Page
        refundsAndCancellations: {
            title: "Remboursements & Annulations",
            lastUpdated: "Dernière mise à jour",
            toc: "On this page",
            consultantNoShow: {
                title: "Absence du Consultant",
                content: "Texte FR..."
            },
            userCancellations: {
                title: "Annulations par l'Utilisateur",
                content: "Texte FR..."
            },
            technicalFailures: {
                title: "Pannes Techniques",
                content: "Texte FR..."
            },
            conferences: {
                title: "Conférences",
                content: "Texte FR..."
            },
            howToRequest: {
                title: "Comment Demander un Remboursement",
                content: "Texte FR..."
            },
            footer: { text: "Des questions sur cette politique ? Envoyez un e-mail à" }
        },

        // Community Guidelines Page
        communityGuidelines: {
            title: "Directives sur le Contenu et la Communauté",
            lastUpdated: "Dernière mise à jour",
            toc: "On this page",
            respectfulConduct: { title: "Soyez Respectueux", content: "Texte FR..." },
            professionalBoundaries: { title: "Limites Professionnelles", content: "Texte FR..." },
            authenticity: { title: "Authenticité", content: "Texte FR..." },
            commentingRules: { title: "Règles de Commentaire", content: "Texte FR..." },
            enforcement: { title: "Application", content: "Texte FR..." },
            reporting: { title: "Signalement", content: "Texte FR..." },
            footer: { text: "Des questions sur cette politique ? Envoyez un e-mail à" }
        },
        
        // Safety & Reporting Page
        safetyAndReporting: {
            title: "Sécurité & Signalement",
            lastUpdated: "Dernière mise à jour",
            toc: "On this page",
            emergencyDisclaimer: { title: "Avis d'Urgence", content: "Texte FR..." },
            howToReport: { title: "Comment Signaler un Problème", content: "Texte FR..." },
            blockingAndMuting: { title: "Blocage et Masquage", content: "Texte FR..." },
            lawEnforcement: { title: "Demandes des Forces de l'Ordre", content: "Texte FR..." },
            footer: { text: "Des questions sur cette politique ? Envoyez un e-mail à" }
        },
        kycIdVerification: {
            title: "Vérification KYC / ID",
            lastUpdated: "Dernière mise à jour",
            toc: "On this page",
            whatWeVerify: { title: "Ce que nous vérifions", content: "Texte FR..." },
            whenAndWhy: { title: "Quand et pourquoi", content: "Texte FR..." },
            dataFlow: { title: "Flux de données et sécurité", content: "Texte FR..." },
            retentionAndRights: {
                title: "Rétention et vos droits",
                content: "Texte FR... Voir notre",
                link: "Politique de confidentialité"
            },
            footer: { text: "Des questions sur cette politique ? Envoyez un e-mail à" }
        },
        dataProcessing: {
            title: "Traitement des Données & Sous-traitants",
            lastUpdated: "Dernière mise à jour",
            toc: "On this page",
            controllerProcessor: { title: "Responsable du Traitement vs Sous-traitant", content: "Texte FR..." },
            subprocessors: {
                title: "Nos Sous-traitants",
                intro: "Intro FR...",
                table: { category: "Catégorie", name: "Nom", region: "Région", purpose: "Objectif" },
                rows: [
                    { category: "Paiements", name: "Stripe, Inc.", region: "USA/EU", purpose: "Traitement des paiements" },
                    { category: "Analytique", name: "Google Analytics", region: "USA/EU", purpose: "Analyse du trafic" },
                    { category: "Email", name: "Postmark (ActiveCampaign, LLC)", region: "USA/EU", purpose: "Emails transactionnels" },
                    { category: "Vérification ID", name: "Veriff", region: "USA/EU", purpose: "Vérifications KYC" }
                ],
                note: "Note FR..."
            },
            footer: { text: "Des questions sur cette politique ? Envoyez un e-mail à" }
        },
        copyrightAndTakedown: {
            title: "Politique de Droit d'Auteur et de Retrait",
            lastUpdated: "Dernière mise à jour",
            toc: "On this page",
            submitComplaint: { title: "Comment Soumettre une Plainte", content: "Texte FR..." },
            requiredInfo: {
                title: "Informations Requises",
                intro: "Intro FR...",
                list: [ "Texte FR...", "Texte FR...", "Texte FR...", "Texte FR...", "Texte FR...", "Texte FR..." ]
            },
            counterNotice: { title: "Procédure de Contre-Notification", content: "Texte FR..." },
            footer: { text: "Des questions sur cette politique ? Envoyez un e-mail à" }
        }
    }
};
