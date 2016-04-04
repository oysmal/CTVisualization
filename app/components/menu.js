( function( window ) {

'use strict';

// classList support for class management
var hasClass, addClass, removeClass;
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };


function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}
window.action = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

})( window );
var menuBottom = document.getElementById( 'menu-s4' ),
    showBottom = document.getElementById( 'showBottom' ),
    body = document.body;

showBottom.onclick = function() {
  action.toggle( this, 'active' ); //as opposed to disabled
  action.toggle( menuBottom, 'menu-open' );
        //disableOther( 'showBottom' );
      };