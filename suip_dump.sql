--
-- PostgreSQL database dump
--

\restrict P0hOigDuMEAVG9jRiSEAT0yP5q4m7cnm3QCuN2J4zTIAjZwnG3vv4OkuwSTWxNq

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    "ID" bigint DEFAULT nextval('public.equipment_id_seq'::regclass) NOT NULL,
    "MODEL" text,
    "MODEL_SERIES" text,
    "COMMENT" text,
    "IMAGE_PATH" text
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materials_id_seq OWNER TO postgres;

--
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    "ID" bigint DEFAULT nextval('public.materials_id_seq'::regclass) NOT NULL,
    "TYPE" text,
    "NAME" text,
    "PART_NUMBER" text,
    "SERIAL_NUMBER" text,
    "QUANTITY" integer DEFAULT 0 NOT NULL,
    "COMPATIBILITY" text,
    "WAYBILL_NUMBER" text,
    "STORE_ADDRESS" text,
    "ROW" text,
    "SHELF" text,
    "CONTAINER" text,
    "RECEIVE_DATE" text,
    "COMMENT" text,
    "IMAGE_PATH" text
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- Name: os_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.os_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.os_id_seq OWNER TO postgres;

--
-- Name: os; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.os (
    "ID" bigint DEFAULT nextval('public.os_id_seq'::regclass) NOT NULL,
    "REGION" text,
    "HOST_NAME" text,
    "HOST_NAME_CMDB" text,
    "KE" text,
    "PLATFORM_ADDRESS" text,
    "CATEGORY" text,
    "EQUIPMENT_TYPE" text,
    "SERVER_TYPE" text,
    "EQUIPMENT_MODEL" text,
    "CMDB_STATUS" text,
    "CPU" bigint,
    "RAM" bigint,
    "HDD" bigint,
    "TL" bigint,
    "OS" text,
    "UPDATE_COMMENTS" text,
    "INVENTORY_NUMBER" text,
    "EXPLOITATION_DATE" text,
    "SERIAL_NUMBER" text,
    "OS_NAME" text,
    "CPU_QUANTITY" text,
    "CORES_NUM" text,
    "MEMORY_GB" text,
    "HDD_GB" text,
    "HDD_TYPE" text,
    "HDD_QUANTITY" text,
    "STATUS" text,
    "IMAGE_PATH" text
);


ALTER TABLE public.os OWNER TO postgres;

--
-- Name: works; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works (
    "ID" integer NOT NULL,
    "DESCRIPTION" text,
    "OS" text,
    "PLANNED_DATE" text,
    "ACTUAL_DATE" text,
    "STATUS" text,
    "COMMENT" text,
    "IMAGE_PATH" text
);


ALTER TABLE public.works OWNER TO postgres;

--
-- Name: works_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."works_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."works_ID_seq" OWNER TO postgres;

--
-- Name: works_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."works_ID_seq" OWNED BY public.works."ID";


--
-- Name: works_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.works_materials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.works_materials_id_seq OWNER TO postgres;

--
-- Name: works_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works_materials (
    "ID" bigint DEFAULT nextval('public.works_materials_id_seq'::regclass) NOT NULL,
    "WORK_ID" bigint,
    "MATERIAL_ID" bigint,
    "PLANNED_QUANTITY" bigint,
    "ACTUAL_QUANTITY" bigint,
    "NOTE" text
);


ALTER TABLE public.works_materials OWNER TO postgres;

