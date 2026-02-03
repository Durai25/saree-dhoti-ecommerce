import { db } from "../js/firebase.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addAdmin = async function(){
  await setDoc(doc(db, "admins", email.value), {
    role: role.value,
    active: true,
    createdAt: new Date()
  });
  alert('Admin added');
};
