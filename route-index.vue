<template>
<div>
<button v-on:click="$router.go(-1)">go back</button>
<button v-on:click="updateData">refresh</button>
<ul>
	<li v-for="f in data.dirs">
		<router-link v-bind:to="$route.path + '/' + f + '/'">
			{{f}}
		</router-link>
	</li>
</ul>
<div id='calendar'></div>
<pre id='plaintxt'></pre>
</div>
</template>

<script>
import $ from 'jquery';
import 'fullcalendar';
var moment = require('moment');

String.prototype.replaceAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index+character.length);
};

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
			$("#calendar").fullCalendar('removeEvents');
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
			}, 600);
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
		updateView: function () {
			var cats = this.data.cats.trim();
			if (cats == '') {
				$('#calendar').hide();
				$('#plaintxt').text('');
				return;
			} else if (cats[cats.length - 1] == ',') {
				cats = cats.replaceAt(cats.length - 1, ' ');
			}
			var j = {};
			try {
				j = JSON.parse('[' + cats + ']');
			} catch (e) {
				$('#calendar').hide();
				$('#plaintxt').text(cats);
				return;
			}
			// console.log('update Calendar')
			// console.log(j)
			this.refreshCal(j);
			const pretty = JSON.stringify(j, null, 4);
			$('#plaintxt').text(pretty);
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
