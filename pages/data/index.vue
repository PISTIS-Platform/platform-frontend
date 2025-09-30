<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const categoryLang = 'en'

const datasetCategoryOptions = [
    {
        "pref_label": {
            "mt": "Kwistjonijiet internazzjonali",
            "el": "Διεθνή θέματα",
            "da": "Internationale spørgsmål",
            "pt": "Questões internacionais",
            "fi": "Kansainväliset kysymykset",
            "sv": "Internationella frågor",
            "en": "International issues",
            "no": "Internasjonale temaer",
            "bg": "Международни въпроси",
            "it": "Tematiche internazionali",
            "fr": "Questions internationales",
            "es": "Asuntos internacionales",
            "nl": "Internationale vraagstukken",
            "hu": "Nemzetközi ügyek",
            "sl": "Mednarodna vprašanja",
            "et": "Rahvusvahelised küsimused",
            "ro": "Chestiuni internaționale",
            "de": "Internationale Themen",
            "cs": "Mezinárodní otázky",
            "hr": "Međunarodni pitanja",
            "lt": "Tarptautiniai klausimai",
            "sk": "Medzinárodné otázky",
            "nb": "Internasjonale temaer",
            "pl": "Kwestie międzynarodowe",
            "lv": "Starptautiski jautājumi",
            "ga": "Saincheisteanna idirnáisiúnta",
            "nn": "Internasjonale tema"
        },
        "id": "INTR",
    },
    {
        "pref_label": {
            "de": "Landwirtschaft, Fischerei, Forstwirtschaft und Nahrungsmittel",
            "da": "Landbrug, fiskeri, skovbrug og fødevarer",
            "no": "Jordbruk, fiskeri, skogbruk og mat",
            "hr": "Poljoprivreda, ribarstvo, šumarstvo i hrana",
            "mt": "Agrikoltura, sajd, forestrija u ikel",
            "nb": "Jordbruk, fiskeri, skogbruk og mat",
            "fi": "Maatalous, kalastus, metsätalous ja elintarvikkeet",
            "el": "Γεωργία, αλιεία, δασοκομία και τρόφιμα",
            "pt": "Agricultura, pesca, silvicultura e alimentação",
            "ro": "Agricultură, pescuit, silvicultură şi hrană",
            "sk": "Poľnohospodárstvo, rybné hospodárstvo, lesníctvo a potravinárstvo",
            "cs": "Zemědělství, rybolov, lesnictví a výživa",
            "et": "Põllumajandus, kalandus, metsandus ja toiduained",
            "fr": "Agriculture, pêche, sylviculture et alimentation",
            "sv": "Jordbruk, fiske, skogsbruk och livsmedel",
            "nl": "Landbouw, visserij, bosbouw en voeding",
            "bg": "Селско стопанство, рибарство, горско стопанство и храни",
            "en": "Agriculture, fisheries, forestry and food",
            "ga": "Talmhaíocht, iascach, foraoiseacht agus bia",
            "sl": "Kmetijstvo, ribištvo, gozdarstvo in prehrana",
            "es": "Agricultura, pesca, silvicultura y alimentación",
            "pl": "Rolnictwo, rybołówstwo, leśnictwo i żywność",
            "lt": "Žemės ūkis, žuvininkystė, miškininkystė ir maistas",
            "hu": "Mezőgazdaság, halászat, erdészet és élelmiszer",
            "it": "Agricoltura, pesca, silvicoltura e prodotti alimentari",
            "lv": "Lauksaimniecība, zivsaimniecība, mežsaimniecība un pārtika",
            "nn": "Jordbruk, fiskeri, skogbruk og mat" 
        },
        "id": "AGRI",
    },
    {
        "pref_label": {
            "el": "Πληθυσμός και κοινωνία",
            "bg": "Население и общество",
            "da": "Befolkning og samfund",
            "cs": "Populace a společnost",
            "hr": "Stanovništvo i društvo",
            "ro": "Populaţie şi societate",
            "pt": "População e sociedade",
            "no": "Befolkning og samfunn",
            "nn": "Befolkning og samfunn",
            "sl": "Prebivalstvo in družba",
            "mt": "Popolazzjoni u soċjetà",
            "fr": "Population et société",
            "es": "Población y sociedad",
            "it": "Popolazione e società",
            "et": "Elanikkond ja ühiskond",
            "nl": "Bevolking en samenleving",
            "de": "Bevölkerung und Gesellschaft",
            "fi": "Väestö ja yhteiskunta",
            "lt": "Gyventojų skaičius ir visuomenė",
            "nb": "Befolkning og samfunn",
            "sk": "Obyvateľstvo a spoločnosť",
            "sv": "Befolkning och samhälle",
            "hu": "Népesség és társadalom",
            "ga": "Daonra agus sochaí",
            "en": "Population and society",
            "lv": "Iedzīvotāji un sabiedrība",
            "pl": "Ludność i społeczeństwo"
        },
        "id": "SOCI",
    },
    {
        "pref_label": {
            "en": "Provisional data",
            "sk": "Predbežné údaje",
            "da": "Midlertidige data",
            "fr": "Données provisoires",
            "pt": "Dados provisórios",
            "fi": "Alustavat tiedot",
            "ga": "Sonraí sealadacha",
            "pl": "Dane tymczasowe",
            "es": "Datos provisionales",
            "et": "Esialgsed andmed",
            "lt": "Laikinieji duomenys",
            "nl": "Voorlopige gegevens",
            "it": "Dati provvisori",
            "bg": "НЕОКОНЧАТЕЛНИ ДАННИ",
            "cs": "Předběžné údaje",
            "sl": "Začasni podatki",
            "hr": "Privremeni podaci",
            "mt": "Dejta provviżorja",
            "lv": "Provizoriski dati",
            "hu": "Ideiglenes adatok",
            "sv": "Tillfälliga uppgifter",
            "de": "Vorläufige Daten",
            "el": "Προσωρινά δεδομένα",
            "ro": "Date provizorii"
        },
        "id": "OP_DATPRO",
    },
    {
        "pref_label": {
            "nb": "Helse",
            "fr": "Santé",
            "sk": "Zdravotníctvo",
            "en": "Health",
            "sl": "Zdravje",
            "it": "Salute",
            "et": "Tervis",
            "cs": "Zdraví",
            "de": "Gesundheit",
            "hu": "Egészségügy",
            "nn": "Helse",
            "mt": "Saħħa",
            "bg": "Здраве",
            "hr": "Zdravlje",
            "da": "Sundhed",
            "lv": "Veselība",
            "pt": "Saúde",
            "nl": "Gezondheid",
            "es": "Salud",
            "ro": "Sănătate",
            "no": "Helse",
            "pl": "Zdrowie",
            "fi": "Terveys",
            "lt": "Sveikata",
            "ga": "Sláinte",
            "sv": "Hälsa",
            "el": "Υγεία"
        },
        "id": "HEAL",
    },
    {
        "pref_label": {
            "lv": "Transports",
            "nb": "Transport",
            "hu": "Közlekedés",
            "da": "Transport",
            "cs": "Doprava",
            "it": "Trasporti",
            "nl": "Vervoer",
            "sk": "Doprava",
            "hr": "Promet",
            "mt": "Trasport",
            "sv": "Transport",
            "no": "Transport",
            "pl": "Transport",
            "ga": "Iompar",
            "fr": "Transports",
            "en": "Transport",
            "fi": "Liikenne",
            "et": "Transport",
            "el": "Μεταφορές",
            "lt": "Transportas",
            "ro": "Transport",
            "sl": "Transport",
            "de": "Verkehr",
            "pt": "Transportes",
            "nn": "Transport",
            "bg": "Транспорт",
            "es": "Transporte"
        },
        "id": "TRAN",
    },
    {
        "pref_label": {
            "lt": "Švietimas, kultūra ir sportas",
            "pl": "Edukacja, kultura i sport",
            "sv": "Utbildning, kultur och sport",
            "bg": "Образование, култура и спорт",
            "sl": "Izobraževanje, kultura in šport",
            "da": "Uddannelse, kultur og sport",
            "en": "Education, culture and sport",
            "de": "Bildung, Kultur und Sport",
            "fr": "Éducation, culture et sport",
            "hu": "Oktatás, kultúra és sport",
            "no": "Utdanning, kultur og sport",
            "cs": "Vzdělávání, kultura a sport",
            "pt": "Educação, cultura e desporto",
            "et": "Haridus, kultuur ja sport",
            "ga": "Oideachas, cultúr agus spórt",
            "lv": "Izglītība, kultūra un sports",
            "fi": "Koulutus, kulttuuri ja urheilu",
            "ro": "Educaţie, cultură şi sport",
            "nb": "Utdanning, kultur og sport",
            "nn": "Utdanning, kultur og sport",
            "sk": "Vzdelávanie, kultúra a šport",
            "hr": "Obrazovanje, kultura i sport",
            "nl": "Onderwijs, cultuur en sport",
            "el": "Παιδεία, πολιτιστικά θέματα και αθλητισμός",
            "mt": "Edukazzjoni, kultura u sport",
            "es": "Educación, cultura y deportes",
            "it": "Istruzione, cultura e sport"
        },
        "id": "EDUC",
    },
    {
        "pref_label": {
            "pl": "Sprawiedliwość, ustrój sądów i bezpieczeństwo publiczne",
            "hu": "Igazságügy, jogrendszer és közbiztonság",
            "sl": "Pravosodje, pravni sistem in javna varnost",
            "ro": "Justiție, sistem juridic și siguranță publică",
            "pt": "Justiça, sistema judiciário e segurança pública",
            "hr": "Pravosuđe, pravni sustav i javna sigurnost",
            "nl": "Justitie, rechtsstelsel en openbare veiligheid",
            "et": "Õigusemõistmine, õigussüsteem ja avalik turvalisus",
            "el": "Δικαιoσύνη, νομικό σύστημα και δημόσια ασφάλεια",
            "cs": "Spravedlnost, právní systém a veřejná bezpečnost",
            "no": "Justis, rettssystem og allmenn sikkerhet",
            "lt": "Teisingumas, teisės sistema ir visuomenės sauga",
            "mt": "Ġustizzja, sistema legali u sigurtà pubblika",
            "en": "Justice, legal system and public safety",
            "lv": "Tieslietas, tiesību sistēma un sabiedrības drošība",
            "da": "Retfærdighed, retssystem og offentlig sikkerhed",
            "bg": "Правосъдие, съдебна система и обществена безопасност",
            "nn": "Justis, rettssystem og allmenn tryggleik",
            "sv": "Rättvisa, rättsliga system och allmän säkerhet",
            "sk": "Spravodlivosť, právny systém a verejná bezpečnosť",
            "es": "Justicia, sistema judicial y seguridad pública",
            "de": "Justiz, Rechtssystem und öffentliche Sicherheit",
            "fr": "Justice, système juridique et sécurité publique",
            "ga": "Ceartas, córas dlí agus sábháilteacht an phobail",
            "it": "Giustizia, sistema giuridico e sicurezza pubblica",
            "nb": "Justis, rettssystem og allmenn sikkerhet",
            "fi": "Oikeus, oikeusjärjestelmä ja yleinen turvallisuus"
        },
        "id": "JUST",
    },
    {
        "pref_label": {
            "da": "Videnskab og teknologi",
            "de": "Wissenschaft und Technologie",
            "hr": "Znanost i tehnologija",
            "nb": "Vitenskap og teknologi",
            "ro": "Ştiinţă şi tehnologie",
            "nl": "Wetenschap en technologie",
            "el": "Επιστήμη και τεχνολογία",
            "it": "Scienza e tecnologia",
            "ga": "Eolaíocht agus teicneolaíocht",
            "nn": "Vitskap og teknologi",
            "cs": "Věda a technika",
            "pl": "Nauka i technologia",
            "pt": "Ciência e tecnologia",
            "lv": "Zinātne un tehnoloģija",
            "es": "Ciencia y tecnología",
            "bg": "Наука и tехнологии",
            "hu": "Tudomány és technológia",
            "fr": "Science et technologie",
            "sl": "Znanost in tehnologija",
            "no": "Vitenskap og teknologi",
            "sk": "Veda a technika",
            "mt": "Xjenza u teknoloġija",
            "fi": "Tiede ja teknologia",
            "lt": "Mokslas ir technologijos",
            "sv": "Vetenskap och teknik",
            "en": "Science and technology",
            "et": "Teadus ja tehnoloogia"
        },
        "id": "TECH",
    },
    {
        "pref_label": {
            "sl": "Regije in mesta",
            "da": "Regioner og byer",
            "it": "Regioni e città",
            "es": "Regiones y ciudades",
            "hr": "Regije i gradovi",
            "nl": "Regio's en steden",
            "lt": "Regionai ir miestai",
            "el": "Περιφέρειες και πόλεις",
            "hu": "Régiók és városok",
            "nn": "Regionar og byar",
            "ro": "Regiuni şi orașe",
            "lv": "Reģioni un pilsētas",
            "mt": "Reġjuni u bliet",
            "bg": "Региони и градове",
            "cs": "Regiony a města",
            "fi": "Alueet ja kaupungit",
            "de": "Regionen und Städte",
            "pl": "Regiony i miasta",
            "no": "Regioner og byer",
            "ga": "Réigiúin agus cathracha",
            "pt": "Regiões e cidades",
            "fr": "Régions et villes",
            "nb": "Regioner og byer",
            "en": "Regions and cities",
            "sk": "Regióny a mestá",
            "sv": "Regioner och städer",
            "et": "Piirkonnad ja linnad"
        },
        "id": "REGI",
    },
    {
        "pref_label": {
            "el": "Ενέργεια",
            "ro": "Energie",
            "da": "Energi",
            "sk": "Energetika",
            "nb": "Energi",
            "nl": "Energie",
            "de": "Energie",
            "sl": "Energetika",
            "no": "Energi",
            "it": "Energia",
            "lt": "Energetika",
            "nn": "Energi",
            "pl": "Energia",
            "hu": "Energia",
            "lv": "Enerģētika",
            "es": "Energía",
            "bg": "Енергетика",
            "cs": "Energie",
            "en": "Energy",
            "et": "Energeetika",
            "fr": "Énergie",
            "sv": "Energi",
            "hr": "Energetika",
            "ga": "Fuinneamh",
            "fi": "Energia",
            "mt": "Enerġija",
            "pt": "Energia"
        },
        "id": "ENER",
    },
    {
        "pref_label": {
            "es": "Gobierno y sector público",
            "ro": "Guvern şi sector public",
            "el": "Κυβέρνηση και δημόσιος τομέας",
            "en": "Government and public sector",
            "bg": "Правителство и публичен сектор",
            "ga": "Rialtas agus earnáil phoiblí",
            "lv": "Valdība un sabiedriskais sektors",
            "cs": "Vláda a veřejný sektor",
            "nn": "Forvaltning og offentleg sektor",
            "it": "Governo e settore pubblico",
            "mt": "Gvern u settur pubbliku",
            "hr": "Vlada i javni sektor",
            "sl": "Vlada in javni sektor",
            "no": "Forvaltning og offentlig sektor",
            "pl": "Rząd i sektor publiczny",
            "sv": "Regeringen och den offentliga sektorn",
            "de": "Regierung und öffentlicher Sektor",
            "hu": "Kormányzat és közszféra",
            "fi": "Valtioneuvosto ja julkinen sektori",
            "da": "Regeringen og den offentlige sektor",
            "et": "Valitsus ja avalik sektor",
            "fr": "Gouvernement et secteur public",
            "sk": "Vláda a verejný sektor",
            "lt": "Vyriausybė ir viešasis sektorius",
            "nb": "Forvaltning og offentlig sektor",
            "nl": "Overheid en publieke sector",
            "pt": "Governo e setor público"
        },
        "id": "GOVE",
    },
    {
        "pref_label": {
            "lv": "Vide",
            "ga": "Comhshaol",
            "sk": "Životné prostredie",
            "mt": "Ambjent",
            "fr": "Environnement",
            "nb": "Miljø",
            "hu": "Környezet",
            "fi": "Ympäristö",
            "en": "Environment",
            "nn": "Miljø",
            "nl": "Milieu",
            "el": "Περιβάλλον",
            "hr": "Okoliš",
            "it": "Ambiente",
            "de": "Umwelt",
            "lt": "Aplinka",
            "cs": "Životní prostředí",
            "no": "Miljø",
            "pl": "Środowisko",
            "sl": "Okolje",
            "es": "Medio ambiente",
            "bg": "Околна среда",
            "et": "Keskkond",
            "ro": "Mediu",
            "sv": "Miljö",
            "pt": "Ambiente",
            "da": "Miljø"
        },
        "id": "ENVI",
    },
    {
        "pref_label": {
            "cs": "Hospodářství a finance",
            "mt": "Ekonomija u finanzi",
            "sv": "Ekonomi och finans",
            "fr": "Économie et finances",
            "hu": "Gazdaság és pénzügy",
            "pl": "Gospodarka i finanse",
            "de": "Wirtschaft und Finanzen",
            "lv": "Ekonomika un finanses",
            "en": "Economy and finance",
            "sl": "Gospodarstvo in finance",
            "ga": "Geilleagar agus airgeadas",
            "nb": "Økonomi og finans",
            "sk": "Hospodárstvo a financie",
            "es": "Economía y finanzas",
            "bg": "Икономика и финанси",
            "da": "Økonomi og finanser",
            "nl": "Economie en financiën",
            "et": "Majandus ja rahandus",
            "el": "Οικονομία και χρηματοοικονομικά θέματα",
            "it": "Economia e finanze",
            "lt": "Ekonomika ir finansai",
            "ro": "Economie şi finanţe",
            "no": "Økonomi og finans",
            "hr": "Ekonomija i financije",
            "fi": "Talous ja raha-asiat",
            "nn": "Økonomi og finans",
            "pt": "Economia e finanças"
        },
        "id": "ECON",
    }
];

