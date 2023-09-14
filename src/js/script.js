/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', 
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', 
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    
    cart: {
      wrapperActive: 'active',
    },
    
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, 
    
    cart: {
      defaultDeliveryFee: 20,
    },
    
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
   
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);

    }

    renderInMenu(){
      const thisProduct = this;

      //generatde HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      console.log('generatedHTML', generatedHTML);

      //create element using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      //find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);

      //add element to menu
      menuContainer.appendChild(thisProduct.element);
    }
  

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      
    
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
          /* prevent default action for event */
          event.preventDefault();
          /* find active product (product that has active class) */
          const activeProduct = document.querySelector(classNames.menuProduct.wrapperActive);
                /* if there is active product and it's not thisProduct.element, remove class active from it */
                if ( activeProduct && activeProduct != thisProduct.element){
                  activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
                }
                thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        }); 
    }

    initOrderForm (){
      const thisProduct = this;

      console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      console.log('processOrder');
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
    
      // set price to default price
      let price = thisProduct.data.price;
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);
    
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          console.log(optionId, option);
      
            // check if there is param with a name of paramId in formData and if it includes optionId
            const optSelected = formData[paramId] && formData[paramId].includes(optionId)
            if(optSelected){
              // check if the option is not default
              if(!option.default) {
                // add option price to price variable
                price += option.price
              }  
            } else {
              // check if the option is default
              if(option.default) {
                // reduce price variable
                price -= option.price 
              } 
            }

            // Img
            const optionImage = thisProduct.imageWrapper.querySelector('.'+paramId+'-'+optionId);
            if(optionImage) {
                if(optSelected) {
                  optionImage.classList.add('active');
                } else {
                optionImage.classList.remove('active');
              }
            } 
          }
        }

         //create const priceSingle and add html value
       thisProduct.priceSingle = price

        // multiply price by amount
        price *= thisProduct.amountWidget.value;

        // update calculated price in the HTML
        thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });    
    }

    addToCart(){
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {

        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams(),

      };

      productSummary.price = productSummary.priceSingle * productSummary.amount;
      
      return productSummary;
    } 

    

    prepareCartProductParams() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }
            // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            // option is selected!
            params[paramId].options[optionId] = option.label;
          }
        }
      }
    
      return params;
    }
    
  }  
  
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value||settings.amountWidget.defaultValue);
      thisWidget.initActions();

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      if (!isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
      } thisWidget.announce();
       
      //thisWidget.value = new.Value;
      thisWidget.input.value = thisWidget.value;
    } 

    initActions() {
      const thisWidget = this;
    
      thisWidget.input.addEventListener('change', function () {
        if (thisWidget.input.value){
        thisWidget.setValue(thisWidget.input.value);
        } else  if (!thisWidget.input.value) {
          thisWidget.setValue( thisWidget.input.value = settings.amountWidget.defaultValue);
        }
      });
    
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
    
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent ('updated', {
        bubbles:true
      });

      thisWidget.element.dispatchEvent(event);
    }
 

  }

  class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

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
      
        let totalNumber = 0; // Całościowa liczba sztuk
        let subtotalPrice = 0; // Cena całkowita bez kosztów dostawy
      
        for (let product of thisCart.products) {
          totalNumber += product.amount;
          subtotalPrice += product.price;

          console.log('productPrice', product.price);
        }
      
        // Oblicz cenę końcową (łącznie z dostawą)
        if (totalNumber === 0) {
          thisCart.totalPrice = 0; // Jeśli koszyk jest pusty, cena końcowa wynosi zero (bez dostawy)
        } else {
          thisCart.totalPrice = subtotalPrice + settings.cart.defaultDeliveryFee; // Cena końcowa to suma ceny produktów i dostawy
        }
      
        // Aktualizuj HTML
        thisCart.dom.totalNumber.innerHTML = totalNumber;
        thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
        thisCart.dom.deliveryFee.innerHTML = thisCart.totalPrice ? settings.cart.defaultDeliveryFee: 0;

        for (let elem of thisCart.dom.totalPrice){
          elem.innerHTML=thisCart.totalPrice
        }
        console.log('subtotalPrice', subtotalPrice);
      }

      remove (){
        const thisCart = this;

        let totalNumber = 0; // Całościowa liczba sztuk
        let subtotalPrice = 0; // Cena całkowita bez kosztów dostawy
      
        for (let product of thisCart.products) {
          totalNumber -= product.amount;
          subtotalPrice -= product.price;
        }
      
        // Oblicz cenę końcową (łącznie z dostawą)
        if (totalNumber === 0) {
          thisCart.totalPrice = 0; // Jeśli koszyk jest pusty, cena końcowa wynosi zero (bez dostawy)
        } else {
          thisCart.totalPrice = subtotalPrice + thisCart.deliveryFee; // Cena końcowa to suma ceny produktów i dostawy
        }

        thisCart.splice(thisCart.product);

        thisCart.dom.totalNumber.innerHTML = totalNumber;
        thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
        thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
        thisCart.dom.deliveryFee.innerHTML = thisCart.totalPrice || 0;
       
        thisCart.product.remove();
      }

  }

  class CartProduct {
    
    constructor (menuProduct, element) {

      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.priceSingle = menuProduct.priceSingle;

      thisCartProduct.getElements(element);
      thisCartProduct.initCartAmountWidget();
      thisCartProduct.initActions();
      console.log('thisCartProduct', thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
     }

     initCartAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.dom.amountWidget;
        thisCartProduct.price = thisCartProduct.dom.price;

        thisCartProduct.processOrder();
      });    
    }

    remove (){

      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles:true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);

    }

    initActions (){

      const thisCartProduct = this;

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });

    }

  }

  const app = {

    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for(let productData of thisApp.data.products){
        new Product (productData.id, productData);
      }
    },

    initData: function(){
      const thisApp = this;
      const url = settings.db.url + '/' + settings.db.products;
      fetch(url)
      .then(function(res){return res.json()})
      .then(function(res){
        thisApp.data = {}; 
        thisApp.data.products = res;
        thisApp.initMenu();
      });
    },

    initCart: function(){
      const thisApp = this ;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();

    
      thisApp.initCart();  
    },  

  };

  app.init();
}