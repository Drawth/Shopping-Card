//! variables
const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDOM = document.querySelector("#products-dom");
let buttonsDOM = [];
let cart = [];

let lastScrollY = 0;

window.addEventListener("scroll", () => {
  const header = document.querySelector(".header-area");
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY) {
    // Aşağı kaydırılıyorsa header gizlenir
    header.classList.add("hidden");
  } else {
    // Yukarı kaydırılıyorsa header tekrar görünür
    header.classList.remove("hidden");
  }

  lastScrollY = currentScrollY;
});

class Products {
  async getProducts() {
    try {
      let result = await fetch(
        "https://648c923b8620b8bae7ed171d.mockapi.io/products"
      );
      let products = await result.json();
      return products;
    } catch (error) {
      alert(error);
    }
  }
}
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
            <div class="col-lg-4 col-md-6">
                    <div class="product">
                        <div class="product-image">
                            <img src="${product.image}" alt="product" class="img-fluid" />
                        </div>
                        <div class="product-hover">
                            <span class="product-title">${product.title}</span>
                            <span class="product-price">${product.price}</span>
                            <button class="btn-add-to-cart" data-id=${product.id}>
                                <i class="fas fa-cart-shopping"></i>
                            </button>
                        </div>
                    </div>
                </div> 
            `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((product) => product.id === id);
      if (inCart) {
        button.setAttribute("disabled", "disabled");
        button.style.opacity = ".3";
      } else {
        button.addEventListener("click", (event) => {
          event.target.disabled = true;
          event.target.style.opacity = ".3";
          // get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          // add product to the cart
          cart = [...cart, cartItem];
          // save cart to the local storage
          Storage.saveCart(cart);
          // save cart values
          this.saveCartValues(cart);
          // display cart item
          this.addCartItem(cartItem);
          // show the cart
          this.showCart();
        });
      }
    });
  }
  saveCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    let li = document.createElement("li");
    li.classList.add("cart-list-item");
    li.innerHTML = `
                        <div class="cart-left">
                            <div class="cart-left-image">
                                <img src="${item.image}" alt="product">
                            </div>
                            <div class="cart-left-info">
                                <a href="#" class="cart-left-info-title">${item.title}</a>
                                <span class="cart-left-info-price">${item.price}$</span>
                            </div>

                        </div>
                        <div class="cart-right">
                            <div class="cart-right-quantity">
                                    <button class="quantity-minus" data-id=${item.id} >
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <span class="quantity">${item.amount}</span>
                                    <button class="quantity-plus" data-id=${item.id}>
                                        <i class="fas fa-plus"></i>
                                    </button>
                            </div>
                            <div class="cart-right-remove">
                                <button class="cart-remove-btn" data-id=${item.id}>
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
        `;
    cartContent.appendChild(li);
  }
  showCart() {
    cartBtn.click();
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("cart-remove-btn")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        removeItem.parentElement.parentElement.parentElement.remove();
        this.removeItem(id);
      } else if (event.target.classList.contains("quantity-minus")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.saveCartValues(cart);
          lowerAmount.nextElementSibling.innerText = tempItem.amount;
        } else {
          lowerAmount.parentElement.parentElement.parentElement.remove();
          this.removeItem(id);
        }
      } else if (event.target.classList.contains("quantity-plus")) {
        let higherAmount = event.target;
        let id = higherAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.saveCartValues(cart);
        higherAmount.previousElementSibling.innerText = tempItem.amount;
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.saveCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.style.opacity = "1";
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
  setupApp() {
    cart = Storage.getCart();
    this.saveCartValues(cart);
    this.populateCart(cart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setupApp();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
