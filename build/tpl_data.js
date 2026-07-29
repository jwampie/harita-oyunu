/* ============================================================================
   BÖLÜM 1: OYUN VERİLERİ
   ----------------------------------------------------------------------------
   Bu blokta yalnızca VERİ vardır, mantık yoktur:
   - CONTINENTS / CENTROIDS / FLAG_MAP / ALIASES : özgün oyundan taşındı
   - COUNTRY_INFO  : başkent, nüfus (yaklaşık), resmî dil(ler), yüzölçümü
   - NE_ID_TO_GAME : ISO 3166-1 sayısal kod → oyundaki ülke adı
                     (Natural Earth verisini oyunla eşleştirmek için)
   - NE_NAME_FIX   : sayısal kodu olmayan Natural Earth kayıtları için ad eşleme
   ============================================================================ */

const CONTINENTS = __CONTINENTS__;
const CONTINENTS_ORDER = ["Avrupa", "Asya", "Kuzey Amerika", "Güney Amerika", "Afrika", "Okyanusya"];
const CENTROIDS = __CENTROIDS__;
const FLAG_MAP = __FLAG_MAP__;

/* Kısaltma ve yaygın alternatif adlar (normalize edilmiş biçimde) */
const ALIASES = Object.assign(__ALIASES_BASE__, {
  'abd': 'Amerika Birleşik Devletleri',
  'amerika': 'Amerika Birleşik Devletleri',
  'ingiltere': 'Birleşik Krallık',
  'buyuk britanya': 'Birleşik Krallık',
  'bae': 'Birleşik Arap Emirlikleri',
  'cek cumhuriyeti': 'Çekya',
  'demokratik kongo': 'Kongo Demokratik Cumhuriyeti',
  'kongo demokratik cumhuriyet': 'Kongo Demokratik Cumhuriyeti',
  'kdc': 'Kongo Demokratik Cumhuriyeti',
  'kongo': 'Kongo Cumhuriyeti',
  'burma': 'Myanmar',
  'makedonya': 'Kuzey Makedonya',
  'papua': 'Papua Yeni Gine',
  'sao tome': 'São Tomé ve Príncipe',
  'saint kitts': 'Saint Kitts ve Nevis',
  'saint vincent': 'Saint Vincent ve Grenadinler',
  'trinidad': 'Trinidad ve Tobago',
  'antigua': 'Antigua ve Barbuda',
  'bosna': 'Bosna-Hersek',
  'timor leste': 'Doğu Timor',
  'kibris': 'Güney Kıbrıs Rum Yönetimi',
  'gkry': 'Güney Kıbrıs Rum Yönetimi',
  'rum kesimi': 'Güney Kıbrıs Rum Yönetimi',
  'kibris rum kesimi': 'Güney Kıbrıs Rum Yönetimi',
  'guney kibris rum cumhuriyeti': 'Güney Kıbrıs Rum Yönetimi',
  'kibris cumhuriyeti': 'Güney Kıbrıs Rum Yönetimi',
  'filistin devleti': 'Filistin',
  'yesil burun': 'Yeşil Burun Adaları',
  'cape verde': 'Yeşil Burun Adaları',
  'kape verde': 'Yeşil Burun Adaları',
  'orta afrika': 'Orta Afrika Cumhuriyeti',
  'guney afrika cumhuriyeti': 'Güney Afrika',
  'svaziland': 'Esvatini',
  'fildisi': 'Fildişi Sahili',
  'fildisi sahilleri': 'Fildişi Sahili'
});

/* ----------------------------------------------------------------------------
   ÜLKE KÜNYELERİ — [başkent, yaklaşık nüfus, resmî dil(ler), yüzölçümü km²]
   Nüfuslar 2024-25 tahminleridir ve karta "≈" işaretiyle yansır.
   ---------------------------------------------------------------------------- */