// Compute options for USelectMenu: array of { label, value }
const categorySelectOptions = computed(() =>
    datasetCategoryOptions.map(opt => ({
        label: opt.pref_label[categoryLang.value] || opt.pref_label['en'],
        value: opt.id
    }))
);

const i18n = useI18n();
const DATA_CHECK_IN = i18n.t('data.dataCheckIn');
const DATA_TRANSFORMATION = i18n.t('data.dataTransformation');
const INSIGHTS_GENERATOR = i18n.t('data.insightGenerator');
const DATA_CHECK_IN_FILE_METHOD = i18n.t('data.dataCheckInFileMethod');
const DATA_CHECK_IN_FTP_METHOD = i18n.t('data.dataCheckInFTPMethod');
const DATA_TRANSFORMATION_RUN_METHOD = i18n.t('data.dataTransformationRunMethod');
const INSIGHTS_GENERATOR_GENERATE_METHOD = i18n.t('data.insightsGeneratorGenerateMethod');
const DATA_CHECK_IN_API_METHOD = i18n.t('data.dataCheckInApiMethod');

const dataset_format = ['csv', 'json', 'tsv', 'parquet', 'xml', 'xlsx'];
const http_methods = ['GET', 'POST'];
const periodicity = ['hourly', 'daily', 'monthly'];

