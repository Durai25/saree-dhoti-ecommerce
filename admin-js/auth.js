import { auth, db } from "../js/firebase.js";
import { doc, getDoc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export async function checkRole(){
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if(!user){
        location.href = "login.html";
        return resolve(null);
      }

      const snap = await getDoc(doc(db,"admins",user.email));
      if(!snap.exists() || !snap.data().active){
        alert('Access denied');
        await signOut(auth);
        location.href = "login.html";
        return resolve(null);
      }

      resolve(snap.data().role);
    });
  });
}

/*
🔐 NOTE:
- roles: owner | manager | support
*/
