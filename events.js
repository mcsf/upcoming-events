/**
 * Supports multiple calendars in the same page. See `each` call at the bottom.
 *
 * Each calendar has a hook that allows third-party scripts to filter the
 * results shown.
 *
 * However, instead of exposing things in a global module, each calendar's hook
 * is exposed via each calendar container's `dataset` HTML5 interface.
 *
 * Example:
 *
 * myCalendar = $(uniqueSelector);
 * myFilter = myCalendar.data('filterHook');
 * myFilter(event => event.hour === '19:00');
 */
(function($, _) {

	var template = _.memoize(function(id) {
		var compiled,
			options = {
				variable: 'data',
				evaluate: /<#([\s\S]+?)#>/g,
				interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
				escape: /\{\{([^\}]+?)\}\}(?!\})/g
			};

		return function(data) {
			compiled = compiled || _.template($('#tmpl-' + id).html(), null, options);
			return compiled(data);
		};
	});

	function getCalendarUrl(calendar) {
		return ('https://www.googleapis.com/calendar/v3/calendars/'
			+ calendar + '/events');
	}

	function fetchEvents(calendar, key, onSuccess) {
		var MONTH_IN_MS = 1000 * 3600 * 24 * 30,
			now = new Date().toISOString(),
			then = new Date(Date.now() + 2 * MONTH_IN_MS).toISOString();

		$.get(getCalendarUrl(calendar), {
			singleEvents: true,
			orderBy: 'startTime',
			timeMin: now,
			timeMax: then,
			key: key
		}, onSuccess);
	}

	function processEvents(data) {
		data.items = data.items.filter(hasStartDate).map(processEvent);
		data.months = groupByMonth(data.items);
	}

	function processEvent(event) {
		var date;

		event.start.date = event.start.date || event.start.dateTime;
		date = new Date(event.start.date);

		event.label = (date.getDate() < 10 ? '0' : '') + date.getDate().toString();
		event.month = date.getMonth();
		event.yearMonth = date.getFullYear() + '-' + date.getMonth();
		event.weekday = getWeekdayName(date.getDay());

		if (event.start.dateTime) {
			event.hour = date.toTimeString().split(':', 2).join(':');
		}

		if (event.location) {
			event.shortLocation = event.location.split(',', 1)[0];
			event.address = event.location.split(',').splice(1).join(',').trim();
			event.mapUrl = 'https://maps.google.com/maps?q=' + encodeURI(event.address);
		}

		/**
		 * Lines in the description like
		 *
		 *     Fee: 5 USD
		 *
		 * or
		 *
		 *     Link: www.example.org
		 *
		 * will be picked up.
		 */
		if (event.description) {
			event.fee = extractValue(event.description, 'Fee', '\\d+');
			event.link = extractValue(event.description, 'Link');
			if (event.link) {
				event.isLinkFacebook = getHostname(event.link) === 'www.facebook.com';
			}
		}

		return event;
	}

	function hasStartDate(event) {
		return event && event.start && (event.start.date || event.start.dateTime);
	}

	function groupByMonth(events) {
		return _.chain(events)
				.groupBy('yearMonth')
				.toArray()
				.map(function(month) {
			return {
				label: getMonthName(month[0].month),
				events: month
			};
		}).value();
	}

	function getMonthName(month) {
		return [
			'jan', 'feb', 'mar', 'apr', 'may', 'jun',
			'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
		][ month ];
	}

	function getWeekdayName(day) {
		return [
			'sunday', 'monday', 'tuesday', 'wednesday',
			'thursday', 'friday', 'saturday'
		][ day ];
	}

	function extractValue(string, field, valueFormat) {
		var regExp, lines, matches;

		valueFormat = valueFormat || '.*';
		regExp = new RegExp('^' + field + ': +(' + valueFormat + ')');
		lines = string.split('\n').filter(function (line) { return line.match(regExp); });

		if (lines.length && (matches = lines[0].match(regExp))) {
			return matches[1];
		}
	}

	function getHostname(url) {
		if (url && window.URL) {
			return new window.URL(url).hostname;
		}
	}

	/**
	 * @impure
	 */
	function drawEvents(container, data) {
		var compiled = template('month');

		container.empty();
		data.months.forEach(function(event) {
			var element = $(compiled(event));
			container.append(element);
		});
	}

	/**
	 * @impure
	 */
	function updateQuery(cachedData, container, filter) {
		cachedData.months = groupByMonth(cachedData.items.filter(filter));
		drawEvents(container, cachedData);
	}

	function makeFilterHook(cachedData, container) {
		return function filterEvents(filter) {
			if (typeof filter !== 'function') {
				throw new Error('filterEvents requires a function as its first argument');
			}
			updateQuery(cachedData, container, filter);
		}
	}

	$(function() {
		// Supports multiple calendars in the same page
		$('.mcsf-events').each(function() {
			var container = $(this),
				calendar = container.data('calendar');
				key = container.data('apiKey');

			if (!calendar || !key) {
				throw new Error('URL or API key missing. Please check your [mcsf_events] shortcodes.');
			}

			fetchEvents(calendar, key, function(data) {
				var hook = makeFilterHook(data, container);
				container.data('filterHook', hook);
				processEvents(data);
				drawEvents(container, data);
			});
		});
	});

})(jQuery, _);
