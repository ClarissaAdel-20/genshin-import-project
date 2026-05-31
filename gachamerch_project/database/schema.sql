-- Database Setup Script: MySQL DDL Setup Schema
-- Project Case: GachaMerch - Genshin Import
-- Course: COSC6094 Mobile Hybrid Solution

CREATE DATABASE IF NOT EXISTS gachamerch_db;
USE gachamerch_db;

-- 1. Users Table (Handles DB and External OAuth user instances)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'admin' or 'user'
  email VARCHAR(100) UNIQUE,
  token VARCHAR(100) -- To store generated alphanumeric bearer tokens
);

-- 2a. Weapons Table (Stores Genshin Import inventory)
CREATE TABLE IF NOT EXISTS weapons (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Sword', 'Bow', 'Polearm', 'Catalyst'
  description TEXT,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL
);

-- 2b. Artifacts Table (Stores Genshin Import inventory)
CREATE TABLE IF NOT EXISTS artifacts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL
);

-- 3. Orders Table (Tracks purchased checkouts to calculate invoice/audit logs)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  details VARCHAR(255),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Seed Data for validation verification
INSERT INTO users (id, username, password, role, email) VALUES
('usr-01', 'admin', 'password123', 'admin', 'admin@gachamerch.com'),
('usr-02', 'user', 'password123', 'user', 'user@gachamerch.com')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO weapons (id, name, type, description, stock, image, price) VALUES
('W01', 'A Thousand Blazing Suns', 'Claymore', 'A radiant greatsword said to have witnessed the extinction and rebirth of countless suns.', 25, 'assets/weapons/W01_A_Thousand_Blazing_Suns_Icon.png', 648000),
('W02', 'Absolution', 'Sword', 'A rapier once wielded by a deceiver who hid their identity behind countless disguises.', 25, 'assets/weapons/W02_Absolution_Icon.png', 648000),
('W03', 'Aqua Simulacra', 'Bow', 'A longbow whose elegant appearance conceals immense and unpredictable power.', 25, 'assets/weapons/W03_Aqua_Simulacra_Icon.png', 648000),
('W04', 'Cashflow Supervision', 'Catalyst', 'A floating monitoring device that was repurposed after being abandoned.', 25, 'assets/weapons/W04_Cashflow_Supervision_Icon.png', 648000),
('W05', 'Crimson Moon Semblance', 'Polearm', 'A blood-red polearm that reflects the eerie brilliance of a crimson moon.', 25, 'assets/weapons/W05_Crimson_Moons_Semblance_Icon.png', 648000),
('W06', 'Fang of the Mountain', 'Claymore', 'A mighty weapon inspired by the strength and authority of a legendary mountain ruler.', 25, 'assets/weapons/W06_Fang_of_the_Mountain_King_Icon.png', 648000),
('W07', 'Everlasting Moonglow', 'Catalyst', 'A divine vessel that shines with a gentle light reminiscent of the eternal moon.', 25, 'assets/weapons/W07_Everlasting_Moonglow_Icon.png', 648000),
('W08', 'Haran Geppaku Futsu', 'Sword', 'A renowned blade whose name evokes storms, waves, and moonlit elegance.', 25, 'assets/weapons/W09_Haran_Geppaku_Futsu_Icon.png', 648000),
('W09', 'Engulfing Lightning', 'Polearm', 'A polearm embodying the overwhelming force and eternity of thunder itself.', 25, 'assets/weapons/W10_Engulfing_Lightning_Icon.png', 648000),
('W10', 'Memory of Dust', 'Catalyst', 'A catalyst containing ancient memories preserved within golden dust.', 25, 'assets/weapons/W11_Memory_of_Dust_Icon.png', 648000),
('W11', 'Fractured Halo', 'Catalyst', 'A catalyst bearing the remnants of a shattered sacred halo.', 25, 'assets/weapons/W12_Fractured_Halo_Icon.png', 648000),
('W12', 'Polar Star', 'Bow', 'A bow that guides its wielder like the steadfast star illuminating the northern sky.', 25, 'assets/weapons/W13_Polar_Star_Icon.png', 648000),
('W13', 'Golden Frostbound Oath', 'Bow', 'A bow forged from a vow that endures through ice, gold, and time itself.', 25, 'assets/weapons/W14_Golden_Frostbound_Oath_Icon.png', 648000),
('W14', 'Gest of the Mighty Wolf', 'Claymore', 'A claymore carrying the pride and ferocity of a powerful wolf king.', 25, 'assets/weapons/W15_Gest_of_the_Mighty_Wolf_Icon.png', 648000)
ON DUPLICATE KEY UPDATE id=id;

