import {select,templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element){
       const thisBooking = this;
       
       thisBooking.render(element);
       thisBooking.initWidgets();
       thisBooking.getData();
       thisBooking.selectedTable = null;
       thisBooking.initTables();
    }

    sendOrder() {
        const thisBooking = this;
        const starters = [];
        const url = settings.db.url + '/' + settings.db.bookings;
    
        const selectedTableOrder = {
          "date": thisBooking.datePicker.value,
          "hour": thisBooking.hourPicker.value,
          "table": thisBooking.selectedTable, 
          "duration": thisBooking.peopleAmountWidget.value , 
          "ppl": thisBooking.hoursAmountWidget.value, 
          "starters": starters, 
        };

       /* thisBooking.allTableWidget.forEach(function (addOption) { 
          if (addOption.checked) {
            starters.push(addOption.value); 
          }
        });
        */
       
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedTableOrder),
        };
    
        fetch(url, options);
      }


    initTables(){

        const thisBooking = this;

        for (const table of thisBooking.dom.tables){
            table.addEventListener('click', function(){
                if(table.classList.contains('booked')){
                    alert('This table is booked')
                }else{
                    if(!table.classList.contains('selected')){
                        const activeTable = thisBooking.dom.wrapper.querySelector('.selected')
                        if(activeTable){
                            activeTable.classList.remove('selected')
                        }
                        table.classList.add('selected')

                        const tableId = table.getAttribute('data-id');
                        thisBooking.selectedTable=tableId
                    }
                    else{
                        table.classList.remove('selected')
                        thisBooking.selectedTable=null
                    }
                }
            });
        }
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);

        const params = {
            bookings:[
                startDateParam,
                endDateParam,
            ],

            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],

            eventsRepeat: [
                settings.db.repeatParam,
                startDateParam,
            ],
        }

        const urls = {
            bookings:       settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
            eventsCurrent:  settings.db.url + '/' + settings.db.events   + '?' + params.bookings.join('&'),
            eventsRepeat:   settings.db.url + '/' + settings.db.events   + '?' + params.bookings.join('&'),
        };

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
        .then(function(allResponses){
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
            //console.log(bookings);
            //console.log(eventsCurrent);
            //console.log(eventsRepeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        })
    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){

                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
                thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        //console.log('thisBooking.boooked', thisBooking.booked);
    
    thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
            //console.log('loop', hourBlock);

            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM (){
        
        const thisBooking = this;
        

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;
        console.log('thisBooking.date', thisBooking.date);
        console.log('thisBooking.hour', thisBooking.hour);
        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }

        console.log('allAvailable', allAvailable);

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            console.log('tableId', tableId);
            console.log('table', table);
            console.log('settings.booking.tableAttribute', settings.booking.tableAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else{
                table.classList.remove(classNames.booking.tableBooked);
            allAvailable
            console.log('wolny stolik', tableId);

            }
        }
    }

    render(wrapper){
        const thisBooking = this;
        const generatedHTML= templates.bookingWidget();
        thisBooking.dom = {};

        thisBooking.dom.wrapper = wrapper;
        
        thisBooking.dom.wrapper.innerHTML = generatedHTML
        
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    
    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    
        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
        });

        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            thisBooking.sendOrder();
        });

    }
}
export default Booking;