const listServices = ref([
    {
        name: DATA_CHECK_IN,
        method: DATA_CHECK_IN_FILE_METHOD,
        id: 1,
        params: [
            {
                name: 'file (supported CSV, TSV, Json, XML, XLSX and Parquet)',
                type: 'source',
                vue: 'file',
                value: '"Upload Dataset" field',
            },
        ],
    },
    {
        name: DATA_CHECK_IN,
        method: DATA_CHECK_IN_FTP_METHOD,
        id: 2,
        params: [
            {
                name: 'ftp_server',
                type: 'json',
                vue: 'input',
                value: 'ftp.dlptest.com',
            },
            {
                name: 'ftp_user',
                type: 'json',
                vue: 'input',
                value: 'user',
            },
            {
                name: 'ftp_password',
                type: 'json',
                vue: 'input',
                value: 'xxxx',
            },
            {
                name: 'ftp_file_path',
                type: 'json',
                vue: 'input',
                value: 'file.ext',
            },
            {
                name: 'dataset_name',
                type: 'json',
                vue: 'input',
                value: 'Test Dataset',
            },
            {
                name: 'dataset_format',
                type: 'json',
                vue: 'select',
                vue_val: dataset_format,
                value: dataset_format[0],
            },
        ],
    },
    {
        name: DATA_TRANSFORMATION,
        method: DATA_TRANSFORMATION_RUN_METHOD,
        id: 3,
        params: [{ name: 'transformation_definition', type: 'json', vue: 'input', value: '[]' }],
    },
    { name: INSIGHTS_GENERATOR, method: INSIGHTS_GENERATOR_GENERATE_METHOD, id: 4, params: [] },
    {
        name: DATA_CHECK_IN,
        method: DATA_CHECK_IN_API_METHOD,
        id: 5,
        params: [
            {
                name: 'api_url',
                type: 'json',
                vue: 'input',
                value: 'http://test_api.com/data',
            },
            {
                name: 'method',
                type: 'json',
                vue: 'select',
                vue_val: http_methods,
                value: http_methods[0],
            },
            {
                name: 'headers',
                type: 'json',
                vue: 'aggregate',
                vue_val: ['name', 'value'],
                value: [],
            },
            {
                name: 'query_params',
                type: 'json',
                vue: 'aggregate',
                vue_val: ['name', 'value'],
                value: [],
            },
            {
                name: 'body',
                type: 'json',
                vue: 'textarea',
                value: '',
            },
        ],
    },
]);

