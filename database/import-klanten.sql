-- Import script voor klantenlijst
-- Voer dit script uit in je MySQL database om de klanten toe te voegen

USE casaos;

-- Klanten toevoegen
INSERT INTO customers (naam, email, telefoon, adres) VALUES
('Ad Claassen', NULL, '0624560210', 'Rosariopark 47, 5104HW Dongen'),
('Elly van Bree', NULL, '0625264850', 'Hazelaarstraat 7, 5104CX Dongen'),
('Eva Buursema', 'evaarie@xs4all.nl', '0624566280', 'Schweitzerstraat 64, 5101TP Dongen'),
('Evert', NULL, '0637660807', 'Glorieux 24, 5101 XT Dongen'),
('Evert Steenhagen', NULL, '0637660807', 'Glorieux 24, 5101 XT Dongen'),
('Ineke', NULL, '0653376669', 'Provincialeweg 237, 4909 AJ Oosteind'),
('Peter Vreijsen', NULL, '0615870533', 'Cimbaalpad 7, 5101 AN Dongen'),
('René van Strien', NULL, '0625365518', 'Tramstraat 46, 5104 GM Dongen'),
('Richard', NULL, '0640863965', 'Raamsdonkveer'),
('Ton en Trudy', 'trudy2453@gmail.com', '0651394753', 'Schweitzerstraat 70, 5101TP Dongen'),
('Yvonne', NULL, '0653944761', 'Rosariopark 100, 5104 HW Dongen');

-- Controleer of de klanten zijn toegevoegd
SELECT COUNT(*) as 'Aantal klanten toegevoegd' FROM customers WHERE naam IN (
  'Ad Claassen',
  'Elly van Bree',
  'Eva Buursema',
  'Evert',
  'Evert Steenhagen',
  'Ineke',
  'Peter Vreijsen',
  'René van Strien',
  'Richard',
  'Ton en Trudy',
  'Yvonne'
);
