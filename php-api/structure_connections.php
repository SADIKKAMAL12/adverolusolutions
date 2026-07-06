<?php
/**
 * GET /structure_connections.php
 * Returns all active connection types for edges.
 */

require __DIR__ . '/config.php';

$db = getDB();

$stmt = $db->query(
    "SELECT `key`, label, edge_color, dash_array, animated, description, sort_order
     FROM structure_connections
     WHERE active = 1
     ORDER BY sort_order ASC, id ASC"
);

$connections = $stmt->fetchAll();

jsonResponse(['connections' => $connections]);
