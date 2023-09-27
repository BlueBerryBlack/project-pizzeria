import { templates,select} from "../settings";
import {utils} from "../utils";

class Home {
    constructor (){
        const thisHome = this;

        thisHome.render();
        thisHome.getElements();
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

    }


}