-- artifacts --
INSERT INTO artifacts (id, name, type, description, stock, image, price) VALUES
('A01', 'Maidens Distance Love', 'Flower of Life', 'A carefully preserved flower symbolizing pure affection and unwavering devotion.', 25, 'assets/artifacts/A01_Maidens_Distant_Love.png', 648000),
('A02', 'Thundersoother Diadem', 'Circlet of Logos', 'A ceremonial crown worn by those who sought protection from relentless thunderstorms.', 25, 'assets/artifacts/A02_Thundersoothers_Diadem.png', 648000),
('A03', 'Frost Weaved Dignity', 'Goblet of Eonothem', 'An ornate vessel embodying the pride and resilience of a land bound by ice.', 25, 'assets/artifacts/A03_Frost-Weaved_Dignity.png', 648000),
('A04', 'Thundering Poise', 'Circlet of Logos', 'A crown representing composure and authority amid the fury of thunder.', 25, 'assets/artifacts/A04_Thundering_Poise.png', 648000),
('A05', 'Symbol of Felicitation', 'Sands of Eon', 'A timepiece commemorating blessings, celebrations, and good fortune.', 25, 'assets/artifacts/A05_Symbol_of_Felicitation.png', 648000),
('A06', 'End of the Golden Realm', 'Flower of Life', 'A flower marking the fading glory of a once-prosperous golden kingdom.', 25, 'assets/artifacts/A06_End_of_the_Golden_Realm.png', 648000),
('A07', 'Odyssean Flower', 'Flower of Life', 'A blossom carried by travelers as a reminder of distant journeys and homecomings.', 25, 'assets/artifacts/A07_Odyssean_Flower.png', 648000),
('A08', 'Golden Nights Bustle', 'Goblet of Eonothem', 'A lavish cup that recalls the splendor and festivities of prosperous evenings.', 25, 'assets/artifacts/A08_Golden_Nights_Bustle.png', 648000),
('A09', 'Echoing Sound From Days Past', 'Sands of Eon', 'An ancient relic that preserves the lingering memories of bygone eras.', 25, 'assets/artifacts/A09_Echoing_Sound_From_Days_Past.png', 648000),
('A10', 'Dyed Tassel', 'Plume of Death', 'A feather ornament colored by time and tradition, carrying traces of its former owner.', 25, 'assets/artifacts/A10_Dyed_Tassel.png', 648000),
('A11', 'Moonlit Offerings Opulent Dream', 'Flower of Life', 'A flower representing beautiful aspirations offered beneath the moonlight.', 25, 'assets/artifacts/A11_Moonlit_Offerings_Opulent_Dream.png', 648000),
('A12', 'Sharpness That Ceased Upon Wondrous Creation', 'Plume of Death', 'A plume symbolizing how the pursuit of beauty can surpass the need for conflict.', 25, 'assets/artifacts/A12_Sharpness_That_Ceased_Upon_Wondrous_Creation.png', 648000),
('A13', 'Faithful Hourglass', 'Sands of Eon', 'A sandglass reflecting steadfast dedication through the passage of time.', 25, 'assets/artifacts/A13_Faithful_Hourglass.png', 648000),
('A14', 'Wilting Feast', 'Goblet of Eonothem', 'A goblet that serves as a reminder that even grand celebrations eventually fade away.', 25, 'assets/artifacts/A14_Wilting_Feast.png', 648000),
('A15', 'Lamp of the Lost', 'Goblet of Eonothem', 'A vessel whose light once guided wandering souls through darkness and uncertainty.', 25, 'assets/artifacts/A15_Lamp_of_the_Lost.png', 648000)
ON DUPLICATE KEY UPDATE id=id;
