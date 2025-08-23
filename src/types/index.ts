export interface Medicament {
  id: string;
  nom: string;
  prix: number;
  type: string;
  presentation: string;
  quantite_en_stock: number;
  lot?: string;
  expiration_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  prenom: string;
  nom: string;
  nif_cin?: string;
  annee_naissance?: number;
  sexe?: string;
  telephone?: number;
  created_at: string;
  updated_at: string;
}

export interface Entree {
  id: string;
  article_id: string;
  quantite: number;
  date_expiration?: string;
  date_enregistrement: string;
  date_modification: string;
  nom?: string; // Added for enriched data
}

export interface Retour {
  id: string;
  article_id: string;
  quantite: number;
  sortie_id?: string;
  date_enregistrement: string;
  date_modification: string;
  nom?: string; // Added for enriched data
}