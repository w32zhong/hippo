<template>
<div>
<button v-on:click="$router.go(-1)">go back</button>
<button v-on:click="updateData">refresh</button>
<button v-on:click="goto_edit">edit</button>
<ul>
	<li v-for="f in data.dirs">
		<router-link v-bind:to="$route.path + '/' + f + '/'">
			{{f}}
		</router-link>
	</li>
</ul>
<div id='calendar'></div>
<div id='plaintxt'></div>
</div>
</template>

<script>
import $ from 'jquery';
import 'fullcalendar';
var moment = require('moment');

var edit_url = '/droppy/#/proj/tkcloud/hippo/hippo'

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
		contentHeight: "auto",
		events: [],
		eventRender: function(event, element) {
			if (event.description) {
				element.find('.fc-title').append(" [" + event.description + "]");
			}
		}
	});
	$('#calendar').hide();
});

export default {
	data: function () {
		return {
			"data": {},
		};
	},
	created: function () {
		this.updateData();
	},
	beforeRouteUpdate (to, from, next) {
		this.name = to.params.name;
		next();
		this.updateData();
		console.log('Route updated.');
	},
	methods: {
		goto_edit: function () {
			window.location.href = edit_url;
		},
		adjustStartDate: function (ev, field, value) {
			var m = moment(ev.start);
			m.set(field, value);
			ev.start = m.format("YYYY-MM-DD HH:mm");
		},
		monthsBetween: function (ev, begin, end) {
			var m = begin.clone()
			m.set('date', 1);
			var list_ev = [];
			do {
				const new_ev = Object.assign({}, ev);
				this.adjustStartDate(new_ev, 'year', m.year());
				this.adjustStartDate(new_ev, 'month', m.month());
				list_ev.push(new_ev);
				m.add(1, 'months');
				// console.log(m.format());
				// console.log('is before')
				// console.log(end.format());
			} while (m.isBefore(end));
			return list_ev;
		},
		refreshCal: function (arr_events) {
			console.log('refresh events ...');
			$("#calendar").fullCalendar('removeEventSources');
			var vm = this;
			setTimeout(() => {
				// $('#calendar').fullCalendar('addEventSource', arr_events);
				$('#calendar').fullCalendar('addEventSource',
				function (begin, end, timezone, callbk) {
					// console.log('BEGIN'); console.log(begin);
					// console.log('END'); console.log(end);
					var processed_events = [];
					for (var i = 0; i < arr_events.length; i++) {
						var ev = arr_events[i];
						if (ev.yearly == true) {
							for	(var yr = begin.year(); yr <= end.year(); yr ++) {
								const new_ev = Object.assign({}, ev);
								vm.adjustStartDate(new_ev, 'year', yr);
								// console.log(new_ev);
								processed_events.push(new_ev);
							}
						} else if (ev.monthly == true) {
							const list_ev = vm.monthsBetween(ev, begin, end);
							// console.log(list_ev);
							list_ev.forEach(function (new_ev) {
								processed_events.push(new_ev);
							});
						} else {
							processed_events.push(ev);
						}
					}
					callbk(processed_events);
				});
			}, 300);
		},
		testAuth: function (request_path, callbk) {
			$.ajax({
				type : "GET",
				url : request_path,
				dataType: "html",
				success: function(a, b, xhr) {
					var ct = xhr.getResponseHeader("content-type") || "";
					if (ct.indexOf('json') > -1) {
						/* JSON returned, continue. */
						console.log('JSON returned.');
						callbk();
					} else {
						console.log('non-JSON returned.');
						const cur_url = window.location.href;
						window.location.href = '/auth/login?next=' +
						encodeURIComponent(cur_url);
					}
				}
			});
		},
		updateData: function () {
			const visit_path = this.$route.params[0];
			const request_path = "/hippo/get/" + visit_path + "dir.model";
			var vm = this;
			vm.data = {};

			this.testAuth(request_path, function () {
				$.ajax({
					type : "GET",
					url : request_path,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
				}).done(function (json) {
					vm.data = json;
					vm.updateView();
				});
			});
		},
		colorText: function (father, cats) {
			const colors = ['red', '#009688'];
			var i = 0;
			for (var j = 0; j < cats.length; j ++) {
				var cat = cats[j];
				var color = colors[i];
				if (cat.trim() == '')
					continue;
				i = (i + 1) % 2;
				father.append('<pre style="color:' + color +
				              '">' + cat + '<pre>')
			}
		},
		updateView: function () {
			var cats = this.data.cats;
			const cats_string = cats.join().trim();
			/* print out calendar/plaintxt */
			if (cats_string == '') {
				$('#calendar').hide();
				$('#plaintxt').text('');
				return;
			}
			/* see if the json concatenation is valid */
			var j = {};
			try {
				j = JSON.parse('[' + cats_string + ']');
			} catch (e) {
				$('#calendar').hide();
				this.colorText($('#plaintxt'), cats);
				return;
			}
			// console.log('update Calendar')
			// console.log(j)
			this.refreshCal(j);
			const pretty = JSON.stringify(j, null, 4);
			$('#plaintxt').append('<pre>' + pretty + '</pre>');
			$('#calendar').show();
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
