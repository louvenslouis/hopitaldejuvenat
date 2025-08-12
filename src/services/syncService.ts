import { getDB } from '../db';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';

interface SyncConfig {
  tableName: string;
  collectionName: string;
  // Add any specific field mappings if needed
}

const syncConfigs: SyncConfig[] = [
  { tableName: 'liste_medicaments', collectionName: 'medicaments' },
  { tableName: 'patient', collectionName: 'patients' },
  { tableName: 'stock', collectionName: 'stock' },
  { tableName: 'sorties', collectionName: 'sorties' },
  { tableName: 'sorties_details', collectionName: 'sorties_details' },
  { tableName: 'retour', collectionName: 'retour' },
  { tableName: 'stock_adjustments', collectionName: 'stock_adjustments' },
];

export const syncData = async () => {
  console.log("Starting data synchronization...");
  const localDb = await getDB();

  for (const config of syncConfigs) {
    const { tableName, collectionName } = config;

    // 1. Push local changes to Firestore
    await localDb.transaction(async (tx) => {
      // Get pending creates
      const pendingCreates = tx.exec(`SELECT * FROM ${tableName} WHERE sync_status = 'pending_create'`);
      if (pendingCreates.length > 0) {
        for (const row of pendingCreates[0].values) {
          const data: any = {};
          pendingCreates[0].columns.forEach((col, i) => {
            data[col] = row[i];
          });
          const localId = data.id; // Store local ID before deleting it from data object
          const firestoreDocId = data.firestore_doc_id; // Get the pre-generated UUID
          delete data.id; // Firestore generates its own ID
          delete data.sync_status; // Don't upload sync status to Firestore
          delete data.firestore_doc_id; // Don't upload this as a field, it's the doc ID

          try {
            await setDoc(doc(db, collectionName, firestoreDocId), data);
            tx.run(`UPDATE ${tableName} SET sync_status = 'synced' WHERE id = ?`, [localId]);
            console.log(`Created ${tableName} in Firestore: ${firestoreDocId}`);
          } catch (error) {
            console.error(`Error creating ${tableName} in Firestore:`, error);
            // Keep sync_status as pending_create for retry
          }
        }
      }

      // Get pending updates
      const pendingUpdates = tx.exec(`SELECT * FROM ${tableName} WHERE sync_status = 'pending_update'`);
      if (pendingUpdates.length > 0) {
        for (const row of pendingUpdates[0].values) {
          const data: any = {};
          pendingUpdates[0].columns.forEach((col, i) => {
            data[col] = row[i];
          });
          const localId = data.id;
          delete data.id;
          delete data.sync_status;


          if (data.firestore_doc_id) {
            try {
              const docRef = doc(db, collectionName, data.firestore_doc_id);
              await updateDoc(docRef, data);
              tx.run(`UPDATE ${tableName} SET sync_status = 'synced' WHERE id = ?`, [localId]);
              console.log(`Updated ${tableName} in Firestore: ${data.firestore_doc_id}`);
            } catch (error) {
              console.error(`Error updating ${tableName} in Firestore:`, error);
              // Keep sync_status as pending_update for retry
            }
          }
        }
      }

      // Get pending deletes
      const pendingDeletes = tx.exec(`SELECT * FROM ${tableName} WHERE sync_status = 'pending_delete'`);
      if (pendingDeletes.length > 0) {
        for (const row of pendingDeletes[0].values) {
          const data: any = {};
          pendingDeletes[0].columns.forEach((col: string, i: number) => {
            data[col] = row[i];
          });
          const localId = data.id;

          if (data.firestore_doc_id) {
            try {
              const docRef = doc(db, collectionName, data.firestore_doc_id);
              await deleteDoc(docRef);
              // For deletes, we remove from local DB after successful Firestore delete
              tx.run(`DELETE FROM ${tableName} WHERE id = ?`, [localId]);
              console.log(`Deleted ${tableName} from Firestore: ${data.firestore_doc_id}`);
            } catch (error) {
              console.error(`Error deleting ${tableName} from Firestore:`, error);
              // Keep sync_status as pending_delete for retry
            }
          }
        }
      }
    });

    // 2. Pull changes from Firestore to local SQLite
    try {
      const firestoreSnapshot = await getDocs(collection(db, collectionName));
      const firestoreData: any[] = [];
      firestoreSnapshot.forEach(doc => {
        firestoreData.push({ id: doc.id, ...doc.data() });
      });

      // Pull changes from Firestore to local SQLite
      for (const fsDoc of firestoreData) {
        let localRecord = localDb.exec(`SELECT * FROM ${tableName} WHERE firestore_doc_id = ?`, [fsDoc.id]);
        const lastModifiedFirestore = fsDoc.last_modified_local;

        if (localRecord.length === 0 || localRecord[0].values.length === 0) {
          // Record does not exist locally by firestore_doc_id, try to find by natural key
          if (tableName === 'liste_medicaments') {
            localRecord = localDb.exec(`SELECT * FROM ${tableName} WHERE nom = ?`, [fsDoc.nom]);
            if (localRecord.length > 0 && localRecord[0].values.length > 0) {
              // Found by natural key, link it to Firestore and update
              const localId = localRecord[0].values[0][0]; // Assuming ID is the first column
              localDb.run(`UPDATE ${tableName} SET firestore_doc_id = ?, sync_status = 'synced', last_modified_local = ? WHERE id = ?`, [fsDoc.id, lastModifiedFirestore, localId]);
              console.log(`Linked existing local ${tableName} to Firestore: ${fsDoc.id}`);
              continue; // Skip to next fsDoc
            }
          } else if (tableName === 'patient') {
            localRecord = localDb.exec(`SELECT * FROM ${tableName} WHERE nom = ? AND prenom = ?`, [fsDoc.nom, fsDoc.prenom]);
            if (localRecord.length > 0 && localRecord[0].values.length > 0) {
              // Found by natural key, link it to Firestore and update
              const localId = localRecord[0].values[0][0]; // Assuming ID is the first column
              localDb.run(`UPDATE ${tableName} SET firestore_doc_id = ?, sync_status = 'synced', last_modified_local = ? WHERE id = ?`, [fsDoc.id, lastModifiedFirestore, localId]);
              console.log(`Linked existing local ${tableName} to Firestore: ${fsDoc.id}`);
              continue; // Skip to next fsDoc
            }
          }

          // If not found by firestore_doc_id or natural key, insert as new
          const columns = Object.keys(fsDoc).filter(key => key !== 'id');
          const values = columns.map(key => fsDoc[key]);
          const placeholders = columns.map(() => '?').join(',');
          const insertSql = `INSERT INTO ${tableName} (${columns.join(',')}, firestore_doc_id, sync_status, last_modified_local) VALUES (${placeholders}, ?, 'synced', ?)`;
          localDb.run(insertSql, [...values, fsDoc.id, lastModifiedFirestore]);
          console.log(`Inserted new ${tableName} from Firestore: ${fsDoc.id}`);
        } else {
          // Record exists locally, check for updates
          const localTimestamp = localRecord[0].values[0][localRecord[0].columns.indexOf('last_modified_local')];
          if (lastModifiedFirestore && localTimestamp && localTimestamp < lastModifiedFirestore) {
            // Firestore version is newer, update local record
            const updates = Object.keys(fsDoc).filter(key => key !== 'id' && key !== 'firestore_doc_id').map(key => `${key} = ?`).join(',');
            const updateValues = Object.keys(fsDoc).filter(key => key !== 'id' && key !== 'firestore_doc_id').map(key => fsDoc[key]);
            const updateSql = `UPDATE ${tableName} SET ${updates}, sync_status = 'synced', last_modified_local = ? WHERE firestore_doc_id = ?`;
            localDb.run(updateSql, [...updateValues, lastModifiedFirestore, fsDoc.id]);
            console.log(`Updated local ${tableName} from Firestore: ${fsDoc.id}`);
          }
        }
      }

      // Handle local records that are no longer in Firestore (deleted remotely)
      const localRecords = localDb.exec(`SELECT id, firestore_doc_id FROM ${tableName} WHERE firestore_doc_id IS NOT NULL AND sync_status != 'pending_delete'`);
      if (localRecords.length > 0) { // Check if localRecords has data
        for (const localRec of localRecords[0].values) {
          const localId = localRec[0];
          const fsDocId = localRec[1];
          const existsInFirestore = firestoreData.some(doc => doc.id === fsDocId);
          if (!existsInFirestore) {
            localDb.run(`DELETE FROM ${tableName} WHERE id = ?`, [localId]);
            console.log(`Deleted local ${tableName} as it was removed from Firestore: ${fsDocId}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error pulling data from Firestore for ${collectionName}:`, error);
      throw error; // Re-throw to be caught by App.tsx and set global sync status to error
    }
  }
  console.log("Data synchronization complete.");
};