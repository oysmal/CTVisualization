// move index.html to output folder
import main from './components/Main/main.es6';
import menu from './components/Menu/menu.es6';
import histogram from './components/histogram/histogram.es6';
import coverflow from './components/coverflow/coverflow.es6';

let active = 0;

// do this when page loads
window.onload = () => {
  init();
  setNavigation();
};


function init() {
  // Initial setup

  // Load main view
  $('.main_container').load('components/Main/main.html', () => {
    main();
  });

  // Load menu
  $('.menu_container').load('components/Menu/menu.html', () => {
    menu();
  });
}

function setNavigation() {
  // navigate to home. Replace all html in main_container.
  // id for home is 0
  $('#home-nav').on('click', () => {
    if(active != 0) {
      $('.main_container').empty();
      $('.main_container').load('components/Main/main.html', () => {
        main();
      });
      active = 0;   // set this as active
    }
  });


  // navigate to slides. Replace all html in main_container.
  // id for slides is 1
  $('#slices-nav').on('click', () => {
    if(active != 1) {
      $('.main_container').empty();
      $('.main_container').load('components/test.html', () => {

      });
      active = 1;   // set this as active
    }
  });

  // navigate to histogram. Replace all html in main_container
  // id for histogram is 2
  $('#histogram-nav').on('click', () => {
    if(active != 2) {
      $('.main_container').empty();
      $('.main_container').load('components/test.html', () => {

      });
      active = 2;  // set this as active
    }
  });
}

  //load histogram
  $('.histogram_container').load('components/histogram/histogram.html',() =>{
  	histogram();
  });

  //load xray coverflow
  $('.coverflow_container').load('components/coverflow/coverflow.html',()=>{
  	coverflow();
  })

};
