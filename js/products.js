import { db } from "./firebase.js";
import { collection, onSnapshot } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const productBox = document.getElementById("products");

// Sample products for fallback when Firebase is not connected
const sampleProducts = [
  { id: "sample-1", name: "Classic Silk Saree", price: 2499, stock: 15, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
  { id: "sample-2", name: "Men's Cotton Dhoti", price: 899, stock: 25, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400" },
  { id: "sample-3", name: "Kids Festive Wear", price: 1499, stock: 20, image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=400" },
  { id: "sample-4", name: "Designer Kurti", price: 1899, stock: 10, image: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400" },
  { id: "sample-5", name: "Traditional Sherwani", price: 4999, stock: 5, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400" },
  { id: "sample-6", name: "Party Wear Gown", price: 3499, stock: 8, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" }
];

try{
  onSnapshot(collection(db,"products"), snap => {
    productBox.innerHTML = "";
    if(snap.empty){
      renderSampleProducts();
      return;
    }

    snap.forEach(doc => {
      const p = doc.data();
      const productDiv = document.createElement('div');
      productDiv.className = 'product';
      
      const img = document.createElement('img');
      img.src = p.image || '';
      img.alt = p.name || 'Product';
      
      const name = document.createElement('h3');
      name.textContent = p.name || 'Unknown';
      
      const price = document.createElement('p');
      price.className = 'price';
      price.textContent = '₹' + (p.price || 0);
      
      const stock = document.createElement('p');
      stock.className = 'stock ' + (p.stock > 0 ? '' : 'out');
      stock.textContent = p.stock > 0 ? 'In Stock' : 'Out of Stock';
      
      const btn = document.createElement('button');
      btn.disabled = p.stock <= 0;
      btn.textContent = 'Add to Cart';
      btn.onclick = () => addToCart({
        id: doc.id,
        name: p.name,
        price: Number(p.price),
        stock: p.stock,
        image: p.image || ''
      });
      
      const actions = document.createElement('div');
      actions.className = 'actions';
      actions.appendChild(btn);
      
      productDiv.appendChild(img);
      productDiv.appendChild(name);
      productDiv.appendChild(price);
      productDiv.appendChild(stock);
      productDiv.appendChild(actions);
      productBox.appendChild(productDiv);
    });
  });
}catch(e){
  console.warn('Products snapshot failed, rendering sample products', e);
  renderSampleProducts();
}

function renderSampleProducts() {
  productBox.innerHTML = '';
  sampleProducts.forEach(p => {
    productBox.innerHTML += `
      <div class="product">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>
        <p class="stock ${p.stock>0? '':'out'}">${p.stock>0? 'In Stock':'Out of Stock'}</p>
        <div class="actions">
          <button ${p.stock<=0?"disabled":""} onclick="addToCart({id:'${p.id}',name:'${p.name}',price:${p.price},stock:${p.stock},image:'${p.image}'})">Add to Cart</button>
        </div>
      </div>
    `;
  });
}

window.addToCart = function (product) {
  if(product.stock <= 0) {
    alert("This item is out of stock");
    return;
  }
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image: product.image
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");
};


/*
🧠 NOTE:
- Any product added by admin appears here automatically
- Sample products shown when Firebase is not connected
*/
