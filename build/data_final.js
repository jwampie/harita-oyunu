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

const CONTINENTS = {"Avrupa":["Almanya","Andorra","Arnavutluk","Avusturya","Belçika","Beyaz Rusya","Birleşik Krallık","Bosna-Hersek","Bulgaristan","Danimarka","Estonya","Finlandiya","Fransa","Hollanda","Hırvatistan","Karadağ","Kosova","Kuzey Makedonya","Letonya","Lihtenştayn","Litvanya","Lüksemburg","Macaristan","Malta","Moldova","Monako","Norveç","Polonya","Portekiz","Romanya","Rusya","San Marino","Slovakya","Slovenya","Sırbistan","Ukrayna","Vatikan","Yunanistan","Çekya","İrlanda","İspanya","İsveç","İsviçre","İtalya","İzlanda"],"Asya":["Afganistan","Azerbaycan","Bahreyn","Bangladeş","Bhutan","Birleşik Arap Emirlikleri","Brunei","Doğu Timor","Endonezya","Ermenistan","Filipinler","Filistin","Güney Kore","Gürcistan","Hindistan","Irak","Japonya","Kamboçya","Katar","Kazakistan","Kuveyt","Kuzey Kore","Kuzey Kıbrıs Türk Cumhuriyeti","Güney Kıbrıs Rum Yönetimi","Kırgızistan","Laos","Lübnan","Maldivler","Malezya","Moğolistan","Myanmar","Nepal","Pakistan","Singapur","Sri Lanka","Suriye","Suudi Arabistan","Tacikistan","Tayland","Tayvan","Türkiye","Türkmenistan","Umman","Vietnam","Yemen","Çin","Özbekistan","Ürdün","İran","İsrail"],"Afrika":["Angola","Benin","Botsvana","Burkina Faso","Burundi","Cezayir","Cibuti","Ekvator Ginesi","Eritre","Esvatini","Etiyopya","Fas","Fildişi Sahili","Gabon","Gambiya","Gana","Gine","Gine-Bissau","Güney Afrika","Güney Sudan","Kamerun","Kenya","Komorlar","Kongo Cumhuriyeti","Kongo Demokratik Cumhuriyeti","Lesotho","Liberya","Libya","Madagaskar","Malavi","Mali","Mauritius","Moritanya","Mozambik","Mısır","Namibya","Nijer","Nijerya","Orta Afrika Cumhuriyeti","Ruanda","Senegal","Seyşeller","Sierra Leone","Somali","Sudan","São Tomé ve Príncipe","Tanzanya","Togo","Tunus","Uganda","Yeşil Burun Adaları","Zambiya","Zimbabve","Çad"],"Kuzey Amerika":["Amerika Birleşik Devletleri","Antigua ve Barbuda","Bahamalar","Barbados","Belize","Dominik Cumhuriyeti","Dominika","El Salvador","Grenada","Guatemala","Haiti","Honduras","Jamaika","Kanada","Kosta Rika","Küba","Meksika","Nikaragua","Panama","Saint Kitts ve Nevis","Saint Lucia","Saint Vincent ve Grenadinler","Trinidad ve Tobago"],"Güney Amerika":["Arjantin","Bolivya","Brezilya","Ekvador","Guyana","Kolombiya","Paraguay","Peru","Surinam","Uruguay","Venezuela","Şili"],"Okyanusya":["Avustralya","Fiji","Kiribati","Marshall Adaları","Mikronezya","Nauru","Palau","Papua Yeni Gine","Samoa","Solomon Adaları","Tonga","Tuvalu","Vanuatu","Yeni Zelanda"]};
const CONTINENTS_ORDER = ["Avrupa", "Asya", "Kuzey Amerika", "Güney Amerika", "Afrika", "Okyanusya"];
const CENTROIDS = {"Almanya":[9.877098936,50.763668987],"Andorra":[1.52646608,42.52623372],"Arnavutluk":[20.046410921052633,41.05361421052632],"Avusturya":[13.451951084444444,47.65213912222222],"Belçika":[5.009855868181818,50.72022421590909],"Beyaz Rusya":[28.093275046969698,53.49769288939394],"Birleşik Krallık":[-3.7347859336842104,54.85330717052632],"Bosna-Hersek":[17.905391803703704,44.06259647777778],"Bulgaristan":[25.22455167297297,42.77372351351352],"Danimarka":[10.55133265882353,56.09927923529411],"Estonya":[24.986967536,58.299790316],"Finlandiya":[25.63863599275362,65.82028325217391],"Fransa":[2.794947405952381,46.952163015476195],"Hırvatistan":[16.47471249310345,44.479090443103445],"Hollanda":[5.478255747058824,51.782163352941176],"İrlanda":[-8.053907149999999,53.60006471],"İspanya":[-3.7460845483333336,40.50899481333333],"İsveç":[16.63698839,62.726376297777776],"İsviçre":[8.52950759117647,46.74641329705882],"İtalya":[12.358440081176472,42.51195940352941],"İzlanda":[-17.872471424,65.41531328],"Karadağ":[19.26214395625,42.6187071875],"Kosova":[20.7889073,42.63870325714286],"Letonya":[24.79471032142857,56.869232607142855],"Lihtenştayn":[9.550725825,47.136779475],"Litvanya":[23.930291786206897,55.08630276206897],"Lüksemburg":[6.020197075,49.725272775],"Macaristan":[19.0390076,47.5681066],"Kuzey Makedonya":[21.894839283333337,41.4997271],"Malta":[14.309490957142858,36.005823771428574],"Moldova":[28.652441541176472,47.11319997058824],"Monako":[7.427178785714285,43.73976171428571],"Norveç":[16.866431383870967,65.63399351182795],"Polonya":[18.753557262745097,51.50692886470588],"Portekiz":[-7.907244335714286,39.62384827142857],"Romanya":[24.972215495238093,45.70960167142857],"Rusya":[90.45129983855263,57.533556035],"San Marino":[12.46888,43.949811499999996],"Sırbistan":[20.635121241860464,44.21102860465116],"Slovakya":[19.528398022222223,48.67022864444444],"Slovenya":[14.966323396296296,46.066139648148145],"Ukrayna":[31.603414067716535,48.7096622992126],"Vatikan":[12.45592025,41.904307],"Yunanistan":[23.555979173451327,38.570064918584066],"Afganistan":[67.52257408913044,34.826946523913044],"Azerbaycan":[47.37973349285714,40.22614070238095],"Bahreyn":[50.548602914285716,26.114084228571432],"Bangladeş":[90.11351365714286,24.226888223809524],"Bhutan":[90.48298046470589,27.39919235882353],"Birleşik Arap Emirlikleri":[54.45648301785714,24.687777892857145],"Myanmar":[97.50723105181818,21.189069328181816],"Brunei":[114.8170213181818,4.6795335636363635],"Çin":[104.72512216036269,37.89379489663212],"Endonezya":[119.53650816638655,-1.9529090831932772],"Ermenistan":[45.28617852222222,40.133198433333334],"Filipinler":[121.10529653846154,10.362125302564102],"Güney Kore":[127.11725503225806,35.69010933548387],"Gürcistan":[43.611329383333334,42.150343330000005],"Hindistan":[83.65834727056277,25.973616373160173],"Irak":[44.95603387647059,33.61578760588235],"İran":[52.80124909333334,34.00186764095238],"İsrail":[35.098930005,32.031174005000004],"Japonya":[135.7666889390625,35.235719896875],"Kamboçya":[105.24539712608694,12.381190063043478],"Katar":[51.12962826666667,25.469819844444444],"Kazakistan":[65.85796970798319,49.12009472268908],"Kırgızistan":[73.15622842,41.00370889142857],"Kuveyt":[47.773373129999996,29.202926150000003],"Kuzey Kore":[128.3293401125,40.96656696785714],"Laos":[103.60154393461539,18.70192527307692],"Lübnan":[35.93985474285714,33.85113257142857],"Maldivler":[73.22538251666667,3.632738408333333],"Malezya":[115.03412323773584,3.6536946924528304],"Moğolistan":[101.98003606806722,47.76228822605042],"Nepal":[84.35221460784314,28.09631970392157],"Özbekistan":[65.98441172150538,40.94226118494623],"Pakistan":[70.41665528198199,30.81051785135135],"Singapur":[103.81310142,1.30690578],"Sri Lanka":[80.46213855882354,8.028466164705883],"Suriye":[37.84937984324324,35.29547749459459],"Suudi Arabistan":[43.851194515625,24.1822602453125],"Tacikistan":[70.66628625068493,38.87726488904109],"Tayland":[100.41348396981132,13.38100178490566],"Tayvan":[120.98273636363636,23.74476363636364],"Doğu Timor":[125.80406163636363,-8.762695209090909],"Türkiye":[34.32595902970297,39.06482042079208],"Türkmenistan":[58.779076814084505,39.32909711267605],"Umman":[56.625102602702704,21.339695805405405],"Ürdün":[37.1150676,31.316410377777782],"Vietnam":[105.37323893411765,17.30407198470588],"Yemen":[45.321856304444445,15.5398274],"Angola":[17.76856367962963,-11.716685840740741],"Benin":[2.264240103448276,9.899822355172414],"Botsvana":[24.474472113157894,-22.67245503157895],"Burkina Faso":[-1.9540900296296297,12.183515250000001],"Burundi":[29.897957209999998,-3.0849948300000003],"Yeşil Burun Adaları":[-24.420759607692307,16.24220826923077],"Çad":[18.444032730508475,13.283857238983051],"Cezayir":[2.9936915493150686,30.018592779452057],"Cibuti":[42.73806363333333,11.951103716666665],"Kongo Demokratik Cumhuriyeti":[23.733039837301586,-4.0326437126984125],"Ekvator Ginesi":[10.03101931111111,1.6011317555555555],"Eritre":[39.37649471388889,15.134563283333332],"Esvatini":[31.454398322222218,-26.639726044444444],"Etiyopya":[38.595335823333336,8.969626273333335],"Fas":[-7.63354509032258,29.89981880483871],"Fildişi Sahili":[-6.027494740000001,8.197017489090909],"Gabon":[12.24913292051282,-1.2638032205128205],"Gambiya":[-15.629700135294119,13.411939570588235],"Gana":[-1.0487809756756756,7.927077686486486],"Gine-Bissau":[-15.04126445,11.894066125],"Gine":[-10.786702361428572,10.104402247142856],"Güney Afrika":[24.48506530952381,-27.81754585873016],"Güney Sudan":[30.223550971428573,7.38185026103896],"Kamerun":[12.581684814545456,7.3040923399999995],"Kenya":[37.433251040740736,1.806869248148148],"Komorlar":[43.594680700000005,-11.965761042857142],"Kongo Cumhuriyeti":[14.316883391044776,-1.4873248731343285],"Lesotho":[28.072386425,-29.707540775],"Liberya":[-9.233473266666666,6.895448108333333],"Libya":[15.629995807142857,28.36637702142857],"Madagaskar":[46.51186792000001,-18.438835184],"Malavi":[34.0999851475,-13.1495939125],"Mali":[-5.5917508209302325,14.232735451162792],"Mauritius":[57.56819854285715,-20.281530371428573],"Mısır":[31.019668679166667,28.409264716666666],"Moritanya":[-12.04745590882353,18.78749508529412],"Mozambik":[35.067023299999995,-17.36925478],"Namibya":[17.81980199,-21.571115335],"Nijer":[7.179463152830188,15.390115],"Nijerya":[8.588758339682538,9.664470276190476],"Orta Afrika Cumhuriyeti":[21.171710824242425,6.290103021212121],"Ruanda":[29.69662677222222,-2.1350572333333333],"São Tomé ve Príncipe":[6.882716285714286,0.7661330571428572],"Senegal":[-14.736109030232559,13.90596228372093],"Seyşeller":[55.565924575,-4.188592458333333],"Sierra Leone":[-11.71211674,8.515746595],"Somali":[46.383402884999995,7.717206482500001],"Sudan":[30.13009041647059,13.924970928235293],"Tanzanya":[34.64480727115385,-7.289034732692307],"Togo":[0.7558412076923078,8.866024626923076],"Tunus":[9.660732216666666,34.76734600714286],"Uganda":[32.15832942666667,1.79747474],"Zambiya":[28.716245491549298,-12.545151052112676],"Zimbabve":[29.97920074347826,-18.986823249999997],"Antigua ve Barbuda":[-62.04546738571428,17.26367467142857],"Bahamalar":[-77.82917322222222,24.22186318888889],"Barbados":[-59.649482666666664,13.179166666666667],"Belize":[-88.31159447692306,17.301341484615385],"Amerika Birleşik Devletleri":[-154.9401777894737,59.32872402966507],"Dominik Cumhuriyeti":[-70.9392948,19.2204321],"Dominika":[-61.37928376,15.424767220000001],"El Salvador":[-88.83885777333333,13.676459719999999],"Grenada":[-61.73123285,12.104377883333333],"Guatemala":[-90.33877065,15.497347386363636],"Haiti":[-72.97540179166667,18.934009733333333],"Honduras":[-85.62977946999999,14.735827277499999],"Jamaika":[-77.65512386666666,17.937728355555556],"Kanada":[-90.19714643157894,58.13878286172249],"Kosta Rika":[-83.93214858461539,10.032272415384616],"Küba":[-79.84185872272727,21.359846490909092],"Meksika":[-102.29787156305733,23.447576457324843],"Nikaragua":[-85.08108278181818,12.876554572727272],"Panama":[-80.59820561304348,8.57294694347826],"Saint Kitts ve Nevis":[-62.77133056,17.2691771],"Saint Lucia":[-61.00953751428572,13.857720214285715],"Saint Vincent ve Grenadinler":[-61.2730241,12.865032814285714],"Trinidad ve Tobago":[-61.16507465,10.638893975],"Arjantin":[-65.40296336026786,-36.854675067857144],"Bolivya":[-64.95238007922079,-16.653619951948052],"Brezilya":[-57.66491978427947,-9.936359204803495],"Ekvador":[-78.20804592972974,-1.8838365324324322],"Guyana":[-59.02059378297872,4.505840117021276],"Kolombiya":[-72.24790658333333,3.5129209722222225],"Paraguay":[-57.80937787962963,-24.717082201851852],"Peru":[-74.69393867096774,-7.812126952688172],"Şili":[-71.34507574590164,-38.23215423169399],"Surinam":[-56.05354881923077,3.801133069230769],"Uruguay":[-56.737236258974356,-32.390334156410255],"Venezuela":[-65.93065709252336,7.020925980373832],"Avustralya":[136.43432672941177,-25.465007968382352],"Fiji":[-178.94960173333334,-18.881178266666666],"Kiribati":[173.26603055454547,1.6698522636363635],"Marshall Adaları":[167.15464786956522,8.782336173913043],"Mikronezya":[151.66736777,8.56457333],"Nauru":[166.89041758,-0.5280164],"Palau":[132.75526132,5.17315599],"Papua Yeni Gine":[148.87223262428572,-6.895233347142858],"Samoa":[-172.13203718999998,-13.771896799999999],"Solomon Adaları":[158.63886992941178,-8.390132852941177],"Tonga":[-174.71516591666668,-19.918571358333335],"Tuvalu":[179.09127897142858,-8.638256],"Vanuatu":[168.3486257666667,-16.923076386666665],"Yeni Zelanda":[173.02211457530865,-40.729137560493825],"Çekya":[15.276788623287672,49.92303260684931],"Kuzey Kıbrıs Türk Cumhuriyeti":[33.53030866062992,35.148162903513025],"Güney Kıbrıs Rum Yönetimi":[33.16843669545777,35.04162726891413],"Filistin":[35.26,31.95]};
const FLAG_MAP = {"Almanya":"de","Andorra":"ad","Arnavutluk":"al","Avusturya":"at","Belçika":"be","Beyaz Rusya":"by","Birleşik Krallık":"gb","Bosna-Hersek":"ba","Bulgaristan":"bg","Danimarka":"dk","Estonya":"ee","Finlandiya":"fi","Fransa":"fr","Hırvatistan":"hr","Hollanda":"nl","İrlanda":"ie","İspanya":"es","İsveç":"se","İsviçre":"ch","İtalya":"it","İzlanda":"is","Karadağ":"me","Kosova":"xk","Letonya":"lv","Lihtenştayn":"li","Litvanya":"lt","Lüksemburg":"lu","Macaristan":"hu","Kuzey Makedonya":"mk","Malta":"mt","Moldova":"md","Monako":"mc","Norveç":"no","Polonya":"pl","Portekiz":"pt","Romanya":"ro","Rusya":"ru","San Marino":"sm","Sırbistan":"rs","Slovakya":"sk","Slovenya":"si","Türkiye":"tr","Ukrayna":"ua","Vatikan":"va","Yunanistan":"gr","Afganistan":"af","Azerbaycan":"az","Bahreyn":"bh","Bangladeş":"bd","Bhutan":"bt","Birleşik Arap Emirlikleri":"ae","Myanmar":"mm","Brunei":"bn","Çin":"cn","Endonezya":"id","Ermenistan":"am","Filipinler":"ph","Güney Kore":"kr","Gürcistan":"ge","Hindistan":"in","Irak":"iq","İran":"ir","İsrail":"il","Japonya":"jp","Kamboçya":"kh","Katar":"qa","Kazakistan":"kz","Kırgızistan":"kg","Kuveyt":"kw","Kuzey Kore":"kp","Laos":"la","Lübnan":"lb","Maldivler":"mv","Malezya":"my","Moğolistan":"mn","Nepal":"np","Özbekistan":"uz","Pakistan":"pk","Singapur":"sg","Sri Lanka":"lk","Suriye":"sy","Suudi Arabistan":"sa","Tacikistan":"tj","Tayland":"th","Tayvan":"tw","Doğu Timor":"tl","Türkmenistan":"tm","Umman":"om","Ürdün":"jo","Vietnam":"vn","Yemen":"ye","Angola":"ao","Benin":"bj","Botsvana":"bw","Burkina Faso":"bf","Burundi":"bi","Yeşil Burun Adaları":"cv","Çad":"td","Cezayir":"dz","Cibuti":"dj","Kongo Demokratik Cumhuriyeti":"cd","Ekvator Ginesi":"gq","Eritre":"er","Esvatini":"sz","Etiyopya":"et","Fas":"ma","Fildişi Sahili":"ci","Gabon":"ga","Gambiya":"gm","Gana":"gh","Gine-Bissau":"gw","Gine":"gn","Güney Afrika":"za","Güney Sudan":"ss","Kamerun":"cm","Kenya":"ke","Komorlar":"km","Kongo Cumhuriyeti":"cg","Lesotho":"ls","Liberya":"lr","Libya":"ly","Madagaskar":"mg","Malavi":"mw","Mali":"ml","Mauritius":"mu","Mısır":"eg","Moritanya":"mr","Mozambik":"mz","Namibya":"na","Nijer":"ne","Nijerya":"ng","Orta Afrika Cumhuriyeti":"cf","Ruanda":"rw","São Tomé ve Príncipe":"st","Senegal":"sn","Seyşeller":"sc","Sierra Leone":"sl","Somali":"so","Sudan":"sd","Tanzanya":"tz","Togo":"tg","Tunus":"tn","Uganda":"ug","Zambiya":"zm","Zimbabve":"zw","Antigua ve Barbuda":"ag","Bahamalar":"bs","Barbados":"bb","Belize":"bz","Amerika Birleşik Devletleri":"us","Dominik Cumhuriyeti":"do","Dominika":"dm","El Salvador":"sv","Grenada":"gd","Guatemala":"gt","Haiti":"ht","Honduras":"hn","Jamaika":"jm","Kanada":"ca","Kosta Rika":"cr","Küba":"cu","Meksika":"mx","Nikaragua":"ni","Panama":"pa","Saint Kitts ve Nevis":"kn","Saint Lucia":"lc","Saint Vincent ve Grenadinler":"vc","Trinidad ve Tobago":"tt","Arjantin":"ar","Bolivya":"bo","Brezilya":"br","Ekvador":"ec","Guyana":"gy","Kolombiya":"co","Paraguay":"py","Peru":"pe","Şili":"cl","Surinam":"sr","Uruguay":"uy","Venezuela":"ve","Avustralya":"au","Fiji":"fj","Kiribati":"ki","Marshall Adaları":"mh","Mikronezya":"fm","Nauru":"nr","Palau":"pw","Papua Yeni Gine":"pg","Samoa":"ws","Solomon Adaları":"sb","Tonga":"to","Tuvalu":"tv","Vanuatu":"vu","Yeni Zelanda":"nz","Çekya":"cz","Kuzey Kıbrıs Türk Cumhuriyeti":"kktc","Güney Kıbrıs Rum Yönetimi":"cy","Filistin":"ps"};

