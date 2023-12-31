import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Products.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';
  
const app = {

    initPages: function(){
      const thisApp = this;

      thisApp.pages = document.querySelector(select.containerOf.pages).children;
      thisApp.navLinks = document.querySelectorAll(select.nav.links);
      
      const idFromHash = window.location.hash.replace('#/', '');
      
      let pageMatchingHash = thisApp.pages[0].id;

      for (let page of thisApp.pages){
        if (page.id == idFromHash){
          pageMatchingHash = page.id;
          break;
        }
      }

      thisApp.activatePage(pageMatchingHash);

      for(let link of thisApp.navLinks ){
        link.addEventListener('click', function (event){
          const clickedElement = this;
          event.preventDefault();
          /*get page id from href atribute*/
          const id = clickedElement.getAttribute('href').replace('#', '');

          /*run thisApp.activatePage with that id*/
          thisApp.activatePage(id);

          /* change URL hash*/
          window.location.hash = '#/' + id;
        });
      }
    },

    activatePage: function(pageId){
      const thisApp = this;

      //add class active to matching pages
      //remove class active from non-matching pages

      for (let page of thisApp.pages){
       page.classList.toggle(classNames.pages.active, page.id == pageId);
      }
      
       //add class active to matching links
       //remove class active from non-matching links

       for (let link of thisApp.navLinks){
        link.classList.toggle(
          classNames.nav.active, 
          link.getAttribute('href') == '#' + pageId
          );
       }

    },

    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for(let productData of thisApp.data.products){
        new Product (productData.id, productData);
      }
    },

    initCart: function(){
      const thisApp = this ;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);
      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
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

   initBooking: function(){
      const bookingContainer = document.querySelector(select.containerOf.booking);
      new Booking (bookingContainer);

    },

    initHome: function(){
      const homeContainer = document.querySelector(select.containerOf.home);
      new Home (homeContainer);

    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initPages();

      thisApp.initData();

      thisApp.initCart(); 
      
      thisApp.initBooking();

      thisApp.initHome();
    },  

  };

  app.init();
