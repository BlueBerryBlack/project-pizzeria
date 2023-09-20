import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      this.totalNumber = 0; // Całościowa liczba sztuk
      this.subtotalPrice = 0; // Cena całkowita bez kosztów dostawy

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

      getElements(element){
        const thisCart = this;

        thisCart.dom = {};

        thisCart.dom.wrapper = element;
        thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
        thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
        thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee); // Dodana właściwość deliveryFee
        thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice); // Dodana właściwość subtotalPrice
        thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice); // Dodana właściwość totalPrice
        thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber); // Dodana właściwość totalNumber
        thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
        thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
        thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      }

      initActions() {
          const thisCart = this;

          thisCart.dom.toggleTrigger.addEventListener('click', function () {
            thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
          });

          thisCart.dom.productList.addEventListener('updated', function(){
            thisCart.update();
          });

          thisCart.dom.productList.addEventListener('remove', function (event) {
            thisCart.remove(event.detail.cartProduct);
          });

          thisCart.dom.form.addEventListener('submit', function (event){
            event.preventDefault();
            thisCart.sendOrder();
          });
        }
      
      add(menuProduct) {
        const thisCart = this;

         //generatde HTML based on template
        const generatedHTML = templates.cartProduct(menuProduct);
        console.log('generatedHTML', generatedHTML);

        //create element using utils.createElementFromHTML
        thisCart.element = utils.createDOMFromHTML(generatedHTML);

        //add element to menu
        thisCart.dom.productList.appendChild(thisCart.element);
        console.log('adding cart');
          
        thisCart.products.push(new CartProduct(menuProduct, thisCart.element));
        console.log('thisCart.products', thisCart.products);

        thisCart.update();
        console.log('menuproduct', menuProduct);
      }

      update() {
        const thisCart = this;
            
        for (let product of thisCart.products) {
          this.totalNumber += product.amount;
          this.subtotalPrice += product.price;

          console.log('productPrice', product.price);
        }
      
        // Oblicz cenę końcową (łącznie z dostawą)
        if (this.totalNumber === 0) {
          thisCart.totalPrice = 0; // Jeśli koszyk jest pusty, cena końcowa wynosi zero (bez dostawy)
        } else {
          thisCart.totalPrice = this.subtotalPrice + settings.cart.defaultDeliveryFee; // Cena końcowa to suma ceny produktów i dostawy
        }
      
        // Aktualizuj HTML
        thisCart.dom.totalNumber.innerHTML = this.totalNumber;
        thisCart.dom.subtotalPrice.innerHTML = this.subtotalPrice;
        thisCart.dom.deliveryFee.innerHTML = thisCart.totalPrice ? settings.cart.defaultDeliveryFee: 0;

        for (let elem of thisCart.dom.totalPrice){
          elem.innerHTML=thisCart.totalPrice
        }
        console.log('subtotalPrice', this.subtotalPrice);
      }

      remove (thisCartProduct){
        const thisCart = this;
         
        //check if the product is avilable in this cart

        const indexToRemove = thisCart.products.indexOf(thisCartProduct);
        if (indexToRemove === -1) {
          console.error('Product not found in cart');
          return;
        }
      
        thisCart.totalNumber -= thisCartProduct.amount;
        thisCart.subtotalPrice -= thisCartProduct.price * thisCartProduct.amount;
        
        thisCart.products.splice(indexToRemove, 1);

        thisCart.dom.totalNumber.innerHTML = this.totalNumber;
        thisCart.dom.subtotalPrice.innerHTML = this.subtotalPrice;
        thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
        thisCart.dom.deliveryFee.innerHTML = thisCart.totalPrice || 0;
       
        thisCartProduct.dom.wrapper.remove();

        thisCart.update();

      }

      sendOrder (){
        const thisCart = this ;

        const url = settings.db.url + '/' + settings.db.orders;

        const payload = {
          
          address: thisCart.dom.address.value,
          phone: thisCart.dom.phone.value,
          totalPrice: thisCart.totalPrice,
          subtotalPrice: thisCart.subtotalPrice ,
          totalNumber: thisCart.totalNumber,
          deliveryFee: thisCart.deliveryFee,
          products: [],
      }

        for(let prod of thisCart.products) {
          payload.products.push(prod.getData());
        }

        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        };
        
        fetch(url, options);
      }
  }

  export default Cart;