const COUNTRY_INFO = {
  /* ---- AVRUPA ---- */
  "Almanya": ["Berlin", 84500000, "Almanca", 357588],
  "Andorra": ["Andorra la Vella", 82000, "Katalanca", 468],
  "Arnavutluk": ["Tiran", 2740000, "Arnavutça", 28748],
  "Avusturya": ["Viyana", 9130000, "Almanca", 83879],
  "Belçika": ["Brüksel", 11800000, "Felemenkçe, Fransızca, Almanca", 30689],
  "Beyaz Rusya": ["Minsk", 9100000, "Belarusça, Rusça", 207600],
  "Birleşik Krallık": ["Londra", 68300000, "İngilizce", 243610],
  "Bosna-Hersek": ["Saraybosna", 3200000, "Boşnakça, Sırpça, Hırvatça", 51209],
  "Bulgaristan": ["Sofya", 6400000, "Bulgarca", 110994],
  "Çekya": ["Prag", 10900000, "Çekçe", 78871],
  "Danimarka": ["Kopenhag", 5980000, "Danca", 42933],
  "Estonya": ["Tallinn", 1370000, "Estonca", 45228],
  "Finlandiya": ["Helsinki", 5600000, "Fince, İsveççe", 338440],
  "Fransa": ["Paris", 68400000, "Fransızca", 643801],
  "Hırvatistan": ["Zagreb", 3850000, "Hırvatça", 56594],
  "Hollanda": ["Amsterdam", 18000000, "Felemenkçe", 41850],
  "İrlanda": ["Dublin", 5300000, "İrlandaca, İngilizce", 70273],
  "İspanya": ["Madrid", 48600000, "İspanyolca", 505992],
  "İsveç": ["Stokholm", 10600000, "İsveççe", 450295],
  "İsviçre": ["Bern", 8900000, "Almanca, Fransızca, İtalyanca, Romanşça", 41285],
  "İtalya": ["Roma", 58900000, "İtalyanca", 301340],
  "İzlanda": ["Reykjavik", 390000, "İzlandaca", 103000],
  "Karadağ": ["Podgorica", 620000, "Karadağca", 13812],
  "Kosova": ["Priştine", 1760000, "Arnavutça, Sırpça", 10887],
  "Letonya": ["Riga", 1870000, "Letonca", 64589],
  "Lihtenştayn": ["Vaduz", 40000, "Almanca", 160],
  "Litvanya": ["Vilnius", 2890000, "Litvanca", 65300],
  "Lüksemburg": ["Lüksemburg", 672000, "Lüksemburgca, Fransızca, Almanca", 2586],
  "Macaristan": ["Budapeşte", 9580000, "Macarca", 93028],
  "Kuzey Makedonya": ["Üsküp", 1830000, "Makedonca, Arnavutça", 25713],
  "Malta": ["Valletta", 553000, "Maltaca, İngilizce", 316],
  "Moldova": ["Kişinev", 2420000, "Rumence", 33846],
  "Monako": ["Monako", 39000, "Fransızca", 2],
  "Norveç": ["Oslo", 5570000, "Norveççe", 385207],
  "Polonya": ["Varşova", 36600000, "Lehçe", 312696],
  "Portekiz": ["Lizbon", 10600000, "Portekizce", 92212],
  "Romanya": ["Bükreş", 19050000, "Rumence", 238397],
  "Rusya": ["Moskova", 146000000, "Rusça", 17098246],
  "San Marino": ["San Marino", 34000, "İtalyanca", 61],
  "Sırbistan": ["Belgrad", 6600000, "Sırpça", 77474],
  "Slovakya": ["Bratislava", 5420000, "Slovakça", 49035],
  "Slovenya": ["Lübliyana", 2120000, "Slovence", 20273],
  "Türkiye": ["Ankara", 85700000, "Türkçe", 783562],
  "Ukrayna": ["Kiev", 37000000, "Ukraynaca", 603500],
  "Vatikan": ["Vatikan", 800, "İtalyanca, Latince", 0.49],
  "Yunanistan": ["Atina", 10400000, "Yunanca", 131957],

  /* ---- ASYA ---- */
  "Afganistan": ["Kabil", 41500000, "Peştuca, Darice", 652867],
  "Azerbaycan": ["Bakü", 10200000, "Azerbaycanca", 86600],
  "Bahreyn": ["Manama", 1500000, "Arapça", 786],
  "Bangladeş": ["Dakka", 172000000, "Bengalce", 148460],
  "Bhutan": ["Timpu", 790000, "Dzongkha", 38394],
  "Birleşik Arap Emirlikleri": ["Abu Dabi", 10000000, "Arapça", 83600],
  "Brunei": ["Bandar Seri Begavan", 460000, "Malayca", 5765],
  "Çin": ["Pekin", 1410000000, "Çince (Mandarin)", 9596961],
  "Doğu Timor": ["Dili", 1360000, "Tetum, Portekizce", 14874],
  "Endonezya": ["Cakarta", 280000000, "Endonezce", 1904569],
  "Ermenistan": ["Erivan", 2990000, "Ermenice", 29743],
  "Filipinler": ["Manila", 114000000, "Filipince, İngilizce", 300000],
  "Güney Kore": ["Seul", 51700000, "Korece", 100210],
  "Gürcistan": ["Tiflis", 3730000, "Gürcüce", 69700],
  "Hindistan": ["Yeni Delhi", 1440000000, "Hintçe, İngilizce", 3287263],
  "Irak": ["Bağdat", 44500000, "Arapça, Kürtçe", 438317],
  "İran": ["Tahran", 89000000, "Farsça", 1648195],
  "İsrail": ["Tel Aviv", 9800000, "İbranice", 22072],
  "Filistin": ["Doğu Kudüs", 5500000, "Arapça", 6020, "BM gözlemci devleti · TC tanır"],
  "Japonya": ["Tokyo", 124000000, "Japonca", 377975],
  "Kamboçya": ["Phnom Penh", 17000000, "Khmerce", 181035],
  "Katar": ["Doha", 2700000, "Arapça", 11586],
  "Kazakistan": ["Astana", 20000000, "Kazakça, Rusça", 2724900],
  "Kırgızistan": ["Bişkek", 7000000, "Kırgızca, Rusça", 199951],
  "Güney Kıbrıs Rum Yönetimi": ["Lefkoşa", 920000, "Yunanca, Türkçe", 5896],
  "Kuzey Kıbrıs Türk Cumhuriyeti": ["Lefkoşa", 390000, "Türkçe", 3355, "Tanınma: yalnızca TC"],
  "Kuveyt": ["Kuveyt", 4300000, "Arapça", 17818],
  "Kuzey Kore": ["Pyongyang", 26000000, "Korece", 120538],
  "Laos": ["Vientiane", 7600000, "Laoca", 236800],
  "Lübnan": ["Beyrut", 5400000, "Arapça", 10452],
  "Maldivler": ["Male", 520000, "Divehice", 300],
  "Malezya": ["Kuala Lumpur", 34000000, "Malayca", 330803],
  "Moğolistan": ["Ulan Batur", 3500000, "Moğolca", 1564116],
  "Myanmar": ["Naypyidaw", 54500000, "Birmanca", 676578],
  "Nepal": ["Katmandu", 30000000, "Nepalce", 147181],
  "Özbekistan": ["Taşkent", 36000000, "Özbekçe", 448978],
  "Pakistan": ["İslamabad", 240000000, "Urduca, İngilizce", 881913],
  "Singapur": ["Singapur", 5900000, "İngilizce, Malayca, Çince, Tamilce", 728],
  "Sri Lanka": ["Sri Cayavardenepura Kotte", 22000000, "Sinhalce, Tamilce", 65610],
  "Suriye": ["Şam", 23000000, "Arapça", 185180],
  "Suudi Arabistan": ["Riyad", 33000000, "Arapça", 2149690],
  "Tacikistan": ["Duşanbe", 10100000, "Tacikçe", 141400],
  "Tayland": ["Bangkok", 71800000, "Tayca", 513120],
  "Tayvan": ["Taipei", 23400000, "Çince (Mandarin)", 36197, "Tanınma: sınırlı (TC tanımıyor)"],
  "Türkmenistan": ["Aşkabat", 6500000, "Türkmence", 488100],
  "Umman": ["Maskat", 5100000, "Arapça", 309500],
  "Ürdün": ["Amman", 11400000, "Arapça", 89342],
  "Vietnam": ["Hanoi", 100000000, "Vietnamca", 331212],
  "Yemen": ["Sana", 34500000, "Arapça", 527968],

  /* ---- AFRİKA ---- */
  "Angola": ["Luanda", 36500000, "Portekizce", 1246700],
  "Benin": ["Porto-Novo", 13700000, "Fransızca", 114763],
  "Botsvana": ["Gaborone", 2500000, "İngilizce, Setsvana", 581730],
  "Burkina Faso": ["Vagadugu", 23000000, "Fransızca", 274222],
  "Burundi": ["Gitega", 13200000, "Kirundice, Fransızca", 27834],
  "Cezayir": ["Cezayir", 45600000, "Arapça, Berberice", 2381741],
  "Cibuti": ["Cibuti", 1100000, "Fransızca, Arapça", 23200],
  "Çad": ["Ncamena", 18300000, "Fransızca, Arapça", 1284000],
  "Ekvator Ginesi": ["Malabo", 1700000, "İspanyolca, Fransızca, Portekizce", 28051],
  "Eritre": ["Asmara", 3700000, "Tigrinya, Arapça, İngilizce", 117600],
  "Esvatini": ["Mbabane", 1220000, "Svazice, İngilizce", 17364],
  "Etiyopya": ["Addis Ababa", 127000000, "Amharca", 1104300],
  "Fas": ["Rabat", 37500000, "Arapça, Berberice", 446550],
  "Fildişi Sahili": ["Yamoussoukro", 29000000, "Fransızca", 322463],
  "Gabon": ["Librevil", 2440000, "Fransızca", 267668],
  "Gambiya": ["Banjul", 2770000, "İngilizce", 11295],
  "Gana": ["Akra", 34000000, "İngilizce", 238533],
  "Gine": ["Konakri", 14500000, "Fransızca", 245857],
  "Gine-Bissau": ["Bissau", 2150000, "Portekizce", 36125],
  "Güney Afrika": ["Pretoria, Cape Town, Bloemfontein", 62000000, "11 resmî dil (Zuluca, İngilizce, Afrikaanca…)", 1221037],
  "Güney Sudan": ["Cuba", 11100000, "İngilizce", 644329],
  "Kamerun": ["Yaunde", 28600000, "Fransızca, İngilizce", 475442],
  "Kenya": ["Nairobi", 55100000, "Svahili, İngilizce", 580367],
  "Komorlar": ["Moroni", 850000, "Komorca, Arapça, Fransızca", 1861],
  "Kongo Cumhuriyeti": ["Brazavil", 6100000, "Fransızca", 342000],
  "Kongo Demokratik Cumhuriyeti": ["Kinşasa", 102000000, "Fransızca", 2344858],
  "Lesotho": ["Maseru", 2300000, "Sotho dili, İngilizce", 30355],
  "Liberya": ["Monrovia", 5400000, "İngilizce", 111369],
  "Libya": ["Trablus", 6900000, "Arapça", 1759541],
  "Madagaskar": ["Antananarivo", 30300000, "Malgaşça, Fransızca", 587041],
  "Malavi": ["Lilongve", 21000000, "İngilizce, Çevaca", 118484],
  "Mali": ["Bamako", 23300000, "Bambara ve ulusal diller", 1240192],
  "Mauritius": ["Port Louis", 1260000, "İngilizce, Fransızca, Morisyen", 2040],
  "Mısır": ["Kahire", 106000000, "Arapça", 1001450],
  "Moritanya": ["Nuakşot", 4900000, "Arapça", 1030700],
  "Mozambik": ["Maputo", 34000000, "Portekizce", 801590],
  "Namibya": ["Vindhuk", 2600000, "İngilizce", 825615],
  "Nijer": ["Niamey", 27200000, "Fransızca", 1267000],
  "Nijerya": ["Abuja", 227000000, "İngilizce", 923768],
  "Orta Afrika Cumhuriyeti": ["Bangui", 5700000, "Fransızca, Sango", 622984],
  "Ruanda": ["Kigali", 14100000, "Kinyarwanda, İngilizce, Fransızca", 26338],
  "São Tomé ve Príncipe": ["São Tomé", 230000, "Portekizce", 964],
  "Senegal": ["Dakar", 18200000, "Fransızca", 196722],
  "Seyşeller": ["Victoria", 100000, "Seyşel Kreyolu, İngilizce, Fransızca", 452],
  "Sierra Leone": ["Freetown", 8800000, "İngilizce", 71740],
  "Somali": ["Mogadişu", 18100000, "Somalice, Arapça", 637657],
  "Sudan": ["Hartum", 49000000, "Arapça, İngilizce", 1861484],
  "Tanzanya": ["Dodoma", 67400000, "Svahili, İngilizce", 947303],
  "Togo": ["Lome", 9100000, "Fransızca", 56785],
  "Tunus": ["Tunus", 12300000, "Arapça", 163610],
  "Uganda": ["Kampala", 48600000, "İngilizce, Svahili", 241550],
  "Yeşil Burun Adaları": ["Praia", 570000, "Portekizce", 4033],
  "Zambiya": ["Lusaka", 20600000, "İngilizce", 752612],
  "Zimbabve": ["Harare", 16600000, "İngilizce, Şona, Ndebele", 390757],

  /* ---- KUZEY AMERİKA ---- */
  "Amerika Birleşik Devletleri": ["Washington, D.C.", 335000000, "İngilizce", 9833517],
  "Antigua ve Barbuda": ["Saint John's", 100000, "İngilizce", 442],
  "Bahamalar": ["Nassau", 410000, "İngilizce", 13943],
  "Barbados": ["Bridgetown", 282000, "İngilizce", 430],
  "Belize": ["Belmopan", 410000, "İngilizce", 22966],
  "Dominik Cumhuriyeti": ["Santo Domingo", 11300000, "İspanyolca", 48671],
  "Dominika": ["Roseau", 73000, "İngilizce", 751],
  "El Salvador": ["San Salvador", 6300000, "İspanyolca", 21041],
  "Grenada": ["Saint George's", 126000, "İngilizce", 344],
  "Guatemala": ["Guatemala", 18100000, "İspanyolca", 108889],
  "Haiti": ["Port-au-Prince", 11700000, "Fransızca, Haiti Kreyolu", 27750],
  "Honduras": ["Tegucigalpa", 10600000, "İspanyolca", 112492],
  "Jamaika": ["Kingston", 2830000, "İngilizce", 10991],
  "Kanada": ["Ottava", 40000000, "İngilizce, Fransızca", 9984670],
  "Kosta Rika": ["San Jose", 5200000, "İspanyolca", 51100],
  "Küba": ["Havana", 11000000, "İspanyolca", 109884],
  "Meksika": ["Meksiko", 129000000, "İspanyolca", 1964375],
  "Nikaragua": ["Managua", 7000000, "İspanyolca", 130373],
  "Panama": ["Panama", 4500000, "İspanyolca", 75417],
  "Saint Kitts ve Nevis": ["Basseterre", 48000, "İngilizce", 261],
  "Saint Lucia": ["Castries", 180000, "İngilizce", 616],
  "Saint Vincent ve Grenadinler": ["Kingstown", 104000, "İngilizce", 389],
  "Trinidad ve Tobago": ["Port of Spain", 1530000, "İngilizce", 5130],

  /* ---- GÜNEY AMERİKA ---- */
  "Arjantin": ["Buenos Aires", 46600000, "İspanyolca", 2780400],
  "Bolivya": ["Sucre (hükümet: La Paz)", 12400000, "İspanyolca, Keçuva, Aymara", 1098581],
  "Brezilya": ["Brasilia", 216000000, "Portekizce", 8515767],
  "Ekvador": ["Kito", 18000000, "İspanyolca", 283561],
  "Guyana": ["Georgetown", 810000, "İngilizce", 214969],
  "Kolombiya": ["Bogota", 52200000, "İspanyolca", 1141748],
  "Paraguay": ["Asunción", 6900000, "İspanyolca, Guaranice", 406752],
  "Peru": ["Lima", 34000000, "İspanyolca, Keçuva", 1285216],
  "Surinam": ["Paramaribo", 620000, "Felemenkçe", 163820],
  "Şili": ["Santiago", 19700000, "İspanyolca", 756102],
  "Uruguay": ["Montevideo", 3400000, "İspanyolca", 176215],
  "Venezuela": ["Karakas", 28400000, "İspanyolca", 916445],

  /* ---- OKYANUSYA ---- */
  "Avustralya": ["Kanberra", 26700000, "İngilizce", 7692024],
  "Fiji": ["Suva", 930000, "İngilizce, Fiji dili, Hintçe", 18274],
  "Kiribati": ["Güney Tarava", 130000, "Kiribatice, İngilizce", 811],
  "Marshall Adaları": ["Majuro", 42000, "Marşalca, İngilizce", 181],
  "Mikronezya": ["Palikir", 113000, "İngilizce", 702],
  "Nauru": ["Yaren (fiilî)", 12000, "Nauru dili, İngilizce", 21],
  "Palau": ["Ngerulmud", 18000, "Palauca, İngilizce", 459],
  "Papua Yeni Gine": ["Port Moresby", 10300000, "Tok Pisin, İngilizce, Hiri Motu", 462840],
  "Samoa": ["Apia", 220000, "Samoaca, İngilizce", 2842],
  "Solomon Adaları": ["Honiara", 740000, "İngilizce", 28896],
  "Tonga": ["Nuku'alofa", 107000, "Tonga dili, İngilizce", 747],
  "Tuvalu": ["Funafuti", 11000, "Tuvalca, İngilizce", 26],
  "Vanuatu": ["Port Vila", 330000, "Bislama, İngilizce, Fransızca", 12189],
  "Yeni Zelanda": ["Wellington", 5300000, "İngilizce, Maorice", 270467]
};