const workflowServices = ref([]);
const datasetName = ref('');
const datasetDescription = ref('');
const datasetKeywords = ref('');
const datasetEncrytion = ref('false');
const gdprChecking = ref('true');
let fileUpload = ref<File | null>(null);
const runId = ref('None');
const wfRunTimeSpecific = ref('');
const wfPeriodicity = ref('');
const datasetCategory = ref('');

const onDrag = () => {
    runId.value = 'None';

    let keys = Object.keys(listServices.value);

    for (let key in keys) {
        let method = listServices.value[key]['method'];

        if (method == DATA_CHECK_IN_FTP_METHOD || method == DATA_CHECK_IN_API_METHOD) {
            fileUpload.value = null;
        }
    }
};

const onDrop = () => {
    let unique_srvs = [];

    let keys = Object.keys(workflowServices.value);
    let fileSelected = false;

    for (let key in keys) {
        let name = workflowServices.value[key]['name'];
        let method = workflowServices.value[key]['method'];

        if (unique_srvs.includes(name)) {
            alert(' The workflow cannot contain two services of type: ' + name);
            listServices.value.push(workflowServices.value[key]);
            workflowServices.value.splice(key, 1);
        } else {
            unique_srvs.push(name);
            fileSelected =
                method == DATA_CHECK_IN_FILE_METHOD ||
                method == DATA_CHECK_IN_FTP_METHOD ||
                method == DATA_CHECK_IN_API_METHOD;
            /*if (method == DATA_CHECK_IN_FILE_METHOD) {
                fileSelected = true;
            } else if (method == DATA_CHECK_IN_FTP_METHOD) {
                fileUpload.value = 'job';
                fileSelected = true;
            }*/
        }

        if (!fileSelected) {
            fileUpload.value = null;
        }
    }
    runId.value = 'None';
};

