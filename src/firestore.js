import app from "./firebase";
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore(app)

export async function getDishes() {
  const dishesCol = collection(db, 'dishes')
  const dishesSnapshot = await getDocs(dishesCol)
  const dishesList = dishesSnapshot.docs.map(doc => doc.data())
  return dishesList
}

export default db