--
-- Name: works ID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works ALTER COLUMN "ID" SET DEFAULT nextval('public."works_ID_seq"'::regclass);


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment ("ID", "MODEL", "MODEL_SERIES", "COMMENT", "IMAGE_PATH") FROM stdin;
2	HP Proliant ML370G5	G4-G6	\N	\N
16	DELL PowerEdge R720	G4-G6	\N	\N
37	HPE DL20 Gen9	G7-G9	\N	\N
61	IBM HS22	G7-G9	\N	\N
1	HP StoreEasy 1440 Storage	G4-G6	\N	\N
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials ("ID", "TYPE", "NAME", "PART_NUMBER", "SERIAL_NUMBER", "QUANTITY", "COMPATIBILITY", "WAYBILL_NUMBER", "STORE_ADDRESS", "ROW", "SHELF", "CONTAINER", "RECEIVE_DATE", "COMMENT", "IMAGE_PATH") FROM stdin;
57	Оперативная память	Samsung 16GB 2RX4 PC3L-10600R-09-11-E2-D3	628974-081 / 647653-081	CN M393B2G70BH0-YH9Q8	0	HP	null	Lun 73	5-12	-		25.04.2025	\N	uploads/materials/materials_57_1_20251226_114935.webp
74	Вентилятор	Nidec UltraFIo V40W12BS1M5-08A033	766201-B21		4	null	null	LUN 73 Warehouse	5-13	2	-	26.05.2025	\N	uploads/materials/materials_74_1_20260120_164031.webp
233	Кэш память	HP 1GB	570501-002	.	3	SmartArray P410i OEM	\N	LUN 73	6.8	.	.	24.12.2025	\N	uploads/materials/materials_233_1_20251224_103443.webp
240	Батарея	HP 3.6V 500mAh Ni-MH Battery Pack	274779-001	307132-001	1	HP E200, P600	\N	LUN 73	.	.	.	19.01.2026	\N	uploads/materials/materials_240_1_20260119_171051.webp,uploads/materials/materials_240_2_20260119_171051.webp
120	Сетевая карта	Intel Ethernet 10Gb 2-ports SFP+ X520-DA2	X520-DA2	100028884076S041	4			LUN 73 Warehouse	5-13			28.05.2025	\N	\N
127	Адаптер PCI-E 4X - 2хM.2	ORIENT C300E	2005777731100		0	null	null	LUN 73 Warehouse	5-13	003	-	28.05.2025		\N
261	Оперативная память	Samsung 4GB 1Rx4 PC3-14900R-13-12-C2-D3	1	-	16	\N	\N	-	-	-	-	22.05.2026	\N	uploads/materials/materials_261_1_20260522_102403.webp
213	Блок питания 800W	HSTNS-PL45	735039-201	1511000562	1	HP	\N	LUN 73	5-13	4		27.11.2025	\N	uploads/materials/materials_213_IMG_20251127_093918.webp
216	HDD 2TB SAS 7.2K 3.5"	Seagate Constellation ES ST32000444SS	9ZM270-004	9WM17E1V.	6	\N	\N	LUN 73	5-12		-	19.12.2025	\N	uploads/materials/materials_216_1_20251219_101210.webp
220	HDD 500GB sata 7.2k	Seagate Barracuda 	1BD142-021	W2AT8W13	2	\N	\N	LUN 73	6.8	.	.	22.12.2025	\N	uploads/materials/materials_220_1_20251222_105754.webp
149	HDD 8TB sata 7.2k 3.5"	EXOS 7E10 SATA кэш 256 МБ флеш NOR 8 МБ	ST8000NM017B	WWZ19M85	16		Счёт-фактура №73 от 26.02.2026	LUN 73 Warehouse	5-12			29.05.2025	Поставлены на Попова (20шт)	uploads/materials/materials_149_1_20260303_090643.webp
132	Блок питания-1600W	Supermicro PWS-1K68A-1R	PWS-1K68A-1R	1.2	1	null	null	LUN 73 Warehouse	5-13	004	-	28.05.2025	null	uploads/materials/materials_132_IMG_20251024_121345111.webp
193	Кэш память 1GB	Hitachi C1GJ SAS	7183272218-F00002017	3272218-F	4	-	-	Lun 73	6-8	-	-	08.07.2025		uploads/materials/materials_193_IMG_20250708_084958_edit_294691527841072.webp
157	SSD 2TB NVMe M.2	WD Red SN700 NVMe M.2	WDS200T1R0C-68BDK0	24151Y800338	4	null	null	LUN 73 Warehouse	5-12	003	011	29.05.2025	Укомплектованы с переходником PCIe X16 - 4xNVMe	uploads/materials/materials_157_1_20251218_121203.webp
235	HDD 2TB sata 7.2k 3.5"	EXOS 7E10 ST2000NM000B	2TD100-001	WRE0A8M5	7	\N	\N	LUN 73	5-12	.	.	25.12.2025	\N	uploads/materials/materials_235_1_20251225_102341.webp
229	Оперативная память	Elpida 2GB 1Rx4 PC2-3200R-333	345114-061	9305840086N	2	HP	\N	LUN 73	6.8	.	.	24.12.2025	\N	uploads/materials/materials_229_1_20251224_103339.webp
225	HDD 72GB sas 10k 2.5"	HP DG072A8B54	375696-002	3LB18551	11	\N	\N	LUN 73	5-12	.	.	22.12.2025	\N	uploads/materials/materials_225_1_20251222_115803.webp
250	Блок питания 750W	DPS-750AB-3 A HSTNS-PD29	643955-101	660183-001	1	HP DL360P G8	\N	LUN 73	6.8	.	.	11.02.2026	\N	uploads/materials/materials_250_1_20260211_103823.webp
256	Процессор	INTEL XEON GOLD 5317 SRKXM 3.00GHZ 3513G288	.	.	1	\N	\N	LUN 73	.	.	.	04.03.2026	Гарантийный талон №Вн-214746 от 25 Февраля 2026 г.	uploads/materials/materials_256_1_20260304_105316.webp,uploads/materials/materials_256_2_20260304_120441.webp
255	Оптический кабель	5m HP Premier FLEX OM4 FC CABLE QK734A	653728-003	.	24	\N	Счёт-фактура №73 от 26.02.2026	LUN 73	5-13	.	.	03.03.2026	\N	uploads/materials/materials_255_1_20260303_093420.webp
244	Вентилятор	DC Brushless AFC0612DE	394035-001	.	6	\N	\N	LUN 73	5-13	.	.	20.01.2026	\N	uploads/materials/materials_244_1_20260120_171412.webp
258	Сетевая карта	INTEL(R)ETHERNET SERVER ADAPTER 2-Port X520-DA2	E10G42BTDABLK	900139	2	\N	\N	Lun 73	5-13	.	.	11.03.2026	\N	uploads/materials/materials_258_1_20260311_114646.webp,uploads/materials/materials_258_2_20260311_114659.webp,uploads/materials/materials_258_3_20260311_114659.webp,uploads/materials/materials_258_4_20260311_114700.webp
\.


