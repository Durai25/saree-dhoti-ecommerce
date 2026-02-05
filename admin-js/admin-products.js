import { db } from "../js/firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import { checkAdminAccess } from "./auth.js";

const storage = getStorage();
const productsRef = collection(db, "products");

/* =======================
   AUTH + REALTIME LIST
======================= */
(async () => {
  const role = await checkAdminAccess();
  if (!role) return;

  // support role cannot add products
  if (role === "support") {
    const section = document.getElementById("addProductSection");
    if (section) section.remove();
  }

  // realtime products list
  onSnapshot(productsRef, (snap) => {
    const list = document.getElementById("productList");
    list.innerHTML = "";

    snap.forEach((d) => {
      const p = d.data();
      const id = d.id;

      const div = document.createElement("div");
      div.style.cssText =
        "border:1px solid #ddd;padding:10px;margin-bottom:8px";

      const img = document.createElement("img");
      img.src = p.image || "";
      img.width = 80;
      img.style.display = "block";
      img.style.marginBottom = "6px";

      const nameInput = document.createElement("input");
      nameInput.id = `name_${id}`;
      nameInput.value = p.name || "";
      nameInput.placeholder = "Product Name";

      const priceInput = document.createElement("input");
      priceInput.id = `price_${id}`;
      priceInput.type = "number";
      priceInput.value = p.price || 0;
      priceInput.placeholder = "Price";

      const categoryInput = document.createElement("input");
      categoryInput.id = `category_${id}`;
      categoryInput.value = p.category || "";
      categoryInput.placeholder = "Category";

      const stockInput = document.createElement("input");
      stockInput.id = `stock_${id}`;
      stockInput.type = "number";
      stockInput.value = p.stock || 0;
      stockInput.placeholder = "Stock";

      const fileInput = document.createElement("input");
      fileInput.id = `imgfile_${id}`;
      fileInput.type = "file";
      fileInput.accept = "image/*";

      const br = document.createElement("br");

      const updateBtn = document.createElement("button");
      updateBtn.textContent = "Update";
      updateBtn.onclick = () => updateProduct(id);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteProduct(id);

      div.append(
        img,
        nameInput,
        priceInput,
        categoryInput,
        stockInput,
        fileInput,
        br,
        updateBtn,
        deleteBtn
      );

      list.appendChild(div);
    });
  });
})();

/* =======================
   ADD PRODUCT
======================= */
window.addProduct = async function () {
  try {
    const name = document.getElementById("pname").value.trim();
    const price = Number(document.getElementById("price").value || 0);
    const category = document.getElementById("category").value.trim();
    const stock = Number(document.getElementById("stock").value || 0);
    const file = document.getElementById("imageFile").files[0];

    if (!name || !price) return alert("Please enter name and price");
    if (price <= 0) return alert("Price must be positive");
    if (stock < 0) return alert("Stock cannot be negative");
    if (!file) return alert("Please select an image");
    if (!file.type.startsWith("image/"))
      return alert("Please select a valid image");
    if (file.size > 5 * 1024 * 1024)
      return alert("Image must be less than 5MB");

    const imagePath = `products/${Date.now()}_${file.name}`;
    const imageRef = storageRef(storage, imagePath);

    await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(imageRef);

    await addDoc(productsRef, {
      name,
      price,
      category,
      stock,
      image: imageUrl,
      imagePath,
      createdAt: new Date()
    });

    alert("Product added");

    document.getElementById("pname").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("imageFile").value = "";

  } catch (e) {
    console.error(e);
    alert("Failed to add product: " + (e.message || "Unknown error"));
  }
};

/* =======================
   UPDATE PRODUCT
======================= */
window.updateProduct = async function (id) {
  try {
    const name = document.getElementById(`name_${id}`).value.trim();
    const price = Number(document.getElementById(`price_${id}`).value || 0);
    const category = document.getElementById(`category_${id}`).value.trim();
    const stock = Number(document.getElementById(`stock_${id}`).value || 0);
    const file = document.getElementById(`imgfile_${id}`).files[0];

    if (!name || !price) return alert("Name and price are required");
    if (price <= 0) return alert("Price must be positive");
    if (stock < 0) return alert("Stock cannot be negative");
    if (file && file.size > 5 * 1024 * 1024)
      return alert("Image must be less than 5MB");
    if (file && !file.type.startsWith("image/"))
      return alert("Please select a valid image");

    const docRef = doc(db, "products", id);
    const payload = { name, price, category, stock };

    if (file) {
      const cur = await getDoc(docRef);
      if (cur.exists() && cur.data().imagePath) {
        try {
          await deleteObject(storageRef(storage, cur.data().imagePath));
        } catch (e) {
          console.warn("Old image delete failed", e);
        }
      }

      const newPath = `products/${Date.now()}_${file.name}`;
      const newRef = storageRef(storage, newPath);

      await uploadBytes(newRef, file);
      payload.image = await getDownloadURL(newRef);
      payload.imagePath = newPath;
    }

    await updateDoc(docRef, payload);
    alert("Product updated");

  } catch (e) {
    console.error(e);
    alert("Update failed: " + (e.message || "Unknown error"));
  }
};

/* =======================
   DELETE PRODUCT
======================= */
window.deleteProduct = async function (id) {
  if (!confirm("Delete product?")) return;

  try {
    const d = await getDoc(doc(db, "products", id));
    if (d.exists() && d.data().imagePath) {
      try {
        await deleteObject(storageRef(storage, d.data().imagePath));
      } catch (e) {
        console.warn("Failed to delete image", e);
      }
    }
  } catch (e) {
    console.warn("Pre-delete fetch failed", e);
  }

  await deleteDoc(doc(db, "products", id));
};
