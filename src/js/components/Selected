import { classNames, select, settings } from '../settings.js';

class Selected {
  constructor(wrapper) {
    const thisSelected = this;

    thisSelected.render(wrapper);
    thisSelected.initWidgets();
    thisSelected.initTables();
    thisSelected.sendOrder();
  }

  render(wrapper) {
    const thisSelected = this;

    thisSelected.dom = {};

    thisSelected.dom.wrapper = wrapper;

    thisSelected.dom.wrapper.datePicker = thisSelected.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisSelected.dom.wrapper.hourPicker = thisSelected.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisSelected.TableNumber = thisSelected.dom.wrapper.querySelector(select.booking.tableIdAttribute);
    thisSelected.duration = thisSelected.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisSelected.ppl = thisSelected.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisSelected.phone = thisSelected.dom.wrapper.querySelector(select.cart.phone);
    thisSelected.address = thisSelected.dom.wrapper.querySelector(select.cart.address); 

    thisSelected.tableBooked = thisSelected.dom.wrapper.querySelector(classNames.booking.tableBooked);

    thisSelected.allTableWidget = thisSelected.dom.wrapper.querySelectorAll(select.booking.tables); 
  }

  initWidgets() {
    const thisSelected = this;

    thisSelected.allTableWidget.forEach(function (selected) { 
      selected.addEventListener('click', function (event) {
        event.preventDefault();
        thisSelected.initTables();
      });
    });
  }

  initTables() {
    const thisSelected = this;
    const selectedTable = [];

    thisSelected.allTableWidget.forEach(function (selected) { 
      if (selected.checked && selected.classList.contains('booked')) {
        alert('This table is already booked'); 
      } else {
        selected.classList.contains('selected');
        if (!selected.checked) {
          selected.classList.remove('selected');
          selected.checked.classList.add('selected'); 
        }
        const tableId = selected.getAttribute('data-id'); 
        selectedTable.push(tableId);
      }
    });
  }

  sendOrder() {
    const thisSelected = this;
    const starters = [];
    const url = settings.db.url + '/' + settings.db.bookings;

    const selectedTableOrder = {
      "date": thisSelected.dom.wrapper.datePicker,
      "hour": thisSelected.dom.wrapper.hourPicker,
      "table": thisSelected.TableNumber.textContent, 
      "duration": thisSelected.duration.textContent, 
      "ppl": thisSelected.ppl.textContent, 
      "starters": starters, 
      "phone": thisSelected.phone.value, 
      "address": thisSelected.address.value, 
    };

    thisSelected.allTableWidget.forEach(function (addOption) { 
      if (addOption.checked) {
        starters.push(addOption.value); 
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedTableOrder),
    };

    fetch(url, options);
  }
}