/* ----------------------------------------------------------------------------
   YEREL ADLAR (endonimler) — ülkenin kendi dil ve alfabesindeki adı,
   künyede Türkçe adın hemen altında küçük fontla gösterilir.
   Türkçe adla birebir aynı olanlar (Türkiye, Tonga…) listede yoktur.
   ---------------------------------------------------------------------------- */
const NATIVE_NAME = {
  /* Avrupa */
  "Almanya": "Deutschland", "Arnavutluk": "Shqipëria", "Avusturya": "Österreich",
  "Belçika": "België · Belgique", "Beyaz Rusya": "Беларусь",
  "Birleşik Krallık": "United Kingdom", "Bosna-Hersek": "Bosna i Hercegovina",
  "Bulgaristan": "България", "Çekya": "Česko", "Danimarka": "Danmark",
  "Estonya": "Eesti", "Finlandiya": "Suomi", "Fransa": "France",
  "Hırvatistan": "Hrvatska", "Hollanda": "Nederland", "İrlanda": "Éire · Ireland",
  "İspanya": "España", "İsveç": "Sverige", "İsviçre": "Schweiz · Suisse",
  "İtalya": "Italia", "İzlanda": "Ísland", "Karadağ": "Crna Gora",
  "Kosova": "Kosovë", "Letonya": "Latvija", "Lihtenştayn": "Liechtenstein",
  "Litvanya": "Lietuva", "Lüksemburg": "Lëtzebuerg", "Macaristan": "Magyarország",
  "Kuzey Makedonya": "Северна Македонија", "Norveç": "Norge", "Polonya": "Polska",
  "Portekiz": "Portugal", "Romanya": "România", "Rusya": "Россия",
  "Sırbistan": "Србија", "Slovakya": "Slovensko", "Slovenya": "Slovenija",
  "Ukrayna": "Україна", "Vatikan": "Città del Vaticano", "Yunanistan": "Ελλάδα",
  /* Asya */
  "Afganistan": "افغانستان", "Azerbaycan": "Azərbaycan", "Bahreyn": "البحرين",
  "Bangladeş": "বাংলাদেশ", "Bhutan": "འབྲུག་ཡུལ", "Birleşik Arap Emirlikleri": "الإمارات",
  "Brunei": "Brunei Darussalam", "Çin": "中国", "Doğu Timor": "Timor-Leste",
  "Endonezya": "Indonesia", "Ermenistan": "Հայաստան", "Filipinler": "Pilipinas",
  "Filistin": "فلسطين", "Güney Kıbrıs Rum Yönetimi": "Κύπρος",
  "Güney Kore": "대한민국", "Gürcistan": "საქართველო", "Hindistan": "भारत · India",
  "Irak": "العراق", "İran": "ایران", "İsrail": "ישראל", "Japonya": "日本",
  "Kamboçya": "កម្ពុជា", "Katar": "قطر", "Kazakistan": "Қазақстан",
  "Kırgızistan": "Кыргызстан", "Kuveyt": "الكويت", "Kuzey Kore": "조선",
  "Laos": "ລາວ", "Lübnan": "لبنان", "Maldivler": "ދިވެހިރާއްޖެ",
  "Malezya": "Malaysia", "Moğolistan": "Монгол Улс", "Myanmar": "မြန်မာ",
  "Nepal": "नेपाल", "Özbekistan": "Oʻzbekiston", "Pakistan": "پاکستان",
  "Singapur": "Singapura · 新加坡", "Sri Lanka": "ශ්‍රී ලංකා · இலங்கை",
  "Suriye": "سوريا", "Suudi Arabistan": "السعودية", "Tacikistan": "Тоҷикистон",
  "Tayland": "ประเทศไทย", "Tayvan": "台灣", "Umman": "عُمان", "Ürdün": "الأردن",
  "Vietnam": "Việt Nam", "Yemen": "اليمن",
  /* Afrika */
  "Benin": "Bénin", "Botsvana": "Botswana", "Burundi": "Uburundi",
  "Cezayir": "الجزائر", "Cibuti": "Djibouti · جيبوتي", "Çad": "Tchad · تشاد",
  "Ekvator Ginesi": "Guinea Ecuatorial", "Eritre": "ኤርትራ", "Esvatini": "eSwatini",
  "Etiyopya": "ኢትዮጵያ", "Fas": "المغرب", "Fildişi Sahili": "Côte d'Ivoire",
  "Gambiya": "The Gambia", "Gana": "Ghana", "Gine": "Guinée",
  "Gine-Bissau": "Guiné-Bissau", "Güney Afrika": "South Africa",
  "Güney Sudan": "South Sudan", "Kamerun": "Cameroun", "Komorlar": "Komori · جزر القمر",
  "Kongo Cumhuriyeti": "Congo", "Kongo Demokratik Cumhuriyeti": "RD Congo",
  "Liberya": "Liberia", "Libya": "ليبيا", "Madagaskar": "Madagasikara",
  "Malavi": "Malawi", "Mauritius": "Mauritius · Maurice", "Mısır": "مصر",
  "Moritanya": "موريتانيا", "Mozambik": "Moçambique", "Namibya": "Namibia",
  "Nijer": "Niger", "Nijerya": "Nigeria", "Orta Afrika Cumhuriyeti": "République Centrafricaine",
  "Ruanda": "Rwanda", "São Tomé ve Príncipe": "São Tomé e Príncipe",
  "Senegal": "Sénégal", "Seyşeller": "Sesel · Seychelles", "Somali": "Soomaaliya",
  "Sudan": "السودان", "Tanzanya": "Tanzania", "Tunus": "تونس",
  "Yeşil Burun Adaları": "Cabo Verde", "Zambiya": "Zambia", "Zimbabve": "Zimbabwe",
  /* Kuzey Amerika */
  "Amerika Birleşik Devletleri": "United States of America",
  "Antigua ve Barbuda": "Antigua and Barbuda", "Bahamalar": "The Bahamas",
  "Dominik Cumhuriyeti": "República Dominicana", "Dominika": "Dominica",
  "Haiti": "Haïti · Ayiti", "Jamaika": "Jamaica", "Kanada": "Canada",
  "Kosta Rika": "Costa Rica", "Küba": "Cuba", "Meksika": "México",
  "Nikaragua": "Nicaragua", "Panama": "Panamá",
  "Saint Kitts ve Nevis": "Saint Kitts and Nevis",
  "Saint Vincent ve Grenadinler": "Saint Vincent and the Grenadines",
  "Trinidad ve Tobago": "Trinidad and Tobago",
  /* Güney Amerika */
  "Arjantin": "Argentina", "Bolivya": "Bolivia", "Brezilya": "Brasil",
  "Ekvador": "Ecuador", "Kolombiya": "Colombia", "Peru": "Perú",
  "Surinam": "Suriname", "Şili": "Chile",
  /* Okyanusya */
  "Avustralya": "Australia", "Fiji": "Viti · Fiji", "Marshall Adaları": "Marshall Islands",
  "Mikronezya": "Micronesia", "Nauru": "Naoero", "Palau": "Belau · Palau",
  "Papua Yeni Gine": "Papua Niugini", "Samoa": "Sāmoa",
  "Solomon Adaları": "Solomon Islands", "Yeni Zelanda": "New Zealand · Aotearoa"
};

