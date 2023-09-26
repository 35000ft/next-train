﻿var stationNames = "@1,八卦洲大桥南,BAGUAZHOUDAQIAONAN,BGZ,1&@2,笆斗山,BADOUSHAN,BDS,1&@3,燕子矶,YANZIJI,YZJ,1&@4,吉祥庵,JIXIANGAN,JXA,1&@5,晓庄,XIAOZHUANG,XZA,1,7&@6,迈皋桥,MAIGAOQIAO,MGQ,1&@7,红山动物园,HONGSHAN Zoo,HSZ,1&@8,南京站,NANJING Railway Station,NJC,1,3&@9,新模范马路,XINMOFANMALU,MFR,1&@10,玄武门,XUANWUMEN,XWM,1&@11,鼓楼,GULOU,GLX,1,4&@12,珠江路,ZHUJIANGLU,ZJL,1&@13,新街口,XINJIEKOU,XJK,1,2&@14,张府园,ZHANGFUYUAN,ZFY,1&@15,三山街,SANSHANJIE,SSJ,1&@16,中华门,ZHONGHUAMEN,ZHM,1&@17,安德门,ANDEMEN,ADM,1,10&@18,天隆寺,TIANLONGSI,TLS,1&@19,软件大道,RUANJIANDADAO,RJA,1&@20,花神庙,HUASHENMIAO,HSM,1&@21,南京南站,NANJING SouthRailway Station,NJS,1,3,S1,S3&@22,双龙大道,SHUANGLONGDADAO,SLA,1&@23,河定桥,HEDINGQIAO,HDQ,1&@24,胜太路,SHENGTAILU,STL,1&@25,百家湖,BAIJIAHU,BJH,1&@26,小龙湾,XIAOLONGWAN,XLW,1&@27,竹山路,ZHUSHANLU,ZSL,1&@28,天印大道,TIANYINDADAO,TYA,1&@29,龙眠大道,LONGMIANDADAO,LMA,1&@30,南医大·江苏经贸学院,NMU·JIETT,NMU,1&@31,南京交院,NJCI,CIC,1&@32,中国药科大学,CPU,CPU,1&@33,鱼嘴,YUZUI,YZX,2&@34,天保街,TIANBAOJIE,TBJ,2&@35,青莲街,QINGLIANJIE,QLJ,2&@36,螺塘路,LUOTANGLU,LTL,2&@37,油坊桥,YOUFANGQIAO,YFQ,2,S3&@38,雨润大街,YURUNDAJIE,YRA,2&@39,元通,YUANTONG,YTX,2,10&@40,奥体东,Olympic Stadium East,OSE,2&@41,兴隆大街,XINGLONGDAJIE,XLA,2&@42,集庆门大街,JIQINGMENDAJIE,JQM,2&@43,云锦路,YUNJINLU,YJL,2&@44,莫愁湖,MOCHOUHU,MCH,2&@45,汉中门,HANZHONGMEN,HZM,2&@46,上海路,SHANGHAILU,SHL,2&@47,大行宫,DAXINGGONG,DXG,2,3&@48,西安门,XI'ANMEN,XAM,2&@49,明故宫,MINGGUGONG,MGG,2&@50,苜蓿园,MUXUYUAN,MXY,2&@51,下马坊,XIAMAFANG,XMF,2&@52,孝陵卫,XIAOLINGWEI,XLI,2&@53,钟灵街,ZHONGLINGJIE,ZLJ,2&@54,马群,MAQUN,MQX,2,S6&@55,金马路,JINMALU,JML,2,4&@56,仙鹤门,XIANHEMEN,XHM,2&@57,学则路,XUEZELU,XZL,2&@58,仙林中心,XIANLINZHONGXIN,XLC,2&@59,羊山公园,YANGSHANGONGYUAN,YSP,2&@60,南大仙林校区,NJU Xianlin Campus,NJU,2&@61,经天路,JINGTIANLU,JTL,2&@62,林场,LINCHANG,LCX,3&@63,星火路,XINGHUOLU,XHL,3&@64,东大成贤学院,SEU CHENGXIAN College,CXC,3&@65,泰冯路,TAIFENGLU,TFL,3,S8&@66,天润城,TIANRUNCHENG,TRC,3&@67,柳洲东路,LIUZHOUDONGLU,LZE,3&@68,上元门,SHANGYUANMEN,SYM,3&@69,五塘广场,WUTANGGUANGCHANG,WTS,3,7&@70,小市,XIAOSHI,XSX,3&@71,南京林业大学·新庄,NFU·XINZHUANG,NFU,3&@72,鸡鸣寺,JIMINGSI,JMS,3,4&@73,浮桥,FUQIAO,FQX,3&@74,常府街,CHANGFUJIE,CFJ,3&@75,夫子庙,FUZIMIAO,FZM,3&@76,武定门,WUDINGMEN,WDM,3&@77,雨花门,YUHUAMEN,YHM,3&@78,卡子门,KAZIMEN,KZM,3&@79,大明路,DAMINGLU,DML,3&@80,明发广场,MINGFAGUANGCHANG,MFG,3&@81,宏运大道,HONGYUNDADAO,HRA,3&@82,胜太西路,SHENGTAIXILU,STW,3&@83,天元西路,TIANYUANXILU,TYW,3&@84,九龙湖,JIULONGHU,JLH,3&@85,诚信大道,CHENGXINDADAO,CXA,3&@86,东大九龙湖校区,SEU JIULONGHU Campus,SEU,3&@87,秣周东路,MOZHOUDONGLU,MZE,3&@88,龙江,LONGJIANG,LJX,4&@89,草场门,CAOCHANGMEN,CCM,4&@90,云南路,YUNNANLU,YNL,4&@91,九华山,JIUHUASHAN,JHS,4&@92,岗子村,GANGZICUN,GZC,4&@93,蒋王庙,JIANGWANGMIAO,JWM,4&@94,王家湾,WANGJIAWAN,WJW,4&@95,聚宝山,JUBAOSHAN,JBS,4&@96,徐庄,XUZHUANG,XZX,4&@97,汇通路,HUITONGLU,HTL,4&@98,灵山,LINGSHAN,LSX,4&@99,东流,DONGLIU,DLX,4&@100,孟北,MENGBEI,MBX,4&@101,西岗桦墅,XIGANGHUASHU,XGH,4&@102,仙林湖,XIANLINHU,XLH,4&@103,仙新路,XIANXINLU,XXL,7&@104,尧化门,YAOHUAMEN,YHX,7&@105,尧化新村,YAOHUAXINCUN,YHC,7&@106,丁家庄南,DINGJIAZHUANGNAN,DJS,7&@107,丁家庄,DINGJIAZHUANG,DJZ,7&@108,万寿,WANSHOU,WSX,7&@109,幕府山,MUFUSHAN,MFS,7&@110,幕府西路,MUFUXILU,MFW,7&@111,小行,XIAOHANG,XHX,10&@112,中胜,ZHONGSHENG,ZSX,10&@113,奥体中心,Olympic Sports Center,OSC,10&@114,梦都大街,MENGDOUDAJIE,MDA,10&@115,绿博园,LVBOYUAN,LBY,10&@116,江心洲,JIANGXINZHOU,JXZ,10&@117,临江,LINJIANG,LNJ,10&@118,浦口万汇城,PUKOUWANHUICHENG,PKW,10&@119,南京工业大学,NJTECH,NJT,10&@120,龙华路,LONGHUALU,LHL,10&@121,文德路,WENDELU,WDL,10&@122,雨山路,YUSHANLU,YSL,10&@123,翠屏山,CUIPINGSHAN,CPS,S1&@124,河海大学·佛城西路,HHU·FOCHENGXILU,HHU,S1&@125,吉印大道,JIYINDADAO,JYA,S1&@126,正方中路,ZHENGFANGZHONGLU,ZFM,S1&@127,翔宇路北,XIANGYULUBEI,XYN,S1&@128,翔宇路南,XIANGYULUNAN,XYS,S1,S9&@129,禄口机场,LUKOU International Airport,NKG,S1&@130,空港新城江宁,KONGGANGXINCHENGJIANGNING,KGJ,S1,S7&@131,柘塘,ZHETANG,ZTX,S7&@132,空港新城溧水,KONGGANGXINCHENGLISHUI,KGL,S7&@133,群力,QUNLI,QLX,S7&@134,卧龙湖,WOLONGHU,WLH,S7&@135,溧水,LISHUI,LSH,S7&@136,中山湖,ZHONGSHANHU,ZSH,S7&@137,幸庄,XINGZHUANG,XZG,S7&@138,无想山,WUXIANGSHAN,WXS,S7&@139,景明佳园,JINGMINGJIAYUAN,JMJ,S3&@140,铁心桥,TIEXINQIAO,TSQ,S3&@141,春江路,CHUNJIANGLU,CJL,S3&@142,贾西,JIAXI,JXX,S3&@143,永初路,YONGCHULU,YCL,S3&@144,平良大街,PINGLIANGDAJIE,PLS,S3&@145,吴侯街,WUHOUJIE,WHJ,S3&@146,高庙路,GAOMIAOLU,GML,S3&@147,天保,TIANBAO,TBX,S3&@148,刘村,LIUCUN,LCN,S3&@149,马骡圩,MALUOWEI,MLW,S3&@150,兰花塘,LANHUATANG,LHT,S3&@151,双垅,SHUANGLONG,SLX,S3&@152,石碛河,SHIQIHE,SQH,S3&@153,桥林新城,QIAOLINXINCHENG,QLC,S3&@154,林山,LINSHAN,LNS,S3&@155,高家冲,GAOJIACHONG,GJC,S3&@156,句容,JURONG,JRX,S6&@157,崇明,CHONGMING,CMX,S6&@158,华阳,HUAYANG,HYX,S6&@159,童世界,TONGSHIJIE,TSJ,S6&@160,黄梅,HUANGMEI,HMX,S6&@161,泉都大街,QUANDOUDAJIE,QDS,S6&@162,汤山,TANGSHAN,TSN,S6&@163,南京猿人洞,NANJINGYUANRENDONG,YRD,S6&@164,古泉,GUQUAN,GQX,S6&@165,东郊小镇,DONGJIAOXIAOZHEN,DJT,S6&@166,麒麟门,QILINMEN,QLM,S6&@167,百水桥,BAISHUIQIAO,BSQ,S6&@168,金牛湖,JINNIUHU,JNH,S8&@169,八百桥,BABAIQIAO,BBQ,S8&@170,沈桥,SHENQIAO,SQX,S8&@171,方州广场,FANGZHOUGUANGCHANG,FZS,S8&@172,凤凰山公园,FENGHUANGSHANGONGYUAN,FHS,S8&@173,雄州,XIONGZHOU,XZH,S8&@174,龙池,LONGCHI,LCH,S8&@175,六合开发区,Luhe Development Zone,LHD,S8&@176,化工园,HUAGONGYUAN,HGY,S8&@177,长芦,ZHANGLU,CLX,S8&@178,葛塘,GETANG,GTX,S8&@179,大厂,DACHANG,DCX,S8&@180,卸甲甸,XIEJIADIAN,XJD,S8&@181,信息工程大学,NUIST,NXD,S8&@182,高新开发区,Gaoxin Development Zone,GXD,S8&@183,泰山新村,TAISHANXINCUN,TSX,S8&@184,毛纺厂路,MAOFANGCHANGLU,MFC,S8&@185,长江大桥北,CHANGJIANGDAQIAOBEI,DQB,S8&@186,铜山,TONGSHAN,TSH,S9&@187,石湫,SHIQIU,SHQ,S9&@188,明觉,MINGJUE,MJX,S9&@189,团结圩,TUANJIEWEI,TJW,S9&@190,高淳,GAOCHUN,GCX,S9&"