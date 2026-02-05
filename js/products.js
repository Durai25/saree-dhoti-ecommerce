import { db } from "./firebase.js";
import { collection, onSnapshot } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const productBox = document.getElementById("products");

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

  productBox.innerHTML = '';
  sample.forEach(p => {
    productBox.innerHTML += `
      <div class="product">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>
        <p class="stock ${p.stock>0? '':'out'}">${p.stock>0? 'In Stock':'Out of Stock'}</p>
        <div class="actions">
          <button ${p.stock<=0?"disabled":""} onclick="alert('Add to cart (sample)')">Add to Cart</button>
        </div>
      </div>
    `;
  });
}

/*
🧠 NOTE:
- Any product added by admin appears here automatically
*/