/* ----------------------------------------------------------------------------
   ALFABELER — künyede hangi yazı sisteminin kullanıldığı, örnek harflerle
   gösterilir. COUNTRY_SCRIPT'te yer almayan tüm ülkeler Latin alfabesi kullanır.
   ---------------------------------------------------------------------------- */
const SCRIPTS = {
  latin:        ["Latin alfabesi", "Aa Bb Cc Dd"],
  kiril:        ["Kiril alfabesi", "Аа Бб Вв Гг Дд"],
  kiril_latin:  ["Kiril + Latin", "Аа Бб · Aa Bb"],
  latin_kiril:  ["Latin + Kiril", "Aa Bb · Аа Бб"],
  kiril_gecis:  ["Kiril (Latin'e geçiş sürecinde)", "Аа Бб → Aa Bb"],
  yunan:        ["Yunan alfabesi", "Αα Ββ Γγ Δδ"],
  yunan_latin:  ["Yunan + Latin", "Αα Ββ · Aa Bb"],
  arap:         ["Arap alfabesi", "ا ب ت ث ج ح"],
  arap_latin:   ["Arap + Latin", "ا ب ت · Aa Bb"],
  arap_tifinagh:["Arap + Tifinagh (Berberî)", "ا ب · ⵜⵉⴼⵉⵏⴰⵖ"],
  fars:         ["Fars-Arap alfabesi", "ا ب پ ت ث ج چ"],
  nastalik:     ["Arap (Nastalik) alfabesi", "اُردُو ا ب پ ٹ"],
  ibrani:       ["İbrani alfabesi", "א ב ג ד ה"],
  devanagari:   ["Devanagari", "अ आ इ क ख ग"],
  hint_coklu:   ["Devanagari + bölgesel yazılar", "अ आ · த · బ · ਗ"],
  bengal:       ["Bengal alfabesi", "অ আ ক খ গ"],
  sinhala_tamil:["Sinhala + Tamil", "අ ආ · அ ஆ"],
  thai:         ["Tay alfabesi", "ก ข ค ง จ"],
  lao:          ["Lao alfabesi", "ກ ຂ ຄ ງ ຈ"],
  khmer:        ["Khmer alfabesi", "ក ខ គ ឃ ង"],
  myanmar:      ["Myanmar alfabesi", "က ခ ဂ ဃ င"],
  tibet:        ["Tibet alfabesi (Dzongkha)", "ཀ ཁ ག ང ཅ"],
  gurcu:        ["Gürcü alfabesi", "ა ბ გ დ ე"],
  ermeni:       ["Ermeni alfabesi", "Ա Բ Գ Դ Ե"],
  geez:         ["Geez alfabesi", "ሀ ለ ሐ መ ሠ"],
  han:          ["Çin yazısı (Han)", "中文 · 汉字"],
  han_trad:     ["Çin yazısı (Geleneksel Han)", "中文 · 漢字"],
  japon:        ["Kanji + Kana", "日本語 · ひらがな カタカナ"],
  hangul:       ["Hangıl (Kore alfabesi)", "한글 · ㄱ ㄴ ㄷ ㄹ"],
  thaana:       ["Thaana alfabesi", "ހ ށ ނ ރ ބ"],
  mogol:        ["Kiril (+ geleneksel Moğol yazısı)", "Аа Бб · ᠮᠣᠩᠭᠣᠯ"],
  coklu_sg:     ["Latin + Çin + Tamil", "Aa · 中文 · தமிழ்"]
};
const COUNTRY_SCRIPT = {
  /* Kiril ve karışık */
  "Rusya": "kiril", "Ukrayna": "kiril", "Beyaz Rusya": "kiril", "Bulgaristan": "kiril",
  "Kuzey Makedonya": "kiril", "Kırgızistan": "kiril", "Tacikistan": "kiril",
  "Sırbistan": "kiril_latin", "Karadağ": "kiril_latin", "Bosna-Hersek": "latin_kiril",
  "Kazakistan": "kiril_gecis", "Moğolistan": "mogol",
  /* Yunan */
  "Yunanistan": "yunan", "Güney Kıbrıs Rum Yönetimi": "yunan_latin",
  /* Arap ve türevleri */
  "Suudi Arabistan": "arap", "Yemen": "arap", "Umman": "arap",
  "Birleşik Arap Emirlikleri": "arap", "Katar": "arap", "Bahreyn": "arap",
  "Kuveyt": "arap", "Irak": "arap", "Suriye": "arap", "Ürdün": "arap",
  "Lübnan": "arap", "Filistin": "arap", "Mısır": "arap", "Libya": "arap",
  "Tunus": "arap", "Moritanya": "arap", "Sudan": "arap",
  "Cezayir": "arap_tifinagh", "Fas": "arap_tifinagh",
  "Cibuti": "arap_latin", "Çad": "arap_latin", "Komorlar": "arap_latin", "Somali": "arap_latin",
  "İran": "fars", "Afganistan": "fars", "Pakistan": "nastalik", "Maldivler": "thaana",
  /* Diğer */
  "İsrail": "ibrani",
  "Hindistan": "hint_coklu", "Nepal": "devanagari", "Bangladeş": "bengal",
  "Sri Lanka": "sinhala_tamil", "Bhutan": "tibet", "Myanmar": "myanmar",
  "Tayland": "thai", "Laos": "lao", "Kamboçya": "khmer",
  "Çin": "han", "Tayvan": "han_trad", "Japonya": "japon",
  "Güney Kore": "hangul", "Kuzey Kore": "hangul", "Singapur": "coklu_sg",
  "Gürcistan": "gurcu", "Ermenistan": "ermeni", "Etiyopya": "geez", "Eritre": "geez"
};

