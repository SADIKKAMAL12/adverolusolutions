<?php
/**
 * GET /structure_assets.php
 * Returns all active structure assets with pricing and theming.
 */

require __DIR__ . '/config.php';

$db = getDB();

$stmt = $db->query(
    "SELECT `key`, label, base_price, icon, glow_color,
            bg_color_dark, bg_color_light, border_color_dark, border_color_light,
            text_color_dark, text_color_light, description, sort_order
     FROM structure_assets
     WHERE active = 1
     ORDER BY sort_order ASC, id ASC"
);

$assets = $stmt->fetchAll();

jsonResponse(['assets' => $assets]);
