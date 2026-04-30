const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('/Users/Guille/Downloads/web-boda-84004-firebase-adminsdk-fbsvc-f444bd846e.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function getHotels() {
  const snapshot = await db.collection('accommodations').get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data().name);
  });
}

getHotels();
