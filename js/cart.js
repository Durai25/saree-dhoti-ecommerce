let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.addToCart = function(product){
  if(product.stock <= 0) return alert("Out of stock");
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");
};

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.reload();
};

window.clearCart = function() {
  if(confirm("Are you sure you want to clear the cart?")) {
    localStorage.removeItem("cart");
    window.location.reload();
  }
};