/* ----------------------------------------------------------------------------
   NATURAL EARTH EŞLEŞTİRME TABLOLARI
   world-atlas verisindeki her ülkenin "id" alanı ISO 3166-1 sayısal kodudur.
   Kodu -99 olan (tartışmalı) kayıtlar NE_NAME_FIX ile ada göre eşlenir.
   Aynı oyun adına eşlenen birden çok kayıt (ör. Fas + Batı Sahra) topojson
   birleştirmesiyle TEK ülkeye dönüştürülür — eski oyundaki görünümle birebir.
   Eşleşmeyen kayıtlar (Grönland, Antarktika vb.) oyuna dahil edilmez;
   uydu dokusunda kara olarak görünmeye devam ederler.
   ---------------------------------------------------------------------------- */
const NE_ID_TO_GAME = {
  /* Avrupa */
  276: "Almanya", 20: "Andorra", 8: "Arnavutluk", 40: "Avusturya", 56: "Belçika",
  112: "Beyaz Rusya", 826: "Birleşik Krallık", 70: "Bosna-Hersek", 100: "Bulgaristan",
  203: "Çekya", 208: "Danimarka", 233: "Estonya", 246: "Finlandiya", 250: "Fransa",
  191: "Hırvatistan", 528: "Hollanda", 372: "İrlanda", 724: "İspanya", 752: "İsveç",
  756: "İsviçre", 380: "İtalya", 352: "İzlanda", 499: "Karadağ", 428: "Letonya",
  438: "Lihtenştayn", 440: "Litvanya", 442: "Lüksemburg", 348: "Macaristan",
  807: "Kuzey Makedonya", 470: "Malta", 498: "Moldova", 492: "Monako", 578: "Norveç",
  616: "Polonya", 620: "Portekiz", 642: "Romanya", 643: "Rusya", 674: "San Marino",
  688: "Sırbistan", 703: "Slovakya", 705: "Slovenya", 792: "Türkiye", 804: "Ukrayna",
  336: "Vatikan", 300: "Yunanistan",
  /* Asya */
  4: "Afganistan", 31: "Azerbaycan", 48: "Bahreyn", 50: "Bangladeş", 64: "Bhutan",
  784: "Birleşik Arap Emirlikleri", 104: "Myanmar", 96: "Brunei", 156: "Çin",
  360: "Endonezya", 51: "Ermenistan", 608: "Filipinler", 410: "Güney Kore",
  268: "Gürcistan", 356: "Hindistan", 368: "Irak", 364: "İran", 376: "İsrail",
  392: "Japonya", 116: "Kamboçya", 634: "Katar", 398: "Kazakistan", 417: "Kırgızistan",
  196: "Güney Kıbrıs Rum Yönetimi", 275: "Filistin",
  414: "Kuveyt", 408: "Kuzey Kore", 418: "Laos", 422: "Lübnan", 462: "Maldivler",
  458: "Malezya", 496: "Moğolistan", 524: "Nepal", 860: "Özbekistan", 586: "Pakistan",
  702: "Singapur", 144: "Sri Lanka", 760: "Suriye", 682: "Suudi Arabistan",
  762: "Tacikistan", 764: "Tayland", 158: "Tayvan", 626: "Doğu Timor",
  795: "Türkmenistan", 512: "Umman", 400: "Ürdün", 704: "Vietnam", 887: "Yemen",
  /* Afrika */
  24: "Angola", 204: "Benin", 72: "Botsvana", 854: "Burkina Faso", 108: "Burundi",
  132: "Yeşil Burun Adaları", 148: "Çad", 12: "Cezayir", 262: "Cibuti",
  180: "Kongo Demokratik Cumhuriyeti", 226: "Ekvator Ginesi", 232: "Eritre",
  748: "Esvatini", 231: "Etiyopya", 504: "Fas", 732: "Fas" /* Batı Sahra → Fas'a birleşir */,
  384: "Fildişi Sahili", 266: "Gabon", 270: "Gambiya", 288: "Gana", 624: "Gine-Bissau",
  324: "Gine", 710: "Güney Afrika", 728: "Güney Sudan", 120: "Kamerun", 404: "Kenya",
  174: "Komorlar", 178: "Kongo Cumhuriyeti", 426: "Lesotho", 430: "Liberya",
  434: "Libya", 450: "Madagaskar", 454: "Malavi", 466: "Mali", 480: "Mauritius",
  818: "Mısır", 478: "Moritanya", 508: "Mozambik", 516: "Namibya", 562: "Nijer",
  566: "Nijerya", 140: "Orta Afrika Cumhuriyeti", 646: "Ruanda",
  678: "São Tomé ve Príncipe", 686: "Senegal", 690: "Seyşeller", 694: "Sierra Leone",
  706: "Somali", 729: "Sudan", 736: "Sudan" /* eski kod */, 834: "Tanzanya",
  768: "Togo", 788: "Tunus", 800: "Uganda", 894: "Zambiya", 716: "Zimbabve",
  /* Kuzey Amerika */
  28: "Antigua ve Barbuda", 44: "Bahamalar", 52: "Barbados", 84: "Belize",
  840: "Amerika Birleşik Devletleri", 214: "Dominik Cumhuriyeti", 212: "Dominika",
  222: "El Salvador", 308: "Grenada", 320: "Guatemala", 332: "Haiti", 340: "Honduras",
  388: "Jamaika", 124: "Kanada", 188: "Kosta Rika", 192: "Küba", 484: "Meksika",
  558: "Nikaragua", 591: "Panama", 659: "Saint Kitts ve Nevis", 662: "Saint Lucia",
  670: "Saint Vincent ve Grenadinler", 780: "Trinidad ve Tobago",
  /* Güney Amerika */
  32: "Arjantin", 68: "Bolivya", 76: "Brezilya", 218: "Ekvador", 328: "Guyana",
  170: "Kolombiya", 600: "Paraguay", 604: "Peru", 152: "Şili", 740: "Surinam",
  858: "Uruguay", 862: "Venezuela",
  /* Okyanusya */
  36: "Avustralya", 242: "Fiji", 296: "Kiribati", 584: "Marshall Adaları",
  583: "Mikronezya", 520: "Nauru", 585: "Palau", 598: "Papua Yeni Gine",
  882: "Samoa", 90: "Solomon Adaları", 776: "Tonga", 798: "Tuvalu",
  548: "Vanuatu", 554: "Yeni Zelanda"
};

