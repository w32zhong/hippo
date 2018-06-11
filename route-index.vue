<template>
<div>
<button v-on:click="toggleCal()">toggle calendar</button>
<button v-on:click="setSource()">setSource</button>

<div id='calendar'></div>
<ul>
	<li v-for="item in list">
		{{item}}
	</li>
</ul>
</div>
</template>

<script>
import $ from 'jquery';
import 'fullcalendar';

$(function() {
	$('#calendar').fullCalendar({
		header: {
			left: 'prev, next today',
			center: 'title',
			right: 'agendaWeek, month'
		},
		minTime: "07:00:00",
		maxTime: "21:00:00",
		defaultView: 'agendaWeek',
		allDaySlot: false,
		navLinks: true,
		editable: false,
		weekends: true,
		EventLimit: false,
		events: [
			{
				title: 'Algorithm Office Hour',
				description: 'GOL-3576',
				dow: [3],
				start: '11:00',
				end: '12:30'
			},
			{
				title: 'Pattern Recognition - CSCI 737 \n',
				dow: [1, 3, 5],
				start: '14:30',
				end: '15:25'
			}
		],
		eventRender: function(event, element) {
			element.find('.fc-title').append(" [" + event.description + "]");
		}
	});
});

export default {
	data: function () {
		return {
			'list': [],
		};
	},
	created: function () {
		var vm = this;
		vm.list = ['a', 'b', 'c'];

//		$.ajax({
//			type : "GET",
//			url : "get/index.list",
//			contentType: "application/json; charset=utf-8",
//			dataType: "json",
//		}).done(function (json) {
//			console.log(json);
//			vm.filelist = json['filelist'];
//			vm.runlist = json['runlist'];
//			vm.download = json['download'];
//		});

	},
	methods: {
		refreshCal: function (arr_events) {
			$("#calendar").fullCalendar('removeEvents', (_) => {return true});
			$('#calendar').fullCalendar('addEventSource', arr_events);
		},
		toggleCal: function () {
			$("#calendar").toggle();
		},
		setSource: function () {
			var newschedule = [
				{
					title:  'AA',
					dow: [2, 4],
					start: '16:30',
					end: '18:05'
				}
			];

			console.log('refresh ...');
			this.refreshCal(newschedule);
		}
	}
};
</script>
<style>
.fc-time-grid .fc-slats td {
  height: 3.5em !important;
}
.fc-content {
	font-size: 1.0em;
}
</style>