--
-- Data for Name: os; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.os ("ID", "REGION", "HOST_NAME", "HOST_NAME_CMDB", "KE", "PLATFORM_ADDRESS", "CATEGORY", "EQUIPMENT_TYPE", "SERVER_TYPE", "EQUIPMENT_MODEL", "CMDB_STATUS", "CPU", "RAM", "HDD", "TL", "OS", "UPDATE_COMMENTS", "INVENTORY_NUMBER", "EXPLOITATION_DATE", "SERIAL_NUMBER", "OS_NAME", "CPU_QUANTITY", "CORES_NUM", "MEMORY_GB", "HDD_GB", "HDD_TYPE", "HDD_QUANTITY", "STATUS", "IMAGE_PATH") FROM stdin;
4	Пермь	file.corp.com	file.corp.com	457046	 ул. Петропавловская, д. 25а, г. Пермь, Пермский край, 61400	ФПОИ	Сервер	физический	HP StoreEasy 1440 Storage	В эксплуатации	4	8	3500	900	Windows Server 2012 R2	\N	31056749	31.10.2026	CZJ43903B8	Система хранения HP StoreEasy 1440 8TB SATA Storag	1	4	8	3500	sata	4	\N	\N
91	Пермь	sapp01.corp.com	sapp01.corp.com	382886	 ул. Петропавловская, д. 25а, г. Пермь, Пермский край, 61400	БП	Сервер	физический	DELL PowerEdge R720	В эксплуатации	4	4	146	657	Windows Server 2008 R2 Standart	Обновить или выключить невозможно: вендор ушел из РФ	31054644	06.11.2026	GTHGF5J	\N	1	8	4	146	SAS	0	\N	\N
92	Москва	sapp02.corp.com	sapp02.corp.com	382888	улица Академика Ильюшина, дом 12, корпус 2	БП	Сервер	физический	DELL PowerEdge R720	В эксплуатации	4	4	146	657	Windows Server 2008 R2 Standart	Обновить или выключить невозможно: вендор ушел из РФ	31054645	06.11.2026	HTHGF5J	\N	1	8	4	146	SAS	0	\N	\N
93	Москва	sapp03.corp.com	sapp03.corp.com	382890	улица Академика Ильюшина, дом 12, корпус 2	БП	Сервер	физический	DELL PowerEdge R720	В эксплуатации	4	4	146	657	Windows Server 2008 R2 Standart	Обновить или выключить невозможно: вендор ушел из РФ	31054646	06.11.2026	1VHGF5J	\N	1	8	4	146	SAS	0	\N	\N
94	Москва	sapp04.corp.com	sapp04.corp.com	382891	улица Академика Ильюшина, дом 12, корпус 2	БП	Сервер	физический	DELL PowerEdge R720	В эксплуатации	4	4	146	657	Windows Server 2008 R2 Standart	Обновить или выключить невозможно: вендор ушел из РФ	31054647	06.11.2026	JTHGF5J	\N	1	8	4	146	SAS	0	\N	\N
222	Москва	cmdp3.corp.com	cmdp3.corp.com	605233	улица Академика Ильюшина, дом 12, корпус 2	AD	Сервер	Физический	HPE DL20 Gen9	В эксплуатации	4	16	600	2700	WS 2012	\N	31059377	31.12.2026	CZ1726003K	Сервер  ProLiant DL20 Gen9	#N/A	#N/A	#N/A	#N/A	#N/A	#N/A	\N	\N
459	Москва	blade01.corp.com	blade01.corp.com	244210	улица Академика Ильюшина, дом 12, корпус 2	БП	Сервер	физический	IBM HS22	В эксплуатации	8	28	200	900	VMware vSphere 5	0	\N	\N	Y010UF05A0YA	\N	2	8	60Гб	0	0	0	\N	\N
460	Москва	blade02.corp.com	blade02.corp.com	322426	улица Академика Ильюшина, дом 12, корпус 2	БП	Сервер	физический	IBM HS22	В эксплуатации	8	28	200	900	VMware vSphere 5	0	1018309	\N	Y011UN04X029	\N	2	8	60Гб	0	0	0	\N	\N
5	Пермь	file2.corp.com	file2.corp.com	197217	 ул. Петропавловская, д. 25а, г. Пермь, Пермский край, 61400	ФПОИ	Сервер	физический	HP Proliant ML370G5	В эксплуатации	2	4	1168	5256	Windows server 2003 R2 Standart	Установлены ключи и лицензии программных продуктов старых версий.	31051298	31.12.2026	GB8723HR2F	\N	2	8	4	1168	sas	8	\N	\N
\.