/* id'si -99 (veya boş) olan Natural Earth kayıtları — ada göre eşleme.
   null → oyuna dahil edilmez.
   NOT: Kıbrıs ve KKTC de Natural Earth KARA sınırlarından gelir. Kullanıcının
   OSM dosyaları denendi ancak karasuları (12 mil deniz sınırı) içerdikleri
   anlaşıldı — denizler ülke gibi görünüyordu; bu yüzden elendi. */
const NE_NAME_FIX = {
  "Kosovo": "Kosova",
  "Somaliland": "Somali",          /* Somali'ye birleşir (eski oyunla aynı) */
  "W. Sahara": "Fas",              /* Fas'a birleşir (eski oyunla aynı)     */
  "Western Sahara": "Fas",
  "Norway": "Norveç",
  "France": "Fransa",
  "Kazakhstan": "Kazakistan",
  "N. Cyprus": "Kuzey Kıbrıs Türk Cumhuriyeti",
  "Northern Cyprus": "Kuzey Kıbrıs Türk Cumhuriyeti",
  "Cyprus": "Güney Kıbrıs Rum Yönetimi",
  "Palestine": "Filistin",
  "Cyprus U.N. Buffer Zone": null,
  "Indian Ocean Ter.": null,
  "Ashmore and Cartier Is.": null,
  "Siachen Glacier": null
};

/* Acil durum yedeği: Natural Earth'te bulunamayan mikro ülkeler için
   eski oyundaki (kaba) geometri. Normalde hiç kullanılmaz. */
const OLD_MICRO_FALLBACK = __OLD_MICRO__;

/* KKTC bayrağı (flagcdn'de bulunmadığı için gömülü SVG) */
const KKTC_FLAG_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20">' +
  '<rect width="30" height="20" fill="#fff"/>' +
  '<rect y="3.1" width="30" height="1.7" fill="#E30A17"/>' +
  '<rect y="15.2" width="30" height="1.7" fill="#E30A17"/>' +
  '<circle cx="12.9" cy="10" r="4.3" fill="#E30A17"/>' +
  '<circle cx="14.05" cy="10" r="3.35" fill="#fff"/>' +
  '<polygon fill="#E30A17" points="19.90,10.00 18.31,10.52 18.31,12.19 17.33,10.84 15.74,11.35 16.72,10.00 15.74,8.65 17.33,9.16 18.31,7.81 18.31,9.48"/>' +
  '</svg>';
const KKTC_FLAG_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(KKTC_FLAG_SVG);
