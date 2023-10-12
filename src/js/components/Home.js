import { templates,select} from "../settings.js";
import utils from "../utils.js";

class Home {
    constructor (){
        const thisHome = this;

        thisHome.render();
        thisHome.getElements();
        thisHome.initSlider();
    }

    render(){
        const thisHome = this;

        /*generate HTML based on template*/
        const generatedHTML = templates.homeWidget(thisHome);

        /*create element using utils.createElementFromHTML*/
        thisHome.element = utils.createDOMFromHTML(generatedHTML);

        /*find menu container*/
        const homeContainer = document.querySelector(select.containerOf.home);

        /*add element to menu*/
        homeContainer.appendChild(thisHome.element);
    }

    getElements(){

        const thisHome=this;

        thisHome.dom={};
        thisHome.dom.wrapper=thisHome.element;

        thisHome.dom.slider = document.querySelector('.main-carousel');
    }

    initSlider(){

        const thisHome =this;

        new Flickity ( thisHome.dom.slider, {
         
          cellAlign: 'left',
          contain: true
        });
    }



}

export default Home;