/* Kısaltma ve yaygın alternatif adlar (normalize edilmiş biçimde) */
const ALIASES = Object.assign({"kktc":"Kuzey Kıbrıs Türk Cumhuriyeti","kuzey kibris":"Kuzey Kıbrıs Türk Cumhuriyeti","kuzey kibris turk cumhuriyeti":"Kuzey Kıbrıs Türk Cumhuriyeti","kuzey kibris turk cum":"Kuzey Kıbrıs Türk Cumhuriyeti","guney kibris":"Güney Kıbrıs Rum Yönetimi","kibris cumhuriyeti":"Güney Kıbrıs Rum Yönetimi"}, {
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
const OLD_MICRO_FALLBACK = {"Andorra":{"type":"Polygon","coordinates":[[[1.4077997,42.486294],[1.5510875,42.4326182],[1.7868662,42.5745126],[1.4787773,42.6514498],[1.4077997,42.486294]]]},"Lihtenştayn":{"type":"Polygon","coordinates":[[[9.5193111,47.0965561],[9.6335324,47.0834247],[9.5307487,47.270581],[9.5193111,47.0965561]]]},"Lüksemburg":{"type":"Polygon","coordinates":[[[5.7356988,49.8969246],[5.9106751,49.6624741],[5.8085478,49.5409107],[5.9819721,49.4510675],[6.3688512,49.4598681],[6.517683,49.7234631],[6.1024498,50.1705495],[5.7356988,49.8969246]]]},"Malta":{"type":"Polygon","coordinates":[[[13.9360446,36.0715762],[14.3160471,35.600521],[14.8096919,35.7858562],[14.7643247,35.9967998],[14.3439654,36.2660417],[14.0603184,36.2483953],[13.9360446,36.0715762]]]},"San Marino":{"type":"Polygon","coordinates":[[[12.4365217,43.9566339],[12.4874043,43.8964693],[12.5150723,43.9895089],[12.4365217,43.9566339]]]},"Vatikan":{"type":"Polygon","coordinates":[[[12.4554001,41.9073829],[12.4545155,41.9002048],[12.4583653,41.9022574],[12.4554001,41.9073829]]]},"Bahreyn":{"type":"Polygon","coordinates":[[[50.2697989,26.0797357],[50.4334095,25.6791807],[50.81,25.535],[50.9233651,26.2672151],[50.7462712,26.6277097],[50.3875768,26.5300127],[50.2697989,26.0797357]]]},"Singapur":{"type":"Polygon","coordinates":[[[103.5655797,1.1956685],[104.1290145,1.2726318],[104.0915225,1.412616],[103.7138107,1.4579441],[103.5655797,1.1956685]]]},"Komorlar":{"type":"Polygon","coordinates":[[[42.8262181,-11.803432],[43.5259961,-12.5639198],[44.4374566,-12.9854371],[44.9730591,-12.1975229],[43.4281462,-11.1721574],[43.1456707,-11.2344261],[42.8262181,-11.803432]]]},"São Tomé ve Príncipe":{"type":"Polygon","coordinates":[[[6.260642,0.2494502],[6.4162281,-0.1861604],[6.7829156,-0.0844596],[7.6195288,1.4392509],[7.6054134,1.8331509],[7.2336441,1.8622492],[6.260642,0.2494502]]]},"Antigua ve Barbuda":{"type":"Polygon","coordinates":[[[-62.5548313,16.8974346],[-62.4475901,16.755628],[-61.5130019,16.9166717],[-61.5211259,17.6370611],[-61.6856322,17.8868107],[-62.041259,17.854682],[-62.5548313,16.8974346]]]},"Barbados":{"type":"Polygon","coordinates":[[[-59.8562115,13.308],[-59.8124156,13.006],[-59.6057424,12.86],[-59.2292067,13.072],[-59.5371083,13.521],[-59.8562115,13.308]]]},"Dominika":{"type":"Polygon","coordinates":[[[-61.4801175,15.5372748],[-61.3741178,15.2141983],[-61.2595336,15.2507792],[-61.3025324,15.584309],[-61.4801175,15.5372748]]]},"Grenada":{"type":"Polygon","coordinates":[[[-62.0072687,12.0013516],[-61.880575,11.8045586],[-61.6196349,11.8117249],[-61.2095018,12.3975559],[-61.663148,12.6097247],[-62.0072687,12.0013516]]]},"Saint Kitts ve Nevis":{"type":"Polygon","coordinates":[[[-63.0491098,17.2767349],[-62.5995412,16.8926305],[-62.3741863,17.28273],[-62.7847057,17.6170552],[-63.0491098,17.2767349]]]},"Saint Lucia":{"type":"Polygon","coordinates":[[[-61.2855618,13.8629618],[-61.1641981,13.599294],[-60.850187,13.5272198],[-60.6852133,13.7676733],[-60.6964271,14.1358207],[-61.0996135,14.2481101],[-61.2855618,13.8629618]]]},"Saint Vincent ve Grenadinler":{"type":"Polygon","coordinates":[[[-61.6645712,12.610332],[-61.2104846,12.3983584],[-61.0980577,12.4990585],[-60.9211871,12.9400664],[-60.9827451,13.5092693],[-61.3695518,13.4878131],[-61.6645712,12.610332]]]},"Trinidad ve Tobago":{"type":"Polygon","coordinates":[[[-62.083056,10.046111],[-61.1918763,9.8732106],[-60.8592411,9.97879],[-60.305234,11.2182275],[-60.3498803,11.4799629],[-60.7188095,11.5208215],[-61.729444,10.9479173],[-62.083056,10.046111]]]},"Nauru":{"type":"Polygon","coordinates":[[[166.7106737,-0.528],[166.9352626,-0.7526654],[167.1600334,-0.5280907],[166.9354445,-0.3033259],[166.7106737,-0.528]]]}};

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
