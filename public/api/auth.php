<?php
/**
 * Auth API Endpoint (Login, Register, Profile, Sync)
 */

require_once __DIR__ . '/db.php';

if (!$pdo) {
    sendResponse(false, ['db_connected' => false], 'Database not yet configured. Please import jobtrackr.sql in phpMyAdmin and update db.php', 503);
}

$input = getJsonInput();
$action = $_GET['action'] ?? ($input['action'] ?? '');

switch ($action) {
    case 'register':
        $name = trim($input['name'] ?? '');
        $email = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (!$name || !$email || strlen($password) < 6) {
            sendResponse(false, [], 'Name, valid email, and password (min 6 chars) are required.', 400);
        }

        // Check existing user
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendResponse(false, [], 'Email is already registered.', 409);
        }

        $userId = 'usr_' . bin2hex(random_bytes(8));
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $avatar = "https://api.dicebear.com/7.x/initials/svg?seed=" . urlencode($name);

        $stmt = $pdo->prepare("INSERT INTO users (id, email, password_hash, name, avatar) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $email, $hash, $name, $avatar]);

        sendResponse(true, [
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role_title' => 'Job Seeker',
                'location' => 'Indonesia',
                'target_salary' => '15.000.000 - 25.000.000 IDR',
                'avatar' => $avatar
            ]
        ], 'Registration successful!');
        break;

    case 'login':
        $email = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            sendResponse(false, [], 'Email and password are required.', 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            sendResponse(false, [], 'Invalid email or password.', 401);
        }

        unset($user['password_hash']);
        sendResponse(true, ['user' => $user], 'Login successful!');
        break;

    case 'update_profile':
        $userId = $input['user_id'] ?? '';
        if (!$userId) {
            sendResponse(false, [], 'User ID required.', 400);
        }

        $name = $input['name'] ?? null;
        $role_title = $input['role_title'] ?? null;
        $location = $input['location'] ?? null;
        $target_salary = $input['target_salary'] ?? null;
        $avatar = $input['avatar'] ?? null;

        $fields = [];
        $params = [];

        if ($name !== null) { $fields[] = 'name = ?'; $params[] = $name; }
        if ($role_title !== null) { $fields[] = 'role_title = ?'; $params[] = $role_title; }
        if ($location !== null) { $fields[] = 'location = ?'; $params[] = $location; }
        if ($target_salary !== null) { $fields[] = 'target_salary = ?'; $params[] = $target_salary; }
        if ($avatar !== null) { $fields[] = 'avatar = ?'; $params[] = $avatar; }

        if (!empty($fields)) {
            $params[] = $userId;
            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $updated = $stmt->fetch();
        if ($updated) unset($updated['password_hash']);

        sendResponse(true, ['user' => $updated], 'Profile updated!');
        break;

    default:
        sendResponse(false, [], 'Unknown action: ' . htmlspecialchars($action), 400);
        break;
}
