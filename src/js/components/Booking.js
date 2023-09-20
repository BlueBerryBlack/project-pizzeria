import {select,templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(element){
       const thisBooking = this;
       
       thisBooking.render(element);
       thisBooking.initWidgets();
    }

    render(element){

        const thisBooking = this;

        //generate HTML 

       const generatedHTML= templates.bookingWidget();

        //create empty object (thisBooking.dom)

       thisBooking.dom = {};

        //adding a wrapper property to this object and assigning it a reference to the container

        thisBooking.dom.wrapper = element;

        //changing the content of the wrapper (innerHTML) to HTML code generated from the template

        thisBooking.dom.wrapper.innerHTML = generatedHTML
      
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    
    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    }

}

export default Booking;