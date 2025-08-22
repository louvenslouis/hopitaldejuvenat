-- Base de données : Hopital de Juvenat
-- Structure SQL équivalente à la base Airtable (Version SQLite)

-- =============================================
-- 1. TABLE LISTE_MEDICAMENTS (Table principale)
-- =============================================
CREATE TABLE liste_medicaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prix REAL DEFAULT 0,
    type TEXT CHECK(type IN ('Comprimé', 'Goutte', 'Matériel médical', 'Sirop', 'Soluté', 'Solution injectable')) DEFAULT NULL,
    presentation TEXT DEFAULT NULL,
    lot TEXT, -- Add lot number
    expiration_date DATE, -- Add expiration date
    cacher INTEGER DEFAULT 0,
    note TEXT DEFAULT NULL,
    vente_plus TEXT DEFAULT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    firestore_doc_id TEXT DEFAULT NULL,
    sync_status TEXT DEFAULT 'synced',
    last_modified_local TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nom ON liste_medicaments (nom);
CREATE INDEX idx_type ON liste_medicaments (type);
CREATE INDEX idx_cacher ON liste_medicaments (cacher);

-- =============================================
-- 2. TABLE PATIENT
-- =============================================
CREATE TABLE patient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    nif_cin TEXT DEFAULT NULL,
    annee_naissance INTEGER DEFAULT NULL,
    sexe TEXT CHECK(sexe IN ('M', 'F', 'Autre')) DEFAULT NULL,
    telephone INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    firestore_doc_id TEXT DEFAULT NULL,
    sync_status TEXT DEFAULT 'synced',
    last_modified_local TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nom_prenom ON patient (nom, prenom);
CREATE INDEX idx_nif_cin ON patient (nif_cin);
CREATE INDEX idx_telephone ON patient (telephone);

-- =============================================
-- 3. TABLE STOCK (Entrées)
-- =============================================
CREATE TABLE stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 0,
    date_expiration TEXT,
    date_enregistrement TEXT DEFAULT CURRENT_TIMESTAMP,
    date_modification TEXT DEFAULT CURRENT_TIMESTAMP,
    a_verifier INTEGER DEFAULT 0,
    modifie_par TEXT DEFAULT NULL,
    firestore_doc_id TEXT DEFAULT NULL,
    sync_status TEXT DEFAULT 'synced',
    last_modified_local TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES liste_medicaments(id) ON DELETE CASCADE
);

CREATE INDEX idx_stock_article ON stock (article_id);
CREATE INDEX idx_stock_date_enregistrement ON stock (date_enregistrement);
CREATE INDEX idx_stock_a_verifier ON stock (a_verifier);
CREATE INDEX idx_stock_date_expiration ON stock (date_expiration);

-- =============================================
-- 4. TABLE SORTIES (Dispensation)
-- =============================================
CREATE TABLE sorties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_sortie TEXT DEFAULT NULL,
    service TEXT CHECK(service IN ('Clinique externe', 'Urgence', 'Medecine Interne', 'Maternité', 'SOP', 'Pediatrie')) DEFAULT NULL,
    employe TEXT CHECK(employe IN ('Azor', 'Naika', 'Tamara', 'Voltaire')) DEFAULT NULL,
    patient_id INTEGER DEFAULT NULL,
    chambre INTEGER DEFAULT NULL,
    memo TEXT DEFAULT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    date_modification TEXT DEFAULT CURRENT_TIMESTAMP,
    firestore_doc_id TEXT DEFAULT NULL,
    sync_status TEXT DEFAULT 'synced',
    last_modified_local TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE SET NULL
);

CREATE INDEX idx_sorties_date_sortie ON sorties (date_sortie);
CREATE INDEX idx_sorties_service ON sorties (service);
CREATE INDEX idx_sorties_employe ON sorties (employe);
CREATE INDEX idx_sorties_patient ON sorties (patient_id);
CREATE INDEX idx_sorties_created_at ON sorties (created_at);

