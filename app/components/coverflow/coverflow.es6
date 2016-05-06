import context from '../Context/context.es6';

export default function() {

				
				let props = context();
				var fileNames=["one","hand","three"]; // change me
				fileNames.forEach(function(entry){
					$('#namesXray').append('<option value="'+entry+'">'+entry+'</option>');
				});
				
				$( "#namesXray" ).change(function() {
						$('.coverflow').empty();
						var counter = 0;
						var name=$( "#namesXray option:selected" ).text();
  						var xrays = props.image_arrays[name];
						xrays.forEach(function(entry){
						var img = "img"+counter;
						$('.coverflow').append('<img class="reflected" id="'+img+'" src=""/>');
						document.getElementById(img).setAttribute( 'src', entry.src);
						counter++;

					});
					var mid = Math.round(counter/2);
				


				$('.coverflow').coverflow();

				$('#first').click(function() {
					$('.coverflow').coverflow('index', 0);
				});

				$('#last').click(function() {
					$('.coverflow').coverflow('index', -1);
				});

				$('#goto6').click(function() {
					$('.coverflow').coverflow('index', mid-1);	// zero-based index!
				});
				
				$('#keyboard').click(function() {
					$('.coverflow').coverflow('option', 'enableKeyboard', $(this).is(':checked'));
				});
				
				$('#wheel').click(function() {
					$('.coverflow').coverflow('option', 'enableWheel', $(this).is(':checked'));
				});
				
				$('#click').click(function() {
					$('.coverflow').coverflow('option', 'enableClick', $(this).is(':checked'));
				});

				/* CD covers */

				if ($.fn.reflect) {
					$('.photos .cover').reflect();
				}

				$('.photos').coverflow({
					easing:			'easeOutElastic',
					duration:		'slow',
					index:			3,
					width:			320,
					height:			240,
					visible:		'density',
					selectedCss:	{	opacity: 1	},
					outerCss:		{	opacity: .1	},
					
					confirm:		function() {
						console.log('Confirm');
					},

					change:			function(event, cover) {
						var img = $(cover).children().andSelf().filter('img').last();
						$('#photos-name').text(img.data('name') || 'unknown');
					}
					
				});	

				$('#leakdetect').click(function() {
					$('#leakbucket').empty();
					for (var i = 0; i < 100; ++i) {
						$('<div><div>test</div></div>').appendTo('#leakbucket').coverflow();
					}
				});
				});
			
}
