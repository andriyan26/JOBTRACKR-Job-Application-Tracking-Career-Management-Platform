<?php
/**
 * Applications CRUD API Endpoint for Hostinger
 */

require_once __DIR__ . '/db.php';

if (!$pdo) {
    sendResponse(false, ['db_connected' => false], 'Database not connected', 503);
}

$input = getJsonInput();
$action = $_GET['action'] ?? ($input['action'] ?? 'list');
$userId = $_GET['user_id'] ?? ($input['user_id'] ?? '');

if (!$userId) {
    sendResponse(false, [], 'User ID is required', 400);
}

switch ($action) {
    case 'list':
        $stmt = $pdo->prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY application_date DESC");
        $stmt->execute([$userId]);
        $apps = $stmt->fetchAll();
        sendResponse(true, ['applications' => $apps]);
        break;

    case 'save':
        $app = $input['application'] ?? [];
        if (empty($app['company_name']) || empty($app['position'])) {
            sendResponse(false, [], 'Company name and position are required', 400);
        }

        $id = $app['id'] ?? ('app_' . bin2hex(random_bytes(6)));
        $company = $app['company_name'];
        $pos = $app['position'];
        $via = $app['applied_via'] ?? 'LinkedIn';
        $loc = $app['location'] ?? 'Indonesia';
        $salary = $app['salary_range'] ?? 'Negotiable';
        $mode = $app['work_mode'] ?? 'On-site';
        $type = $app['job_type'] ?? 'Full-time';
        $date = $app['application_date'] ?? date('Y-m-d');
        $status = $app['current_status'] ?? 'Applied';
        $lastContact = $app['last_contact_date'] ?? $date;
        $notes = $app['notes'] ?? '';

        $sql = "INSERT INTO applications (id, user_id, company_name, position, applied_via, location, salary_range, work_mode, job_type, application_date, current_status, last_contact_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                company_name = VALUES(company_name),
                position = VALUES(position),
                applied_via = VALUES(applied_via),
                location = VALUES(location),
                salary_range = VALUES(salary_range),
                work_mode = VALUES(work_mode),
                job_type = VALUES(job_type),
                application_date = VALUES(application_date),
                current_status = VALUES(current_status),
                last_contact_date = VALUES(last_contact_date),
                notes = VALUES(notes),
                updated_at = NOW()";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id, $userId, $company, $pos, $via, $loc, $salary, $mode, $type, $date, $status, $lastContact, $notes]);

        sendResponse(true, ['id' => $id], 'Application saved successfully!');
        break;

    case 'delete':
        $appId = $input['id'] ?? ($_GET['id'] ?? '');
        if (!$appId) {
            sendResponse(false, [], 'Application ID required', 400);
        }
        $stmt = $pdo->prepare("DELETE FROM applications WHERE id = ? AND user_id = ?");
        $stmt->execute([$appId, $userId]);
        sendResponse(true, [], 'Application deleted');
        break;

    default:
        sendResponse(false, [], 'Unknown action', 400);
        break;
}
