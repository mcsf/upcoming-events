<?php
/*
Plugin Name: Upcoming Events
Plugin URI: http://github.com/mcsf/events
Description: Simple list-formatted calendar view for Google Calendar
Version: 1.0
Author: mcsf
Author URI: http://github.com/mcsf
*/

add_action( 'wp_footer', 'mcsf_events_templates' );
function mcsf_events_templates() {
	foreach ( glob( __DIR__ . "/templates/*.php" ) as $file ) {
		include_once $file;
	}
}

function mcsf_events_scripts() {
	wp_enqueue_script( 'mcsf_events', plugins_url( 'events.js', __FILE__ ), array( 'jquery', 'underscore' ) );
	wp_enqueue_style( 'mcsf_events', plugins_url( 'events.css', __FILE__ ) );
}

add_shortcode( 'mcsf_events', 'mcsf_events_events_loader' );
function mcsf_events_events_loader( $atts ) {
	$a = shortcode_atts( array(
		'key' => '',
		'calendar' => '',
		'class' => '',
	), $atts );
	mcsf_events_scripts();
	return "<div class=\"mcsf-events {$a['class']}\" " .
		"data-api-key=\"{$a['key']}\" " .
		"data-calendar=\"{$a['calendar']}\"".
		"></div>";
}
