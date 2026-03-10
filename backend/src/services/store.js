const products = require("../../data/products.json");
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
  msg += `Type *"add 1"* to add to cart`;
  return {
    type: "buttons",
    body: msg,
    buttons: ["Details 1", "Details 2", "Cart"],
  };
}

function getProductDetails(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return "Product not found! Type *products* to see the list.";

  const stock = db.getStock(product.id);
  const msg =
    `*${product.name}* (${product.name_bn})\n\n` +
    `Price: ৳${product.price}\n` +
    `Category: ${product.category}\n` +
    `Details: ${product.description}\n` +
    `Stock: ${stock > 0 ? `${stock} available` : "Out of stock"}`;
  return {
    type: "buttons",
    body: msg,
    buttons: [`Add ${product.id}`, "Products", "Cart"],
  };
}

function addToCart(userId, productId, quantity = 1) {
  const product = products.find((p) => p.id === productId);
  if (!product) return "Product not found!";

  const stock = db.getStock(product.id);
  if (stock <= 0) return `*${product.name}* is out of stock!`;
  if (quantity > stock) return `*${product.name}* er stock e matro ${stock}ta ache. Oto add kora jabe na.`;

  db.addToCart(userId, product.id, product.name, product.price, quantity);

  return {
    type: "buttons",
    body: `*${product.name}* added to cart! (${quantity}x)`,
    buttons: ["Cart", "Products", "Order"],
  };
}

function removeFromCart(userId, productId) {
  const removed = db.removeFromCart(userId, productId);
  if (!removed) return "This item is not in your cart!";
  return {
    type: "buttons",
    body: "Item removed from cart.",
    buttons: ["Cart", "Products"],
  };
}

function viewCart(userId) {
  const cartItems = db.getCart(userId);

  if (cartItems.length === 0) {
    return {
      type: "buttons",
      body: "Your cart is empty!",
      buttons: ["Products"],
    };
  }

  let total = 0;
  let msg = "*Your Cart:*\n\n";

  cartItems.forEach((item, i) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    msg += `${i + 1}. ${item.product_name}\n`;
    msg += `   ${item.quantity}x ৳${item.price} = ৳${subtotal}\n\n`;
  });

  msg += `*Total: ৳${total}*`;

  return {
    type: "buttons",
    body: msg,
    buttons: ["Order", "Clear Cart", "Products"],
  };
}

function clearCart(userId) {
  db.clearCart(userId);
  return {
    type: "buttons",
    body: "Cart cleared!",
    buttons: ["Products"],
  };
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
    reply: {
      type: "buttons",
      body:
        `*Order Placed Successfully!*\n\n` +
        `Order ID: *${orderId}*\n` +
        `Customer: ${senderName}\n\n` +
        `*Items:*\n${itemsText}\n` +
        `*Total: ৳${total}*\n\n` +
        `We will contact you shortly for delivery details!\n` +
        `Thank you for shopping with us!`,
      buttons: ["My Orders", "Products"],
    },
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
    return {
      type: "buttons",
      body: "You have no orders yet!",
      buttons: ["Products"],
    };
  }

  let msg = "*Your Orders:*\n\n";
  orders.forEach((order) => {
    msg += `*${order.id}*\n`;
    msg += `Total: ৳${order.total} | Status: ${order.status}\n`;
    msg += `Date: ${order.created_at}\n\n`;
  });

  return {
    type: "buttons",
    body: msg,
    buttons: ["Products"],
  };
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
