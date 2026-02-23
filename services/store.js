const products = require("../data/products.json");
const db = require("./database");

function getProductList() {
  let msg = "*Our Products:*\n\n";
  products.forEach((p) => {
    const stock = db.getStock(p.id);
    const stockText = stock > 0 ? `In Stock (${stock})` : "Out of Stock";
    msg += `*${p.id}.* ${p.name} (${p.name_bn})\n`;
    msg += `   Price: ৳${p.price} | ${stockText}\n\n`;
  });
  msg += `Type *"details 1"* to see product details\n`;
  msg += `Type *"add 1"* to add to cart\n`;
  msg += `Type *"cart"* to view your cart`;
  return msg;
}

function getProductDetails(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return "Product not found! Type *products* to see the list.";

  const stock = db.getStock(product.id);
  return (
    `*${product.name}* (${product.name_bn})\n\n` +
    `Price: ৳${product.price}\n` +
    `Category: ${product.category}\n` +
    `Details: ${product.description}\n` +
    `Stock: ${stock > 0 ? `${stock} available` : "Out of stock"}\n\n` +
    `Type *"add ${product.id}"* to add to cart`
  );
}

function addToCart(userId, productId, quantity = 1) {
  const product = products.find((p) => p.id === productId);
  if (!product) return "Product not found!";

  const stock = db.getStock(product.id);
  if (stock <= 0) return `*${product.name}* is out of stock!`;
  if (quantity > stock) return `*${product.name}* er stock e matro ${stock}ta ache. Oto add kora jabe na.`;

  db.addToCart(userId, product.id, product.name, product.price, quantity);

  return `*${product.name}* added to cart! (${quantity}x)\n\nType *"cart"* to view your cart.`;
}

function removeFromCart(userId, productId) {
  const removed = db.removeFromCart(userId, productId);
  if (!removed) return "This item is not in your cart!";
  return "Item removed from cart.";
}

function viewCart(userId) {
  const cartItems = db.getCart(userId);

  if (cartItems.length === 0) {
    return "Your cart is empty!\n\nType *products* to browse our store.";
  }

  let total = 0;
  let msg = "*Your Cart:*\n\n";

  cartItems.forEach((item, i) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    msg += `${i + 1}. ${item.product_name}\n`;
    msg += `   ${item.quantity}x ৳${item.price} = ৳${subtotal}\n\n`;
  });

  msg += `*Total: ৳${total}*\n\n`;
  msg += `Type *"order"* to place your order\n`;
  msg += `Type *"remove 1"* to remove item\n`;
  msg += `Type *"clear cart"* to empty your cart`;

  return msg;
}

function clearCart(userId) {
  db.clearCart(userId);
  return "Cart cleared!";
}

function placeOrder(userId, senderName) {
  const cartItems = db.getCart(userId);

  if (cartItems.length === 0) {
    return "Your cart is empty! Add some products first.";
  }

  // Check stock before ordering
  for (const item of cartItems) {
    const stock = db.getStock(item.product_id);
    if (stock < item.quantity) {
      return `*${item.product_name}* er stock e matro ${stock}ta ache, but cart e ${item.quantity}ta ache. Please cart theke adjust korun.`;
    }
  }

  let total = 0;
  let items = [];
  let itemsText = "";

  cartItems.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    items.push({
      productId: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      subtotal,
    });
    itemsText += `- ${item.product_name} x${item.quantity} = ৳${subtotal}\n`;
  });

  // Generate order ID
  const orderId = "ORD-" + Date.now().toString(36).toUpperCase();

  // Save to database (transaction: order + stock decrease + cart clear)
  try {
    db.createOrder(orderId, userId, senderName, items, total);
  } catch (err) {
    return "Order place korte problem hoise. Please abar try korun.";
  }

  return {
    reply:
      `*Order Placed Successfully!*\n\n` +
      `Order ID: *${orderId}*\n` +
      `Customer: ${senderName}\n` +
      `Phone: ${userId}\n\n` +
      `*Items:*\n${itemsText}\n` +
      `*Total: ৳${total}*\n\n` +
      `We will contact you shortly for delivery details!\n` +
      `Thank you for shopping with us!`,
    orderId,
    userId,
    senderName,
    items,
    total,
    itemsText,
  };
}

function getMyOrders(userId) {
  const orders = db.getUserOrders(userId);

  if (orders.length === 0) {
    return "You have no orders yet!\n\nType *products* to start shopping.";
  }

  let msg = "*Your Orders:*\n\n";
  orders.forEach((order) => {
    const items = JSON.parse(order.items);
    msg += `*${order.id}*\n`;
    msg += `Total: ৳${order.total} | Status: ${order.status}\n`;
    msg += `Date: ${order.created_at}\n\n`;
  });

  return msg;
}

module.exports = {
  getProductList,
  getProductDetails,
  addToCart,
  removeFromCart,
  viewCart,
  clearCart,
  placeOrder,
  getMyOrders,
};
