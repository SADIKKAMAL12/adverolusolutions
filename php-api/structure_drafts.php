<?php
/**
 * CRUD for structure drafts
 *
 * GET    ?id=123        — single draft
 * GET    (no params)    — list current user's drafts
 * POST                   — create draft
 * PUT    ?id=123        — update draft
 * DELETE ?id=123        — delete draft
 */

require __DIR__ . '/config.php';

$userId = requireAuth();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ---------- GET ----------
if ($method === 'GET') {
    if (!empty($_GET['id'])) {
        $stmt = $db->prepare(
            "SELECT id, user_id, name, nodes_json, edges_json, total_price, node_count, edge_count, created_at, updated_at
             FROM structure_drafts WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([(int)$_GET['id'], $userId]);
        $draft = $stmt->fetch();
        if (!$draft) {
            jsonResponse(['error' => 'Draft not found'], 404);
        }
        jsonResponse(['draft' => $draft]);
    }

    $stmt = $db->prepare(
        "SELECT id, name, total_price, node_count, edge_count, created_at, updated_at
         FROM structure_drafts WHERE user_id = ? ORDER BY updated_at DESC"
    );
    $stmt->execute([$userId]);
    jsonResponse(['drafts' => $stmt->fetchAll()]);
}

// ---------- POST (create) ----------
if ($method === 'POST') {
    $data = getJsonInput();
    $name = trim($data['name'] ?? 'Untitled Structure');
    $nodesJson = json_encode($data['nodes'] ?? []);
    $edgesJson = json_encode($data['edges'] ?? []);
    $totalPrice = (float) ($data['total_price'] ?? 0);
    $nodeCount = (int) ($data['node_count'] ?? 0);
    $edgeCount = (int) ($data['edge_count'] ?? 0);

    $stmt = $db->prepare(
        "INSERT INTO structure_drafts (user_id, name, nodes_json, edges_json, total_price, node_count, edge_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$userId, $name, $nodesJson, $edgesJson, $totalPrice, $nodeCount, $edgeCount]);

    jsonResponse([
        'success' => true,
        'id' => (int) $db->lastInsertId(),
        'name' => $name,
    ], 201);
}

// ---------- PUT (update) ----------
if ($method === 'PUT') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) {
        jsonResponse(['error' => 'Draft ID required'], 400);
    }

    $data = getJsonInput();
    $fields = [];
    $values = [];

    if (isset($data['name'])) {
        $fields[] = 'name = ?';
        $values[] = trim($data['name']);
    }
    if (isset($data['nodes'])) {
        $fields[] = 'nodes_json = ?';
        $values[] = json_encode($data['nodes']);
    }
    if (isset($data['edges'])) {
        $fields[] = 'edges_json = ?';
        $values[] = json_encode($data['edges']);
    }
    if (isset($data['total_price'])) {
        $fields[] = 'total_price = ?';
        $values[] = (float) $data['total_price'];
    }
    if (isset($data['node_count'])) {
        $fields[] = 'node_count = ?';
        $values[] = (int) $data['node_count'];
    }
    if (isset($data['edge_count'])) {
        $fields[] = 'edge_count = ?';
        $values[] = (int) $data['edge_count'];
    }

    if (empty($fields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }

    $values[] = $id;
    $values[] = $userId;

    $stmt = $db->prepare("UPDATE structure_drafts SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?");
    $stmt->execute($values);

    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'Draft not found or not owned by you'], 404);
    }

    jsonResponse(['success' => true, 'id' => $id]);
}

// ---------- DELETE ----------
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) {
        jsonResponse(['error' => 'Draft ID required'], 400);
    }

    $stmt = $db->prepare("DELETE FROM structure_drafts WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'Draft not found or not owned by you'], 404);
    }

    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