--
-- Data for Name: works; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works ("ID", "DESCRIPTION", "OS", "PLANNED_DATE", "ACTUAL_DATE", "STATUS", "COMMENT", "IMAGE_PATH") FROM stdin;
21	Вставка заглушек в сервер	31057874	15.04.2025	\N	\N	\N	\N
23	Демонтаж сервера	31048382	15.04.2025	\N	\N	\N	\N
22	Демонтаж дисковых полок	31042383	15.04.2025	\N	\N	\N	\N
31	Обслуживание сервера	сервер HP DL360G8 инв.CZJ33405KR	22.01.2026	22.01.2026	Завершено		\N
32	Обслуживание сервера	сервер HP DL360G8 инв.31056029 	29.01.2026	\N	Завершено	\N	\N
33	Обслуживание сервера	сервер HP DL360G8 инв. x	03.02.2026	\N	Завершено		\N
\.


--
-- Data for Name: works_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works_materials ("ID", "WORK_ID", "MATERIAL_ID", "PLANNED_QUANTITY", "ACTUAL_QUANTITY", "NOTE") FROM stdin;
\.


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_id_seq', 75, true);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materials_id_seq', 262, true);


--
-- Name: os_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.os_id_seq', 759, true);


--
-- Name: works_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."works_ID_seq"', 39, true);


--
-- Name: works_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.works_materials_id_seq', 9, true);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY ("ID");


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY ("ID");


--
-- Name: os os_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.os
    ADD CONSTRAINT os_pkey PRIMARY KEY ("ID");


--
-- Name: works_materials works_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_materials
    ADD CONSTRAINT works_materials_pkey PRIMARY KEY ("ID");


--
-- Name: works_materials works_materials_work_material_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_materials
    ADD CONSTRAINT works_materials_work_material_key UNIQUE ("WORK_ID", "MATERIAL_ID");


--
-- Name: works works_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT works_pkey PRIMARY KEY ("ID");


--
-- Name: works_materials works_materials_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_materials
    ADD CONSTRAINT works_materials_material_id_fkey FOREIGN KEY ("MATERIAL_ID") REFERENCES public.materials("ID") ON DELETE RESTRICT;


--
-- Name: works_materials works_materials_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works_materials
    ADD CONSTRAINT works_materials_work_id_fkey FOREIGN KEY ("WORK_ID") REFERENCES public.works("ID") ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict P0hOigDuMEAVG9jRiSEAT0yP5q4m7cnm3QCuN2J4zTIAjZwnG3vv4OkuwSTWxNq

