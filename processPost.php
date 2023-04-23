<?php
include("./cookieManagement.php");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  saveFormData($_POST);
}

if(!isset($_SESSION["registered"])){
  session_start();
  saveDataInSession();
}

header("Location: "."http://".$_SERVER['HTTP_HOST']."/index.php");
die();
?>