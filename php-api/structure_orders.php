<?php
/**
 * Structure Orders API
 *
 * User endpoints:
 *   POST              — submit a new order
 *   GET  ?mine=1      — list current user's orders
 *
 * Admin endpoints:
 *   GET               — list all orders (admin)
 *   GET  ?id=123      — single order detail (admin)
 *   PUT  ?id=123      — update status / admin_notes (admin)
 */

require __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ---------- User: Submit Order ----------
if ($method === 'POST') {
    $userId = requireAuth();
    $data = getJsonInput();

    $name = trim($data['name'] ?? 'Structure Order');
    $draftId = !empty($data['draft_id']) ? (int) $data['draft_id'] : null;
    $nodes = $data['nodes'] ?? [];
    $edges = $data['edges'] ?? [];
    $totalPrice = (float) ($data['total_price'] ?? 0);
    $nodeCount = (int) ($data['node_count'] ?? count($nodes));
    $edgeCount = (int) ($data['edge_count'] ?? count($edges));

    $orderCode = 'STR-' . strtoupper(substr(uniqid(), -8));

    $stmt = $db->prepare(
        "INSERT INTO structure_orders
         (user_id, draft_id, order_code, name, nodes_json, edges_json, total_price, node_count, edge_count, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
    );
    $stmt->execute([
        $userId, $draftId, $orderCode, $name,
        json_encode($nodes), json_encode($edges),
        $totalPrice, $nodeCount, $edgeCount
    ]);

    $orderId = (int) $db->lastInsertId();

    jsonResponse([
        'success' => true,
        'id' => $orderId,
        'order_code' => $orderCode,
        'status' => 'pending',
    ], 201);
}

// ---------- User: List My Orders ----------
if ($method === 'GET' && !empty($_GET['mine'])) {
    $userId = requireAuth();
    $stmt = $db->prepare(
        "SELECT id, order_code, name, total_price, node_count, edge_count, status, admin_notes, submitted_at, created_at
         FROM structure_orders WHERE user_id = ? ORDER BY submitted_at DESC"
    );
    $stmt->execute([$userId]);
    jsonResponse(['orders' => $stmt->fetchAll()]);
}

// ---------- Admin: List All Orders ----------
if ($method === 'GET' && empty($_GET['id'])) {
    requireAdmin();
    $status = $_GET['status'] ?? null;

    $sql = "SELECT o.*, u.name AS user_name, u.email AS user_email
            FROM structure_orders o
            LEFT JOIN users u ON o.user_id = u.id";
    $params = [];

    if ($status) {
        $sql .= " WHERE o.status = ?";
        $params[] = $status;
    }
    $sql .= " ORDER BY o.submitted_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonResponse(['orders' => $stmt->fetchAll()]);
}

// ---------- Admin: Single Order Detail ----------
if ($method === 'GET' && !empty($_GET['id'])) {
    requireAdmin();
    $stmt = $db->prepare(
        "SELECT o.*, u.name AS user_name, u.email AS user_email
         FROM structure_orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = ?"
    );
    $stmt->execute([(int)$_GET['id']]);
    $order = $stmt->fetch();
    if (!$order) {
        jsonResponse(['error' => 'Order not found'], 404);
    }
    jsonResponse(['order' => $order]);
}

// ---------- Admin: Update Order ----------
if ($method === 'PUT') {
    requireAdmin();
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) {
        jsonResponse(['error' => 'Order ID required'], 400);
    }

    $data = getJsonInput();
    $fields = [];
    $values = [];

    if (isset($data['status']) && in_array($data['status'], ['pending','processing','completed','cancelled'], true)) {
        $fields[] = 'status = ?';
        $values[] = $data['status'];
        if ($data['status'] === 'completed') {
            $fields[] = 'completed_at = NOW()';
        }
    }
    if (isset($data['admin_notes'])) {
        $fields[] = 'admin_notes = ?';
        $values[] = trim($data['admin_notes']);
    }

    if (empty($fields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }

    $values[] = $id;
    $stmt = $db->prepare("UPDATE structure_orders SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($values);

    jsonResponse(['success' => true, 'id' => $id]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
