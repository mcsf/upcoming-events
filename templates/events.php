<script id="tmpl-month" type="text/template">
	<div class="month">
		<header>{{ data.label }}</header>
		<div class="days">
			<# data.events.forEach(function(event) { #>
				<div class="day">
					<span class="event-date">{{ event.label }} . </span>
					<span class="event-title">{{ event.summary }}</span>
					<br>{{ event.weekday }}

					<# if (event.location) { #>
						<span class="event-location">
							@ {{ event.shortLocation }}
							<a class="icon icon-map-marker" target="_blank" href="{{ event.mapUrl }}"></a>
						</span>
					<# } #>

					<# if (event.link) { #>
						<# event.linkClass = event.isLinkFacebook ? 'icon-facebook' : 'icon-external-link'; #>
						<a target="_blank" class="event-link icon {{ event.linkClass }}" href="{{ event.link }}"></a>
					<# } #>

					<# if (event.hour) { #>
						<span class="event-time">
							<span class="icon icon-clock-o"></span> {{ event.hour }}
						</span>
					<# } #>

					<# if (event.fee) { #>
						<span class="event-fee">
							<span class="icon icon-euro"></span> {{ event.fee }}
						</span>
					<# } #>

				</div>
			<# }); #>
		</div>
	</div>
</script>