const aggregateElement = async (services: [string], param: string) => {
    for (let service in services) {
        if (services[service].method == DATA_CHECK_IN_API_METHOD) {
            let index = services[service].params.findIndex((item) => item == param);
            services[service].params[index].value.push({ name: '', value: '' });
        }
    }
};

const removeQueryParam = async (services: [string], param: string, index_values: string) => {
    for (let service in services) {
        if (services[service].method == DATA_CHECK_IN_API_METHOD) {
            let index = services[service].params.findIndex((item) => item == param);
            services[service].params[index].value.splice(index_values, 1);
        }
    }
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        fileUpload.value = target.files[0];
    }
};

const runJobConfigurator = async (services: [string]) => {
    const formData = new FormData();
    let isoDateString = wfRunTimeSpecific.value;
    let periodicity = wfPeriodicity.value;

    if (isoDateString) {
        const date = new Date(wfRunTimeSpecific.value);
        isoDateString = date.toISOString();
        formData.append('scheduled_execution_time', isoDateString);
    }

    if (periodicity) {
        formData.append('periodicity', periodicity);
    }

    /*formData.append('workflow', jsonContent.value);*/
    formData.append('workflow', JSON.stringify(services));
    formData.append('dataset_description', datasetDescription.value);
    // formData.append('dataset_keywords', datasetKeywords.value);
    formData.append('dataset_name', datasetName.value);    
    formData.append('dataset_category', datasetCategory.value.value);
    formData.append('encrytion', datasetEncrytion.value);
    formData.append('gdpr_checker', gdprChecking.value);
    formData.append('dataset_keywords',
        Array.isArray(datasetKeywords.value)
            ? JSON.stringify(datasetKeywords.value)
            : JSON.stringify(
                datasetKeywords.value
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k.length > 0)
            )
);
alert(formData.get('dataset_keywords') as string);

    if (fileUpload.value) {
        formData.append('dataset', fileUpload.value, fileUpload.value.name);
    }

    try {
        if (!datasetName.value) {
            throw new Error('No dataset name provided.');
            /* } else if (!datasetDescription.value) {
            throw new Error('No dataset description provided.'); */
            /* } else if (!datasetKeywords.value) {
            throw new Error('No dataset keywords provided.'); */
        } else if (!datasetCategory.value) {
            throw new Error(
                'No category has been selected for the dataset, please select one category.',
            );
        } else if (services.length == 0) {
            throw new Error(
                'No service has been selected for the workflow definition, please select at least one service.',
            );
        } else if (services.length > 0) {
            if (services[0].name != DATA_CHECK_IN) {
                throw new Error(
                    'The workflow definition must include the Data Check-In service as the first job of the workflow.',
                );
            } else if (!fileUpload.value) {
                if (services[0].method != DATA_CHECK_IN_FTP_METHOD && services[0].method != DATA_CHECK_IN_API_METHOD) {
                    throw new Error('No dataset selected.');
                }
            } else if (periodicity) {
                if (services[0].method == DATA_CHECK_IN_FILE_METHOD) {
                    wfPeriodicity.value = '';
                    throw new Error('A periodicity type cannot be set for file upload data check-in');
                }
            }
        }

        const response = await $fetch('/api/job-configurator/jobconfig', {
            method: 'POST',
            body: formData,
        });

        const responseContent = await response.data;

        /*if (!response.ok) {
            throw new Error('Network response was not ok');
        }*/

        /*const responseContent = response.data;*/

        /*jsonResponse = JSON.stringify(data, null, 2);*/

        runId.value = responseContent.dag_run_id;
    } catch (error: any) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
};
</script>

