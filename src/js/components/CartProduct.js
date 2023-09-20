import AmountWidget from './AmountWidget.js';
import {select} from '../settings.js';

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
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle*thisCartProduct.amount;

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
        thisCartProduct.remove(event.detail.cartProduct);
      });
    }

    getData (){
      const thisCartProduct = this;

      const productSummaryOrder = {

        id: thisCartProduct.id,
        name:  thisCartProduct.name,
        amount:  thisCartProduct.amountWidget.value,
        priceSingle:  thisCartProduct.priceSingle,
        params:  thisCartProduct.prepareCartProductParams(),
      };

      productSummaryOrder.price = productSummaryOrder.priceSingle * productSummaryOrder.amount;
      
      return productSummaryOrder;
    }
  }

  export default CartProduct;