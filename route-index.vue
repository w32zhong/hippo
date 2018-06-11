<template>
<div>
<ul>
	<li v-for="item in list">
		{{item}}
	</li>
</ul>
</div>
</template>

<script>
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

	}
};
</script>