<template>
    <div class="w-full mx-auto p-4 bg-white border border-1 rounded-lg space-y-6">
        <div class="form-container rounded-md bg-white space-y-4 p-4">
            <label for="datasetDefinition" class="block text-sm font-extrabold text-neutral-700">{{
                $t('data.datasetDefinition')
            }}</label>

            <div class="form-container mx-auto p-6 bg-white border-4 border-neutral-100 rounded-md mt-3">
                <!-- <div class="rounded-md" >
                    <label for="fileUpload" class="block text-sm font-medium text-neutral-700"  >{{
                        $t('data.uploadDataset')
                    }}</label>
                    <input id="fileUpload" type="file"
                        class="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mt-3"
                        @change="handleFileChange" />
                </div> -->
                <div class="rounded-md w-full flex">
                    <label for="datasetName" class="mt-2 block text-sm font-medium text-neutral-700 w-40">{{
                        $t('data.datasetName')
                    }}</label>
                    <input
                        id="datasetName"
                        v-model="datasetName"
                        type="text"
                        class="mt-1 w-full block sm:text-sm border-neutral-300 rounded-md ml-4 text-black bg-white"
                    />
                </div>
                <div class="rounded-md w-full flex">
                    <label for="datasetDescription" class="mt-4 block text-sm font-medium text-neutral-700 w-40">{{
                        $t('data.datasetDescription')
                    }}</label>
                    <input
                        id="datasetDescription"
                        v-model="datasetDescription"
                        type="text"
                        class="mt-4 block w-full sm:text-sm border-neutral-300 rounded-md ml-4 text-black bg-white"
                    />
                </div>
                <div class="rounded-md w-full flex">
                    <label for="datasetKeywords" class="mt-4 block text-sm font-medium text-neutral-700 w-40">{{
                        $t('data.datasetKeywords')
                    }}</label>
                    <input
                        id="datasetKeywords"
                        v-model="datasetKeywords"
                        type="text"
                        class="mt-4 block w-full sm:text-sm border-neutral-300 rounded-md ml-4 text-black bg-white"
                    />
                </div>
                <div class="rounded-md w-full flex">
                    <label for="datasetCategory" class="mt-4 block text-sm font-medium text-neutral-700 w-40">{{
                        $t('data.datasetCategory')
                    }}</label>

                    <USelectMenu
                        id="datasetCategorySelect"
                        v-model="datasetCategory"
                        :options="categorySelectOptions"
                        placeholder=" Select Category ... "
                        class="mt-4 block w-full sm:text-sm border-neutral-300 rounded-md ml-4 text-black bg-white"
                    >
                    </USelectMenu>
                </div>
                <div class="container w-full flex">
                    <div class="container w-full flex">
                        <label for="datasetEncrytion" class="text-sm font-medium text-neutral-700 mt-7 mr-7">{{
                            $t('data.datasetEncrytion')
                        }}</label>
                        <input id="checkbox" v-model="datasetEncrytion" type="checkbox" class="mt-7 w-6 h-6 p-1" />
                    </div>
                    <div class="container w-full flex">
                        <label for="gdprChecking" class="text-sm font-medium text-neutral-700 ml-15 mt-7 w-40">{{
                            $t('data.gdprChecking')
                        }}</label>
                        <input id="checkbox" v-model="gdprChecking" type="checkbox" class="mt-7 w-6 h-6" />
                    </div>
                </div>
            </div>

            <div class="rounded-md">
                <label for="workflowDefinition" class="block text-sm font-extrabold text-neutral-700">{{
                    $t('data.workflowDefinition')
                }}</label>

                <div class="container mx-auto p-4 bg-white border-4 border-neutral-100 rounded-md mt-3 mr-10">
                    <div class="w-full max-w-lg d text-left mt-3">
                        <p class="block text-sm font-medium text-blue-900">Services Available</p>
                        <draggable
                            tag="ul"
                            ghost-class="moving-card"
                            filter=".action-button"
                            group="all-services"
                            class="w-full min-h-20 max-w-md mt-3 border bg-primary-50 text-sm"
                            :list="listServices"
                            :animation="200"
                            @change="onDrag()"
                        >
                            <li
                                v-for="srv in listServices"
                                :key="srv.id"
                                class="p-4 mb-3 ml-2 mt-3 mr-2 flex justify-left text-sm items-center bg-pistis-200 shadow rounded-lg cursor-move"
                            >
                                <Icon name="icon-park:add-three" size="2em" />
                                <span class="ml-5">{{ srv.name }}: {{ srv.method }}</span>
                            </li>
                        </draggable>
                    </div>

                    <div class="w-full h-full max-w-lg text-left mt-3 mr-10">
                        <p class="block text-sm font-medium text-blue-900">Workflow Representation</p>
                        <div class="w-full h-full max-w-lg text-center mt-3 bg-primary-50">
                            <p class="block text-sm font-medium text-black">Start</p>
                            <Icon name="icon-park:code-download" size="3em" />
                        </div>

                        <draggable
                            tag="ul"
                            ghost-class="moving-card"
                            filter=".action-button"
                            group="all-services"
                            class="w-full min-h-20 max-w-lg mt-1 border bg-primary-50 text-sm"
                            :list="workflowServices"
                            :animation="200"
                            @change="onDrop()"
                        >
                            <li
                                v-for="(srv, index) in workflowServices"
                                :key="srv.id"
                                class="p-4 mb-3 ml-2 mt-3 mr-2 flex justify-left items-center bg-pistis-400 shadow rounded-lg font-semibold cursor-move"
                            >
                                <Icon name="icon-park:arrow-down" size="2em" />
                                <span class="ml-5">Job {{ index + 1 }} - {{ srv.name }}: {{ srv.method }}</span>
                            </li>
                        </draggable>
                        <div class="w-full h-full max-w-lg text-center mt-1 bg-primary-50">
                            <p class="block text-sm font-medium text-black">End</p>
                            <Icon name="icon-park:code" size="2.5em" />
                        </div>
                        <div class="w-full flex max-w-lg text-center mt-8">
                            <p class="block text-sm text-left font-medium text-blue-900 mt-3">
                                Specific Workflow Run Time:
                            </p>
                            <input
                                v-model="wfRunTimeSpecific"
                                type="datetime-local"
                                class="form-control text-center ml-5 mt-1"
                                title="Set Specific Event Time"
                            />
                        </div>
                        <div class="w-full flex max-w-lg text-center mt-6">
                            <p class="block text-sm text-left font-medium text-blue-900 mt-3">Periodicity:</p>
                            <USelectMenu
                                v-model="wfPeriodicity"
                                size="lg"
                                :options="periodicity"
                                placeholder=" Select periodicity ... "
                                class="w-full w-2/3 mt-1 sm:text-sm border-black rounded-md mt-2 mb-5 ml-11 text-black bg-primary-100"
                            >
                            </USelectMenu>
                        </div>
                    </div>
                </div>
            </div>
            <div class="rounded-md">
                <label for="jobInputs" class="block text-sm font-extrabold text-neutral-700">{{
                    $t('data.jobInputs')
                }}</label>
                <div
                    class="container mx-auto p-4 bg-white border border-4 border-neutral-100 rounded-md mt-3 mb-3 mr-3"
                >
                    <ul class="w-full ml-3 mr-5">
                        <li
                            v-for="srv in workflowServices"
                            :key="srv.id"
                            class="w-full mt-3 ml-3 mb-5 mr-3 bg-wwhite items-center border-2 border-pistis-200 shadow rounded-lg cursor-move text-sm font-medium text-blue-100"
                        >
                            <div class="rounded-m ml-3 mt-3 mb-2 mr-3 font-medium text-blue-900 font-semibold">
                                {{ srv.name }}: {{ srv.method }}

                                <ul class="ml-3 mr-10 m-5">
                                    <li
                                        v-for="param in srv.params"
                                        :key="param.name"
                                        class="w-full flex mt-3 ml-3 mb-5 mr-10 bg-wwhite items-center rounded-lg cursor-move text-sm font-medium text-blue-100"
                                    >
                                        <div class="rounded-md w-full flex">
                                            <label
                                                v-if="param"
                                                for="paramName"
                                                class="block w-60 mt-2 ml-1 mr-3 mb-5 font-medium text-neutral-700 flex"
                                            >
                                                {{ param.name }}:
                                            </label>
                                            <input
                                                v-if="param && param.type == 'source' && param.vue == 'file'"
                                                id="fileUpload"
                                                type="file"
                                                class="mt-1 boderblock text-sm text-neutral-500 file:mr-15 file:text-sm file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mt-1"
                                                accept=".csv,.json,.tsv,.parquet,.xlsx"
                                                @change="handleFileChange"
                                            />
                                            <input
                                                v-if="param && param.type != 'source' && param.vue == 'input'"
                                                id="paramValue"
                                                v-model="param.value"
                                                type="text"
                                                :readonly="false"
                                                class="mt-1 block w-11/12 sm:text-sm border-neutral-300 rounded-md mt-1 ml-1 mb-5 mr-8 text-black font-light"
                                            />
                                            <input
                                                v-if="param && param.type == 'source' && param.vue == 'input'"
                                                id="paramValue"
                                                v-model="param.value"
                                                type="text"
                                                :readonly="true"
                                                class="mt-1 block w-11/12 sm:text-sm border-neutral-300 rounded-md mt-2 ml-2 mb-5 mr-8 text-black font-light bg-primary-100"
                                            />
                                            <textarea
                                                v-if="param && param.vue == 'textarea'"
                                                id="paramValue"
                                                v-model="param.value"
                                                rows="10"
                                                cols="50"
                                                class="mt-1 block w-full sm:text-sm border-neutral-300 rounded-md text-black font-light ml-3 mr-7"
                                            ></textarea>
                                            <div
                                                v-if="param && param.vue == 'aggregate'"
                                                class="rounded-md w-full border-2 border-netral-300 ml-3 mr-3 bg-neutral-50"
                                            >
                                                <div
                                                    v-for="(api_param, index_value) in param.value"
                                                    :key="index_value"
                                                    class="rounded-md w-full ml-3 mr-3 mt-1 mb-1 flex"
                                                >
                                                    <div
                                                        v-for="json_field in Object.keys(api_param)"
                                                        :key="json_field"
                                                        class="rounded-md w-full ml-3 mr-3 mt-1 mb-1 flex"
                                                    >
                                                        <label
                                                            class="block mt-2 ml-1 mr-3 mb-2 font-medium text-neutral-700"
                                                        >
                                                            {{ json_field }}:
                                                        </label>
                                                        <input
                                                            id="{{ json_field }}{{ index_value }}"
                                                            v-model="param.value[index_value][json_field]"
                                                            type="text"
                                                            :readonly="false"
                                                            class="w-full flex mt-1 block w-11/12 sm:text-sm border-neutral-300 rounded-md mt-1 ml-2 mb-1 mr-0 text-black font-light"
                                                        />
                                                    </div>
                                                    <div class="ml-1 mb-2 flex mr-5 mt-2">
                                                        <Icon
                                                            v-if="param && param.vue == 'aggregate'"
                                                            name="icon-park:close-small"
                                                            size="2em"
                                                            mb-3
                                                            ml-3
                                                            @click="
                                                                removeQueryParam(workflowServices, param, index_value)
                                                            "
                                                        >
                                                        </Icon>
                                                    </div>
                                                </div>
                                            </div>
                                            <USelectMenu
                                                v-if="param && param.type != 'source' && param.vue == 'select'"
                                                v-model="param.value"
                                                size="lg"
                                                :options="param.vue_val"
                                                placeholder=" Select value ... "
                                                class="mt-1 block w-11/12 sm:text-sm border-neutral-300 rounded-md mt-2 mb-5 mr-8 text-black font-light bg-primary-100"
                                            >
                                            </USelectMenu>
                                        </div>
                                        <div class="ml-3 mb-3 flex mr-3 items-center justify-right">
                                            <Icon
                                                v-if="param && param.type != 'source' && param.vue != 'aggregate'"
                                                name="icon-park:electronic-locks-open"
                                                size="3em"
                                                mb-3
                                                ml-3
                                            />
                                            <Icon
                                                v-if="param && param.type == 'source' && param.vue != 'aggregate'"
                                                name="icon-park:electronic-locks-close"
                                                size="3em"
                                                mb-3
                                                ml-3
                                            />
                                            <button
                                                v-if="param && param.vue == 'aggregate'"
                                                class="w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                @click="aggregateElement(workflowServices, param)"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </li>
                                    <label
                                        v-if="srv.params.length == 0"
                                        for="paramName"
                                        class="block mt-3 ml-2 mr-2 mb-5 font-semibold text-neutral-700"
                                    >
                                        Service has not input params.
                                    </label>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div v-if="runId != 'None'" class="rounded-md">
                <label for="workflowExecutionResults" class="block text-sm font-medium text-neutral-700">{{
                    $t('data.workflowExecutionResults')
                }}</label>
                <div class="rounded-md border border-2 mt-3 mb-1 bg-white border-pistis-500">
                    <div class="container mx-auto p-2 rounded-md ml-5 mr-10 flex w-full">
                        <Icon name="icon-park:file-code-one" size="2.5em" />
                        <label for="workflowRunId" class="block text-sm mt-2 font-medium text-neutral-700">
                            {{ $t('data.workflowRunId') }}</label
                        >
                        <label for="runId" class="block text-sm mt-2 font-medium font-semibold text-blue-500">
                            {{ runId }}</label
                        >
                    </div>
                </div>
            </div>
            <div class="rounded-md text-center">
                <button
                    class="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    @click="runJobConfigurator(workflowServices)"
                >
                    Run Workflow
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.moving-card {
    @apply opacity-50 bg-gray-100 border border-blue-500;
}

.container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.form-container {
    flex: 1;
}

.response-container {
    flex: 1;
}
</style>