-- =============================================
-- 5. TABLE SORTIES_DETAILS (Articles de chaque sortie)
-- =============================================
CREATE TABLE sorties_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sortie_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 0,
    position_article INTEGER NOT NULL,
    firestore_doc_id TEXT DEFAULT NULL,
    sync_status TEXT DEFAULT 'synced',
    last_modified_local TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sortie_id) REFERENCES sorties(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES liste_medicaments(id) ON DELETE CASCADE,
    UNIQUE (sortie_id, position_article)
);

CREATE INDEX idx_sorties_details_sortie ON sorties_details (sortie_id);
CREATE INDEX idx_sorties_details_article ON sorties_details (article_id);
CREATE INDEX idx_sorties_details_position ON sorties_details (position_article);

-- =============================================
-- 6. TABLE RETOUR
-- =============================================
CREATE TABLE retour (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 0,
    sortie_id INTEGER DEFAULT NULL,
    date_enregistrement TEXT DEFAULT CURRENT_TIMESTAMP,
    date_modification TEXT DEFAULT CURRENT_TIMESTAMP,
    modifie_par TEXT DEFAULT NULL,
    firestore_doc_id TEXT DEFAULT NULL,
    sync_status TEXT DEFAULT 'synced',
    last_modified_local TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES liste_medicaments(id) ON DELETE CASCADE,
    FOREIGN KEY (sortie_id) REFERENCES sorties(id) ON DELETE SET NULL
);

CREATE INDEX idx_retour_article ON retour (article_id);
CREATE INDEX idx_retour_sortie ON retour (sortie_id);
CREATE INDEX idx_retour_date_enregistrement ON retour (date_enregistrement);

-- =============================================
-- 7. TABLE STOCK_ADJUSTMENTS (New table for manual adjustments)
-- =============================================
CREATE TABLE stock_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    quantite_ajustee INTEGER NOT NULL, -- Positive for increase, negative for decrease
    raison TEXT DEFAULT NULL,
    date_ajustement TEXT DEFAULT CURRENT_TIMESTAMP,
    modifie_par TEXT DEFAULT NULL,
    firestore_doc_id TEXT DEFAULT NULL,
    sync_status TEXT DEFAULT 'synced',
    last_modified_local TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES liste_medicaments(id) ON DELETE CASCADE
);

CREATE INDEX idx_stock_adjustments_article ON stock_adjustments (article_id);
CREATE INDEX idx_stock_adjustments_date ON stock_adjustments (date_ajustement);

-- =============================================
-- TRIGGERS FOR TRAÇABILITÉ (Existing, ensure they are still valid)
-- =============================================

CREATE TRIGGER tr_sorties_details_update_sortie
AFTER INSERT ON sorties_details
FOR EACH ROW
BEGIN
    UPDATE sorties 
    SET date_modification = CURRENT_TIMESTAMP,
        last_modified_local = CURRENT_TIMESTAMP
    WHERE id = NEW.sortie_id;
END;

CREATE TRIGGER tr_liste_medicaments_updated_at
AFTER UPDATE ON liste_medicaments
FOR EACH ROW
BEGIN
    UPDATE liste_medicaments
    SET updated_at = CURRENT_TIMESTAMP,
        last_modified_local = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;

CREATE TRIGGER tr_patient_updated_at
AFTER UPDATE ON patient
FOR EACH ROW
BEGIN
    UPDATE patient
    SET updated_at = CURRENT_TIMESTAMP,
        last_modified_local = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;

CREATE TRIGGER tr_stock_updated_at
AFTER UPDATE ON stock
FOR EACH ROW
BEGIN
    UPDATE stock
    SET date_modification = CURRENT_TIMESTAMP,
        last_modified_local = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;

CREATE TRIGGER tr_sorties_updated_at
AFTER UPDATE ON sorties
FOR EACH ROW
BEGIN
    UPDATE sorties
    SET date_modification = CURRENT_TIMESTAMP,
        last_modified_local = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;

CREATE TRIGGER tr_retour_updated_at
AFTER UPDATE ON retour
FOR EACH ROW
BEGIN
    UPDATE retour
    SET date_modification = CURRENT_TIMESTAMP,
        last_modified_local = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;