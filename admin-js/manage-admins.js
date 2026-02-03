import { db } from "../js/firebase.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addAdmin = async function(){
  try {
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    
    if(!email) return alert('Email is required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) return alert('Please enter a valid email');
    if(!['owner', 'manager', 'support'].includes(role)) return alert('Invalid role');
    
    await setDoc(doc(db, "admins", email), {
      role: role,
      active: true,
      createdAt: new Date()
    });
    
    alert('Admin added successfully');
    document.getElementById('email').value = '';
  } catch(e) {
    console.error(e);
    alert('Failed to add admin: ' + (e.message || 'Unknown error'));
  }
};
