'use strict';

let showBottom = false;

export default function() {
    $('#showBottom').on('click', () => {

      // Toggle the menu
      if(showBottom) {
        $('#menu-s4').removeClass('menu-open');
        showBottom = false;
      } else {
        $('#menu-s4').addClass('menu-open');
        showBottom = true;
      }

    });
}
