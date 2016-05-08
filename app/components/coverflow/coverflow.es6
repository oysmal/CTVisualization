import context from '../Context/context.es6';
import {getFiles} from '../FileList/fileList.es6';

export default function() {


				let props = context();
				let fileNames = getFiles();
				//console.log(fileNames);
				//let fileNames=["one","hand","three"]; // change me
				fileNames.forEach(function(entry){
					$('#namesXray').append('<option value="'+entry+'">'+entry+'</option>');
				});

				$( "#namesXray" ).click(function() {
						$('.coverflow').empty();
						let counter = 0;
						let name=$( "#namesXray option:selected" ).text();
						console.log(name);
  						let xrays = props.image_arrays[name];
						xrays.forEach(function(entry){
						let img = "img"+counter;
							$('.coverflow').append('<img class="reflected" id="'+img+'" src=""/>');
							document.getElementById(img).setAttribute( 'src', entry.src);
							counter++;

						});
					let mid = Math.round(counter/2);



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
					width:			500,
					height:			500,
					visible:		'density',
					selectedCss:	{	opacity: 1	},
					outerCss:		{	opacity: .1	},

					confirm:		function() {
						console.log('Confirm');
					},

					change:			function(event, cover) {
						let img = $(cover).children().andSelf().filter('img').last();
						$('#photos-name').text(img.data('name') || 'unknown');
					}

				});

				$('#leakdetect').click(function() {
					$('#leakbucket').empty();
					for (let i = 0; i < 100; ++i) {
						$('<div><div>test</div></div>').appendTo('#leakbucket').coverflow();
					}
				});
				});

}
