let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.addToCart = function(product){
  if(product.stock <= 0) return alert("Out of stock");
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
};
