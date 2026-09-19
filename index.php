<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/core/Session.php';

Session::start();

if (Session::isLoggedIn()) {
    header('Location: ' . CLIENT_URL . '/pages/dashboard/dashboard.php');
} else {
    header('Location: ' . SITE_URL . '/login.php');
}
exit;