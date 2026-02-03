import { db } from "../js/firebase.js";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { checkRole } from "./auth.js";

const storage = getStorage();
const productsRef = collection(db, "products");

(async () => {
  const role = await checkRole();
  if (!role) return; // redirected

  // only owner/manager can add products
  if (role === 'support') {
    const section = document.getElementById('addProductSection');
    if (section) section.remove();
  }

  // realtime products list
  onSnapshot(productsRef, snap => {
    const list = document.getElementById('productList');
    list.innerHTML = '';

    snap.forEach(d => {
      const p = d.data();
      const id = d.id;

      list.innerHTML += `
        <div class="product" style="border:1px solid #ddd;padding:10px;margin-bottom:8px">
          <img src="${p.image||''}" width="80" style="display:block;margin-bottom:6px;">
          <input id="name_${id}" value="${p.name||''}">
          <input id="price_${id}" type="number" value="${p.price||0}">
          <input id="category_${id}" value="${p.category||''}">
          <input id="stock_${id}" type="number" value="${p.stock||0}">
          <input id="imgfile_${id}" type="file" accept="image/*">
          <br>
          <button onclick="updateProduct('${id}')">Update</button>
          <button onclick="deleteProduct('${id}')">Delete</button>
        </div>
      `;
    });
  });
})();

window.addProduct = async function(){
  const name = document.getElementById('pname').value.trim();
  const price = Number(document.getElementById('price').value || 0);
  const category = document.getElementById('category').value.trim();
  const stock = Number(document.getElementById('stock').value || 0);
  const file = document.getElementById('imageFile').files[0];

  if(!name || !price) return alert('Please enter name and price');

  let imageUrl = '';
  let imagePath = '';
  if(file){
    const path = `products/${Date.now()}_${file.name}`;
    const sRef = storageRef(storage, path);
    await uploadBytes(sRef, file);
    imageUrl = await getDownloadURL(sRef);
    imagePath = path; // store the storage path for later deletion
  }

  await addDoc(productsRef, {
    name,
    price,
    category,
    stock,
    image: imageUrl,
    imagePath: imagePath,
    createdAt: new Date()
  });

  alert('Product added');
  // clear inputs
  document.getElementById('pname').value = '';
  document.getElementById('price').value = '';
  document.getElementById('category').value = '';
  document.getElementById('stock').value = '';
  document.getElementById('imageFile').value = '';
};

window.updateProduct = async function(id){
  try {
    const name = document.getElementById(`name_${id}`).value.trim();
    const price = Number(document.getElementById(`price_${id}`).value || 0);
    const category = document.getElementById(`category_${id}`).value.trim();
    const stock = Number(document.getElementById(`stock_${id}`).value || 0);
    const file = document.getElementById(`imgfile_${id}`).files[0];

    const docRef = doc(db, 'products', id);
    const payload = { name, price, category, stock };

    if(file){
      // delete previous image if exists
      try{
        const cur = await getDoc(docRef);
        if(cur.exists() && cur.data().imagePath){
          const prevPath = cur.data().imagePath;
          try{ await deleteObject(storageRef(storage, prevPath)); } catch(e){ console.warn('Failed to delete previous image', e); }
        }
      }catch(e){ console.warn('Could not fetch current product for image cleanup', e); }

      const path = `products/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      payload.image = await getDownloadURL(sRef);
      payload.imagePath = path;
    }

    await updateDoc(docRef, payload);
    alert('Updated');
  } catch (e) {
    console.error(e);
    alert('Update failed');
  }
};

window.deleteProduct = async function(id){
  if(!confirm('Delete product?')) return;

  try{
    const d = await getDoc(doc(db,'products',id));
    if(d.exists() && d.data().imagePath){
      try{ await deleteObject(storageRef(storage, d.data().imagePath)); } catch(e){ console.warn('Failed to delete image from storage', e); }
    }
  }catch(e){ console.warn('Could not fetch product before deletion', e); }

  await deleteDoc(doc(db, 'products', id));
};
